import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    // 验证管理员密码
    if (password !== 'bugoumai') {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      )
    }
    
    // 清空数据库（按依赖关系顺序）
    await prisma.sale.deleteMany({})
    await prisma.purchase.deleteMany({})
    await prisma.inventory.deleteMany({})
    await prisma.product.deleteMany({})
    
    return NextResponse.json({ 
      success: true, 
      message: '数据库已成功重置' 
    })
    
  } catch (error) {
    console.error('重置数据库时出错:', error)
    return NextResponse.json(
      { error: '重置数据库时出错' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}