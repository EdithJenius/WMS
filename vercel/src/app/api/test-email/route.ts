import { NextRequest, NextResponse } from 'next/server'
import { sendInventoryAlertEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('=== 测试邮件发送 API ===')
    
    const { email, productName, quantity } = await request.json()
    
    if (!email || !productName || quantity === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数：email, productName, quantity' },
        { status: 400 }
      )
    }
    
    console.log('发送测试邮件到:', email)
    console.log('商品名称:', productName)
    console.log('库存数量:', quantity)
    
    const result = await sendInventoryAlertEmail(email, productName, quantity)
    
    console.log('邮件发送结果:', result)
    
    return NextResponse.json({
      success: result,
      message: result ? '邮件发送成功' : '邮件发送失败',
      email,
      productName,
      quantity
    })
    
  } catch (error) {
    console.error('测试邮件发送失败:', error)
    return NextResponse.json(
      { 
        error: '测试邮件发送失败',
        details: error.message 
      },
      { status: 500 }
    )
  }
}