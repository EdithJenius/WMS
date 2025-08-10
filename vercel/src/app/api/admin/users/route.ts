import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { requireAdmin } from '@/lib/middleware'
import { verifyCode } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) {
      return user
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) {
      return user
    }

    const { username, email, password, role = 'user', verificationCode } = await request.json()

    if (!username || !email || !password || !verificationCode) {
      return NextResponse.json(
        { error: '所有字段都必须填写' },
        { status: 400 }
      )
    }

    // 验证邮箱验证码
    if (!verifyCode(email, verificationCode)) {
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      )
    }

    // 检查用户名是否已存在
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名或邮箱已存在' },
        { status: 409 }
      )
    }

    // 创建用户
    const hashedPassword = await hashPassword(password)
    const newUser = await db.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      message: '用户创建成功',
      user: newUser
    })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}