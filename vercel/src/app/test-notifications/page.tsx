'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Bell, 
  Plus, 
  Trash2, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Send
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface InventoryNotification {
  id: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CheckResult {
  message: string
  lowInventoryCount: number
  sentCount: number
  failedCount: number
}

export default function TestNotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<InventoryNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  // 添加通知状态
  const [showAddNotification, setShowAddNotification] = useState(false)
  const [newNotificationEmail, setNewNotificationEmail] = useState('')
  
  // 检查库存状态
  const [checkLoading, setCheckLoading] = useState(false)
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null)

  // 获取通知列表
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/inventory-notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      } else {
        setMessage({ type: 'error', message: '获取通知列表失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', message: '网络错误' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // 添加通知
  const handleAddNotification = async () => {
    if (!newNotificationEmail || !newNotificationEmail.includes('@')) {
      setMessage({ type: 'error', message: '请输入有效的邮箱地址' })
      return
    }

    try {
      const response = await fetch('/api/inventory-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newNotificationEmail }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', message: '添加成功' })
        setNewNotificationEmail('')
        setShowAddNotification(false)
        fetchNotifications()
      } else {
        setMessage({ type: 'error', message: data.error || '添加失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', message: '网络错误' })
    }
  }

  // 切换通知状态
  const handleToggleNotification = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/inventory-notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, isActive }),
      })

      if (response.ok) {
        fetchNotifications()
      } else {
        setMessage({ type: 'error', message: '更新状态失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', message: '网络错误' })
    }
  }

  // 删除通知
  const handleDeleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory-notifications?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage({ type: 'success', message: '删除成功' })
        fetchNotifications()
      } else {
        setMessage({ type: 'error', message: '删除失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', message: '网络错误' })
    }
  }

  // 检查库存警报
  const handleCheckInventory = async () => {
    setCheckLoading(true)
    setCheckResult(null)
    
    try {
      const response = await fetch('/api/check-inventory-alerts', {
        method: 'POST',
      })

      const data = await response.json()
      
      if (response.ok) {
        setCheckResult(data)
        setMessage({ type: 'success', message: '检查完成' })
      } else {
        setMessage({ type: 'error', message: data.error || '检查失败' })
      }
    } catch (error) {
      setMessage({ type: 'error', message: '网络错误' })
    } finally {
      setCheckLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">库存通知测试页面</h1>
          <p className="text-muted-foreground">测试库存通知功能的添加、管理和警报发送</p>
          {user && (
            <div className="mt-2">
              <Badge variant="outline">当前用户: {user.username}</Badge>
              <Badge variant="secondary">角色: {user.role}</Badge>
            </div>
          )}
        </div>

        {/* 消息提示 */}
        {message && (
          <Alert className={message.type === 'success' ? "border-green-200 bg-green-50 mb-6" : "border-red-200 bg-red-50 mb-6"}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? "text-green-800" : "text-red-800"}>
              {message.message}
            </AlertDescription>
          </Alert>
        )}

        {/* 通知管理 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>库存通知管理</span>
              </div>
              <Button
                onClick={() => setShowAddNotification(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>添加邮箱</span>
              </Button>
            </CardTitle>
            <CardDescription>
              管理接收库存警报邮件的邮箱地址
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddNotification && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-email">邮箱地址</Label>
                  <Input
                    id="notification-email"
                    type="email"
                    value={newNotificationEmail}
                    onChange={(e) => setNewNotificationEmail(e.target.value)}
                    placeholder="请输入邮箱地址"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAddNotification}
                    disabled={!newNotificationEmail}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>添加</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddNotification(false)
                      setNewNotificationEmail('')
                    }}
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">加载中...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>暂无通知设置</p>
                  <p className="text-sm">点击"添加邮箱"按钮添加接收通知的邮箱</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{notification.email}</p>
                        <p className="text-sm text-muted-foreground">
                          添加时间：{new Date(notification.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`switch-${notification.id}`} className="text-sm">
                          启用
                        </Label>
                        <Switch
                          id={`switch-${notification.id}`}
                          checked={notification.isActive}
                          onCheckedChange={(checked) => handleToggleNotification(notification.id, checked)}
                        />
                      </div>
                      <Badge variant={notification.isActive ? 'default' : 'secondary'}>
                        {notification.isActive ? '已启用' : '已禁用'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 库存检查 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>手动检查库存警报</span>
            </CardTitle>
            <CardDescription>
              手动触发库存检查并发送警报邮件到所有启用的邮箱
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleCheckInventory}
              disabled={checkLoading || notifications.length === 0}
              className="flex items-center space-x-2"
            >
              {checkLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>检查并发送警报</span>
            </Button>

            {checkResult && (
              <Alert className={checkResult.failedCount > 0 ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
                {checkResult.failedCount > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <AlertDescription className={checkResult.failedCount > 0 ? "text-orange-800" : "text-green-800"}>
                  {checkResult.message}
                </AlertDescription>
              </Alert>
            )}

            {checkResult && (
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <p className="font-medium text-blue-900">检查结果详情：</p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">低库存商品：</span>
                    <span className="font-medium">{checkResult.lowInventoryCount}</span>
                  </div>
                  <div>
                    <span className="text-green-600">发送成功：</span>
                    <span className="font-medium">{checkResult.sentCount}</span>
                  </div>
                  <div>
                    <span className="text-red-600">发送失败：</span>
                    <span className="font-medium">{checkResult.failedCount}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 说明信息 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>功能说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>库存通知功能：</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>当商品库存低于2箱时，系统会自动发送警报邮件</li>
              <li>每个商品每天只会发送一次警报，避免重复通知</li>
              <li>可以添加多个邮箱地址接收通知</li>
              <li>可以单独启用或禁用每个邮箱的通知</li>
            </ul>
            <p className="mt-2"><strong>测试建议：</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>先添加一个测试邮箱地址</li>
              <li>确保邮箱地址已启用通知</li>
              <li>点击"检查并发送警报"按钮测试功能</li>
              <li>检查邮箱是否收到警报邮件</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}