import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Only check subscription for dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      const response = await fetch(`${req.nextUrl.origin}/api/subscription/status`, {
        headers: {
          Cookie: req.headers.get('cookie') || '',
        },
      })

      if (!response.ok) {
        return NextResponse.redirect(new URL('/pricing', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pricing',
    '/api/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 