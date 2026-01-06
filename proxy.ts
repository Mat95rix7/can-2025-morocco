import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ Laisser passer la page de login
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  const isAuth = req.cookies.get('admin-auth')?.value === 'true'

  if (!isAuth && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
