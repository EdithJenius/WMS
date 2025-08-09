import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const series = searchParams.get('series')
    const status = searchParams.get('status')

    let whereClause = {}

    if (search) {
      whereClause = {
        product: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
            { series: { contains: search, mode: 'insensitive' } }
          ]
        }
      }
    }

    if (series && series !== 'all') {
      whereClause = {
        ...whereClause,
        product: {
          series: series
        }
      }
    }

    const inventories = await db.inventory.findMany({
      where: whereClause,
      include: {
        product: true
      },
      orderBy: {
        lastUpdated: 'desc'
      }
    })

    // 根据状态过滤
    let filteredInventories = inventories
    if (status === 'in_stock') {
      filteredInventories = inventories.filter(inv => inv.quantity > 0)
    } else if (status === 'out_of_stock') {
      filteredInventories = inventories.filter(inv => inv.quantity === 0)
    } else if (status === 'low_stock') {
      filteredInventories = inventories.filter(inv => inv.quantity > 0 && inv.quantity <= 10)
    }

    return NextResponse.json(filteredInventories)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, quantity, avgCost } = body

    // 验证商品是否存在
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 400 }
      )
    }

    // 更新或创建库存记录
    const inventory = await db.inventory.upsert({
      where: { productId },
      update: {
        quantity: parseInt(quantity),
        avgCost: parseFloat(avgCost),
        lastUpdated: new Date()
      },
      create: {
        productId,
        quantity: parseInt(quantity),
        avgCost: parseFloat(avgCost)
      },
      include: {
        product: true
      }
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Error updating inventory:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}