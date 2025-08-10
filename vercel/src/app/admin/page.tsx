'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminPanel from '@/components/admin-panel'
import { useAuth } from '@/contexts/auth-context'

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (user.role !== 'admin') {
        router.push('/')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">管理员面板</h1>
          </div>
        </div>
      </header>
      <main className="py-6">
        <AdminPanel />
      </main>
    </div>
  )
}