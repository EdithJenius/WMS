'use client'

import { useAuth } from '@/contexts/auth-context'

export default function DebugPage() {
  const { user, loading, login, logout } = useAuth()

  const handleLogin = async () => {
    const success = await login('admin', 'bugoumai')
    console.log('Login success:', success)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">调试页面</h1>
        
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">认证状态</h2>
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? JSON.stringify(user) : 'Not logged in'}</p>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">操作</h2>
            <div className="space-x-4">
              <button 
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                登录 (admin/bugoumai)
              </button>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                退出
              </button>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">API 测试</h2>
            <div className="space-y-2">
              <button 
                onClick={() => fetch('/api/stats').then(r => r.json()).then(console.log)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                测试 Stats API
              </button>
              <button 
                onClick={() => fetch('/api/auth/me').then(r => r.json()).then(console.log)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                测试 Auth Me API
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}