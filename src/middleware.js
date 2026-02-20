// middleware.js — Edge Runtime compatible
import { NextResponse } from "next/server"
import { getUserToken, getAdminToken, isTokenExpired } from "@/utils/middlewareTokenUtils"

export function middleware(req) {
  const { pathname } = req.nextUrl
  const cookieString = req.headers.get('cookie') || ''

  // ===== Admin Routes =====
  if (pathname.startsWith('/admin')) {
    const adminToken = getAdminToken(cookieString)
    const isAdminAuthenticated = adminToken && !isTokenExpired(adminToken)

    // Admin login page: redirect to dashboard if already authenticated
    if (pathname === '/admin/login') {
      if (isAdminAuthenticated) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      }
      return NextResponse.next()
    }

    // All other /admin/* routes require admin token
    if (!isAdminAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    return NextResponse.next()
  }

  // ===== Regular User Routes =====
  const userToken = getUserToken(cookieString)
  const isAuthenticated = userToken && !isTokenExpired(userToken)

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signeup', '/forgot-password', '/about', '/contact', '/auth/redirect']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

  if (isPublicRoute) {
    // Redirect authenticated users away from login/signup
    if ((pathname === '/login' || pathname === '/signeup') && isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }

  // All other routes require user authentication
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sounds|.*\\..*).*)'
  ],
}