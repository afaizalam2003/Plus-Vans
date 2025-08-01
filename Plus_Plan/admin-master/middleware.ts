import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Allow all non-admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // 2. Check for auth token on admin routes
  const token = request.cookies.get('auth_token')?.value
  
  // 3. If no token, redirect to sign-in
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // 4. User is authenticated, allow access
  return NextResponse.next()
}

export const config = {
  // Only run middleware on /admin routes
  matcher: ['/admin/:path*']
}
