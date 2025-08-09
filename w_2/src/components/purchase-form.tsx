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
import { Upload, Plus, Save, X, Loader2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  code: string
  series: string
  size?: string
  style?: string
  hiddenRatio?: number
  version?: string
  image?: string
}

interface PurchaseFormData {
  purchaseNo: string
  supplier: string
  manager: string
  purchaseTime: string
  purchaseType: string
  productId: string
  quantity: number
  unitCost: number
  totalCost: number
  batchNo?: string
  status: string
  notes?: string
}

interface PurchaseFormProps {
  onRefresh?: () => void
}

export default function PurchaseForm({ onRefresh }: PurchaseFormProps) {
  const [formData, setFormData] = useState<PurchaseFormData>({
    purchaseNo: '',
    supplier: '',
    manager: '',
    purchaseTime: new Date().toISOString().slice(0, 16),
    purchaseType: '',
    productId: '',
    quantity: 1,
    unitCost: 0,
    totalCost: 0,
    batchNo: '',
    status: 'pending',
    notes: ''
  })

  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    code: '',
    series: '',
    size: '',
    style: '',
    hiddenRatio: 0,
    version: '',
    image: ''
  })
  const [loading, setLoading] = useState(false)

  const purchaseTypes = [
    '整箱', '散装', '转单', '拼多多', '小红书', '抖音', '淘宝', '京东', '其他'
  ]

  const statusOptions = [
    { value: 'pending', label: '待到货', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'arrived', label: '已到货', color: 'bg-green-100 text-green-800' },
    { value: 'listed', label: '已上架', color: 'bg-blue-100 text-blue-800' }
  ]

  // 获取商品列表
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleInputChange = (field: keyof PurchaseFormData, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // 自动计算总成本
      if (field === 'quantity' || field === 'unitCost') {
        updated.totalCost = Number(updated.quantity) * Number(updated.unitCost)
      }
      
      return updated
    })
  }

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId)
    setSelectedProduct(product || null)
    setFormData(prev => ({ ...prev, productId }))
  }

  const handleNewProductChange = (field: keyof Product, value: string | number) => {
    setNewProduct(prev => ({ ...prev, [field]: value }))
  }

  const addNewProduct = async () => {
    if (!newProduct.name || !newProduct.code) {
      alert('请填写商品名称和编号')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newProduct)
      })

      if (response.ok) {
        const product = await response.json()
        setProducts(prev => [...prev, product])
        setNewProduct({
          name: '',
          code: '',
          series: '',
          size: '',
          style: '',
          hiddenRatio: 0,
          version: '',
          image: ''
        })
        setShowProductForm(false)
        
        // 自动选中新添加的商品
        setSelectedProduct(product)
        setFormData(prev => ({ ...prev, productId: product.id }))
      } else {
        const error = await response.json()
        alert(error.error || '添加商品失败')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('添加商品失败')
    } finally {
      setLoading(false)
    }
  }

  const generatePurchaseNo = () => {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = date.toTimeString().slice(0, 8).replace(/:/g, '')
    return `PO${dateStr}${timeStr}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.supplier || !formData.manager || !formData.purchaseType || !formData.productId) {
      alert('请填写所有必填字段')
      return
    }

    if (!formData.purchaseNo) {
      setFormData(prev => ({ ...prev, purchaseNo: generatePurchaseNo() }))
    }

    setLoading(true)
    try {
      const response = await fetch('/api/purchases/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('进货记录已保存！')
        
        // 重置表单
        setFormData({
          purchaseNo: '',
          supplier: '',
          manager: '',
          purchaseTime: new Date().toISOString().slice(0, 16),
          purchaseType: '',
          productId: '',
          quantity: 1,
          unitCost: 0,
          totalCost: 0,
          batchNo: '',
          status: 'pending',
          notes: ''
        })
        setSelectedProduct(null)
        
        // 刷新统计数据
        if (onRefresh) {
          onRefresh()
        }
      } else {
        const error = await response.json()
        alert(error.error || '保存失败')
      }
    } catch (error) {
      console.error('Error saving purchase:', error)
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
            <Plus className="h-5 w-5" />
            <span>进货管理</span>
          </CardTitle>
          <CardDescription>
            添加新的进货记录，管理商品入库信息
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="purchaseNo">进货编号</Label>
                <div className="flex space-x-2">
                  <Input
                    id="purchaseNo"
                    value={formData.purchaseNo}
                    onChange={(e) => handleInputChange('purchaseNo', e.target.value)}
                    placeholder="自动生成或手动输入"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleInputChange('purchaseNo', generatePurchaseNo())}
                  >
                    生成
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">供应商 *</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  placeholder="输入供应商名称"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manager">归属人 *</Label>
                <Input
                  id="manager"
                  value={formData.manager}
                  onChange={(e) => handleInputChange('manager', e.target.value)}
                  placeholder="输入负责人姓名"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchaseTime">进货时间</Label>
                <Input
                  id="purchaseTime"
                  type="datetime-local"
                  value={formData.purchaseTime}
                  onChange={(e) => handleInputChange('purchaseTime', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purchaseType">进货类型 *</Label>
                <Select value={formData.purchaseType} onValueChange={(value) => handleInputChange('purchaseType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择进货类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batchNo">批次编号</Label>
                <Input
                  id="batchNo"
                  value={formData.batchNo}
                  onChange={(e) => handleInputChange('batchNo', e.target.value)}
                  placeholder="输入批次编号"
                />
              </div>
            </div>

            <Separator />

            {/* 商品信息 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">商品信息</h3>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowProductForm(!showProductForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加新商品
                </Button>
              </div>

              {showProductForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">添加新商品</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="productName">商品名称 *</Label>
                        <Input
                          id="productName"
                          value={newProduct.name}
                          onChange={(e) => handleNewProductChange('name', e.target.value)}
                          placeholder="输入商品名称"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productCode">商品编号 *</Label>
                        <Input
                          id="productCode"
                          value={newProduct.code}
                          onChange={(e) => handleNewProductChange('code', e.target.value)}
                          placeholder="输入商品编号"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productSeries">系列</Label>
                        <Input
                          id="productSeries"
                          value={newProduct.series}
                          onChange={(e) => handleNewProductChange('series', e.target.value)}
                          placeholder="输入商品系列"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productSize">尺寸</Label>
                        <Input
                          id="productSize"
                          value={newProduct.size}
                          onChange={(e) => handleNewProductChange('size', e.target.value)}
                          placeholder="输入商品尺寸"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productStyle">款式</Label>
                        <Input
                          id="productStyle"
                          value={newProduct.style}
                          onChange={(e) => handleNewProductChange('style', e.target.value)}
                          placeholder="输入商品款式"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="productVersion">版本</Label>
                        <Input
                          id="productVersion"
                          value={newProduct.version}
                          onChange={(e) => handleNewProductChange('version', e.target.value)}
                          placeholder="输入商品版本"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowProductForm(false)}
                      >
                        取消
                      </Button>
                      <Button
                        type="button"
                        onClick={addNewProduct}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        添加商品
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                          {product.name} - {product.code}
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
                        {selectedProduct.hiddenRatio && (
                          <div><strong>隐藏款概率:</strong> {selectedProduct.hiddenRatio}%</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* 数量和价格信息 */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="quantity">数量 *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                  min="1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unitCost">成本单价 (元) *</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => handleInputChange('unitCost', parseFloat(e.target.value) || 0)}
                  min="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalCost">总成本 (元)</Label>
                <Input
                  id="totalCost"
                  type="number"
                  step="0.01"
                  value={formData.totalCost}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>

            <Separator />

            {/* 状态和备注 */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <Badge className={option.color}>
                            {option.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">备注</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="输入备注信息"
                  rows={1}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                保存进货记录
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}