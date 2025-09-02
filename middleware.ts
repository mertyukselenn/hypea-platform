import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Check if user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      const userRole = req.nextauth.token?.role
      
      // Only allow OWNER and ADMIN roles to access admin panel
      if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Check if user is trying to access account routes
    if (req.nextUrl.pathname.startsWith('/account')) {
      // User must be authenticated
      if (!req.nextauth.token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (
          req.nextUrl.pathname.startsWith('/auth') ||
          req.nextUrl.pathname.startsWith('/api/auth') ||
          req.nextUrl.pathname === '/' ||
          req.nextUrl.pathname.startsWith('/store') ||
          req.nextUrl.pathname.startsWith('/news') ||
          req.nextUrl.pathname.startsWith('/community') ||
          req.nextUrl.pathname.startsWith('/forms') ||
          req.nextUrl.pathname.startsWith('/legal') ||
          req.nextUrl.pathname.startsWith('/support') ||
          req.nextUrl.pathname.startsWith('/_next') ||
          req.nextUrl.pathname.startsWith('/favicon')
        ) {
          return true
        }

        // For protected routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
