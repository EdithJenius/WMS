import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { requireAdmin } from '@/lib/middleware'
import { verifyCode } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)
    if (admin instanceof NextResponse) {
      return admin
    }

    const { userId, newPassword, verificationCode } = await request.json()

    if (!userId || !newPassword || !verificationCode) {
      return NextResponse.json(
        { error: '所有字段都必须填写' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 验证邮箱验证码
    if (!verifyCode(user.email, verificationCode)) {
      return NextResponse.json(
        { error: '验证码错误或已过期' },
        { status: 400 }
      )
    }

    // 更新密码
    const hashedPassword = await hashPassword(newPassword)
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      message: '密码修改成功'
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}