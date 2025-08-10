// 临时调试脚本 - 测试邮件配置
require('dotenv').config();

console.log('=== 邮件配置调试 ===');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '已设置' : '未设置');
console.log('EMAIL_PASSWORD 长度:', process.env.EMAIL_PASSWORD?.length || 0);

if (process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD !== 'your_email_password_here') {
  console.log('✅ EMAIL_PASSWORD 已正确设置');
} else {
  console.log('❌ EMAIL_PASSWORD 未正确设置');
  console.log('请在 .env 文件中设置正确的 QQ 邮箱授权码');
  console.log('格式: EMAIL_PASSWORD="你的QQ邮箱授权码"');
}