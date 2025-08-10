import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const offset = (page - 1) * limit;

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const [returns, total] = await Promise.all([
      db.return.findMany({
        where,
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
        },
        orderBy: {
          returnTime: 'desc'
        },
        skip: offset,
        take: limit
      }),
      db.return.count({ where })
    ]);

    return NextResponse.json({
      data: returns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('获取退货列表失败:', error);
    return NextResponse.json({ error: '获取退货列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminCheck = await requireAdmin(session);
    if (adminCheck) {
      return adminCheck;
    }

    const data = await request.json();
    const {
      saleId,
      quantity,
      returnPrice,
      packageIntact,
      resalable,
      reason,
      notes
    } = data;

    // 验证必填字段
    if (!saleId || !quantity || !returnPrice) {
      return NextResponse.json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 检查销售记录是否存在
    const sale = await db.sale.findUnique({
      where: { id: saleId },
      include: { product: true }
    });

    if (!sale) {
      return NextResponse.json({ error: '销售记录不存在' }, { status: 404 });
    }

    // 生成退货编号
    const returnNo = `RT${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    // 创建退货记录
    const returnRecord = await db.return.create({
      data: {
        returnNo,
        saleId,
        quantity,
        returnPrice,
        totalAmount: quantity * returnPrice,
        packageIntact: packageIntact ?? true,
        resalable: resalable ?? true,
        reason,
        notes,
        userId: session.user.id
      },
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

    return NextResponse.json(returnRecord);
  } catch (error) {
    console.error('创建退货记录失败:', error);
    return NextResponse.json({ error: '创建退货记录失败' }, { status: 500 });
  }
}