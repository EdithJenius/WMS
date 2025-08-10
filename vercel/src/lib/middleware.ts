import { NextRequest, NextResponse } from 'next/server'
import { getUserById } from './auth'

export async function requireAuth(request: NextRequest) {
  const authToken = request.cookies.get('auth-token')?.value

  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const user = await getUserById(authToken)

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return user
}

export async function requireAdmin(request: NextRequest) {
  const user = await requireAuth(request)

  if (user instanceof NextResponse) {
    return user // This is a redirect response
  }

  if (user.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return user
}