const { sendInventoryAlertEmail } = require('./src/lib/email.js');

async function testEmail() {
  console.log('=== 测试邮件发送功能 ===');
  
  try {
    const result = await sendInventoryAlertEmail(
      '1801957829@qq.com',
      'Yooki',
      0
    );
    
    console.log('邮件发送结果:', result);
    
  } catch (error) {
    console.error('邮件发送失败:', error);
  }
}

testEmail();