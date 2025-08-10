import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendInventoryAlertEmail } from '@/lib/email'

// 库存监控配置
const INVENTORY_THRESHOLD = 2 // 警戒线：2箱

// 检查并发送库存警报的辅助函数
async function checkAndSendInventoryAlerts(productId: string, newQuantity: number) {
  try {
    // 只有当库存数量小于等于警戒线时才发送警报
    if (newQuantity > INVENTORY_THRESHOLD) {
      return
    }

    console.log(`检测到低库存商品ID: ${productId}, 数量: ${newQuantity}`)

    // 获取商品信息
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      console.error(`未找到商品ID: ${productId}`)
      return
    }

    // 获取所有启用的邮件通知设置
    const notifications = await db.inventoryNotification.findMany({
      where: { isActive: true }
    })

    if (notifications.length === 0) {
      console.log('没有启用的邮件通知设置，跳过发送')
      return
    }

    // 检查今天是否已经发送过通知
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingLog = await db.notificationLog.findFirst({
      where: {
        productId,
        email: { in: notifications.map(n => n.email) },
        sentAt: { gte: today }
      }
    })

    if (existingLog) {
      console.log(`商品 ${product.name} 今天已经发送过通知，跳过`)
      return
    }

    // 为每个邮箱发送通知
    for (const notification of notifications) {
      try {
        console.log(`发送库存警报到: ${notification.email}`)
        
        const success = await sendInventoryAlertEmail(
          notification.email,
          product.name,
          newQuantity
        )

        // 记录发送日志
        await db.notificationLog.create({
          data: {
            productId,
            productName: product.name,
            quantity: newQuantity,
            threshold: INVENTORY_THRESHOLD,
            email: notification.email,
            success
          }
        })

        if (success) {
          console.log(`✅ 成功发送库存警报邮件到 ${notification.email}`)
        } else {
          console.error(`❌ 发送库存警报邮件失败到 ${notification.email}`)
        }
      } catch (error) {
        console.error(`发送邮件到 ${notification.email} 时出错:`, error)
      }
    }
  } catch (error) {
    console.error('检查并发送库存警报时出错:', error)
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const series = searchParams.get('series')
    const status = searchParams.get('status')

    let whereClause = {}

    if (search) {
      whereClause = {
        product: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { series: { contains: search, mode: 'insensitive' } }
          ]
        }
      }
    }

    if (series && series !== 'all') {
      whereClause = {
        ...whereClause,
        product: {
          series: series
        }
      }
    }

    const inventories = await db.inventory.findMany({
      where: whereClause,
      include: {
        product: true
      },
      orderBy: {
        lastUpdated: 'desc'
      }
    })

    // 根据状态过滤
    let filteredInventories = inventories
    if (status === 'in_stock') {
      filteredInventories = inventories.filter(inv => inv.quantity > 0)
    } else if (status === 'out_of_stock') {
      filteredInventories = inventories.filter(inv => inv.quantity === 0)
    } else if (status === 'low_stock') {
      filteredInventories = inventories.filter(inv => inv.quantity > 0 && inv.quantity <= 10)
    }

    return NextResponse.json(filteredInventories)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity, avgCost } = body

    // 验证商品是否存在
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 400 }
      )
    }

    const newQuantity = parseInt(quantity)

    // 更新或创建库存记录
    const inventory = await db.inventory.upsert({
      where: { productId },
      update: {
        quantity: newQuantity,
        avgCost: parseFloat(avgCost),
        lastUpdated: new Date()
      },
      create: {
        productId,
        quantity: newQuantity,
        avgCost: parseFloat(avgCost)
      },
      include: {
        product: true
      }
    })

    // 检查是否需要发送库存警报
    await checkAndSendInventoryAlerts(productId, newQuantity)

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}