import nodemailer from 'nodemailer'
import { config } from 'dotenv'
import { db } from './db'

// Load environment variables
config()

// 创建全局共享的验证码存储
// 使用 globalThis 来确保在模块重新加载时保持数据
declare global {
  var globalVerificationCodes: Map<string, { code: string; expires: number }> | undefined
}

// 初始化全局验证码存储
if (!global.globalVerificationCodes) {
  global.globalVerificationCodes = new Map<string, { code: string; expires: number }>()
}

const verificationCodes = global.globalVerificationCodes

// 创建邮件传输器
const createTransporter = () => {
  console.log('Creating email transporter...')
  const emailPassword = process.env.EMAIL_PASSWORD
  console.log('EMAIL_PASSWORD environment variable:', emailPassword ? 'SET' : 'NOT SET')
  console.log('EMAIL_PASSWORD length:', emailPassword?.length || 0)
  
  if (!emailPassword) {
    throw new Error('EMAIL_PASSWORD environment variable is not set')
  }
  
  const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 587,
    secure: false, // 使用STARTTLS
    requireTLS: true,
    auth: {
      user: '3233569941@qq.com',
      pass: emailPassword
    },
    // 添加更多配置选项
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1'
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 8000,
    // 添加调试选项
    debug: true,
    logger: true,
    // 添加重试机制
    pool: true,
    maxConnections: 1,
    rateDelta: 1000,
    rateLimit: 5
  })

  return transporter
}

export async function sendVerificationCode(email: string): Promise<boolean> {
  try {
    console.log('=== Starting sendVerificationCode process ===')
    console.log('Target email:', email)
    
    // 检查环境变量
    const emailPassword = process.env.EMAIL_PASSWORD
    if (!emailPassword) {
      console.error('EMAIL_PASSWORD environment variable is not set')
      return false
    }
    
    console.log('EMAIL_PASSWORD is set with length:', emailPassword.length)
    console.log('EMAIL_PASSWORD preview:', `${emailPassword.substring(0, 4)}...${emailPassword.substring(emailPassword.length - 4)}`)
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('Generated verification code:', code)
    
    // 设置5分钟过期时间
    const expires = Date.now() + 5 * 60 * 1000
    
    // 存储验证码
    verificationCodes.set(email, { code, expires })
    console.log('Verification code stored for email:', email)
    
    // 创建邮件传输器
    const transporter = createTransporter()
    
    // 发送邮件
    const mailOptions = {
      from: '3233569941@qq.com',
      to: '3233569941@qq.com',
      subject: '管理员操作验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            管理员操作验证码
          </h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 16px;">
              有管理员请求执行以下操作：
            </p>
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
              目标邮箱：${email}
            </p>
            <p style="margin: 0 0 10px 0; font-size: 16px;">
              验证码：<span style="font-size: 24px; font-weight: bold; color: #007bff;">${code}</span>
            </p>
          </div>
          <p style="color: #666; font-size: 14px; margin: 20px 0 0 0;">
            此验证码将在5分钟后过期，请尽快使用。如果您没有请求此操作，请忽略此邮件。
          </p>
        </div>
      `
    }
    
    console.log('=== Email Configuration ===')
    console.log('From:', mailOptions.from)
    console.log('To:', mailOptions.to)
    console.log('Subject:', mailOptions.subject)
    console.log('==========================')
    
    // 验证连接
    console.log('Verifying SMTP connection...')
    try {
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully')
    } catch (verifyError) {
      console.error('❌ SMTP connection verification failed:', verifyError)
      console.error('Verify error details:', {
        message: verifyError.message,
        code: verifyError.code,
        command: verifyError.command,
        responseCode: verifyError.responseCode,
        response: verifyError.response
      })
      return false
    }
    
    console.log('Attempting to send email...')
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully!')
    console.log('Message ID:', info.messageId)
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    
    return true
  } catch (error) {
    console.error('❌ 发送验证码失败:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
      stack: error.stack
    })
    return false
  }
}

export function verifyCode(email: string, code: string): boolean {
  console.log('=== Verifying Code ===')
  console.log('Email:', email)
  console.log('Input code:', code)
  
  const stored = verificationCodes.get(email)
  
  if (!stored) {
    console.log('❌ No stored code found for email:', email)
    console.log('Available emails:', Array.from(verificationCodes.keys()))
    return false
  }
  
  console.log('✅ Stored code found:', {
    code: stored.code,
    expires: new Date(stored.expires).toISOString(),
    expiresTimestamp: stored.expires,
    now: new Date().toISOString(),
    nowTimestamp: Date.now()
  })
  
  // 检查是否过期 - 使用时间戳比较而不是Date对象
  const now = Date.now()
  if (now > stored.expires) {
    console.log('❌ Code expired for email:', email)
    console.log('Expired at:', new Date(stored.expires).toISOString())
    console.log('Current time:', new Date(now).toISOString())
    verificationCodes.delete(email)
    return false
  }
  
  // 验证码是否正确 - 去除空格后比较
  const normalizedInputCode = code.trim()
  const normalizedStoredCode = stored.code.trim()
  
  if (normalizedStoredCode === normalizedInputCode) {
    console.log('✅ Code verified successfully for email:', email)
    verificationCodes.delete(email)
    return true
  }
  
  console.log('❌ Code verification failed for email:', email)
  console.log('Expected:', normalizedStoredCode)
  console.log('Received:', normalizedInputCode)
  return false
}

// 清理过期验证码
setInterval(() => {
  const now = Date.now()
  let cleanedCount = 0
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expires) {
      verificationCodes.delete(email)
      cleanedCount++
    }
  }
  if (cleanedCount > 0) {
    console.log('Cleaned up', cleanedCount, 'expired verification codes')
  }
}, 60 * 1000) // 每分钟清理一次

// 库存监控配置
const INVENTORY_THRESHOLD = 2 // 警戒线：2箱

// 检查并发送库存警报的辅助函数
export async function checkAndSendInventoryAlerts(productId: string, newQuantity: number) {
  try {
    // 只有当库存数量小于等于警戒线时才发送警报
    if (newQuantity > INVENTORY_THRESHOLD) {
      return
    }

    console.log(`检测到低库存商品ID: ${productId}, 数量: ${newQuantity}`)

    // 获取商品信息
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      console.error(`未找到商品ID: ${productId}`)
      return
    }

    // 获取所有启用的邮件通知设置
    const notifications = await db.inventoryNotification.findMany({
      where: { isActive: true }
    })

    if (notifications.length === 0) {
      console.log('没有启用的邮件通知设置，跳过发送')
      return
    }

    // 检查今天是否已经发送过通知
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existingLog = await db.notificationLog.findFirst({
      where: {
        productId,
        email: { in: notifications.map(n => n.email) },
        sentAt: { gte: today }
      }
    })

    if (existingLog) {
      console.log(`商品 ${product.name} 今天已经发送过通知，跳过`)
      return
    }

    // 为每个邮箱发送通知
    for (const notification of notifications) {
      try {
        console.log(`发送库存警报到: ${notification.email}`)
        
        const success = await sendInventoryAlertEmail(
          notification.email,
          product.name,
          newQuantity
        )

        // 记录发送日志
        await db.notificationLog.create({
          data: {
            productId,
            productName: product.name,
            quantity: newQuantity,
            threshold: INVENTORY_THRESHOLD,
            email: notification.email,
            success
          }
        })

        if (success) {
          console.log(`✅ 成功发送库存警报邮件到 ${notification.email}`)
        } else {
          console.error(`❌ 发送库存警报邮件失败到 ${notification.email}`)
        }
      } catch (error) {
        console.error(`发送邮件到 ${notification.email} 时出错:`, error)
      }
    }
  } catch (error) {
    console.error('检查并发送库存警报时出错:', error)
  }
}

// 发送库存警报邮件
export async function sendInventoryAlertEmail(email: string, productName: string, quantity: number): Promise<boolean> {
  try {
    console.log('=== Starting sendInventoryAlertEmail process ===')
    console.log('Target email:', email)
    console.log('Product:', productName)
    console.log('Quantity:', quantity)
    
    // 检查环境变量
    const emailPassword = process.env.EMAIL_PASSWORD
    if (!emailPassword) {
      console.error('EMAIL_PASSWORD environment variable is not set')
      return false
    }
    
    // 创建邮件传输器
    const transporter = createTransporter()
    
    // 发送邮件
    const mailOptions = {
      from: '3233569941@qq.com',
      to: email,
      subject: `库存警报：${productName} 库存不足`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
            🚨 库存警报
          </h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
              以下商品库存已达到警戒线：
            </p>
            <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #dc3545;">
              商品名称：${productName}
            </p>
            <p style="margin: 0 0 10px 0; font-size: 16px;">
              当前库存：<span style="font-size: 24px; font-weight: bold; color: #dc3545;">${quantity}</span> 箱
            </p>
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">
              警戒线：2箱
            </p>
          </div>
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold; color: #1976d2;">
              💡 建议
            </p>
            <p style="margin: 0; font-size: 14px;">
              请及时补充库存，避免影响正常销售。建议立即联系供应商安排进货。
            </p>
          </div>
          <p style="color: #666; font-size: 12px; margin: 20px 0 0 0;">
            此邮件由系统自动发送，请勿回复。如有疑问，请联系管理员。
          </p>
          <p style="color: #666; font-size: 12px; margin: 5px 0 0 0;">
            发送时间：${new Date().toLocaleString('zh-CN')}
          </p>
        </div>
      `
    }
    
    console.log('=== Email Configuration ===')
    console.log('From:', mailOptions.from)
    console.log('To:', mailOptions.to)
    console.log('Subject:', mailOptions.subject)
    console.log('==========================')
    
    // 验证连接
    console.log('Verifying SMTP connection...')
    try {
      await transporter.verify()
      console.log('✅ SMTP connection verified successfully')
    } catch (verifyError) {
      console.error('❌ SMTP connection verification failed:', verifyError)
      return false
    }
    
    console.log('Attempting to send inventory alert email...')
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Inventory alert email sent successfully!')
    console.log('Message ID:', info.messageId)
    
    return true
  } catch (error) {
    console.error('❌ 发送库存警报邮件失败:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
      stack: error.stack
    })
    return false
  }
}