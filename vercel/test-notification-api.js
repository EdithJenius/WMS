// 测试库存通知 API 的简单脚本
const testNotificationAPI = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('=== 测试库存通知 API ===\n');
  
  // 测试 1: 获取通知列表
  console.log('1. 测试获取通知列表...');
  try {
    const response = await fetch(`${baseUrl}/api/inventory-notifications`);
    const data = await response.json();
    console.log('状态:', response.status);
    console.log('响应:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('错误:', error.message);
  }
  console.log('');
  
  // 测试 2: 添加通知邮箱
  console.log('2. 测试添加通知邮箱...');
  try {
    const response = await fetch(`${baseUrl}/api/inventory-notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    const data = await response.json();
    console.log('状态:', response.status);
    console.log('响应:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('错误:', error.message);
  }
  console.log('');
  
  // 测试 3: 检查库存警报
  console.log('3. 测试检查库存警报...');
  try {
    const response = await fetch(`${baseUrl}/api/check-inventory-alerts`, {
      method: 'POST',
    });
    const data = await response.json();
    console.log('状态:', response.status);
    console.log('响应:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('错误:', error.message);
  }
};

testNotificationAPI();