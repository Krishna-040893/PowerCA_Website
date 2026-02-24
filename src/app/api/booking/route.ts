import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { createErrorResponse, ErrorType } from '@/lib/error-handler'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
}

// GET - Fetch booked slots for a specific date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Date parameter is required'
      )
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json({ bookedSlots: [] })
    }

    // Parse the date to get just the date portion
    const dateObj = new Date(date)
    const dateStr = dateObj.toISOString().split('T')[0]

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('time')
      .eq('date', dateStr)

    if (error) {
      logger.error('Failed to fetch booked slots', error)
      return NextResponse.json({ bookedSlots: [] })
    }

    const bookedSlots = bookings?.map(b => b.time) || []
    return NextResponse.json({ bookedSlots })
  } catch (error) {
    logger.error('Failed to fetch booked slots', error instanceof Error ? error : new Error('Unknown error'))
    return NextResponse.json({ bookedSlots: [] })
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, firmName, date, time, message } = body

    // Validate required fields
    if (!name || !email || !phone || !firmName || !date || !time) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured', details: 'database' },
        { status: 500 }
      )
    }

    // Insert booking into Supabase
    const { error } = await supabase
      .from('bookings')
      .insert([{
        name,
        email,
        phone,
        firm_name: firmName,
        date,
        time,
        message: message || null,
        type: 'demo',
      }])

    if (error) {
      logger.error('Failed to create booking', error)
      return NextResponse.json(
        { success: false, error: 'Failed to save booking', details: 'database' },
        { status: 500 }
      )
    }

    // Try to send confirmation email (non-blocking)
    try {
      const { Resend } = await import('resend')
      const resendApiKey = process.env.RESEND_API_KEY
      if (resendApiKey) {
        const resend = new Resend(resendApiKey)
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'PowerCA <noreply@powerca.in>',
          to: email,
          subject: 'Demo Booking Confirmation - PowerCA',
          html: `
            <h2>Demo Booking Confirmed!</h2>
            <p>Dear ${name},</p>
            <p>Your demo has been scheduled successfully.</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p>We look forward to showing you PowerCA!</p>
            <br/>
            <p>Best regards,<br/>Team PowerCA</p>
          `,
        })
      }
    } catch (emailError) {
      logger.error('Failed to send booking confirmation email', emailError instanceof Error ? emailError : new Error('Unknown error'))
      // Don't fail the booking if email fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to create booking', error instanceof Error ? error : new Error('Unknown error'))
    return createErrorResponse(
      ErrorType.INTERNAL,
      'Failed to create booking'
    )
  }
}
