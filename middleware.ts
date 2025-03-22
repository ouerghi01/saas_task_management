import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const publicPaths = ['/login', '/signup','/']
    if (!token && publicPaths.includes(req.nextUrl.pathname)) {
      return NextResponse.next()
    }
    // Prevent infinite redirect by allowing access to the signin page
    if (!token) {
      if (req.nextUrl.pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', req.url))
      }
      return NextResponse.next()
    }

    // Only check subscription for dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      const response = await fetch(`${req.nextUrl.origin}/api/subscription/status`, {
        headers: {
          Cookie: req.headers.get('cookie') || '',
        },
      })
      const data = await response.json()
      console.log(data)

      if (!response.ok) {
        return NextResponse.redirect(new URL('/pricing', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => true, // Allow middleware to handle redirections
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/pricing',
    '/((?!api|_next/static|_next/image|favicon.ico|auth/signin).*)', // Prevent redirect loops
  ],
}
