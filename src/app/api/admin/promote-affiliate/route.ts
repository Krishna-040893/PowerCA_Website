import {NextRequest, NextResponse  } from 'next/server'
import {requireAdminAuth  } from '@/lib/admin-auth-helper'
import {createAdminClient  } from '@/lib/supabase/admin'

// Generate unique affiliate ID
function generateAffiliateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'AFF-'
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // First, fetch the current user data to get all their information
    const { data: userData, error: fetchError } = await supabase
      .from('registrations')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch user data', details: fetchError.message },
        { status: 500 }
      )
    }

    // Generate unique affiliate ID
    const affiliateId = generateAffiliateId()

    // Update the registrations table with affiliate ID
    const { data: registrationData, error: registrationError } = await supabase
      .from('registrations')
      .update({
        role: 'Affiliate',  // Use capital A to match existing constraint
        is_affiliate: true,
        affiliate_status: 'approved',
        affiliate_id: affiliateId
      })
      .eq('id', userId)
      .select()
      .single()

    if (registrationError) {
      return NextResponse.json(
        { error: 'Failed to update user role', details: registrationError.message },
        { status: 500 }
      )
    }

    // Create affiliate profile in affiliate_profiles table
    try {
      // Check if profile already exists
      const { data: existingProfile, error: _checkError } = await supabase
        .from('affiliate_profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!existingProfile) {
        // Create new affiliate profile - let triggers generate IDs
        const { data: affiliateProfile, error: profileError } = await supabase
          .from('affiliate_profiles')
          .insert({
            user_id: userId,
            firm_name: userData.name || userData.firm_name || 'To be updated',
            firm_address: userData.address || 'To be updated',
            contact_person: userData.name,
            contact_email: userData.email,
            contact_phone: userData.phone || null,
            product_url: 'https://powerca.in/demo',
            website_url: 'https://powerca.in',
            commission_rate: 10.00,
            status: 'active'
          })
          .select()
          .single()

        if (profileError) {
          // Profile creation failed, continue without it
        } else {

          // Update registrations table with the generated affiliate_id
          if (affiliateProfile?.affiliate_id) {
            await supabase
              .from('registrations')
              .update({
                affiliate_id: affiliateProfile.affiliate_id,
                affiliate_details_completed: false
              })
              .eq('id', userId)
          }
        }
      } else {
        // Update existing profile to active
        const { error: updateError } = await supabase
          .from('affiliate_profiles')
          .update({
            status: 'active',
            approved_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single()

        if (updateError) {
          // Profile update failed, continue without it
        }
      }
    } catch {
      // Continue even if profile creation fails
    }
    return NextResponse.json({
      success: true,
      message: 'User successfully promoted to affiliate',
      user: registrationData
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to promote user to affiliate', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}