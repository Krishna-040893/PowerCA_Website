import {NextRequest, NextResponse  } from 'next/server'
import {requireAdminAuth, createUnauthorizedResponse  } from '@/lib/auth/admin-session'
import {createClient  } from '@supabase/supabase-js'
import {sendAffiliateApprovalEmail  } from '@/lib/resend'
import {logger  } from '@/lib/logger'

// Get all affiliate applications (Admin only)
export async function GET(_request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
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

    // Fetch affiliate registrations with user info
    const { data: applications, error } = await supabase
      .from('affiliate_registrations')
      .select('*')
      .order('created_at', { ascending: false })

    // Generate username from email for display (no registration_forms dependency)
    let enrichedApplications = applications || []
    if (applications && applications.length > 0) {
      enrichedApplications = applications.map(app => {
        // Generate username from email (part before @)
        const username = app.email ? app.email.split('@')[0] : 'affiliate'
        return {
          ...app,
          registrations: { username, email: app.email }
        }
      })
    }

    if (error) {
      logger.error('Supabase error', error)

      // If table doesn't exist, return empty array
      if (error.message?.includes('affiliate_registrations') || error.code === '42P01') {
        return NextResponse.json([])
      }

      return NextResponse.json(
        { error: 'Failed to fetch affiliate applications' },
        { status: 500 }
      )
    }

    // Map the data to match the expected format with all fields
    const mappedApplications = enrichedApplications.map(app => ({
      id: app.id,
      name: app.full_name,
      email: app.email,
      phone: app.phone,
      city: app.city,
      state: app.state,
      business_type: app.business_type,
      company_name: app.company_name,
      designation: app.designation,
      experience: app.experience,
      promotion_method: app.promotion_method,
      target_audience: app.target_audience,
      monthly_leads: app.monthly_leads,
      account_number: app.account_number,
      ifsc_code: app.ifsc_code,
      pan_number: app.pan_number,
      gst_number: app.gst_number,
      status: app.status,
      admin_notes: app.rejection_reason,
      created_at: app.created_at,
      referral_code: app.referral_code,
      approved_at: app.approved_at,
      registrations: app.registrations
    }))

    return NextResponse.json(mappedApplications)

  } catch (error) {
    logger.error('Admin affiliates error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update affiliate application status (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const body = await request.json()
    const { applicationId, status, adminNotes } = body

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

    // First, get the affiliate registration to find the user_id and email
    const { data: affiliateReg, error: fetchError } = await supabase
      .from('affiliate_registrations')
      .select('user_id, full_name, email')
      .eq('id', applicationId)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch affiliate registration', fetchError)
      return NextResponse.json(
        { error: 'Failed to find affiliate registration' },
        { status: 500 }
      )
    }

    // Prepare update data based on status
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString()
      // Referral code will be auto-generated by database trigger
    } else if (status === 'rejected') {
      updateData.rejected_at = new Date().toISOString()
      updateData.rejection_reason = adminNotes
    }

    const { data, error } = await supabase
      .from('affiliate_registrations')
      .update(updateData)
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      logger.error('Supabase error updating affiliate registration', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update application' },
        { status: 500 }
      )
    }

    logger.info('Affiliate application updated successfully', {
      applicationId,
      status,
      referralCode: data.referral_code
    })

    // Send approval email if status is approved
    if (status === 'approved' && data.referral_code) {
      try {
        const affiliateLoginUrl = 'https://powerca.in/affiliate-login'

        const emailResult = await sendAffiliateApprovalEmail({
          name: affiliateReg.full_name,
          email: affiliateReg.email,
          referralCode: data.referral_code,
          affiliateLoginUrl
        })

        if (emailResult.success) {
          logger.info('Affiliate approval email sent successfully', { email: affiliateReg.email })
        } else {
          logger.error('Failed to send affiliate approval email', emailResult.error)
          // Don't fail the request if email fails - approval is already done
        }
      } catch (emailError) {
        logger.error('Error sending affiliate approval email', emailError)
        // Don't fail the request if email fails - approval is already done
      }
    }

    return NextResponse.json({
      message: 'Application updated successfully',
      application: data,
      referral_code: data.referral_code // Return the auto-generated referral code
    })

  } catch (error) {
    logger.error('Update application error', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}