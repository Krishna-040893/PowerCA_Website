import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// Update booking status (Admin only)
=======
import { createAdminClient } from '@/lib/supabase/admin'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

>>>>>>> cf3e0fc4b677538fbe555a702158b5c6d77d557f
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
<<<<<<< HEAD
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = session.user?.email === "admin@powerca.in" || 
                    session.user?.email === "contact@powerca.in" ||
                    session.user?.role === "admin"
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const { status } = await request.json()
    const bookingId = params.id

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
      console.log('Supabase not configured, simulating update')
      
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
=======
    const { status } = await request.json()
    const bookingId = params.id

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {
      // Try to update in Prisma database
      try {
        const updatedBooking = await prisma.booking.update({
          where: { id: bookingId },
          data: { 
            status: status,
            updatedAt: new Date()
          }
        })

        return NextResponse.json({
          success: true,
          booking: updatedBooking
        })
      } catch (prismaError) {
        console.log('Database not configured, returning success')
        return NextResponse.json({
          success: true,
          message: 'Booking updated (demo mode)'
        })
      }
    }

    // Use Supabase if configured
>>>>>>> cf3e0fc4b677538fbe555a702158b5c6d77d557f
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
<<<<<<< HEAD
      console.error('Supabase update error:', error)
      return NextResponse.json(
        { error: 'Failed to update booking', details: error.message },
=======
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update booking' },
>>>>>>> cf3e0fc4b677538fbe555a702158b5c6d77d557f
        { status: 500 }
      )
    }

<<<<<<< HEAD
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

  } catch (error) {
    console.error('Admin booking update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
=======
    return NextResponse.json({
      success: true,
      booking: data
    })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
>>>>>>> cf3e0fc4b677538fbe555a702158b5c6d77d557f
      { status: 500 }
    )
  }
}

<<<<<<< HEAD
// Get specific booking details (Admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = session.user?.email === "admin@powerca.in" || 
                    session.user?.email === "contact@powerca.in" ||
                    session.user?.role === "admin"
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    const bookingId = params.id

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {
      console.log('Supabase not configured, returning sample booking')
      
      return NextResponse.json({ 
        booking: {
          id: bookingId,
          name: "Sample User",
          email: "sample@email.com",
          phone: "9876543210",
          firm_name: "Sample Firm",
          date: new Date().toISOString().split('T')[0],
          time: "10:00 AM - 11:00 AM",
          type: "demo",
          status: "PENDING",
          message: "Sample booking message",
          created_at: new Date().toISOString()
        },
        message: "Demo data (Supabase not configured)"
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
      console.error('Supabase error:', error)
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

  } catch (error) {
    console.error('Admin booking fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete booking (Admin only)
=======
>>>>>>> cf3e0fc4b677538fbe555a702158b5c6d77d557f
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
<<<<<<< HEAD
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const isAdmin = session.user?.email === "admin@powerca.in" || 
                    session.user?.email === "contact@powerca.in" ||
                    session.user?.role === "admin"
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

=======
>>>>>>> cf3e0fc4b677538fbe555a702158b5c6d77d557f
    const bookingId = params.id

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {
<<<<<<< HEAD
      console.log('Supabase not configured, simulating delete')
      
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
      console.error('Supabase delete error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to delete booking', details: error.message },
=======
      // Try to delete from Prisma database
      try {
        await prisma.booking.delete({
          where: { id: bookingId }
        })

        return NextResponse.json({
          success: true,
          message: 'Booking deleted successfully'
        })
      } catch (prismaError) {
        console.log('Database not configured, returning success')
        return NextResponse.json({
          success: true,
          message: 'Booking deleted (demo mode)'
        })
      }
    }

    // Use Supabase if configured
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete booking' },
>>>>>>> cf3e0fc4b677538fbe555a702158b5c6d77d557f
        { status: 500 }
      )
    }

<<<<<<< HEAD
    return NextResponse.json({ 
      success: true,
      message: 'Booking deleted successfully',
      booking: data
    })

  } catch (error) {
    console.error('Admin booking delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
=======
    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
>>>>>>> cf3e0fc4b677538fbe555a702158b5c6d77d557f
      { status: 500 }
    )
  }
}