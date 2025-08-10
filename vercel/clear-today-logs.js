const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearTodayLogs() {
  try {
    console.log('=== 清除今日通知日志 ===');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await prisma.notificationLog.deleteMany({
      where: {
        sentAt: {
          gte: today
        }
      }
    });
    
    console.log(`清除了 ${result.count} 条今日通知日志`);
    
  } catch (error) {
    console.error('清除日志失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTodayLogs();