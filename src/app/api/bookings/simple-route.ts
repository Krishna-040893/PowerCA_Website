import {NextRequest, NextResponse  } from 'next/server'

// In-memory storage (for demo purposes - in production, use a database)
const bookings = new Map<string, Set<string>>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, time } = body

    // Store booking in memory
    const dateKey = new Date(date).toISOString().split('T')[0]
    if (!bookings.has(dateKey)) {
      bookings.set(dateKey, new Set())
    }
    bookings.get(dateKey)?.add(time)

    // Format date for email
    const _formattedDate = new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // For now, we'll skip email sending until Resend API key is configured
    // In production, uncomment this:
    // await sendBookingConfirmationEmail({
    //   name,
    //   email,
    //   phone,
    //   firmName,
    //   date: formattedDate,
    //   time,
    //   message
    // })


    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully'
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to process booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    const dateKey = new Date(date).toISOString().split('T')[0]
    const bookedSlots = Array.from(bookings.get(dateKey) || [])

    return NextResponse.json({ bookedSlots })
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}