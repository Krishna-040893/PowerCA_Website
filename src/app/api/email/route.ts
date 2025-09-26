import {NextRequest, NextResponse  } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const _body = await request.json()

    // Add email sending logic here using Resend

    return NextResponse.json({ sent: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}