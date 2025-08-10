'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Truck, Save, Calculator, Loader2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  code: string
  series: string
  size?: string
  style?: string
  avgCost?: number
  quantity?: number
  boxesPerCase?: number | null
  boxesPerSet?: number | null
}

interface SaleFormData {
  saleTime: string
  sender: string
  platform: string
  saleType: string
  productId: string
  quantity: number
  unit: string
  salePrice: number
  customerName?: string
  receiveMethod: string
  expressCompany?: string
  trackingNo?: string
  shippingFee?: number
  profit?: number
  notes?: string
}

interface SaleFormProps {
  onRefresh?: () => void
  user?: {
    id: string
    username: string
  }
}

export default function SaleForm({ onRefresh, user }: SaleFormProps) {
  const [formData, setFormData] = useState<SaleFormData>({
    saleTime: new Date().toISOString().slice(0, 16),
    sender: '',
    platform: '',
    saleType: '',
    productId: '',
    quantity: 1,
    unit: 'box',
    salePrice: 0,
    customerName: '',
    receiveMethod: '',
    expressCompany: '',
    trackingNo: '',
    shippingFee: 0,
    profit: 0,
    notes: ''
  })

  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)

  const platforms = [
    '拼多多', '小红书', '抖音', '淘宝', '京东', 'TikTok', '微信', '其他'
  ]

  const saleTypes = [
    '售卖', '赠送', '换货', '调拨'
  ]

  const receiveMethods = [
    '快递', '当面'
  ]

  const expressCompanies = [
    '顺丰速运', '中通快递', '圆通速递', '申通快递', '韵达速递', '邮政EMS', '京东物流', '其他'
  ]

  const unitOptions = [
    { value: 'case', label: '箱' },
    { value: 'casebox', label: '端盒' },
    { value: 'box', label: '盒' }
  ]

  // 获取商品列表
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/inventory/')
      const data = await response.json()
      const productsWithInventory = data.map((inv: any) => ({
        id: inv.product.id,
        name: inv.product.name,
        code: inv.product.code,
        series: inv.product.series,
        size: inv.product.size,
        style: inv.product.style,
        avgCost: inv.avgCost,
        quantity: inv.quantity,
        boxesPerCase: inv.product.boxesPerCase,
        boxesPerSet: inv.product.boxesPerSet
      }))
      setProducts(productsWithInventory)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleInputChange = (field: keyof SaleFormData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // 自动计算利润
      if (selectedProduct && (field === 'salePrice' || field === 'shippingFee' || field === 'quantity')) {
        const totalCost = (selectedProduct.avgCost || 0) * updated.quantity
        const totalRevenue = updated.salePrice * updated.quantity
        const totalShippingFee = updated.shippingFee || 0
        updated.profit = totalRevenue - totalCost - totalShippingFee
      }
      
      return updated
    })
  }

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId)
    setSelectedProduct(product || null)
    setFormData(prev => ({ ...prev, productId }))
    
    // 如果选择了商品，重新计算利润
    if (product) {
      setFormData(prev => {
        const totalCost = (product.avgCost || 0) * prev.quantity
        const totalRevenue = prev.salePrice * prev.quantity
        const totalShippingFee = prev.shippingFee || 0
        return {
          ...prev,
          productId,
          profit: totalRevenue - totalCost - totalShippingFee
        }
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.sender || !formData.platform || !formData.saleType || !formData.productId || !formData.receiveMethod) {
      alert('请填写所有必填字段')
      return
    }

    if (!user) {
      alert('用户信息丢失，请重新登录')
      return
    }

    // 验证库存
    if (selectedProduct && formData.quantity > (selectedProduct.quantity || 0)) {
      alert(`库存不足！当前库存：${selectedProduct.quantity}，试图出货：${formData.quantity}`)
      return
    }

    setLoading(true)
    try {
      const requestData = {
        ...formData,
        userId: user.id
      }

      const response = await fetch('/api/sales/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        alert('出货记录已保存！')
        
        // 重置表单
        setFormData({
          saleTime: new Date().toISOString().slice(0, 16),
          sender: '',
          platform: '',
          saleType: '',
          productId: '',
          quantity: 1,
          unit: 'box',
          salePrice: 0,
          customerName: '',
          receiveMethod: '',
          expressCompany: '',
          trackingNo: '',
          shippingFee: 0,
          profit: 0,
          notes: ''
        })
        setSelectedProduct(null)
        
        // 刷新统计数据
        if (onRefresh) {
          onRefresh()
        }
        
        // 刷新商品列表
        fetchProducts()
      } else {
        const error = await response.json()
        alert(error.error || '保存失败')
      }
    } catch (error) {
      console.error('Error saving sale:', error)
      alert('保存失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5" />
            <span>出货管理</span>
          </CardTitle>
          <CardDescription>
            添加新的出货记录，管理商品出库信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="saleTime">出货时间</Label>
                <Input
                  id="saleTime"
                  type="datetime-local"
                  value={formData.saleTime}
                  onChange={(e) => handleInputChange('saleTime', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sender">发货人 *</Label>
                <Input
                  id="sender"
                  value={formData.sender}
                  onChange={(e) => handleInputChange('sender', e.target.value)}
                  placeholder="输入发货人姓名"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platform">出货平台 *</Label>
                <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择出货平台" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(platform => (
                      <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="saleType">出货类型 *</Label>
                <Select value={formData.saleType} onValueChange={(value) => handleInputChange('saleType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择出货类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {saleTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerName">客户昵称/编号</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="输入客户昵称或编号"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receiveMethod">收货方式 *</Label>
                <Select value={formData.receiveMethod} onValueChange={(value) => handleInputChange('receiveMethod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择收货方式" />
                  </SelectTrigger>
                  <SelectContent>
                    {receiveMethods.map(method => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* 商品信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">商品信息</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="productSelect">选择商品 *</Label>
                  <Select value={formData.productId} onValueChange={handleProductChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择商品" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.code} (库存: {product.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProduct && (
                  <div className="space-y-2">
                    <Label>商品信息</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                      <div className="text-sm space-y-1">
                        <div><strong>名称:</strong> {selectedProduct.name}</div>
                        <div><strong>编号:</strong> {selectedProduct.code}</div>
                        <div><strong>系列:</strong> {selectedProduct.series}</div>
                        {selectedProduct.size && <div><strong>尺寸:</strong> {selectedProduct.size}</div>}
                        {selectedProduct.style && <div><strong>款式:</strong> {selectedProduct.style}</div>}
                        {selectedProduct.boxesPerCase && selectedProduct.boxesPerSet && (
                          <div><strong>规格:</strong> {selectedProduct.boxesPerCase}箱/端 × {selectedProduct.boxesPerSet}盒/端</div>
                        )}
                        <div><strong>平均成本:</strong> ¥{selectedProduct.avgCost}</div>
                        <div><strong>当前库存:</strong> {selectedProduct.quantity}盒</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* 数量和价格信息 */}
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label htmlFor="quantity">数量 *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  min="1"
                  max={selectedProduct?.quantity || 1}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">单位 *</Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择单位" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="salePrice">售价 (元) *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => handleInputChange('salePrice', parseFloat(e.target.value) || 0)}
                  min="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shippingFee">运费 (元)</Label>
                <Input
                  id="shippingFee"
                  type="number"
                  step="0.01"
                  value={formData.shippingFee}
                  onChange={(e) => handleInputChange('shippingFee', parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profit">利润 (元)</Label>
                <div className="relative">
                  <Input
                    id="profit"
                    type="number"
                    step="0.01"
                    value={formData.profit}
                    readOnly
                    className="bg-muted pr-10"
                  />
                  <Calculator className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* 快递信息 */}
            {formData.receiveMethod === '快递' && (
              <>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="expressCompany">快递公司</Label>
                    <Select value={formData.expressCompany} onValueChange={(value) => handleInputChange('expressCompany', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择快递公司" />
                      </SelectTrigger>
                      <SelectContent>
                        {expressCompanies.map(company => (
                          <SelectItem key={company} value={company}>{company}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="trackingNo">快递单号</Label>
                    <Input
                      id="trackingNo"
                      value={formData.trackingNo}
                      onChange={(e) => handleInputChange('trackingNo', e.target.value)}
                      placeholder="输入快递单号"
                    />
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* 备注 */}
            <div className="space-y-2">
              <Label htmlFor="notes">备注</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="输入备注信息"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                保存出货记录
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}