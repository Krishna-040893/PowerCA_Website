import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { createErrorResponse, ErrorType } from '@/lib/error-handler'

const SLOT_CAPACITY = 5

function normalizeDateString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const match = value.trim().match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : null
}

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
      return NextResponse.json({ slotCounts: {} })
    }

    const dateStr = normalizeDateString(date)
    if (!dateStr) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Date must be in YYYY-MM-DD format'
      )
    }

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('time')
      .eq('date', dateStr)
      .neq('status', 'CANCELLED')

    if (error) {
      logger.error('Failed to fetch booked slots', error)
      return NextResponse.json({ slotCounts: {} })
    }

    // Aggregate booking counts per time slot
    const slotCounts: Record<string, number> = {}
    if (bookings) {
      for (const b of bookings) {
        slotCounts[b.time] = (slotCounts[b.time] || 0) + 1
      }
    }

    return NextResponse.json({ slotCounts })
  } catch (error) {
    logger.error('Failed to fetch booked slots', error instanceof Error ? error : new Error('Unknown error'))
    return NextResponse.json({ slotCounts: {} })
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

    const normalizedDate = normalizeDateString(date)
    if (!normalizedDate) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD.', details: 'validation' },
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

    const normalizedEmail = email.toLowerCase().trim()

    // Check for duplicate booking (same email + date + time, non-cancelled)
    const { data: existingBooking, error: dupError } = await supabase
      .from('bookings')
      .select('id')
      .eq('email', normalizedEmail)
      .eq('date', normalizedDate)
      .eq('time', time)
      .neq('status', 'CANCELLED')
      .limit(1)
      .maybeSingle()

    if (dupError) {
      logger.error('Failed to check duplicate booking', dupError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify booking availability', details: 'database' },
        { status: 500 }
      )
    }

    if (existingBooking) {
      return NextResponse.json(
        { success: false, error: 'You have already booked this time slot. Please select a different time.', details: 'duplicate' },
        { status: 409 }
      )
    }

    // Check slot capacity
    const { count, error: countError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('date', normalizedDate)
      .eq('time', time)
      .neq('status', 'CANCELLED')

    if (countError) {
      logger.error('Failed to check slot capacity', countError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify slot availability', details: 'database' },
        { status: 500 }
      )
    }

    if ((count ?? 0) >= SLOT_CAPACITY) {
      return NextResponse.json(
        { success: false, error: 'This time slot is fully booked. Please select a different time.', details: 'slot_full' },
        { status: 409 }
      )
    }

    // Insert booking into Supabase
    const { error } = await supabase
      .from('bookings')
      .insert([{
        name,
        email: normalizedEmail,
        phone,
        firm_name: firmName,
        date: normalizedDate,
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

    // Send confirmation email to user + team notification (non-blocking, dynamic import)
    try {
      const { sendBookingConfirmationEmail } = await import('@/lib/resend')
      await sendBookingConfirmationEmail({
        name,
        email,
        phone,
        firmName,
        date: normalizedDate,
        time,
        message,
      })
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
