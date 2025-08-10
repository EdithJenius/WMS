'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Box, Plus, Save, Calculator, Loader2, Package } from 'lucide-react'
import { convertToBoxes, convertFromBoxes, formatInventory, getUnitDisplayName, type Unit } from '@/lib/unit-converter'

interface Product {
  id: string
  name: string
  code: string
  series: string
  boxesPerCase?: number | null
  boxesPerSet?: number | null
}

interface TestResult {
  input: { quantity: number; unit: Unit }
  boxes: number
  converted: { quantity: number; unit: Unit }[]
  formatted: string
}

export default function TestBlindBoxPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [testQuantity, setTestQuantity] = useState(1)
  const [testUnit, setTestUnit] = useState<Unit>('box')
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)

  const unitOptions: { value: Unit; label: string }[] = [
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
      const response = await fetch('/api/products/')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const runConversionTest = () => {
    if (!selectedProduct) {
      alert('请先选择一个商品')
      return
    }

    const specs = {
      boxesPerCase: selectedProduct.boxesPerCase,
      boxesPerSet: selectedProduct.boxesPerSet
    }

    // 转换为盒数
    const boxes = convertToBoxes(testQuantity, testUnit, specs)

    // 转换为各种单位
    const conversions: { quantity: number; unit: Unit }[] = []
    for (const unit of ['case', 'casebox', 'box'] as Unit[]) {
      const convertedQuantity = convertFromBoxes(boxes, unit, specs)
      conversions.push({ quantity: convertedQuantity, unit })
    }

    // 格式化库存显示
    const formatted = formatInventory(boxes, specs)

    const result: TestResult = {
      input: { quantity: testQuantity, unit: testUnit },
      boxes,
      converted: conversions,
      formatted
    }

    setTestResults(prev => [result, ...prev.slice(0, 9)]) // 保留最近10条结果
  }

  const addSampleProduct = async () => {
    const sampleProducts = [
      {
        name: '夏日系列盲盒',
        code: 'SUMMER001',
        series: '夏日系列',
        boxesPerCase: 4,
        boxesPerSet: 12
      },
      {
        name: '星空幻想盲盒',
        code: 'STAR001',
        series: '星空系列',
        boxesPerCase: 6,
        boxesPerSet: 8
      },
      {
        name: '萌宠乐园盲盒',
        code: 'PET001',
        series: '萌宠系列',
        boxesPerCase: 4,
        boxesPerSet: 6
      }
    ]

    const randomProduct = sampleProducts[Math.floor(Math.random() * sampleProducts.length)]

    try {
      const response = await fetch('/api/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(randomProduct)
      })

      if (response.ok) {
        fetchProducts()
        alert('示例商品添加成功！')
      } else {
        const error = await response.json()
        alert(error.error || '添加失败')
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('添加失败')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">盲盒规格测试页面</h1>
          <p className="text-muted-foreground">测试盲盒规格转换和库存计算功能</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左侧：测试面板 */}
          <div className="space-y-6">
            {/* 商品选择 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>商品选择</span>
                </CardTitle>
                <CardDescription>
                  选择一个商品进行单位转换测试
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Select value={selectedProduct?.id || ''} onValueChange={(value) => {
                    const product = products.find(p => p.id === value)
                    setSelectedProduct(product || null)
                  }}>
                    <SelectTrigger className="flex-1">
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
                  <Button onClick={addSampleProduct} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    添加示例
                  </Button>
                </div>

                {selectedProduct && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">商品规格</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>名称:</strong> {selectedProduct.name}</div>
                      <div><strong>编号:</strong> {selectedProduct.code}</div>
                      <div><strong>系列:</strong> {selectedProduct.series}</div>
                      {selectedProduct.boxesPerCase && selectedProduct.boxesPerSet && (
                        <>
                          <div><strong>一箱几端:</strong> {selectedProduct.boxesPerCase} 端</div>
                          <div><strong>一端几盒:</strong> {selectedProduct.boxesPerSet} 盒</div>
                          <div><strong>换算:</strong> 1箱 = {selectedProduct.boxesPerCase}端 = {selectedProduct.boxesPerCase * selectedProduct.boxesPerSet}盒</div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 转换测试 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>单位转换测试</span>
                </CardTitle>
                <CardDescription>
                  输入数量和单位，查看转换结果
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="testQuantity">数量</Label>
                    <Input
                      id="testQuantity"
                      type="number"
                      value={testQuantity}
                      onChange={(e) => setTestQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="testUnit">单位</Label>
                    <Select value={testUnit} onValueChange={(value) => setTestUnit(value as Unit)}>
                      <SelectTrigger>
                        <SelectValue />
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
                </div>

                <Button onClick={runConversionTest} disabled={!selectedProduct} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  执行转换测试
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：测试结果 */}
          <div className="space-y-6">
            {/* 规格说明 */}
            <Card>
              <CardHeader>
                <CardTitle>盲盒规格说明</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-3">
                  <div>
                    <h4 className="font-medium mb-1">层级结构</h4>
                    <p className="text-muted-foreground">
                      1箱 = 多个端盒 = 多个盲盒（全套普通款）
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">单位说明</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>箱 (case):</strong> 最小进货单位，通常包含多个端盒</li>
                      <li><strong>端盒 (casebox):</strong> 中间单位，包含全套普通款盲盒</li>
                      <li><strong>盒 (box):</strong> 最小单位，单个盲盒</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">使用场景</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>进货:</strong> 通常以"箱"为单位进货</li>
                      <li><strong>出货:</strong> 可以按"箱"、"端盒"或"盒"出货</li>
                      <li><strong>库存:</strong> 系统统一以"盒"为单位管理库存</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 测试结果 */}
            <Card>
              <CardHeader>
                <CardTitle>测试结果</CardTitle>
                <CardDescription>
                  显示最近的单位转换测试结果
                </CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Box className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>暂无测试结果</p>
                    <p className="text-sm">选择商品并执行转换测试</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {testResults.map((result, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">
                            {result.input.quantity}{getUnitDisplayName(result.input.unit)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            = {result.boxes} 盒
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">转换结果:</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            {result.converted.map((conv, i) => (
                              <div key={i} className="p-2 bg-muted rounded text-center">
                                <div className="font-medium">{conv.quantity}</div>
                                <div className="text-muted-foreground">{getUnitDisplayName(conv.unit)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                          <span className="font-medium">格式化显示:</span> {result.formatted}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}