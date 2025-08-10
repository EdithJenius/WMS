import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/middleware'

// 获取所有库存通知设置
export async function GET(request: NextRequest) {
  try {
    const notifications = await db.inventoryNotification.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('获取库存通知失败:', error)
    return NextResponse.json(
      { error: '获取库存通知失败' },
      { status: 500 }
    )
  }
}

// 添加新的库存通知设置
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // 返回重定向响应
    }

    const body = await request.json()
    const { email } = body

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: '请输入有效的邮箱地址' },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existing = await db.inventoryNotification.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json(
        { error: '该邮箱已存在' },
        { status: 400 }
      )
    }

    const notification = await db.inventoryNotification.create({
      data: {
        email,
        isActive: true
      }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('添加库存通知失败:', error)
    return NextResponse.json(
      { error: '添加库存通知失败' },
      { status: 500 }
    )
  }
}

// 更新库存通知设置
export async function PUT(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // 返回重定向响应
    }

    const body = await request.json()
    const { id, isActive } = body

    if (!id) {
      return NextResponse.json(
        { error: '缺少通知ID' },
        { status: 400 }
      )
    }

    const notification = await db.inventoryNotification.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('更新库存通知失败:', error)
    return NextResponse.json(
      { error: '更新库存通知失败' },
      { status: 500 }
    )
  }
}

// 删除库存通知设置
export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await requireAdmin(request)
    if (authResult instanceof NextResponse) {
      return authResult // 返回重定向响应
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: '缺少通知ID' },
        { status: 400 }
      )
    }

    await db.inventoryNotification.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除库存通知失败:', error)
    return NextResponse.json(
      { error: '删除库存通知失败' },
      { status: 500 }
    )
  }
}