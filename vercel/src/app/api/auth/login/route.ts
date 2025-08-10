import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

async function authenticateUser(username: string, password: string) {
  const user = await db.user.findFirst({
    where: {
      OR: [
        { username: username },
        { email: username }
      ]
    }
  })

  if (!user) {
    return null
  }

  // 动态导入bcryptjs以避免模块解析问题
  const bcrypt = await import('bcryptjs')
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return null
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    const user = await authenticateUser(username, password)

    if (!user) {
      return NextResponse.json(
        { error: '用户名或密码错误' },
        { status: 401 }
      )
    }

    // 创建响应并设置 cookie
    const response = NextResponse.json({
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    })

    // 设置 HTTP-only cookie
    response.cookies.set('auth-token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}