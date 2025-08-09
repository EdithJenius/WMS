import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const series = searchParams.get('series')

    let whereClause = {}
    
    if (search) {
      whereClause = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { series: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    if (series && series !== 'all') {
      whereClause = {
        ...whereClause,
        series: series
      }
    }

    const products = await db.product.findMany({
      where: whereClause,
      include: {
        inventory: true,
        _count: {
          select: {
            purchases: true,
            sales: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      code,
      series,
      size,
      style,
      hiddenRatio,
      version,
      image
    } = body

    // 检查商品编号是否已存在
    const existingProduct = await db.product.findUnique({
      where: { code }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: '商品编号已存在' },
        { status: 400 }
      )
    }

    const product = await db.product.create({
      data: {
        name,
        code,
        series,
        size,
        style,
        hiddenRatio: hiddenRatio ? parseFloat(hiddenRatio) : null,
        version,
        image
      }
    })

    // 创建库存记录
    await db.inventory.create({
      data: {
        productId: product.id,
        quantity: 0,
        avgCost: 0
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}