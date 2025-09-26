import {NextRequest  } from 'next/server'
import jwt from 'jsonwebtoken'

// Ensure JWT_SECRET is properly configured
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('CRITICAL: NEXTAUTH_SECRET environment variable is not configured. This is required for secure authentication.')
}

const JWT_SECRET = process.env.NEXTAUTH_SECRET

export interface AdminUser {
  username: string
  email: string
  role: string
}

export async function verifyAdminToken(token: string): Promise<jwt.JwtPayload | null> {
  try {
    if (!token) {
      return null
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload

    // Check if token is expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return null
    }

    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export async function verifyAdminRequest(request: NextRequest): Promise<AdminUser | null> {
  try {
    // Check for token in cookies (set by login) - use synchronous access from request
    const tokenFromCookie = request.cookies.get('adminToken')?.value

    // Check for token in Authorization header (for API calls)
    const authHeader = request.headers.get('authorization')
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null

    const token = tokenFromCookie || tokenFromHeader

    if (!token) {
      return null
    }

    const decoded = await verifyAdminToken(token)

    if (!decoded || !decoded.username) {
      return null
    }

    return {
      username: decoded.username,
      email: decoded.email || '',
      role: decoded.role || 'admin'
    }
  } catch (error) {
    console.error('Request verification error:', error)
    return null
  }
}