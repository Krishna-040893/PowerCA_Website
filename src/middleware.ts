import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Custom logic can be added here if needed
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

// Protect these routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/protected/:path*',
    '/clients/:path*',
    '/documents/:path*',
    '/reports/:path*',
    '/settings/:path*'
  ]
}