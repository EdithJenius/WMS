const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('=== 创建测试用户 ===');
    
    // 生成密码哈希
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'admin'
      }
    });
    
    console.log('已创建测试用户:', {
      id: testUser.id,
      username: testUser.username,
      email: testUser.email,
      role: testUser.role
    });
    
    console.log('登录信息:');
    console.log('用户名: testuser');
    console.log('密码: password123');
    
  } catch (error) {
    console.error('创建测试用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();