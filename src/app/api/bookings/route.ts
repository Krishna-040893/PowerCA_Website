import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmationEmail } from '@/lib/resend'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, firmName, date, time, message } = body

    // Store booking in database
    const booking = await db.booking.create({
      data: {
        name,
        email,
        phone,
        firmName,
        date: new Date(date),
        time,
        message,
        status: 'confirmed'
      }
    })

    // Send confirmation emails
    await sendBookingConfirmationEmail({
      name,
      email,
      phone,
      firmName,
      date,
      time,
      message
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Booking confirmed successfully',
      booking 
    })
  } catch (error) {
    console.error('Booking error:', error)
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

    // Get bookings for the specified date
    const bookings = await db.booking.findMany({
      where: {
        date: {
          gte: new Date(date),
          lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
        }
      },
      select: {
        time: true
      }
    })

    const bookedSlots = bookings.map(booking => booking.time)
    
    return NextResponse.json({ bookedSlots })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}