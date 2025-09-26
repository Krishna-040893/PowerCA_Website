import {NextRequest, NextResponse  } from 'next/server'
import {getServerSession  } from 'next-auth/next'
import {authOptions  } from '@/lib/auth'

// Generate unique affiliate ID
function generateAffiliateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'AFF-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate a new affiliate ID
    const affiliateId = generateAffiliateId()

    return NextResponse.json({
      success: true,
      affiliateId
    })

  } catch (error) {
    console.error('Error generating affiliate ID:', error)
    return NextResponse.json(
      { error: 'Failed to generate affiliate ID' },
      { status: 500 }
    )
  }
}