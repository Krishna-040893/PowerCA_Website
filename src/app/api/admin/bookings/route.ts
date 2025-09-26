import {NextRequest, NextResponse  } from 'next/server'
import {createClient  } from '@supabase/supabase-js'
import {requireAdminAuth  } from '@/lib/admin-auth-helper'
import {logger  } from '@/lib/logger'
import {createErrorResponse, ErrorType, handleConfigurationError, handleDatabaseError, isServiceConfigured  } from '@/lib/error-handler'

// Force Node.js runtime for JWT support
export const runtime = 'nodejs'

// Get all bookings (Admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using centralized helper
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    // Admin is authorized, proceed with the request
    const adminUser = auth.admin

    // Log admin action for audit trail (without sensitive data)
    logger.adminAction('GET_BOOKINGS', adminUser.id)

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY') ||
        supabaseUrl?.includes('YOUR_PROJECT_ID')) {
      logger.debug('Supabase not configured, using sample data')

      // Return sample data for demo
      const sampleBookings = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          email: 'rajesh.kumar@email.com',
          phone: '9876543210',
          firm_name: 'Kumar & Associates',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 AM - 11:00 AM',
          type: 'demo',
          status: 'CONFIRMED',
          message: 'Interested in practice management features',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Priya Sharma',
          email: 'priya.sharma@email.com',
          phone: '9876543211',
          firm_name: 'Sharma CA Firm',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          time: '02:00 PM - 03:00 PM',
          type: 'demo',
          status: 'PENDING',
          message: 'Need help with GST compliance',
          created_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
        },
        {
          id: '3',
          name: 'Amit Patel',
          email: 'amit.patel@email.com',
          phone: '9876543212',
          firm_name: 'Patel & Co',
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
          time: '11:00 AM - 12:00 PM',
          type: 'consultation',
          status: 'COMPLETED',
          message: 'Looking for client management solutions',
          created_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
        }
      ]

      return NextResponse.json({
        bookings: sampleBookings,
        message: 'Demo data (Supabase not configured)',
        total: sampleBookings.length
      })
    }

    // Create Supabase admin client
    if (!supabaseUrl || !supabaseServiceKey) {
      return handleConfigurationError('Database')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // Fetch bookings from Supabase
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist, provide helpful info in development only
      if (error.message?.includes('bookings') || error.code === '42P01') {
        if (process.env.NODE_ENV === 'development') {
          return NextResponse.json({
            bookings: [],
            message: 'Bookings table not found. Please create it in Supabase.',
            setupRequired: true,
            instructions: `
Run this SQL in your Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  firm_name VARCHAR(255),
  date DATE NOT NULL,
  time VARCHAR(50) NOT NULL,
  type VARCHAR(50) DEFAULT 'demo',
  status VARCHAR(50) DEFAULT 'PENDING',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policy for service role
CREATE POLICY "Service role can manage bookings" ON bookings
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
          `,
            total: 0
          })
        }
        return createErrorResponse(
          ErrorType.DATABASE,
          'Database table not configured'
        )
      }

      return handleDatabaseError(error)
    }

    return NextResponse.json({
      bookings: bookings || [],
      total: bookings?.length || 0,
      message: 'Live data from Supabase'
    })

  } catch (error) {
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error
    )
  }
}

// Create a new booking (Admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    const body = await request.json()

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY') ||
        supabaseUrl?.includes('YOUR_PROJECT_ID')) {
      return handleConfigurationError('Database')
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return handleConfigurationError('Database')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    const { data, error } = await supabase
      .from('bookings')
      .insert([body])
      .select()
      .single()

    if (error) {
      return handleDatabaseError(error)
    }

    return NextResponse.json({
      booking: data,
      message: 'Booking created successfully'
    })

  } catch (error) {
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error
    )
  }
}