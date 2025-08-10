'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, BarChart3, RefreshCw, LogOut, CheckCircle, XCircle } from 'lucide-react'

export default function SimpleTestPage() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        setAuthStatus('authenticated')
      } else {
        setAuthStatus('unauthenticated')
      }
    } catch (error) {
      setAuthStatus('unauthenticated')
    }
  }

  const login = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: 'admin', password: 'bugoumai' }),
      })
      if (response.ok) {
        setAuthStatus('authenticated')
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setAuthStatus('unauthenticated')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

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
    checkAuth()
  }, [])

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">检查认证状态...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-6 w-6" />
              <h1 className="text-2xl font-bold">潮玩盲盒库存管理系统 - 简化测试页面</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={authStatus === 'authenticated' ? 'default' : 'destructive'}>
                {authStatus === 'authenticated' ? '已登录' : '未登录'}
              </Badge>
              {authStatus === 'authenticated' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="h-4 w-4" />
                  <span>退出</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={login}
                  className="flex items-center space-x-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>登录</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>系统状态检查</span>
              </CardTitle>
              <CardDescription>
                检查各个系统组件的运行状态
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {authStatus === 'authenticated' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>认证系统</span>
                  </div>
                  <Badge variant={authStatus === 'authenticated' ? 'default' : 'destructive'}>
                    {authStatus === 'authenticated' ? '正常' : '异常'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>前端界面</span>
                  </div>
                  <Badge variant="default">正常</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>服务器运行</span>
                  </div>
                  <Badge variant="default">正常</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {authStatus === 'authenticated' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>系统概览</span>
                </CardTitle>
                <CardDescription>
                  当前系统状态和统计信息
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 flex-1">
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{stats?.overview.totalProducts || 0}</div>
                      <p className="text-sm text-muted-foreground">总商品数</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{stats?.overview.totalInventory || 0}</div>
                      <p className="text-sm text-muted-foreground">总库存</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{stats?.overview.todayPurchases || 0}</div>
                      <p className="text-sm text-muted-foreground">今日进货</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-2xl font-bold">{stats?.overview.todaySales || 0}</div>
                      <p className="text-sm text-muted-foreground">今日出货</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchStats}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}