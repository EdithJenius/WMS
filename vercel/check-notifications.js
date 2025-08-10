const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkNotifications() {
  try {
    console.log('=== 检查库存通知设置 ===');
    
    // 检查库存通知设置
    const notifications = await prisma.inventoryNotification.findMany();
    console.log('当前库存通知设置:', notifications);
    
    // 检查低库存商品
    const inventories = await prisma.inventory.findMany({
      include: {
        product: true
      }
    });
    
    const lowStockInventories = inventories.filter(inv => inv.quantity <= 2);
    console.log('低库存商品:', lowStockInventories);
    
    // 检查通知日志
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogs = await prisma.notificationLog.findMany({
      where: {
        sentAt: {
          gte: today
        }
      }
    });
    console.log('今日通知日志:', todayLogs);
    
  } catch (error) {
    console.error('检查失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNotifications();