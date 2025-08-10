import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    // 获取进货记录
    const purchasesWhere: any = {}
    const salesWhere: any = {}

    if (startDate && endDate) {
      purchasesWhere.purchaseTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
      salesWhere.saleTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (search) {
      purchasesWhere.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } }
        ]
      }
      salesWhere.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } }
        ]
      }
    }

    const [purchases, sales] = await Promise.all([
      db.purchase.findMany({
        where: purchasesWhere,
        include: {
          product: true
        },
        orderBy: {
          purchaseTime: 'desc'
        }
      }),
      db.sale.findMany({
        where: salesWhere,
        include: {
          product: true
        },
        orderBy: {
          saleTime: 'desc'
        }
      })
    ])

    // 转换为统一的记录格式
    const records = [
      ...purchases.map(purchase => ({
        id: purchase.id,
        type: 'purchase' as const,
        productName: purchase.product.name,
        productCode: purchase.product.code,
        quantity: purchase.quantity,
        price: purchase.unitCost,
        totalAmount: purchase.totalCost,
        date: purchase.purchaseTime.toISOString(),
        operator: purchase.manager,
        platform: purchase.purchaseType,
        customerName: null
      })),
      ...sales.map(sale => ({
        id: sale.id,
        type: 'sale' as const,
        productName: sale.product.name,
        productCode: sale.product.code,
        quantity: sale.quantity,
        price: sale.salePrice,
        totalAmount: sale.salePrice * sale.quantity,
        date: sale.saleTime.toISOString(),
        operator: sale.sender,
        platform: sale.platform,
        customerName: sale.customerName
      }))
    ]

    // 按日期排序
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // 根据类型过滤
    let filteredRecords = records
    if (type === 'purchase') {
      filteredRecords = records.filter(r => r.type === 'purchase')
    } else if (type === 'sale') {
      filteredRecords = records.filter(r => r.type === 'sale')
    }

    return NextResponse.json(filteredRecords)
  } catch (error) {
    console.error('Error fetching records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    )
  }
}