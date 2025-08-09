import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    const startDate = new Date(date)
    const endDate = new Date(date)
    endDate.setHours(23, 59, 59, 999)

    // 获取基本统计数据
    const [
      totalProducts,
      totalInventory,
      todayPurchases,
      todaySales,
      totalPurchaseValue,
      totalSalesValue,
      totalProfit
    ] = await Promise.all([
      // 总商品数
      db.product.count(),
      
      // 总库存数量
      db.inventory.aggregate({
        _sum: {
          quantity: true
        }
      }),
      
      // 今日进货数
      db.purchase.count({
        where: {
          purchaseTime: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // 今日出货数
      db.sale.count({
        where: {
          saleTime: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      
      // 总进货价值
      db.purchase.aggregate({
        _sum: {
          totalCost: true
        }
      }),
      
      // 总销售价值
      db.sale.aggregate({
        _sum: {
          salePrice: true
        }
      }),
      
      // 总利润
      db.sale.aggregate({
        _sum: {
          profit: true
        }
      })
    ])

    // 获取今日详细数据
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const [
      todayPurchaseValue,
      todaySalesValue,
      todayProfit,
      lowStockProducts,
      outOfStockProducts
    ] = await Promise.all([
      // 今日进货价值
      db.purchase.aggregate({
        where: {
          purchaseTime: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        _sum: {
          totalCost: true
        }
      }),
      
      // 今日销售价值
      db.sale.aggregate({
        where: {
          saleTime: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        _sum: {
          salePrice: true
        }
      }),
      
      // 今日利润
      db.sale.aggregate({
        where: {
          saleTime: {
            gte: todayStart,
            lte: todayEnd
          }
        },
        _sum: {
          profit: true
        }
      }),
      
      // 库存不足商品数
      db.inventory.count({
        where: {
          quantity: {
            gt: 0,
            lte: 10
          }
        }
      }),
      
      // 缺货商品数
      db.inventory.count({
        where: {
          quantity: 0
        }
      })
    ])

    // 获取总库存价值
    const inventoryItems = await db.inventory.findMany({
      include: {
        product: true
      }
    })

    const totalInventoryValue = inventoryItems.reduce(
      (sum, item) => sum + (item.quantity * item.avgCost),
      0
    )

    const stats = {
      overview: {
        totalProducts,
        totalInventory: totalInventory._sum.quantity || 0,
        todayPurchases,
        todaySales,
        totalInventoryValue
      },
      financial: {
        totalPurchaseValue: totalPurchaseValue._sum.totalCost || 0,
        totalSalesValue: totalSalesValue._sum.salePrice || 0,
        totalProfit: totalProfit._sum.profit || 0,
        todayPurchaseValue: todayPurchaseValue._sum.totalCost || 0,
        todaySalesValue: todaySalesValue._sum.salePrice || 0,
        todayProfit: todayProfit._sum.profit || 0
      },
      inventory: {
        lowStockProducts,
        outOfStockProducts,
        inStockProducts: totalProducts - lowStockProducts - outOfStockProducts
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}