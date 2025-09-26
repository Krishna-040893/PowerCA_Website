import {NextRequest, NextResponse  } from 'next/server'
import {requireAdminAuth  } from '@/lib/admin-auth-helper'
import {createClient  } from '@supabase/supabase-js'

// Get all affiliate applications (Admin only)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey ||
        supabaseUrl.includes('YOUR_PROJECT_ID')) {
      // Return sample data for demo
      const sampleApplications = [
        {
          id: '1',
          name: 'Ravi Patel',
          account_email: 'ravi.patel@capartners.com',
          payment_email: 'ravi.patel@gmail.com',
          website_url: 'https://capartners.com',
          promotion_method: 'Will promote through our CA network and client base',
          status: 'pending',
          created_at: new Date().toISOString(),
          registrations: {
            username: 'ravipatel',
            email: 'ravi.patel@capartners.com'
          }
        },
        {
          id: '2',
          name: 'Sneha Reddy',
          account_email: 'sneha@taxconsultants.in',
          payment_email: 'sneha.reddy@gmail.com',
          website_url: 'https://taxconsultants.in',
          promotion_method: 'Email marketing to existing client database',
          status: 'approved',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          registrations: {
            username: 'snehareddy',
            email: 'sneha@taxconsultants.in'
          }
        }
      ]

      return NextResponse.json(sampleApplications)
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // Fetch affiliate applications
    const { data: applications, error } = await supabase
      .from('affiliate_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)

      // If table doesn't exist, return empty array with setup instructions
      if (error.message?.includes('affiliate_applications') || error.code === '42P01') {
        return NextResponse.json([])
      }

      return NextResponse.json(
        { error: 'Failed to fetch affiliate applications' },
        { status: 500 }
      )
    }

    return NextResponse.json(applications || [])

  } catch (error) {
    console.error('Admin affiliates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update affiliate application status (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    const body = await request.json()
    const { applicationId, status, adminNotes, approvedBy } = body

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey ||
        supabaseUrl.includes('YOUR_PROJECT_ID')) {
      return NextResponse.json({
        message: 'Demo mode - application status updated',
        applicationId,
        status
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    const { data, error } = await supabase
      .from('affiliate_applications')
      .update({
        status,
        admin_notes: adminNotes,
        approved_by: approvedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Application updated successfully',
      application: data
    })

  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}