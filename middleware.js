import { NextResponse } from "next/server";

// نحددو المسارات المحمية
const protectedPaths = ["/dashboard", "/profile", "/settings"];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // هل المسار محمي؟
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  // نجيب التوكن من الكوكيز فقط (لا تستعمل localStorage أو getAccessToken)
  const token = req.cookies.get("access_token")?.value;

  if (isProtected && !token) {
    // إذا ما عندوش توكن ورجع طلب صفحة محمية → redirect لل login
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // إذا المستخدم عنده توكن وحاول يدخل صفحة login → redirect لل dashboard
  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // غير ذلك، خلّي الطلب يمشي عادي
  return NextResponse.next();
} 