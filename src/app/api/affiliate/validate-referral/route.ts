import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - Validate affiliate referral code and customer ID
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ref = searchParams.get('ref') // Referral code
    const cus = searchParams.get('cus') // Customer ID

    if (!ref || !cus) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Missing referral code or customer ID'
      }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify that the referral code and customer ID match in affiliate_referrals table
    const { data: referral, error: referralError } = await supabase
      .from('affiliate_referrals')
      .select(`
        id,
        affiliate_profile_id,
        referral_code,
        customer_id,
        referred_name,
        referred_email,
        status,
        affiliate_profiles (
          firm_name,
          user_id,
          registration_forms (
            name,
            email
          )
        )
      `)
      .eq('referral_code', ref)
      .eq('customer_id', cus)
      .eq('status', 'pending') // Only pending referrals can be used for purchase
      .single()

    if (referralError || !referral) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Invalid or already used referral link'
      }, { status: 404 })
    }

    // Handle affiliate_profiles as it may be returned as array or object
    const affiliateProfile = Array.isArray(referral.affiliate_profiles)
      ? referral.affiliate_profiles[0]
      : referral.affiliate_profiles

    // Handle registration_forms as it may be returned as array or object
    const registrationForms = affiliateProfile?.registration_forms
    const registrationForm = registrationForms && Array.isArray(registrationForms)
      ? registrationForms[0]
      : registrationForms

    const affiliateName = (registrationForm && typeof registrationForm === 'object' && 'name' in registrationForm)
      ? registrationForm.name
      : 'Affiliate Partner'

    return NextResponse.json({
      success: true,
      valid: true,
      referralId: referral.id,
      affiliateName,
      firmName: affiliateProfile?.firm_name,
      customerName: referral.referred_name,
      customerEmail: referral.referred_email
    })

  } catch (error) {
    console.error('❌ Error validating referral:', error)
    return NextResponse.json({
      success: false,
      valid: false,
      error: 'Failed to validate referral'
    }, { status: 500 })
  }
}
