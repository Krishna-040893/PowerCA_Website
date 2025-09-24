import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// Generate a unique referral code
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'REF-'
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// POST - Create new referral profile (allows multiple)
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/affiliate/create-referral - Starting')

    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      console.log('No session found')
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    console.log('Session user:', session.user.id, session.user.email)

    const body = await request.json()
    console.log('Request body:', body)

    const supabase = createAdminClient()

    // Verify user is an affiliate
    const { data: userData, error: userError } = await supabase
      .from('registrations')
      .select('id, role, affiliate_id')
      .eq('id', session.user.id)
      .single()

    if (userError || !userData) {
      console.error('User not found in database')
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Check role case-insensitively
    if (userData.role?.toLowerCase() !== 'affiliate') {
      console.error('User is not an affiliate:', userData.role)
      return NextResponse.json(
        { error: `User is not an affiliate. Current role: ${userData.role}` },
        { status: 403 }
      )
    }

    console.log('User verified as affiliate with ID:', userData.affiliate_id)

    // First get the affiliate profile to check for existing referrals
    const { data: affiliateProfile } = await supabase
      .from('affiliate_profiles')
      .select('id')
      .eq('user_id', userData.id)
      .single()

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
        console.log('Duplicate referral found:', existingReferrals)
        return NextResponse.json(
          { error: 'Referral user is already exist. This customer has already been referred by you and is pending.' },
          { status: 400 }
        )
      }
    }

    // Check if a profile already exists for this user
    const { data: existingProfile, error: checkError } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', userData.id)
      .single()

    console.log('Existing profile check:', { existingProfile, checkError })

    // Generate unique referral code
    let referralCode = generateReferralCode()

    // Ensure referral code is unique
    let codeExists = true
    let attempts = 0
    while (codeExists && attempts < 10) {
      const { data: existingCode } = await supabase
        .from('affiliate_profiles')
        .select('id')
        .eq('referral_code', referralCode)
        .single()

      if (!existingCode) {
        codeExists = false
      } else {
        referralCode = generateReferralCode()
        attempts++
      }
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'Unable to generate unique referral code. Please try again.' },
        { status: 500 }
      )
    }

    let profileData;
    let operationError;

    if (existingProfile) {
      // Update existing profile with new referral code
      console.log('Updating existing profile with new referral code')

      const updateData = {
        affiliate_id: userData.affiliate_id || body.affiliateId,
        referral_code: referralCode,
        firm_name: body.firmName,
        firm_address: body.firmAddress,
        contact_person: body.contactPerson || null,
        contact_email: body.contactEmail || null,
        contact_phone: body.contactPhone || null,
        product_url: body.productUrl || 'https://powerca.in/demo',
        website_url: body.websiteUrl || 'https://powerca.in',
        updated_at: new Date().toISOString()
      }

      const { data: updatedProfile, error: updateError } = await supabase
        .from('affiliate_profiles')
        .update(updateData)
        .eq('user_id', userData.id)
        .select()
        .single()

      profileData = updatedProfile
      operationError = updateError

      console.log('Update result:', { updatedProfile, updateError })
    } else {
      // Create new affiliate profile/referral
      const insertData = {
        user_id: userData.id,
        affiliate_id: userData.affiliate_id || body.affiliateId,
        referral_code: referralCode,
        firm_name: body.firmName,
        firm_address: body.firmAddress,
        contact_person: body.contactPerson || null,
        contact_email: body.contactEmail || null,
        contact_phone: body.contactPhone || null,
        product_url: body.productUrl || 'https://powerca.in/demo',
        website_url: body.websiteUrl || 'https://powerca.in',
        status: 'active'
      }

      console.log('Creating new referral profile:', insertData)

      const { data: newProfile, error: createError } = await supabase
        .from('affiliate_profiles')
        .insert(insertData)
        .select()
        .single()

      profileData = newProfile
      operationError = createError

      console.log('Insert result:', { newProfile, createError })
    }

    if (operationError) {
      console.error('Error processing referral profile:', operationError)
      return NextResponse.json(
        { error: `Failed to process referral profile: ${operationError.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Store referral data in affiliate_referrals table with referral code
    const { data: referralData, error: referralError } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_profile_id: profileData.id,
        affiliate_id: profileData.affiliate_id, // Store affiliate ID
        referral_code: profileData.referral_code, // Store the referral code
        referred_email: body.contactEmail || '',
        referred_name: body.contactPerson || body.firmName,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (referralError) {
      console.log('Note: Could not create referral record:', referralError.message)
      // Don't fail the operation, just log it
    }

    return NextResponse.json({
      success: true,
      message: existingProfile ? 'Referral profile updated with new code' : 'New referral profile created successfully',
      profile: {
        id: profileData.id,
        affiliate_id: profileData.affiliate_id,
        referral_code: profileData.referral_code,
        referral_link: `${process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'}/pricing?ref=${profileData.referral_code}`,
        firm_name: profileData.firm_name,
        status: profileData.status
      },
      referralRecord: referralData || null
    })

  } catch (error) {
    console.error('Error in POST /api/affiliate/create-referral:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}