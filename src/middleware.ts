import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth')
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  const isLoginRoute = nextUrl.pathname === '/admin/login'

  if (isApiAuthRoute) {
    return NextResponse.next()
  }

  if (isAdminRoute) {
    if (isLoginRoute) {
      if (isLoggedIn) {
        return NextResponse.redirect(new URL('/admin', nextUrl))
      }
      return NextResponse.next()
    }

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/admin/login', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
