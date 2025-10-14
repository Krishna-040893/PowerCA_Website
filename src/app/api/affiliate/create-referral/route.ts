import {NextRequest, NextResponse  } from 'next/server'
import {getServerSession  } from 'next-auth/next'
import {authOptions  } from '@/lib/auth'
import {createAdminClient  } from '@/lib/supabase/admin'
import {REGISTRATION_FORMS_TABLE  } from '@/lib/constants/tables'
import {sendReferralLinkEmail  } from '@/lib/resend'

// POST - Create new referral profile (allows multiple)
// Uses the admin-assigned referral code from affiliate_registrations table
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const supabase = createAdminClient()

    // Check if user is an affiliate based on their role in session
    const isAffiliate = session.user.role?.toLowerCase() === 'affiliate'

    let userData
    let affiliateReg

    if (isAffiliate) {
      // For affiliates, look them up directly in affiliate_registrations by email
      const { data: affiliate, error: affiliateError } = await supabase
        .from('affiliate_registrations')
        .select('id, email, full_name, referral_code, affiliate_id, status')
        .eq('email', session.user.email)
        .eq('status', 'approved')
        .single()

      if (affiliateError || !affiliate) {
        return NextResponse.json(
          { error: 'Affiliate not found or not approved' },
          { status: 404 }
        )
      }

      userData = {
        id: affiliate.id,
        role: 'affiliate'
      }

      affiliateReg = {
        referral_code: affiliate.referral_code,
        affiliate_id: affiliate.affiliate_id || null, // Use the database-assigned affiliate_id
        status: affiliate.status
      }
    } else {
      // For regular users, check registration_forms table
      const { data: user, error: userError } = await supabase
        .from(REGISTRATION_FORMS_TABLE)
        .select('id, role')
        .eq('id', session.user.id)
        .single()

      if (userError || !user) {
        return NextResponse.json(
          { error: 'User not found in database' },
          { status: 404 }
        )
      }

      // Check role case-insensitively
      if (user.role?.toLowerCase() !== 'affiliate') {
        return NextResponse.json(
          { error: `User is not an affiliate. Current role: ${user.role}` },
          { status: 403 }
        )
      }

      userData = user

      // Get the admin-assigned referral code from affiliate_registrations
      const { data: reg, error: regError } = await supabase
        .from('affiliate_registrations')
        .select('referral_code, affiliate_id, status')
        .eq('user_id', userData.id)
        .eq('status', 'approved')
        .single()

      if (regError || !reg) {
        return NextResponse.json(
          { error: 'Affiliate registration not found or not approved' },
          { status: 404 }
        )
      }

      affiliateReg = reg
    }

    // Use the admin-assigned referral code
    const referralCode = affiliateReg.referral_code

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code not assigned. Please contact admin.' },
        { status: 400 }
      )
    }

    // For new affiliates (using affiliate_registrations), use email to find profile
    // For old affiliates (using registration_forms), use user_id
    let profileLookupQuery = supabase
      .from('affiliate_profiles')
      .select('id, affiliate_id, referral_code, user_id')

    if (isAffiliate) {
      // New system: lookup by referral_code
      profileLookupQuery = profileLookupQuery.eq('referral_code', affiliateReg.referral_code)
    } else {
      // Old system: lookup by user_id
      profileLookupQuery = profileLookupQuery.eq('user_id', userData.id)
    }

    const { data: affiliateProfile } = await profileLookupQuery.maybeSingle()

    // If affiliate profile exists, check for duplicate referrals
    if (affiliateProfile) {
      // Check if the same customer is already referred by this affiliate
      let duplicateQuery = supabase
        .from('affiliate_referrals')
        .select('*')
        .eq('affiliate_profile_id', affiliateProfile.id)
        .eq('status', 'pending') // Only check pending referrals

      // Build the duplicate check query
      if (body.contactEmail) {
        duplicateQuery = duplicateQuery.eq('referred_email', body.contactEmail)
      } else if (body.firmName) {
        duplicateQuery = duplicateQuery.ilike('referred_name', `%${body.firmName}%`)
      }

      const { data: existingReferrals, error: referralCheckError } = await duplicateQuery.limit(1).single()

      if (existingReferrals && !referralCheckError) {
        return NextResponse.json(
          { error: 'Referral user is already exist. This customer has already been referred by you and is pending.' },
          { status: 400 }
        )
      }
    }

    // Check if a profile already exists for this user
    // Try multiple lookup methods to avoid duplicate key errors
    let existingProfile = null

    console.log('🔍 Looking up affiliate profile for:', {
      affiliate_id: affiliateReg.affiliate_id,
      referral_code: affiliateReg.referral_code,
      isAffiliate
    })

    // Method 1: Lookup by affiliate_id (most reliable if affiliate_id exists)
    if (affiliateReg.affiliate_id) {
      console.log('🔍 Method 1: Searching by affiliate_id:', affiliateReg.affiliate_id)

      const { data: profileByAffiliateId, error: lookupError } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('affiliate_id', affiliateReg.affiliate_id)
        .maybeSingle()

      if (lookupError) {
        console.error('❌ Error looking up by affiliate_id:', lookupError)
      }

      if (profileByAffiliateId) {
        existingProfile = profileByAffiliateId
        console.log('✅ Found existing profile by affiliate_id:', affiliateReg.affiliate_id)
      } else {
        console.log('⚠️ No profile found by affiliate_id:', affiliateReg.affiliate_id)
      }
    } else {
      console.log('⚠️ No affiliate_id available for lookup')
    }

    // Method 2: Lookup by referral_code or user_id (fallback)
    if (!existingProfile) {
      let existingProfileQuery = supabase
        .from('affiliate_profiles')
        .select('*')

      if (isAffiliate) {
        // New system: lookup by referral_code
        existingProfileQuery = existingProfileQuery.eq('referral_code', affiliateReg.referral_code)
      } else {
        // Old system: lookup by user_id
        existingProfileQuery = existingProfileQuery.eq('user_id', userData.id)
      }

      const { data: profileByCode } = await existingProfileQuery.maybeSingle()
      existingProfile = profileByCode
    }

    let profileData

    if (existingProfile) {
      // Profile exists - just use it, DON'T overwrite with customer data
      console.log('✅ Using existing affiliate profile:', existingProfile.id)
      profileData = existingProfile
    } else {
      // Create new affiliate profile ONCE with affiliate's basic info
      // This should only happen on first referral creation
      const insertData = {
        user_id: isAffiliate ? null : userData.id, // New affiliates don't have user_id
        affiliate_id: affiliateReg.affiliate_id || null,
        referral_code: referralCode, // Admin-assigned code
        product_url: 'https://powerca.in/demo',
        website_url: 'https://powerca.in',
        status: 'active'
      }

      console.log('✅ Creating new affiliate profile:', {
        isNewAffiliate: isAffiliate,
        referralCode: referralCode,
        userId: insertData.user_id
      })

      const { data: newProfile, error: createError } = await supabase
        .from('affiliate_profiles')
        .insert(insertData)
        .select()
        .single()

      if (createError) {
        console.error('❌ Failed to create profile:', createError)
        return NextResponse.json(
          { error: `Failed to create affiliate profile: ${createError.message || 'Unknown error'}` },
          { status: 500 }
        )
      }

      profileData = newProfile
    }

    // Store referral data in affiliate_referrals table with referral code
    // customer_id will be auto-generated by database trigger (CUS001, CUS002, etc.)
    const { data: referralData, error: referralError } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_profile_id: profileData.id,
        affiliate_id: profileData.affiliate_id, // Store affiliate ID
        referral_code: profileData.referral_code, // Store the referral code
        referred_email: body.contactEmail || '',
        referred_name: body.contactPerson || body.firmName,
        referred_phone: body.contactPhone || null, // Store customer's phone
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (referralError) {
      console.error('❌ Error creating referral record:', referralError)
      return NextResponse.json(
        { error: `Failed to create referral: ${referralError.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    if (!referralData) {
      console.error('❌ No referral data returned after insert')
      return NextResponse.json(
        { error: 'Failed to create referral: No data returned' },
        { status: 500 }
      )
    }

    console.log('✅ Referral record created:', {
      customer_id: referralData.customer_id,
      referral_code: profileData.referral_code
    })

    // Send email to customer if email is provided
    if (body.contactEmail && referralData?.customer_id) {
      console.log('📧 Attempting to send referral link email to:', body.contactEmail)
      console.log('📧 RESEND_API_KEY configured:', !!process.env.RESEND_API_KEY)
      console.log('📧 EMAIL_FROM configured:', process.env.EMAIL_FROM)

      try {
        // Create referral link with both referral code and customer ID
        const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'}/pricing?ref=${profileData.referral_code}&cus=${referralData.customer_id}`

        console.log('📧 Sending email with details:', {
          customerEmail: body.contactEmail,
          referralCode: profileData.referral_code,
          customerId: referralData.customer_id,
          referralLink
        })

        const emailResult = await sendReferralLinkEmail({
          customerName: body.contactPerson || body.firmName || 'Customer',
          customerEmail: body.contactEmail,
          affiliateName: session.user.name || 'Your Partner',
          referralCode: profileData.referral_code,
          referralLink: referralLink,
          firmName: body.firmName,
          customerId: referralData.customer_id
        })

        console.log('📧 Email result:', emailResult)

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
    } else {
      if (!body.contactEmail) {
        console.log('⚠️ No email provided - skipping email send')
      }
      if (!referralData?.customer_id) {
        console.log('⚠️ No customer ID - skipping email send')
      }
    }

    // Build referral link with customer ID if available
    const referralLink = referralData?.customer_id
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'}/pricing?ref=${profileData.referral_code}&cus=${referralData.customer_id}`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'}/pricing?ref=${profileData.referral_code}`

    return NextResponse.json({
      success: true,
      message: existingProfile ? 'New customer referral created successfully' : 'Referral profile created with customer',
      emailSent: !!body.contactEmail,
      profile: {
        id: profileData.id,
        affiliate_id: profileData.affiliate_id,
        referral_code: profileData.referral_code, // Admin-assigned code (e.g., 0CDCCBF1)
        referral_link: referralLink,
        firm_name: profileData.firm_name,
        status: profileData.status
      },
      referralRecord: referralData ? {
        id: referralData.id,
        customer_id: referralData.customer_id, // Auto-generated (e.g., CUS001)
        referred_name: referralData.referred_name,
        referred_email: referralData.referred_email,
        status: referralData.status
      } : null
    })

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
