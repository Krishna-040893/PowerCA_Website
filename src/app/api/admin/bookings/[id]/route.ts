import {NextRequest, NextResponse  } from 'next/server'
import {requireAdminAuth  } from '@/lib/admin-auth-helper'
import {createAdminClient  } from '@/lib/supabase/admin'

// Update booking status (Admin only)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    const { status } = await request.json()
    const resolvedParams = await params
    const bookingId = resolvedParams.id

    // Validate status
    const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {

      return NextResponse.json({
        success: true,
        message: `Booking ${bookingId} status updated to ${status} (demo mode)`,
        booking: {
          id: bookingId,
          status: status,
          updated_at: new Date().toISOString()
        }
      })
    }

    // Update in Supabase
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update booking', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: data
    })

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get specific booking details (Admin only)
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    const resolvedParams = await params
    const bookingId = resolvedParams.id

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {

      return NextResponse.json({
        booking: {
          id: bookingId,
          name: 'Sample User',
          email: 'sample@email.com',
          phone: '9876543210',
          firm_name: 'Sample Firm',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM - 11:00 AM',
          type: 'demo',
          status: 'PENDING',
          message: 'Sample booking message',
          created_at: new Date().toISOString()
        },
        message: 'Demo data (Supabase not configured)'
      })
    }

    // Fetch from Supabase
    const supabase = createAdminClient()

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch booking', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ booking })

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete booking (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    const resolvedParams = await params
    const bookingId = resolvedParams.id

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {

      return NextResponse.json({
        success: true,
        message: `Booking ${bookingId} deleted (demo mode)`
      })
    }

    // Delete from Supabase
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to delete booking', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
      booking: data
    })

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}