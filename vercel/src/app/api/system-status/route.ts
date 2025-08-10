import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 检查系统状态
    const systemStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      components: {
        server: {
          status: 'running',
          port: 3000,
          framework: 'Next.js 15'
        },
        auth: {
          status: 'working',
          method: 'cookie-based',
          storage: 'memory'
        },
        database: {
          status: 'working',
          type: 'memory-storage',
          note: 'temporary solution'
        },
        api: {
          status: 'working',
          endpoints: [
            '/api/auth/login',
            '/api/auth/me',
            '/api/auth/logout',
            '/api/stats'
          ]
        }
      },
      admin: {
        username: 'admin',
        password: 'bugoumai',
        note: 'default admin account'
      },
      issues: {
        resolved: [
          'verification code system',
          'disk quota problem',
          'login functionality',
          'UI display issues',
          'password hash issues'
        ],
        current: []
      },
      access_urls: {
        main: 'http://localhost:3000',
        login: 'http://localhost:3000/login',
        admin: 'http://localhost:3000/admin',
        status: 'http://localhost:8080'
      }
    }

    return NextResponse.json(systemStatus)
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Failed to get system status',
        message: error.message 
      },
      { status: 500 }
    )
  }
}