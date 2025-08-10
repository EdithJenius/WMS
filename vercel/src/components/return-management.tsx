'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { RotateCcw, Search, Filter, Plus, Eye, Edit, Trash2 } from 'lucide-react'

interface Return {
  id: string
  returnNo: string
  returnTime: string
  quantity: number
  returnPrice: number
  totalAmount: number
  packageIntact: boolean
  resalable: boolean
  reason?: string
  notes?: string
  status: string
  sale: {
    id: string
    saleTime: string
    quantity: number
    unit: string
    salePrice: number
    customerName?: string
    platform: string
    product: {
      id: string
      name: string
      code: string
      series: string
    }
    user: {
      id: string
      username: string
      email: string
    }
  }
  user: {
    id: string
    username: string
    email: string
  }
}

interface User {
  id: string
  username: string
  email: string
  role: string
}

interface ReturnFormData {
  saleId: string
  quantity: number
  returnPrice: number
  packageIntact: boolean
  resalable: boolean
  reason?: string
  notes?: string
}

export default function ReturnManagement({ user }: { user: User }) {
  const [returns, setReturns] = useState<Return[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReturn, setEditingReturn] = useState<Return | null>(null)
  const [sales, setSales] = useState<any[]>([])
  const [formData, setFormData] = useState<ReturnFormData>({
    saleId: '',
    quantity: 0,
    returnPrice: 0,
    packageIntact: true,
    resalable: true,
    reason: '',
    notes: ''
  })

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'pending', label: '待处理' },
    { value: 'processing', label: '处理中' },
    { value: 'completed', label: '已完成' },
    { value: 'rejected', label: '已拒绝' }
  ]

  const statusLabels: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    rejected: '已拒绝'
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }

  const fetchReturns = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        status: selectedStatus
      })
      
      const response = await fetch(`/api/returns?${params}`)
      const data = await response.json()
      
      if (data.data) {
        setReturns(data.data)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('获取退货列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales?limit=1000')
      const data = await response.json()
      
      if (data.data) {
        setSales(data.data)
      }
    } catch (error) {
      console.error('获取销售列表失败:', error)
    }
  }

  useEffect(() => {
    fetchReturns()
    fetchSales()
  }, [currentPage, selectedStatus])

  const handleSubmit = async () => {
    if (!formData.saleId || !formData.quantity || !formData.returnPrice) {
      alert('请填写必填字段')
      return
    }

    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setFormData({
          saleId: '',
          quantity: 0,
          returnPrice: 0,
          packageIntact: true,
          resalable: true,
          reason: '',
          notes: ''
        })
        fetchReturns()
        alert('退货记录创建成功')
      } else {
        const error = await response.json()
        alert('创建失败: ' + error.error)
      }
    } catch (error) {
      console.error('创建退货记录失败:', error)
      alert('创建失败')
    }
  }

  const updateReturnStatus = async (returnId: string, status: string) => {
    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchReturns()
        alert('状态更新成功')
      } else {
        const error = await response.json()
        alert('更新失败: ' + error.error)
      }
    } catch (error) {
      console.error('更新退货状态失败:', error)
      alert('更新失败')
    }
  }

  const deleteReturn = async (returnId: string) => {
    if (!confirm('确定要删除这条退货记录吗？')) {
      return
    }

    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchReturns()
        alert('删除成功')
      } else {
        const error = await response.json()
        alert('删除失败: ' + error.error)
      }
    } catch (error) {
      console.error('删除退货记录失败:', error)
      alert('删除失败')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm', { locale: zhCN })
  }

  const getSelectedSale = () => {
    return sales.find(sale => sale.id === formData.saleId)
  }

  return (
    <div className="space-y-6">
      {/* 头部操作区 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <RotateCcw className="h-5 w-5" />
                <span>退货管理</span>
              </CardTitle>
              <CardDescription>
                管理客户退货记录，跟踪退货状态和处理进度
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>新建退货</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>新建退货记录</DialogTitle>
                  <DialogDescription>
                    填写退货信息，系统将自动关联对应的销售记录
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="saleId">选择销售记录 *</Label>
                      <Select
                        value={formData.saleId}
                        onValueChange={(value) => setFormData({ ...formData, saleId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择销售记录" />
                        </SelectTrigger>
                        <SelectContent>
                          {sales.map((sale) => (
                            <SelectItem key={sale.id} value={sale.id}>
                              {sale.product.name} - {sale.customerName || '未知客户'} - {formatDate(sale.saleTime)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantity">退货数量（盒） *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        placeholder="请输入退货数量"
                      />
                    </div>
                  </div>
                  
                  {getSelectedSale() && (
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm font-medium">销售记录信息：</p>
                      <p className="text-sm text-muted-foreground">
                        商品：{getSelectedSale().product.name} | 
                        客户：{getSelectedSale().customerName || '未知'} | 
                        原售价：{formatCurrency(getSelectedSale().salePrice)}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="returnPrice">退货单价 *</Label>
                      <Input
                        id="returnPrice"
                        type="number"
                        step="0.01"
                        value={formData.returnPrice}
                        onChange={(e) => setFormData({ ...formData, returnPrice: parseFloat(e.target.value) || 0 })}
                        placeholder="请输入退货单价"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>退货总金额</Label>
                      <div className="p-2 border rounded-md bg-muted">
                        {formatCurrency(formData.quantity * formData.returnPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>包装状态</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="packageIntact"
                          checked={formData.packageIntact}
                          onCheckedChange={(checked) => setFormData({ ...formData, packageIntact: checked as boolean })}
                        />
                        <Label htmlFor="packageIntact">包装完整</Label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>是否可二次出售</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="resalable"
                          checked={formData.resalable}
                          onCheckedChange={(checked) => setFormData({ ...formData, resalable: checked as boolean })}
                        />
                        <Label htmlFor="resalable">可二次出售</Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">退货原因</Label>
                    <Input
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="请输入退货原因"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">备注</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="请输入备注信息"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleSubmit}>
                    创建退货记录
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <Label>状态筛选：</Label>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchReturns}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 退货列表 */}
      <Card>
        <CardHeader>
          <CardTitle>退货记录列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">加载中...</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>退货编号</TableHead>
                      <TableHead>商品信息</TableHead>
                      <TableHead>客户信息</TableHead>
                      <TableHead>退货数量</TableHead>
                      <TableHead>退货金额</TableHead>
                      <TableHead>包装状态</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {returns.map((returnItem) => (
                      <TableRow key={returnItem.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{returnItem.returnNo}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(returnItem.returnTime)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{returnItem.sale.product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {returnItem.sale.product.code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{returnItem.sale.customerName || '未知客户'}</div>
                            <div className="text-sm text-muted-foreground">
                              {returnItem.sale.platform}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{returnItem.quantity} 盒</div>
                            <div className="text-sm text-muted-foreground">
                              原销售：{returnItem.sale.quantity} {returnItem.sale.unit}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{formatCurrency(returnItem.totalAmount)}</div>
                            <div className="text-sm text-muted-foreground">
                              单价：{formatCurrency(returnItem.returnPrice)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              包装：{returnItem.packageIntact ? '完整' : '破损'}
                            </div>
                            <div className="text-sm">
                              可售：{returnItem.resalable ? '是' : '否'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[returnItem.status]}>
                            {statusLabels[returnItem.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {user.role === 'admin' && (
                              <>
                                <Select
                                  value={returnItem.status}
                                  onValueChange={(value) => updateReturnStatus(returnItem.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">待处理</SelectItem>
                                    <SelectItem value="processing">处理中</SelectItem>
                                    <SelectItem value="completed">已完成</SelectItem>
                                    <SelectItem value="rejected">已拒绝</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteReturn(returnItem.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    第 {currentPage} 页，共 {totalPages} 页
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}