const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('=== 检查用户数据 ===');
    
    const users = await prisma.user.findMany();
    console.log('当前用户:', users);
    
    if (users.length === 0) {
      console.log('没有找到用户，需要创建默认用户');
      
      // 创建默认管理员用户
      const adminUser = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@example.com',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
          role: 'admin'
        }
      });
      
      console.log('已创建默认管理员用户:', {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      });
      
      console.log('默认登录信息:');
      console.log('用户名: admin');
      console.log('密码: password');
    }
    
  } catch (error) {
    console.error('检查用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();