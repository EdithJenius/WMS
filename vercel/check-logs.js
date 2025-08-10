const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // 检查通知日志
    const logs = await prisma.notificationLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 10
    })
    
    console.log('📋 最近的通知日志:')
    logs.forEach(log => {
      console.log(`- ${log.sentAt}: ${log.productName} (${log.quantity}) -> ${log.email} [${log.success ? '成功' : '失败'}]`)
    })
    
    // 检查低库存商品
    const lowStockItems = await prisma.inventory.findMany({
      where: { quantity: { lte: 2 } },
      include: { product: true }
    })
    
    console.log('\n📦 低库存商品:')
    lowStockItems.forEach(item => {
      console.log(`- ${item.product.name}: ${item.quantity} 箱`)
    })
    
    // 检查启用的通知
    const activeNotifications = await prisma.inventoryNotification.findMany({
      where: { isActive: true }
    })
    
    console.log('\n📧 启用的通知邮箱:')
    activeNotifications.forEach(notif => {
      console.log(`- ${notif.email}`)
    })
    
  } catch (error) {
    console.error('❌ 检查日志失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()