import {withAuth, type NextRequestWithAuth  } from 'next-auth/middleware'
import {NextRequest, NextResponse, type NextFetchEvent  } from 'next/server'

// Custom middleware that handles both user and admin authentication
export async function middleware(req: NextRequest, event: NextFetchEvent) {
  const pathname = req.nextUrl.pathname

  // Handle admin routes with JWT authentication
  if (pathname.startsWith('/admin')) {
    // Allow access to admin login page
    if (pathname === '/admin-login') {
      return NextResponse.next()
    }

    // Check for admin token in cookies or headers
    const adminToken = req.cookies.get('adminToken')?.value ||
                      req.headers.get('authorization')?.replace('Bearer ', '')

    // On first redirect after login, allow a brief grace period
    // Check for a special query parameter that indicates fresh login
    const url = new URL(req.url)
    const fromLogin = url.searchParams.get('from_login')

    if (!adminToken) {
      // If coming from login with fresh token, allow one redirect without token
      // The client-side will have localStorage and cookie will be set on next request
      if (fromLogin === 'true') {
        // Allow access - client-side will clean up the URL parameter
        return NextResponse.next()
      }

      // Redirect to admin login if no token
      return NextResponse.redirect(new URL('/admin-login', req.url))
    }

    try {
      // Simple JWT format validation (3 parts separated by dots)
      // Let server-side API routes handle full verification
      if (adminToken.split('.').length === 3) {
        // Valid JWT format, allow access
        return NextResponse.next()
      } else {
        // Invalid token format, redirect to login
        const response = NextResponse.redirect(new URL('/admin-login', req.url))
        response.cookies.delete('adminToken')
        return response
      }
    } catch {
      // Token validation failed
      const response = NextResponse.redirect(new URL('/admin-login', req.url))
      response.cookies.delete('adminToken')
      return response
    }
  }

  // Handle admin API routes
  if (pathname.startsWith('/api/admin')) {
    // Allow admin auth endpoints
    if (pathname.startsWith('/api/admin/auth')) {
      return NextResponse.next()
    }

    // All other admin API routes require authentication
    const adminToken = req.cookies.get('adminToken')?.value ||
                      req.headers.get('authorization')?.replace('Bearer ', '')

    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No admin token provided' },
        { status: 401 }
      )
    }

    try {
      // Simple JWT format validation (3 parts separated by dots)
      // Let API routes handle full server-side verification
      if (adminToken.split('.').length === 3) {
        // Valid JWT format, allow access - API routes will do full verification
        return NextResponse.next()
      } else {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid admin token format' },
          { status: 401 }
        )
      }
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized - Token validation failed' },
        { status: 401 }
      )
    }
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
