import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/middleware'

// GET /api/notification-logs - 获取通知日志
export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin(request)
    if (user instanceof NextResponse) {
      return user
    }

    const logs = await db.notificationLog.findMany({
      orderBy: { sentAt: 'desc' },
      take: 50 // 限制返回最近50条记录
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('获取通知日志失败:', error)
    return NextResponse.json({ error: '获取通知日志失败' }, { status: 500 })
  }
}