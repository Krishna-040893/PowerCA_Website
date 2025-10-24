import {NextRequest, NextResponse  } from 'next/server'
import {getServerSession  } from 'next-auth/next'
import {authOptions  } from '@/lib/auth'
import {createAdminClient  } from '@/lib/supabase/admin'
import {REGISTRATION_FORMS_TABLE  } from '@/lib/constants/tables'
import {sendReferralLinkEmail  } from '@/lib/resend'

// GET - Fetch affiliate details
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // First check if user is an affiliate
    const { data: userData, error: userError } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('id, role')
      .eq('id', session.user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userData.role !== 'Affiliate') {
      return NextResponse.json(
        { error: 'User is not an affiliate' },
        { status: 403 }
      )
    }

    // Fetch admin-assigned referral code and affiliate ID
    const { data: affiliateReg } = await supabase
      .from('affiliate_registrations')
      .select('referral_code, affiliate_id, status')
      .eq('user_id', userData.id)
      .eq('status', 'approved')
      .single()

    // Fetch affiliate details (using affiliate_profiles table)
    const { data: affiliateDetails, error: detailsError } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', userData.id)
      .single()

    if (detailsError && detailsError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      return NextResponse.json(
        { error: 'Failed to fetch affiliate details' },
        { status: 500 }
      )
    }

    // Merge admin-assigned code with profile data
    const mergedDetails = affiliateDetails ? {
      ...affiliateDetails,
      referral_code: affiliateReg?.referral_code || affiliateDetails.referral_code, // Use admin code
      affiliate_id: affiliateReg?.affiliate_id || affiliateDetails.affiliate_id // Use admin ID
    } : null

    return NextResponse.json({
      success: true,
      affiliateDetails: mergedDetails,
      userId: userData.id,
      affiliateId: affiliateReg?.affiliate_id || null
    })

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new affiliate details
export async function POST(request: NextRequest) {
  try {
    // Ensure we always return JSON
    const headers = {
      'Content-Type': 'application/json',
    }

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401, headers }
      )
    }

    const body = await request.json()

    const supabase = createAdminClient()

    // Verify user is an affiliate

    const { data: userData, error: userError } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('id, role')
      .eq('id', session.user.id)
      .single()


    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Check role case-insensitively
    if (userData.role?.toLowerCase() !== 'affiliate') {
      return NextResponse.json(
        { error: `User is not an affiliate. Current role: ${userData.role}` },
        { status: 403 }
      )
    }


    // Check if affiliate details already exist

    const { data: existingDetails } = await supabase
      .from('affiliate_profiles')
      .select('id')
      .eq('user_id', userData.id)
      .single()


    if (existingDetails) {
      return NextResponse.json(
        { error: 'Affiliate profile already exists. Please refresh the page.' },
        { status: 400 }
      )
    }

    // Generate a simple referral code
    const generateReferralCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = 'REF-'
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    // Prepare insert data
    const insertData = {
      user_id: userData.id,
      affiliate_id: body.affiliateId || null,
      referral_code: generateReferralCode(),
      firm_name: body.firmName,
      firm_address: body.firmAddress,
      contact_person: body.contactPerson || null,
      contact_email: body.contactEmail || null,
      contact_phone: body.contactPhone || null,
      product_url: body.productUrl || 'https://powerca.in/demo',
      website_url: body.websiteUrl || 'https://powerca.in',
      status: 'active'
    }


    // Create affiliate details with minimal required fields
    const { data: newDetails, error: createError } = await supabase
      .from('affiliate_profiles')
      .insert(insertData)
      .select()
      .single()


    if (createError) {
      return NextResponse.json(
        { error: `Failed to create affiliate details: ${createError.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Send email to customer if email is provided
    if (body.contactEmail && newDetails) {
      try {
        const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'}/pricing?ref=${newDetails.referral_code}`

        const emailResult = await sendReferralLinkEmail({
          customerName: body.contactPerson || body.firmName || 'Customer',
          customerEmail: body.contactEmail,
          affiliateName: session.user.name || 'Your Partner',
          referralCode: newDetails.referral_code,
          referralLink: referralLink,
          firmName: body.firmName
        })

        if (emailResult.success) {
          console.log('✅ Referral link email sent successfully to:', body.contactEmail)
        } else {
          console.error('❌ Failed to send referral link email:', emailResult.error)
          // Don't fail the operation if email fails
        }
      } catch (emailError) {
        console.error('❌ Error sending referral link email:', emailError)
        // Don't fail the operation if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Affiliate details created successfully',
      emailSent: !!body.contactEmail,
      affiliateDetails: newDetails
    })

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update existing affiliate details
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const supabase = createAdminClient()

    // Verify user is an affiliate

    const { data: userData, error: userError } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('id, role')
      .eq('id', session.user.id)
      .single()


    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Check role case-insensitively
    if (userData.role?.toLowerCase() !== 'affiliate') {
      return NextResponse.json(
        { error: `User is not an affiliate. Current role: ${userData.role}` },
        { status: 403 }
      )
    }


    // Update affiliate details
    const { data: updatedDetails, error: updateError } = await supabase
      .from('affiliate_profiles')
      .update({
        firm_name: body.firmName,
        firm_address: body.firmAddress,
        contact_person: body.contactPerson || null,
        contact_email: body.contactEmail || null,
        contact_phone: body.contactPhone || null,
        product_url: body.productUrl || 'https://powerca.in/demo',
        website_url: body.websiteUrl || 'https://powerca.in',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userData.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update affiliate details' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Affiliate details updated successfully',
      affiliateDetails: updatedDetails
    })

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
