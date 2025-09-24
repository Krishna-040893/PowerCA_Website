import { NextRequest, NextResponse } from 'next/server'
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
    const supabase = createAdminClient()
    
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
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
      { status: 500 }
    )
  }
}