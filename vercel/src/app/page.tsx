'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, Truck, Search, BarChart3, RefreshCw, Wifi, Shield, LogOut, RotateCcw } from 'lucide-react'
import PurchaseForm from '@/components/purchase-form'
import SaleForm from '@/components/sale-form'
import InventoryList from '@/components/inventory-list'
import ReturnManagement from '@/components/return-management'
import NetworkInfo from '@/components/network-info'
import { useAuth } from '@/contexts/auth-context'

interface Stats {
  overview: {
    totalProducts: number
    totalInventory: number
    todayPurchases: number
    todaySales: number
    totalInventoryValue: number
  }
  financial: {
    totalPurchaseValue: number
    totalSalesValue: number
    totalProfit: number
    todayPurchaseValue: number
    todaySalesValue: number
    todayProfit: number
  }
  inventory: {
    lowStockProducts: number
    outOfStockProducts: number
    inStockProducts: number
  }
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      // 使用 window.location.href 进行硬重定向，避免 Next.js 路由状态问题
      window.location.href = '/login'
    }
  }, [user, authLoading])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <h1 className="text-2xl font-bold">潮玩盲盒库存管理系统 v1.0</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">v1.0</Badge>
              <Badge variant="outline">{user.username}</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStats}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>退出</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>概览</span>
            </TabsTrigger>
            <TabsTrigger value="purchase" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>进货管理</span>
            </TabsTrigger>
            <TabsTrigger value="sale" className="flex items-center space-x-2">
              <Truck className="h-4 w-4" />
              <span>出货管理</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>库存查询</span>
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>退货管理</span>
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center space-x-2">
              <Wifi className="h-4 w-4" />
              <span>移动端</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>管理员</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 基本统计 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总商品数</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.overview.totalProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">种商品</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总库存</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.overview.totalInventory || 0}</div>
                  <p className="text-xs text-muted-foreground">件商品</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">今日进货</CardTitle>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.overview.todayPurchases || 0}</div>
                  <p className="text-xs text-muted-foreground">笔进货</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">今日出货</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.overview.todaySales || 0}</div>
                  <p className="text-xs text-muted-foreground">笔出货</p>
                </CardContent>
              </Card>
            </div>

            {/* 财务统计 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">总库存价值</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats ? formatCurrency(stats.overview.totalInventoryValue) : '¥0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">库存总价值</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">今日销售</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats ? formatCurrency(stats.financial.todaySalesValue) : '¥0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">今日销售额</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">今日利润</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats?.financial.todayProfit && stats.financial.todayProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats && stats.financial.todayProfit ? formatCurrency(stats.financial.todayProfit) : '¥0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">今日利润</p>
                </CardContent>
              </Card>
            </div>

            {/* 库存状态 */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">正常库存</CardTitle>
                  <Package className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.inventory.inStockProducts || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">种商品</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">库存不足</CardTitle>
                  <Package className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats?.inventory.lowStockProducts || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">种商品</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">缺货</CardTitle>
                  <Package className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats?.inventory.outOfStockProducts || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">种商品</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="purchase">
            <PurchaseForm onRefresh={fetchStats} user={user} />
          </TabsContent>

          <TabsContent value="sale">
            <SaleForm onRefresh={fetchStats} user={user} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryList />
          </TabsContent>

          <TabsContent value="returns">
            <ReturnManagement user={user} />
          </TabsContent>

          <TabsContent value="network">
            <NetworkInfo />
          </TabsContent>

          <TabsContent value="admin">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>管理员功能</span>
                  </CardTitle>
                  <CardDescription>
                    数据库管理和其他管理员功能
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() => window.open('/admin', '_blank')}
                        className="flex items-center space-x-2"
                      >
                        <Shield className="h-4 w-4" />
                        <span>打开管理员面板</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const password = prompt('请输入管理员密码：')
                          if (password === 'bugoumai') {
                            if (confirm('确定要重置数据库吗？此操作不可恢复！')) {
                              fetch('/api/reset-database/', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ password }),
                              }).then(response => response.json())
                                .then(data => {
                                  if (data.success) {
                                    alert('数据库重置成功！')
                                    window.location.reload()
                                  } else {
                                    alert('重置失败：' + (data.error || '未知错误'))
                                  }
                                })
                                .catch(error => {
                                  alert('网络错误：' + error.message)
                                })
                            }
                          } else if (password !== null) {
                            alert('密码错误！')
                          }
                        }}
                        className="flex items-center space-x-2"
                      >
                        <Shield className="h-4 w-4" />
                        <span>快速重置数据库</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (confirm('确定要生成测试数据吗？这将创建产品、进货、销售和退货记录。')) {
                            fetch('/api/test-data', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ clearExisting: false }),
                            }).then(response => response.json())
                              .then(data => {
                                if (data.message) {
                                  alert(`测试数据创建成功！\n产品：${data.stats.products}个\n进货：${data.stats.purchases}笔\n销售：${data.stats.sales}笔\n退货：${data.stats.returns}笔`)
                                  window.location.reload()
                                } else {
                                  alert('创建失败：' + (data.error || '未知错误'))
                                }
                              })
                              .catch(error => {
                                alert('网络错误：' + error.message)
                              })
                          }
                        }}
                        className="flex items-center space-x-2"
                      >
                        <Shield className="h-4 w-4" />
                        <span>生成测试数据</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (confirm('确定要清空所有数据并重新生成测试数据吗？此操作不可恢复！')) {
                            const password = prompt('请输入管理员密码：')
                            if (password === 'bugoumai') {
                              fetch('/api/test-data', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ clearExisting: true }),
                              }).then(response => response.json())
                                .then(data => {
                                  if (data.message) {
                                    alert(`测试数据创建成功！\n产品：${data.stats.products}个\n进货：${data.stats.purchases}笔\n销售：${data.stats.sales}笔\n退货：${data.stats.returns}笔`)
                                    window.location.reload()
                                  } else {
                                    alert('创建失败：' + (data.error || '未知错误'))
                                  }
                                })
                                .catch(error => {
                                  alert('网络错误：' + error.message)
                                })
                            } else if (password !== null) {
                              alert('密码错误！')
                            }
                          }
                        }}
                        className="flex items-center space-x-2 bg-red-50 border-red-200 hover:bg-red-100"
                      >
                        <Shield className="h-4 w-4" />
                        <span>清空并生成测试数据</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}