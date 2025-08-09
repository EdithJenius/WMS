'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Plus, Package, Truck, Search, BarChart3, RefreshCw, Wifi } from 'lucide-react'
import PurchaseForm from '@/components/purchase-form'
import SaleForm from '@/components/sale-form'
import InventoryList from '@/components/inventory-list'
import NetworkInfo from '@/components/network-info'

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

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stats/')  // 添加斜杠
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
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStats}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="network" className="flex items-center space-x-2">
              <Wifi className="h-4 w-4" />
              <span>移动端</span>
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
            <PurchaseForm onRefresh={fetchStats} />
          </TabsContent>

          <TabsContent value="sale">
            <SaleForm onRefresh={fetchStats} />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryList />
          </TabsContent>

          <TabsContent value="network">
            <NetworkInfo />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}