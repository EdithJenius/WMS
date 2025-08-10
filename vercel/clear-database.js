// clear-database.js - 清空数据库脚本
const fs = require('fs');
const { execSync } = require('child_process');

console.log('正在清空数据库...');

// 删除数据库文件
const dbFiles = [
  'db/custom.db',
  'prisma/db/custom.db'
];

dbFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`已删除: ${file}`);
  }
});

console.log('数据库文件已删除');

// 重新生成数据库
console.log('正在重新创建数据库...');
try {
  execSync('npm run db:push', { stdio: 'inherit' });
  console.log('数据库已重置完成！');
} catch (error) {
  console.error('重新创建数据库失败:', error.message);
  process.exit(1);
}

// 生成 Prisma 客户端
console.log('正在生成 Prisma 客户端...');
try {
  execSync('npm run db:generate', { stdio: 'inherit' });
  console.log('所有操作完成！');
} catch (error) {
  console.error('生成 Prisma 客户端失败:', error.message);
  process.exit(1);
}