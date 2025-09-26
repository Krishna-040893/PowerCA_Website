import {NextRequest, NextResponse  } from 'next/server'
import {verifyAdminToken  } from './admin-auth'
import jwt from 'jsonwebtoken'

interface AuthorizedResult {
  authorized: true
  admin: jwt.JwtPayload
  error: null
}

interface UnauthorizedResult {
  authorized: false
  error: NextResponse
  admin?: never
}

type AdminAuthResult = AuthorizedResult | UnauthorizedResult

/**
 * Centralized admin authorization helper for API routes
 * Use this at the beginning of any admin API route handler
 */
export async function requireAdminAuth(request: NextRequest): Promise<AdminAuthResult> {
  try {
    // Check for admin token in cookies or Authorization header
    const tokenFromCookie = request.cookies.get('adminToken')?.value
    const authHeader = request.headers.get('authorization')
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null

    const token = tokenFromCookie || tokenFromHeader

    if (!token) {
      return {
        authorized: false,
        error: NextResponse.json(
          {
            success: false,
            error: 'Unauthorized - No admin token provided',
            message: 'Please log in to access this resource'
          },
          { status: 401 }
        )
      }
    }

    // Verify the token
    const decoded = await verifyAdminToken(token)

    if (!decoded) {
      return {
        authorized: false,
        error: NextResponse.json(
          {
            success: false,
            error: 'Unauthorized - Invalid or expired token',
            message: 'Your session has expired. Please log in again.'
          },
          { status: 401 }
        )
      }
    }

    // Check if admin role
    if (decoded.role !== 'admin') {
      return {
        authorized: false,
        error: NextResponse.json(
          {
            success: false,
            error: 'Forbidden - Admin access required',
            message: 'You do not have permission to access this resource'
          },
          { status: 403 }
        )
      }
    }

    // Return the decoded admin user data
    return {
      authorized: true,
      admin: decoded,
      error: null
    }
  } catch {
    // Log error securely without exposing details
    console.error('Admin authentication error:', {
      timestamp: new Date().toISOString(),
      error: 'Authentication failed'
    })

    return {
      authorized: false,
      error: NextResponse.json(
        {
          success: false,
          error: 'Authentication error',
          message: 'An error occurred during authentication'
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Example usage in an API route:
 *
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAdminAuth(request)
 *   if (!auth.authorized) {
 *     return auth.error
 *   }
 *
 *   // Access admin data: auth.admin
 *   // Your protected route logic here
 * }
 */