import {NextRequest, NextResponse  } from 'next/server'
import {requireAdminAuth, createUnauthorizedResponse  } from '@/lib/auth/admin-session'
import {createAdminClient  } from '@/lib/supabase/admin'
import {REGISTRATION_FORMS_TABLE  } from '@/lib/constants/tables'

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
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
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
      .from(REGISTRATION_FORMS_TABLE)
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

    // Update the registration entry with new role
    const { data: registrationData, error: registrationError } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .update({
        role: 'Affiliate'
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
        const { data: _affiliateProfile, error: profileError } = await supabase
          .from('affiliate_profiles')
          .insert({
            user_id: userId,
            affiliate_id: affiliateId,
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

          // No additional registration updates required
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
