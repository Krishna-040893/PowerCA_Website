import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

/**
 * Get the admin session from NextAuth
 * Returns the session if user is authenticated and has admin role
 * Returns null if not authenticated or not an admin
 */
export async function getAdminSession() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  // Check if user has admin role
  if (session.user.role !== 'admin') {
    return null
  }

  return session
}

/**
 * Require admin authentication for API routes
 * Returns the session if authenticated, or an error response
 *
 * Example usage:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const session = await requireAdminAuth()
 *   if (!session) {
 *     return new NextResponse('Unauthorized', { status: 401 })
 *   }
 *
 *   // Your protected route logic here
 *   return NextResponse.json({ data: 'success' })
 * }
 * ```
 */
export async function requireAdminAuth() {
  const session = await getAdminSession()

  if (!session) {
    return null
  }

  return session
}

/**
 * Create an unauthorized response for admin API routes
 */
export function createUnauthorizedResponse(message = 'Unauthorized - Admin access required') {
  return NextResponse.json(
    {
      success: false,
      error: message,
      message: 'Please log in with an admin account'
    },
    { status: 401 }
  )
}

/**
 * Create a forbidden response for admin API routes
 */
export function createForbiddenResponse(message = 'Forbidden - Insufficient permissions') {
  return NextResponse.json(
    {
      success: false,
      error: message,
      message: 'You do not have permission to access this resource'
    },
    { status: 403 }
  )
}
