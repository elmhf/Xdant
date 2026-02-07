import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;
  const isAuthenticated = !!token;

  // If authenticated user tries to access login or signup pages, redirect to home
  if ((pathname === "/login" || pathname === "/signeup") && isAuthenticated) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Let all other requests pass through
  // Backend auth middleware handles authentication for protected routes
  // This is necessary because cookies may not be visible to Next.js middleware in cross-origin setups
  return NextResponse.next();
} 