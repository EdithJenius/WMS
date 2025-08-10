import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireAdmin } from '@/lib/middleware';

// 随机数据生成器
const randomProducts = [
  { name: '泡泡玛特 SKULLPANDA', code: 'SKULL001', series: 'SKULLPANDA系列', size: '常规款', style: '潮玩盲盒' },
  { name: '泡泡玛特 DIMOO', code: 'DIMOO001', series: 'DIMOO系列', size: '常规款', style: '潮玩盲盒' },
  { name: '泡泡玛特 MOLLY', code: 'MOLLY001', series: 'MOLLY系列', size: '常规款', style: '潮玩盲盒' },
  { name: '泡泡玛特 PUCKY', code: 'PUCKY001', series: 'PUCKY精灵系列', size: '常规款', style: '潮玩盲盒' },
  { name: '泡泡玛特 LABUBU', code: 'LABUBU001', series: 'LABUBU系列', size: '常规款', style: '潮玩盲盒' }
];

const randomSuppliers = ['潮玩批发商A', '盲盒供应商B', '玩具批发C', '潮玩总代D'];
const randomPlatforms = ['淘宝', '京东', '拼多多', '微信', '闲鱼'];
const randomCustomers = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
const randomReasons = ['质量问题', '包装破损', '不喜欢', '买错了', '尺寸不符', '颜色不符'];

function getRandomItem(array: any[]) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function generatePurchaseNo() {
  return `CG${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
}

function generateReturnNo() {
  return `RT${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
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

    // 清空现有数据（可选）
    const { clearExisting } = await request.json();
    
    if (clearExisting) {
      await db.return.deleteMany();
      await db.sale.deleteMany();
      await db.purchase.deleteMany();
      await db.inventory.deleteMany();
      await db.product.deleteMany();
    }

    // 创建产品
    const products = [];
    for (let i = 0; i < randomProducts.length; i++) {
      const productData = randomProducts[i];
      const product = await db.product.create({
        data: {
          name: productData.name,
          code: productData.code,
          series: productData.series,
          size: productData.size,
          style: productData.style,
          boxesPerCase: getRandomNumber(4, 8), // 一箱4-8端
          boxesPerSet: getRandomNumber(8, 12) // 一端8-12盒
        }
      });
      products.push(product);
    }

    // 创建进货记录
    const purchases = [];
    for (let i = 0; i < 10; i++) {
      const product = getRandomItem(products);
      const quantity = getRandomNumber(1, 5);
      const unit = getRandomItem(['case', 'casebox', 'box']);
      const unitCost = getRandomFloat(20, 100);
      
      const purchase = await db.purchase.create({
        data: {
          purchaseNo: generatePurchaseNo(),
          supplier: getRandomItem(randomSuppliers),
          manager: '管理员',
          purchaseTime: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // 过去30天内
          purchaseType: '常规进货',
          quantity,
          unit,
          unitCost,
          totalCost: quantity * unitCost,
          batchNo: `B${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          status: 'completed',
          productId: product.id,
          userId: session.user.id
        }
      });
      purchases.push(purchase);

      // 更新库存
      const existingInventory = await db.inventory.findUnique({
        where: { productId: product.id }
      });

      // 转换为盒数
      let boxQuantity = 0;
      if (unit === 'case') {
        boxQuantity = quantity * (product.boxesPerCase || 1) * (product.boxesPerSet || 1);
      } else if (unit === 'casebox') {
        boxQuantity = quantity * (product.boxesPerSet || 1);
      } else {
        boxQuantity = quantity;
      }

      if (existingInventory) {
        const totalQuantity = existingInventory.quantity + boxQuantity;
        const totalCost = existingInventory.avgCost * existingInventory.quantity + unitCost * boxQuantity;
        await db.inventory.update({
          where: { productId: product.id },
          data: {
            quantity: totalQuantity,
            avgCost: totalCost / totalQuantity,
            lastUpdated: new Date()
          }
        });
      } else {
        await db.inventory.create({
          data: {
            productId: product.id,
            quantity: boxQuantity,
            avgCost: unitCost,
            lastUpdated: new Date()
          }
        });
      }
    }

    // 创建销售记录
    const sales = [];
    for (let i = 0; i < 15; i++) {
      const product = getRandomItem(products);
      const inventory = await db.inventory.findUnique({
        where: { productId: product.id }
      });

      if (!inventory || inventory.quantity < 1) continue;

      const quantity = getRandomNumber(1, Math.min(3, inventory.quantity));
      const unit = 'box'; // 销售统一以盒为单位
      const salePrice = getRandomFloat(30, 150);
      const profit = (salePrice - inventory.avgCost) * quantity;

      const sale = await db.sale.create({
        data: {
          saleTime: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000), // 过去20天内
          sender: '管理员',
          platform: getRandomItem(randomPlatforms),
          saleType: '零售',
          quantity,
          unit,
          salePrice,
          customerName: getRandomItem(randomCustomers),
          receiveMethod: getRandomItem(['快递', '自提', '同城配送']),
          expressCompany: Math.random() > 0.3 ? getRandomItem(['顺丰', '圆通', '中通', '韵达']) : null,
          trackingNo: Math.random() > 0.3 ? String(Math.floor(Math.random() * 1000000000)) : null,
          shippingFee: Math.random() > 0.5 ? getRandomFloat(5, 20) : null,
          profit,
          productId: product.id,
          userId: session.user.id
        }
      });
      sales.push(sale);

      // 更新库存
      await db.inventory.update({
        where: { productId: product.id },
        data: {
          quantity: inventory.quantity - quantity,
          lastUpdated: new Date()
        }
      });
    }

    // 创建退货记录
    const returns = [];
    for (let i = 0; i < 8; i++) {
      const sale = getRandomItem(sales);
      const returnQuantity = getRandomNumber(1, sale.quantity);
      const returnPrice = getRandomFloat(sale.salePrice * 0.5, sale.salePrice * 0.9); // 退货价格通常是原价的50%-90%
      
      const returnRecord = await db.return.create({
        data: {
          returnNo: generateReturnNo(),
          returnTime: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000), // 过去10天内
          quantity: returnQuantity,
          returnPrice,
          totalAmount: returnQuantity * returnPrice,
          packageIntact: Math.random() > 0.3, // 70%概率包装完整
          resalable: Math.random() > 0.4, // 60%概率可二次出售
          reason: getRandomItem(randomReasons),
          notes: Math.random() > 0.5 ? '客户反馈良好' : null,
          status: getRandomItem(['pending', 'processing', 'completed', 'rejected']),
          saleId: sale.id,
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
      returns.push(returnRecord);
    }

    return NextResponse.json({
      message: '测试数据创建成功',
      stats: {
        products: products.length,
        purchases: purchases.length,
        sales: sales.length,
        returns: returns.length
      }
    });
  } catch (error) {
    console.error('创建测试数据失败:', error);
    return NextResponse.json({ error: '创建测试数据失败' }, { status: 500 });
  }
}