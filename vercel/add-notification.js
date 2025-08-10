const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // 添加一个测试通知邮箱
    const notification = await prisma.inventoryNotification.create({
      data: {
        email: '3233569941@qq.com',
        isActive: true
      }
    })
    
    console.log('✅ 成功添加通知邮箱:', notification)
    
    // 查看所有通知
    const allNotifications = await prisma.inventoryNotification.findMany()
    console.log('📧 当前所有通知邮箱:', allNotifications)
    
  } catch (error) {
    console.error('❌ 添加通知邮箱失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()