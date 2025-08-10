const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // 删除今天的通知日志
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const result = await prisma.notificationLog.deleteMany({
      where: {
        sentAt: { gte: today }
      }
    })
    
    console.log(`✅ 删除了 ${result.count} 条今天的通知日志`)
    
    // 检查剩余的日志
    const remainingLogs = await prisma.notificationLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 5
    })
    
    console.log('\n📋 剩余的通知日志:')
    if (remainingLogs.length === 0) {
      console.log('无')
    } else {
      remainingLogs.forEach(log => {
        console.log(`- ${log.sentAt}: ${log.productName} (${log.quantity}) -> ${log.email} [${log.success ? '成功' : '失败'}]`)
      })
    }
    
  } catch (error) {
    console.error('❌ 清除日志失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()