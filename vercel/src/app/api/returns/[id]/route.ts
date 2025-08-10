import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/lib/middleware';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminCheck = await requireAdmin(session);
    if (adminCheck) {
      return adminCheck;
    }

    const { status } = await request.json();
    const returnId = params.id;

    if (!status) {
      return NextResponse.json({ error: '缺少状态参数' }, { status: 400 });
    }

    const validStatuses = ['pending', 'processing', 'completed', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '无效的状态值' }, { status: 400 });
    }

    const updatedReturn = await db.return.update({
      where: { id: returnId },
      data: { status },
      include: {
        sale: {
          include: {
            product: true,
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedReturn);
  } catch (error) {
    console.error('更新退货状态失败:', error);
    return NextResponse.json({ error: '更新退货状态失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminCheck = await requireAdmin(session);
    if (adminCheck) {
      return adminCheck;
    }

    const returnId = params.id;

    await db.return.delete({
      where: { id: returnId }
    });

    return NextResponse.json({ message: '退货记录已删除' });
  } catch (error) {
    console.error('删除退货记录失败:', error);
    return NextResponse.json({ error: '删除退货记录失败' }, { status: 500 });
  }
}