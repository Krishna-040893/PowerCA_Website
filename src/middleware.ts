import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
<<<<<<< HEAD
  async function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Check if user has a role in their token
    if (token) {
      const userRole = (token.role as string)?.toLowerCase()

      // Redirect affiliates to their dashboard or profile creation
      if (userRole === 'affiliate') {
        if (pathname === '/dashboard') {
          // Check if affiliate needs to complete setup
          if (token.needsAffiliateSetup) {
            return NextResponse.redirect(new URL('/affiliate/account', req.url))
          }
          // Redirect to affiliate dashboard
          return NextResponse.redirect(new URL('/affiliate/dashboard', req.url))
        }
      }

      // Prevent non-affiliates from accessing affiliate routes
      if (userRole !== 'affiliate' && pathname.startsWith('/affiliate')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // Prevent non-admins from accessing admin routes
      if (userRole !== 'admin' && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

=======
  function middleware(req) {
    // Custom logic can be added here if needed
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/auth/login',
      error: '/auth/error'
    }
  }
)

<<<<<<< HEAD
// Protect these routes (removed /admin/:path* to allow direct access)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/affiliate/:path*',
=======
// Protect these routes
export const config = {
  matcher: [
    '/dashboard/:path*',
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
    '/api/protected/:path*',
    '/clients/:path*',
    '/documents/:path*',
    '/reports/:path*',
    '/settings/:path*'
  ]
}