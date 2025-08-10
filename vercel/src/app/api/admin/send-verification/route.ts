import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationCode } from '@/lib/email'
import { requireAdmin } from '@/lib/middleware'
import { config } from 'dotenv'

// Load environment variables
config()

export async function POST(request: NextRequest) {
  try {
    console.log('=== Admin Send Verification Request ===')
    
    const admin = await requireAdmin(request)
    if (admin instanceof NextResponse) {
      return admin
    }

    const { email } = await request.json()
    console.log('Request email:', email)

    if (!email) {
      return NextResponse.json(
        { error: '邮箱不能为空' },
        { status: 400 }
      )
    }

    // Debug environment variables
    console.log('Environment check:')
    console.log('EMAIL_PASSWORD set:', !!process.env.EMAIL_PASSWORD)
    console.log('EMAIL_PASSWORD length:', process.env.EMAIL_PASSWORD?.length || 0)
    
    const success = await sendVerificationCode(email)
    console.log('Send verification result:', success)

    if (success) {
      return NextResponse.json({
        message: '验证码已发送到管理员邮箱'
      })
    } else {
      return NextResponse.json(
        { 
          error: '发送验证码失败',
          debug: {
            env_set: !!process.env.EMAIL_PASSWORD,
            env_length: process.env.EMAIL_PASSWORD?.length || 0
          }
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Send verification error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    return NextResponse.json(
      { 
        error: '服务器错误',
        details: error.message 
      },
      { status: 500 }
    )
  }
}