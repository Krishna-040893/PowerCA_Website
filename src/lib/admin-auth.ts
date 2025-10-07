import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

function getJwtSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET

  if (!secret) {
    throw new Error(
      'CRITICAL: NEXTAUTH_SECRET environment variable is not configured. This is required for secure authentication.'
    )
  }

  return secret
}

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

    const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload

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
    const tokenFromCookie = request.cookies.get('adminToken')?.value

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
