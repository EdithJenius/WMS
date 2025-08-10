'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { 
  Database, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Users, 
  UserPlus, 
  Key,
  Mail,
  UserX,
  Bell,
  Plus,
  Trash2,
  Send
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface ResetResult {
  success: boolean
  message: string
  error?: string
}

interface User {
  id: string
  username: string
  email: string
  role: string
  createdAt: string
}

interface InventoryNotification {
  id: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminPanel() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResetResult | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const { user } = useAuth()
  
  // 用户管理状态
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  
  // 添加用户状态
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [userMessage, setUserMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  // 修改密码状态
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordCode, setPasswordCode] = useState('')
  const [passwordCodeSent, setPasswordCodeSent] = useState(false)
  const [passwordCountdown, setPasswordCountdown] = useState(0)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // 库存通知状态
  const [notifications, setNotifications] = useState<InventoryNotification[]>([])
  const [showAddNotification, setShowAddNotification] = useState(false)
  const [newNotificationEmail, setNewNotificationEmail] = useState('')
  const [notificationMessage, setNotificationMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [checkLoading, setCheckLoading] = useState(false)
  const [checkResult, setCheckResult] = useState<any>(null)

  // 获取用户列表
  const fetchUsers = async () => {
    setUsersLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  // 获取库存通知设置
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/inventory-notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('获取通知设置失败:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchNotifications()
  }, [])

  // 添加用户倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
    } else if (countdown === 0 && codeSent) {
      setCodeSent(false)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [countdown, codeSent])

  // 修改密码倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (passwordCountdown > 0) {
      timer = setTimeout(() => {
        setPasswordCountdown(passwordCountdown - 1)
      }, 1000)
    } else if (passwordCountdown === 0 && passwordCodeSent) {
      setPasswordCodeSent(false)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [passwordCountdown, passwordCodeSent])

  const handleResetDatabase = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/reset-database/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult({
          success: true,
          message: data.message
        })
        setPassword('')
        setShowConfirm(false)
      } else {
        setResult({
          success: false,
          message: data.error || '重置失败'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: '网络错误，请稍后重试'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
    setPassword('')
    setResult(null)
  }

  // 发送验证码
  const sendVerificationCode = async (email: string, type: 'add' | 'password') => {
    try {
      const response = await fetch('/api/admin/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        if (type === 'add') {
          setCodeSent(true)
          setCountdown(30)
          setUserMessage({ type: 'success', message: '验证码已发送到管理员邮箱' })
        } else {
          setPasswordCodeSent(true)
          setPasswordCountdown(30)
          setPasswordMessage({ type: 'success', message: '验证码已发送到管理员邮箱' })
        }
      } else {
        const data = await response.json()
        if (type === 'add') {
          setUserMessage({ type: 'error', message: data.error || '发送失败' })
        } else {
          setPasswordMessage({ type: 'error', message: data.error || '发送失败' })
        }
      }
    } catch (error) {
      if (type === 'add') {
        setUserMessage({ type: 'error', message: '网络错误，请稍后重试' })
      } else {
        setPasswordMessage({ type: 'error', message: '网络错误，请稍后重试' })
      }
    }
  }

  // 添加用户
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password || !verificationCode) {
      setUserMessage({ type: 'error', message: '所有字段都必须填写' })
      return
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newUser,
          verificationCode
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setUserMessage({ type: 'success', message: '用户创建成功' })
        setNewUser({ username: '', email: '', password: '', role: 'user' })
        setVerificationCode('')
        setCodeSent(false)
        setCountdown(0)
        setShowAddUser(false)
        fetchUsers()
      } else {
        setUserMessage({ type: 'error', message: data.error || '创建失败' })
      }
    } catch (error) {
      setUserMessage({ type: 'error', message: '网络错误，请稍后重试' })
    }
  }

  // 修改密码
  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword || !passwordCode) {
      setPasswordMessage({ type: 'error', message: '所有字段都必须填写' })
      return
    }

    try {
      const response = await fetch('/api/admin/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          newPassword,
          verificationCode: passwordCode
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setPasswordMessage({ type: 'success', message: '密码修改成功' })
        setSelectedUser('')
        setNewPassword('')
        setPasswordCode('')
        setPasswordCodeSent(false)
        setPasswordCountdown(0)
      } else {
        setPasswordMessage({ type: 'error', message: data.error || '修改失败' })
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', message: '网络错误，请稍后重试' })
    }
  }

  // 库存通知相关函数
  const handleAddNotification = async () => {
    if (!newNotificationEmail || !newNotificationEmail.includes('@')) {
      setNotificationMessage({ type: 'error', message: '请输入有效的邮箱地址' })
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
        setNotificationMessage({ type: 'success', message: '添加成功' })
        setNewNotificationEmail('')
        setShowAddNotification(false)
        fetchNotifications()
      } else {
        setNotificationMessage({ type: 'error', message: data.error || '添加失败' })
      }
    } catch (error) {
      setNotificationMessage({ type: 'error', message: '网络错误，请稍后重试' })
    }
  }

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
      }
    } catch (error) {
      console.error('更新通知状态失败:', error)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory-notifications?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('删除通知失败:', error)
    }
  }

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
      } else {
        setCheckResult({ error: data.error || '检查失败' })
      }
    } catch (error) {
      setCheckResult({ error: '网络错误，请稍后重试' })
    } finally {
      setCheckLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="database" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>数据库管理</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>用户管理</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>库存通知</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>数据库管理</span>
                <Badge variant="secondary">管理员</Badge>
              </CardTitle>
              <CardDescription>
                数据库管理功能 - 需要管理员权限
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 当前用户信息 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">当前登录用户</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{user?.username}</Badge>
                  <Badge variant="secondary">{user?.role}</Badge>
                </div>
              </div>

              {/* 警告信息 */}
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>警告：</strong>此操作将删除所有数据，包括产品、进货记录、销售记录和库存信息。
                  此操作不可恢复，请谨慎操作！
                </AlertDescription>
              </Alert>

              {/* 密码输入 */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  管理员密码
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入管理员密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  disabled={loading}
                />
              </div>

              {/* 确认对话框 */}
              {showConfirm && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <strong>最后确认：</strong>您确定要清空所有数据吗？此操作无法撤销！
                  </AlertDescription>
                  <div className="mt-3 flex space-x-2">
                    <Button
                      variant="destructive"
                      onClick={handleResetDatabase}
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? '重置中...' : '确认重置'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                      size="sm"
                    >
                      取消
                    </Button>
                  </div>
                </Alert>
              )}

              {/* 操作按钮 */}
              {!showConfirm && (
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    onClick={handleResetDatabase}
                    disabled={!password || loading}
                    className="flex items-center space-x-2"
                  >
                    <Database className="h-4 w-4" />
                    <span>重置数据库</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setPassword('')
                      setResult(null)
                    }}
                    disabled={loading}
                  >
                    清空
                  </Button>
                </div>
              )}

              {/* 结果显示 */}
              {result && (
                <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                    {result.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-6">
            {/* 用户列表 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>用户管理</span>
                  </div>
                  <Button
                    onClick={() => setShowAddUser(true)}
                    className="flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>添加用户</span>
                  </Button>
                </CardTitle>
                <CardDescription>
                  管理系统用户账户和权限
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">加载中...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{u.username}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                            {u.role === 'admin' ? '管理员' : '用户'}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 添加用户表单 */}
            {showAddUser && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>添加新用户</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userMessage && (
                    <Alert className={userMessage.type === 'success' ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                      {userMessage.type === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription className={userMessage.type === 'success' ? "text-green-800" : "text-red-800"}>
                        {userMessage.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">用户名</Label>
                      <Input
                        id="username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        placeholder="请输入用户名"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="请输入邮箱"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">密码</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="请输入密码"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">角色</Label>
                      <select
                        id="role"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="user">用户</option>
                        <option value="admin">管理员</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification">邮箱验证码</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="verification"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="请输入验证码"
                        className="flex-1"
                      />
                      <Button
                        onClick={() => sendVerificationCode(newUser.email, 'add')}
                        disabled={!newUser.email || codeSent}
                        variant="outline"
                      >
                        {countdown > 0 ? `${countdown}s` : (codeSent ? '已发送' : '发送验证码')}
                      </Button>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={handleAddUser}
                      disabled={!newUser.username || !newUser.email || !newUser.password || !verificationCode}
                      className="flex items-center space-x-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>添加用户</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddUser(false)
                        setNewUser({ username: '', email: '', password: '', role: 'user' })
                        setVerificationCode('')
                        setCodeSent(false)
                        setCountdown(0)
                        setUserMessage(null)
                      }}
                    >
                      取消
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="space-y-6">
            {/* 通知设置 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5" />
                    <span>库存通知设置</span>
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
                {notificationMessage && (
                  <Alert className={notificationMessage.type === 'success' ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    {notificationMessage.type === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={notificationMessage.type === 'success' ? "text-green-800" : "text-red-800"}>
                      {notificationMessage.message}
                    </AlertDescription>
                  </Alert>
                )}

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
                          setNotificationMessage(null)
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {notifications.length === 0 ? (
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

            {/* 手动检查 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>手动检查库存</span>
                </CardTitle>
                <CardDescription>
                  手动触发库存检查并发送警报邮件
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
                  <Alert className={checkResult.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
                    {checkResult.error ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <AlertDescription className={checkResult.error ? "text-red-800" : "text-green-800"}>
                      {checkResult.error || checkResult.message}
                    </AlertDescription>
                  </Alert>
                )}

                {checkResult && !checkResult.error && (
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
