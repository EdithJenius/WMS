'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'

export default function TestAuthPage() {
  const [formData, setFormData] = useState({
    username: 'testuser',
    password: 'password123'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  const { user, loading: authLoading, login, logout } = useAuth()

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    setResult('')

    try {
      const success = await login(formData.username, formData.password)
      if (success) {
        setResult('登录成功！')
      } else {
        setError('登录失败')
      }
    } catch (error) {
      setError('网络错误：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      setResult('退出登录成功！')
    } catch (error) {
      setError('退出登录失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const checkAuthStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setResult('认证状态：已登录 - ' + JSON.stringify(data.user))
      } else {
        setResult('认证状态：未登录')
      }
    } catch (error) {
      setError('检查认证状态失败：' + error.message)
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">认证测试页面</h1>
          <p className="text-muted-foreground">测试登录、登出和认证状态检查功能</p>
        </div>

        {/* 当前用户状态 */}
        <Card>
          <CardHeader>
            <CardTitle>当前用户状态</CardTitle>
            <CardDescription>显示当前登录用户的信息</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">已登录</Badge>
                  <span className="text-sm text-muted-foreground">ID: {user.id}</span>
                </div>
                <div><strong>用户名:</strong> {user.username}</div>
                <div><strong>邮箱:</strong> {user.email}</div>
                <div><strong>角色:</strong> {user.role}</div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">未登录</Badge>
                <span className="text-sm text-muted-foreground">请先登录</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 登录表单 */}
        <Card>
          <CardHeader>
            <CardTitle>登录测试</CardTitle>
            <CardDescription>使用测试账户登录</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
            </div>
            <Button
              onClick={handleLogin}
              disabled={loading || !formData.username || !formData.password}
              className="w-full"
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <Card>
          <CardHeader>
            <CardTitle>操作测试</CardTitle>
            <CardDescription>测试各种认证相关操作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button
                onClick={checkAuthStatus}
                disabled={loading}
                variant="outline"
              >
                检查认证状态
              </Button>
              <Button
                onClick={handleLogout}
                disabled={loading || !user}
                variant="outline"
              >
                退出登录
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 结果显示 */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {result}
            </AlertDescription>
          </Alert>
        )}

        {/* 测试账户信息 */}
        <Card>
          <CardHeader>
            <CardTitle>测试账户信息</CardTitle>
            <CardDescription>可用的测试账户</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>用户名:</strong> testuser</div>
              <div><strong>密码:</strong> password123</div>
              <div><strong>角色:</strong> user</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}