// middleware.js - نسخة مبسطة
import { NextResponse } from "next/server"
import { getTokenFromRequest, isTokenExpired } from "@/utils/jwtUtils"

export function middleware(req) {

  const { pathname } = req.nextUrl

  // نجيب التوكن من الكوكيز
  const cookieString = req.headers.get('cookie') || ''

  const token = getTokenFromRequest(cookieString)
  const isAuthenticated = token && !isTokenExpired(token)


  // قائمة المسارات التي لا تحتاج مصادقة
  const publicRoutes = ['/login', '/signeup', '/forgot-password', '/about', '/contact', '/auth/redirect', '/admin/login','/admin/dashboard']
  const isPublicRoute = publicRoutes.includes(pathname)

  // إذا كان المسار عام، خلّي المستخدم يدخل
  if (isPublicRoute) {
    // لكن إذا كان مسجل دخول وحاول يدخل login → وجهه للداشبورد
    if ((pathname === '/login' || pathname === "signeup") && isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    return NextResponse.next()
  }



  // باقي المسارات تحتاج مصادقة
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', req.url)
    // حفظ المسار المطلوب للعودة إليه بعد تسجيل الدخول
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'
  ],
}