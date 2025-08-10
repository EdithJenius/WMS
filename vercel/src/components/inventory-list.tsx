'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Download, Eye, Package, Loader2 } from 'lucide-react'

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

interface Inventory {
  id: string
  productId: string
  quantity: number
  avgCost: number
  lastUpdated: string
  product: Product
}

interface InventoryRecord {
  id: string
  type: 'purchase' | 'sale'
  productName: string
  productCode: string
  quantity: number
  price: number
  totalAmount: number
  date: string
  operator: string
  platform?: string
  customerName?: string
}

export default function InventoryList() {
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [filteredInventories, setFilteredInventories] = useState<Inventory[]>([])
  const [records, setRecords] = useState<InventoryRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<InventoryRecord[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSeries, setFilterSeries] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('inventory')
  const [loading, setLoading] = useState(false)

  // 获取库存数据
  useEffect(() => {
    fetchInventory()
    fetchRecords()
  }, [])

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/inventory/')
      const data = await response.json()
      setInventories(data)
      setFilteredInventories(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/records/')
      const data = await response.json()
      setRecords(data)
      setFilteredRecords(data)
    } catch (error) {
      console.error('Error fetching records:', error)
    }
  }

  // 获取所有系列
  const allSeries = Array.from(new Set(inventories.map(inv => inv.product.series)))

  // 过滤库存
  useEffect(() => {
    let filtered = inventories

    if (searchTerm) {
      filtered = filtered.filter(inv =>
        inv.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.product.series.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterSeries !== 'all') {
      filtered = filtered.filter(inv => inv.product.series === filterSeries)
    }

    if (filterStatus === 'in_stock') {
      filtered = filtered.filter(inv => inv.quantity > 0)
    } else if (filterStatus === 'out_of_stock') {
      filtered = filtered.filter(inv => inv.quantity === 0)
    } else if (filterStatus === 'low_stock') {
      filtered = filtered.filter(inv => inv.quantity > 0 && inv.quantity <= 10)
    }

    setFilteredInventories(filtered)
  }, [inventories, searchTerm, filterSeries, filterStatus])

  // 过滤记录
  useEffect(() => {
    let filtered = records

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.operator.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRecords(filtered)
  }, [records, searchTerm])

  const getStatusBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">缺货</Badge>
    } else if (quantity <= 10) {
      return <Badge variant="secondary">库存不足</Badge>
    } else {
      return <Badge variant="default">有库存</Badge>
    }
  }

  const getTypeBadge = (type: 'purchase' | 'sale') => {
    if (type === 'purchase') {
      return <Badge variant="default" className="bg-green-100 text-green-800">进货</Badge>
    } else {
      return <Badge variant="default" className="bg-blue-100 text-blue-800">出货</Badge>
    }
  }

  const exportData = () => {
    const data = activeTab === 'inventory' ? filteredInventories : filteredRecords
    const csvContent = activeTab === 'inventory' 
      ? '商品名称,商品编号,系列,尺寸,款式,库存数量,平均成本,总价值,最后更新\n' +
        data.map(inv => 
          `${inv.product.name},${inv.product.code},${inv.product.series},${inv.product.size || ''},${inv.product.style || ''},${inv.quantity},${inv.avgCost},${inv.quantity * inv.avgCost},${new Date(inv.lastUpdated).toLocaleString()}`
        ).join('\n')
      : '类型,商品名称,商品编号,数量,单价,总金额,日期,操作人,平台,客户\n' +
        data.map(record => 
          `${record.type === 'purchase' ? '进货' : '出货'},${record.productName},${record.productCode},${record.quantity},${record.price},${record.totalAmount},${new Date(record.date).toLocaleString()},${record.operator},${record.platform || ''},${record.customerName || ''}`
        ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${activeTab === 'inventory' ? '库存清单' : '出入库记录'}_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  const totalInventoryValue = filteredInventories.reduce((sum, inv) => sum + (inv.quantity * inv.avgCost), 0)
  const totalInventoryQuantity = filteredInventories.reduce((sum, inv) => sum + inv.quantity, 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>库存查询</span>
          </CardTitle>
          <CardDescription>
            查询商品库存信息和出入库记录
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 统计信息 */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">商品种类</p>
                    <p className="text-2xl font-bold">{filteredInventories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">总库存数量</p>
                    <p className="text-2xl font-bold">{totalInventoryQuantity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">总库存价值</p>
                    <p className="text-2xl font-bold">¥{totalInventoryValue.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 搜索和过滤 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="搜索商品名称、编号、系列..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {activeTab === 'inventory' && (
              <>
                <div className="md:w-48">
                  <Label htmlFor="series">系列</Label>
                  <Select value={filterSeries} onValueChange={setFilterSeries}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择系列" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有系列</SelectItem>
                      {allSeries.map(series => (
                        <SelectItem key={series} value={series}>{series}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:w-48">
                  <Label htmlFor="status">状态</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有状态</SelectItem>
                      <SelectItem value="in_stock">有库存</SelectItem>
                      <SelectItem value="low_stock">库存不足</SelectItem>
                      <SelectItem value="out_of_stock">缺货</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div className="flex items-end space-x-2">
              <Button onClick={exportData} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
              <Button onClick={() => { fetchInventory(); fetchRecords(); }} variant="outline">
                <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </div>

          {/* 标签切换 */}
          <div className="flex space-x-4 mb-6">
            <Button
              variant={activeTab === 'inventory' ? 'default' : 'outline'}
              onClick={() => setActiveTab('inventory')}
            >
              库存清单
            </Button>
            <Button
              variant={activeTab === 'records' ? 'default' : 'outline'}
              onClick={() => setActiveTab('records')}
            >
              出入库记录
            </Button>
          </div>

          {/* 库存清单表格 */}
          {activeTab === 'inventory' && (
            <div className="rounded-md border">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">加载中...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品信息</TableHead>
                      <TableHead>系列</TableHead>
                      <TableHead>尺寸</TableHead>
                      <TableHead>款式</TableHead>
                      <TableHead>库存数量</TableHead>
                      <TableHead>平均成本</TableHead>
                      <TableHead>总价值</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>最后更新</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventories.map((inventory) => (
                      <TableRow key={inventory.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{inventory.product.name}</div>
                            <div className="text-sm text-muted-foreground">{inventory.product.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>{inventory.product.series}</TableCell>
                        <TableCell>{inventory.product.size || '-'}</TableCell>
                        <TableCell>{inventory.product.style || '-'}</TableCell>
                        <TableCell>{inventory.quantity}</TableCell>
                        <TableCell>¥{inventory.avgCost.toFixed(2)}</TableCell>
                        <TableCell>¥{(inventory.quantity * inventory.avgCost).toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(inventory.quantity)}</TableCell>
                        <TableCell>{new Date(inventory.lastUpdated).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* 出入库记录表格 */}
          {activeTab === 'records' && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>类型</TableHead>
                    <TableHead>商品信息</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>单价</TableHead>
                    <TableHead>总金额</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>操作人</TableHead>
                    <TableHead>平台</TableHead>
                    <TableHead>客户</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{getTypeBadge(record.type)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{record.productName}</div>
                          <div className="text-sm text-muted-foreground">{record.productCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>{record.quantity}</TableCell>
                      <TableCell>¥{record.price.toFixed(2)}</TableCell>
                      <TableCell>¥{record.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(record.date).toLocaleString()}</TableCell>
                      <TableCell>{record.operator}</TableCell>
                      <TableCell>{record.platform || '-'}</TableCell>
                      <TableCell>{record.customerName || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}