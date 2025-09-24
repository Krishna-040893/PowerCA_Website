import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// Get all bookings (Admin only)
export async function GET(request: NextRequest) {
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

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {
      console.log('Supabase not configured, returning sample data')
      
      // Return sample data for demo
      const sampleBookings = [
        {
          id: "1",
          name: "Rajesh Kumar",
          email: "rajesh.kumar@email.com",
          phone: "9876543210",
          firm_name: "Kumar & Associates",
          date: new Date().toISOString().split('T')[0],
          time: "10:00 AM - 11:00 AM",
          type: "demo",
          status: "CONFIRMED",
          message: "Interested in practice management features",
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          name: "Priya Sharma", 
          email: "priya.sharma@email.com",
          phone: "9876543211",
          firm_name: "Sharma CA Firm",
          date: "2025-09-15",
          time: "02:00 PM - 03:00 PM",
          type: "demo",
          status: "PENDING",
          message: "Need help with GST compliance",
          created_at: new Date().toISOString()
        },
        {
          id: "3",
          name: "Amit Patel",
          email: "amit.patel@email.com",
          phone: "9876543212", 
          firm_name: "Patel & Co",
          date: "2025-09-12",
          time: "11:00 AM - 12:00 PM",
          type: "demo",
          status: "COMPLETED",
          message: "Looking for client management solutions",
          created_at: new Date().toISOString()
        }
      ]
      
      return NextResponse.json({ 
        bookings: sampleBookings,
        message: "Demo data (Supabase not configured)"
      })
    }

    // Fetch from Supabase
=======
import { createAdminClient } from '@/lib/supabase/admin'

let prisma: any = null
try {
  const { PrismaClient } = require('@prisma/client')
  prisma = new PrismaClient()
} catch (error) {
  console.log('Prisma not configured, will use Supabase or demo data')
}

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url' || !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http')) {
      // Try to fetch from Prisma database if available
      if (prisma) {
        try {
          const bookings = await prisma.booking.findMany({
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        })

        return NextResponse.json({
          success: true,
          bookings: bookings.map(booking => ({
            id: booking.id,
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            firmName: booking.firmName,
            date: booking.date.toISOString(),
            time: booking.time,
            status: booking.status,
            message: booking.message,
            createdAt: booking.createdAt.toISOString(),
            user: booking.user
          }))
        })
        } catch (prismaError) {
          console.log('Prisma error:', prismaError)
        }
      }
      
      // Return demo data if database is not configured
        return NextResponse.json({
          success: true,
          bookings: [
            {
              id: 'DEMO-001',
              name: 'John Doe',
              email: 'john.doe@example.com',
              phone: '9876543210',
              firmName: 'ABC & Associates',
              date: new Date().toISOString(),
              time: '10:00 AM',
              status: 'CONFIRMED',
              message: 'Looking forward to the demo',
              createdAt: new Date().toISOString()
            },
            {
              id: 'DEMO-002',
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              phone: '9876543211',
              firmName: 'XYZ Chartered Accountants',
              date: new Date(Date.now() + 86400000).toISOString(),
              time: '02:00 PM',
              status: 'PENDING',
              message: 'Interested in tax features',
              createdAt: new Date().toISOString()
            }
          ]
        })
    }

    // Use Supabase if configured
>>>>>>> cf3e0fc4b677538fbe555a702158b5c6d77d557f
    const supabase = createAdminClient()
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
<<<<<<< HEAD
      return NextResponse.json(
        { error: 'Failed to fetch bookings', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      bookings: bookings || [],
      total: bookings?.length || 0
    })

  } catch (error) {
    console.error('Admin bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
=======
      // Fallback to demo data
      return NextResponse.json({
        success: true,
        bookings: []
      })
    }

    return NextResponse.json({
      success: true,
      bookings: bookings?.map(booking => ({
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        firmName: booking.firm_name,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        message: booking.message,
        createdAt: booking.created_at
      })) || []
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
>>>>>>> cf3e0fc4b677538fbe555a702158b5c6d77d557f
      { status: 500 }
    )
  }
}