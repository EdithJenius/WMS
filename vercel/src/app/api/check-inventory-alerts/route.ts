import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendInventoryAlertEmail } from '@/lib/email'

// 库存监控配置
const INVENTORY_THRESHOLD = 2 // 警戒线：2箱

export async function POST(request: NextRequest) {
  try {
    console.log('开始手动检查库存警报...')
    
    // 获取所有库存记录
    const inventories = await db.inventory.findMany({
      include: {
        product: true
      }
    })

    // 找出所有库存不足的商品
    const lowStockInventories = inventories.filter(inv => inv.quantity <= INVENTORY_THRESHOLD)
    
    console.log(`发现 ${lowStockInventories.length} 个低库存商品`)

    if (lowStockInventories.length === 0) {
      return NextResponse.json({
        message: '没有发现低库存商品',
        lowInventoryCount: 0,
        sentCount: 0,
        failedCount: 0
      })
    }

    // 获取所有启用的邮件通知设置
    const notifications = await db.inventoryNotification.findMany({
      where: { isActive: true }
    })

    if (notifications.length === 0) {
      return NextResponse.json({
        message: '没有启用的邮件通知设置',
        lowInventoryCount: lowStockInventories.length,
        sentCount: 0,
        failedCount: 0
      })
    }

    // 获取今天的日期（用于防重复检查）
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let sentCount = 0
    let failedCount = 0
    const processedProducts = new Set<string>()

    // 为每个低库存商品发送通知
    for (const inventory of lowStockInventories) {
      const productId = inventory.product.id
      
      // 跳过已经处理过的商品
      if (processedProducts.has(productId)) {
        continue
      }
      
      processedProducts.add(productId)

      // 检查今天是否已经发送过通知（防重复机制）
      const existingLog = await db.notificationLog.findFirst({
        where: {
          productId,
          email: { in: notifications.map(n => n.email) },
          sentAt: { gte: today }
        }
      })

      if (existingLog) {
        console.log(`商品 ${inventory.product.name} 今天已经发送过通知，跳过`)
        continue
      }

      // 为每个邮箱发送通知
      for (const notification of notifications) {
        try {
          console.log(`发送库存警报到: ${notification.email}, 商品: ${inventory.product.name}`)
          
          const success = await sendInventoryAlertEmail(
            notification.email,
            inventory.product.name,
            inventory.quantity
          )

          // 记录发送日志
          await db.notificationLog.create({
            data: {
              productId,
              productName: inventory.product.name,
              quantity: inventory.quantity,
              threshold: INVENTORY_THRESHOLD,
              email: notification.email,
              success
            }
          })

          if (success) {
            sentCount++
            console.log(`✅ 成功发送库存警报邮件到 ${notification.email}`)
          } else {
            failedCount++
            console.error(`❌ 发送库存警报邮件失败到 ${notification.email}`)
          }
        } catch (error) {
          failedCount++
          console.error(`发送邮件到 ${notification.email} 时出错:`, error)
        }
      }
    }

    const message = `检查完成：发现 ${lowStockInventories.length} 个低库存商品，成功发送 ${sentCount} 封邮件，失败 ${failedCount} 封`
    
    return NextResponse.json({
      message,
      lowInventoryCount: lowStockInventories.length,
      sentCount,
      failedCount
    })

  } catch (error) {
    console.error('检查库存警报时出错:', error)
    return NextResponse.json(
      { error: '检查库存警报失败' },
      { status: 500 }
    )
  }
}