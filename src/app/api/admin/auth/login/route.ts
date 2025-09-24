import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Default admin credentials (in production, store these in database)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  passwordHash: bcrypt.hashSync('admin123', 10)
}

// JWT secret (in production, use environment variable)
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key-here-please-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check username
    if (username !== ADMIN_CREDENTIALS.username) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, ADMIN_CREDENTIALS.passwordHash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        username: ADMIN_CREDENTIALS.username,
        role: 'admin',
        loginTime: new Date().toISOString()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Create response with token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        username: ADMIN_CREDENTIALS.username,
        role: 'admin'
      }
    })

    // Set HTTP-only cookie for better security
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 24 hours
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    )
  }
}