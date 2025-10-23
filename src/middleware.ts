import {withAuth, type NextRequestWithAuth  } from 'next-auth/middleware'
import {NextRequest, NextResponse, type NextFetchEvent  } from 'next/server'

// Custom middleware that handles both user and admin authentication
export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const pathname = req.nextUrl.pathname

  // Handle admin routes with NextAuth
  if (pathname.startsWith('/admin')) {
    // Allow access to admin login page
    if (pathname === '/admin-login') {
      return NextResponse.next()
    }

    // Use NextAuth middleware for admin routes
    const authMiddleware = withAuth({
      pages: {
        signIn: '/admin-login',
      },
      callbacks: {
        authorized: ({ token }) => {
          // Only allow if user has admin role
          return token?.role === 'admin'
        }
      }
    })

    return authMiddleware(req as NextRequestWithAuth, event)
  }

  // Handle admin API routes with NextAuth
  if (pathname.startsWith('/api/admin')) {
    // Admin API routes will handle their own authentication using getServerSession
    // Middleware just passes through - individual routes verify admin role
    return NextResponse.next()
  }

  // For non-admin routes, use the existing NextAuth logic
  const isProtectedAffiliateRoute =
    pathname === '/affiliate' ||
    pathname.startsWith('/affiliate/')

  if (pathname.startsWith('/dashboard') ||
      isProtectedAffiliateRoute ||
      pathname.startsWith('/api/protected') ||
      pathname.startsWith('/clients') ||
      pathname.startsWith('/documents') ||
      pathname.startsWith('/reports') ||
      pathname.startsWith('/settings')) {

    // This will trigger NextAuth authentication with proper callback
    const signInPage = pathname.startsWith('/affiliate') ? '/affiliate-login' : '/login'
    const authMiddleware = withAuth({
      pages: {
        signIn: signInPage,
      },
    })

    return authMiddleware(req as NextRequestWithAuth, event)
  }

  // Allow all other routes
  return NextResponse.next()
}

// Protect these routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/dashboard/:path*',
    '/affiliate/:path*',
    '/api/protected/:path*',
    '/clients/:path*',
    '/documents/:path*',
    '/reports/:path*',
    '/settings/:path*'
  ]
}
