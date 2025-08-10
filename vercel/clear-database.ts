import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    console.log('正在清空数据库...')
    
    // 删除所有数据（按依赖关系顺序）
    await prisma.sale.deleteMany({})
    console.log('已清空销售记录')
    
    await prisma.purchase.deleteMany({})
    console.log('已清空进货记录')
    
    await prisma.inventory.deleteMany({})
    console.log('已清空库存记录')
    
    await prisma.product.deleteMany({})
    console.log('已清空产品记录')
    
    console.log('数据库清空完成！')
    
  } catch (error) {
    console.error('清空数据库时出错:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearDatabase()