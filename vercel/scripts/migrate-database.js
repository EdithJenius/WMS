const { PrismaClient } = require('@prisma/client');

// SQLite 配置
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

// 目标数据库配置（需要在环境变量中设置）
const targetPrisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('开始数据迁移...');
    
    // 连接源数据库
    await sqlitePrisma.$connect();
    console.log('✅ 连接SQLite数据库成功');
    
    // 连接目标数据库
    await targetPrisma.$connect();
    console.log('✅ 连接目标数据库成功');
    
    // 迁移用户数据
    console.log('📋 迁移用户数据...');
    const users = await sqlitePrisma.user.findMany();
    for (const user of users) {
      await targetPrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`✅ 迁移了 ${users.length} 个用户`);
    
    // 迁移产品数据
    console.log('📦 迁移产品数据...');
    const products = await sqlitePrisma.product.findMany();
    for (const product of products) {
      await targetPrisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }
    console.log(`✅ 迁移了 ${products.length} 个产品`);
    
    // 迁移进货数据
    console.log('📥 迁移进货数据...');
    const purchases = await sqlitePrisma.purchase.findMany();
    for (const purchase of purchases) {
      await targetPrisma.purchase.upsert({
        where: { id: purchase.id },
        update: purchase,
        create: purchase
      });
    }
    console.log(`✅ 迁移了 ${purchases.length} 笔进货记录`);
    
    // 迁移销售数据
    console.log('📤 迁移销售数据...');
    const sales = await sqlitePrisma.sale.findMany();
    for (const sale of sales) {
      await targetPrisma.sale.upsert({
        where: { id: sale.id },
        update: sale,
        create: sale
      });
    }
    console.log(`✅ 迁移了 ${sales.length} 笔销售记录`);
    
    // 迁移库存数据
    console.log('📊 迁移库存数据...');
    const inventories = await sqlitePrisma.inventory.findMany();
    for (const inventory of inventories) {
      await targetPrisma.inventory.upsert({
        where: { productId: inventory.productId },
        update: inventory,
        create: inventory
      });
    }
    console.log(`✅ 迁移了 ${inventories.length} 条库存记录`);
    
    // 迁移退货数据
    console.log('🔄 迁移退货数据...');
    const returns = await sqlitePrisma.return.findMany();
    for (const returnItem of returns) {
      await targetPrisma.return.upsert({
        where: { id: returnItem.id },
        update: returnItem,
        create: returnItem
      });
    }
    console.log(`✅ 迁移了 ${returns.length} 笔退货记录`);
    
    // 迁移通知数据
    console.log('📧 迁移通知数据...');
    const notifications = await sqlitePrisma.inventoryNotification.findMany();
    for (const notification of notifications) {
      await targetPrisma.inventoryNotification.upsert({
        where: { email: notification.email },
        update: notification,
        create: notification
      });
    }
    console.log(`✅ 迁移了 ${notifications.length} 条通知记录`);
    
    // 迁移通知日志
    console.log('📝 迁移通知日志...');
    const notificationLogs = await sqlitePrisma.notificationLog.findMany();
    for (const log of notificationLogs) {
      await targetPrisma.notificationLog.create({
        data: log
      });
    }
    console.log(`✅ 迁移了 ${notificationLogs.length} 条通知日志`);
    
    console.log('🎉 数据迁移完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    await sqlitePrisma.$disconnect();
    await targetPrisma.$disconnect();
  }
}

// 运行迁移
migrateData();