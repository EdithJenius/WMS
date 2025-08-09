import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const supplier = searchParams.get('supplier')

    let whereClause = {}

    if (startDate && endDate) {
      whereClause = {
        ...whereClause,
        purchaseTime: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    }

    if (supplier) {
      whereClause = {
        ...whereClause,
        supplier: { contains: supplier, mode: 'insensitive' }
      }
    }

    const purchases = await db.purchase.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            inventory: true
          }
        }
      },
      orderBy: {
        purchaseTime: 'desc'
      }
    })

    return NextResponse.json(purchases)
  } catch (error) {
    console.error('Error fetching purchases:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to fetch purchases', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      purchaseNo,
      supplier,
      manager,
      purchaseTime,
      purchaseType,
      productId,
      quantity,
      unitCost,
      totalCost,
      batchNo,
      status,
      notes
    } = body

    // 检查进货编号是否已存在
    if (purchaseNo) {
      const existingPurchase = await db.purchase.findUnique({
        where: { purchaseNo }
      })

      if (existingPurchase) {
        return NextResponse.json(
          { error: '进货编号已存在' },
          { status: 400 }
        )
      }
    }

    // 验证商品是否存在
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { inventory: true }
    })

    if (!product) {
      return NextResponse.json(
        { error: '商品不存在' },
        { status: 400 }
      )
    }

    // 生成进货编号（如果未提供）
    const finalPurchaseNo = purchaseNo || `PO${Date.now()}`

    // 创建进货记录
    const purchase = await db.purchase.create({
      data: {
        purchaseNo: finalPurchaseNo,
        supplier,
        manager,
        purchaseTime: new Date(purchaseTime),
        purchaseType,
        productId,
        quantity: parseInt(quantity),
        unitCost: parseFloat(unitCost),
        totalCost: parseFloat(totalCost),
        batchNo,
        status,
        notes
      },
      include: {
        product: true
      }
    })

    // 如果状态是已到货，更新库存
    if (status === 'arrived' || status === 'listed') {
      const currentInventory = product.inventory[0] // 获取第一个库存记录
      const newQuantity = currentInventory.quantity + parseInt(quantity)
      const newAvgCost = currentInventory.quantity > 0 
        ? ((currentInventory.avgCost * currentInventory.quantity) + parseFloat(totalCost)) / newQuantity
        : parseFloat(unitCost)

      await db.inventory.update({
        where: { productId },
        data: {
          quantity: newQuantity,
          avgCost: newAvgCost,
          lastUpdated: new Date()
        }
      })
    }

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error('Error creating purchase:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to create purchase', details: errorMessage },
      { status: 500 }
    )
  }
}