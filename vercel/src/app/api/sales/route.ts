import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkAndSendInventoryAlerts } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const platform = searchParams.get('platform')
    const saleType = searchParams.get('saleType')

    let whereClause = {}

    if (startDate && endDate) {
      whereClause = {
        ...whereClause,
        saleTime: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    }

    if (platform) {
      whereClause = {
        ...whereClause,
        platform: { contains: platform, mode: 'insensitive' }
      }
    }

    if (saleType) {
      whereClause = {
        ...whereClause,
        saleType: saleType
      }
    }

    const sales = await db.sale.findMany({
      where: whereClause,
      include: {
        product: {
          include: {
            inventory: true
          }
        }
      },
      orderBy: {
        saleTime: 'desc'
      }
    })

    return NextResponse.json(sales)
  } catch (error) {
    console.error('Error fetching sales:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      saleTime,
      sender,
      platform,
      saleType,
      productId,
      quantity,
      salePrice,
      customerName,
      receiveMethod,
      expressCompany,
      trackingNo,
      shippingFee,
      notes,
      userId
    } = body

    // 验证用户ID
    if (!userId) {
      return NextResponse.json(
        { error: '用户信息缺失' },
        { status: 400 }
      )
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

    // 验证库存是否充足
    if (product.inventory[0].quantity < parseInt(quantity)) {
      return NextResponse.json(
        { error: '库存不足' },
        { status: 400 }
      )
    }

    // 计算利润
    const totalRevenue = parseFloat(salePrice) * parseInt(quantity)
    const totalCost = product.inventory[0].avgCost * parseInt(quantity)
    const totalShippingFee = parseFloat(shippingFee) || 0
    const profit = totalRevenue - totalCost - totalShippingFee

    // 创建出货记录
    const sale = await db.sale.create({
      data: {
        saleTime: new Date(saleTime),
        sender,
        platform,
        saleType,
        productId,
        quantity: parseInt(quantity),
        salePrice: parseFloat(salePrice),
        customerName,
        receiveMethod,
        expressCompany,
        trackingNo,
        shippingFee: totalShippingFee,
        profit,
        notes,
        userId
      },
      include: {
        product: true
      }
    })

    // 更新库存
    const newQuantity = product.inventory[0].quantity - parseInt(quantity)
    await db.inventory.update({
      where: { productId },
      data: {
        quantity: newQuantity,
        lastUpdated: new Date()
      }
    })

    // 检查是否需要发送库存警报
    await checkAndSendInventoryAlerts(productId, newQuantity)

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    console.error('Error creating sale:', error)
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    )
  }
}