import {NextRequest, NextResponse  } from 'next/server'
import {createAdminClient  } from '@/lib/supabase/admin'
import {requireAdminAuth  } from '@/lib/admin-auth-helper'
import bcrypt from 'bcryptjs'

// GET all users for admin
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth(request)
    if (!auth.authorized) {
      return auth.error
    }

    const supabase = createAdminClient()

    // Try to fetch from Supabase Auth (this is more reliable)
    try {
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

      if (!authError && users) {
        // Transform user data for frontend
        const transformedUsers = users.map(user => ({
          id: user.id,
          email: user.email || '',
          created_at: user.created_at,
          username: user.user_metadata?.username || user.email?.split('@')[0] || '',
          name: user.user_metadata?.name || user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          role: user.user_metadata?.role || 'User',
          professional_type: user.user_metadata?.professional_type,
          is_affiliate: user.user_metadata?.is_affiliate || false,
          affiliate_status: user.user_metadata?.affiliate_status
        }))

        return NextResponse.json({
          success: true,
          users: transformedUsers
        })
      }
    } catch (authListError) {
      console.error('Error fetching from Supabase Auth:', authListError)
    }

    // Fallback: try to fetch from users table if it exists
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users from table:', error)
      // Return empty array instead of error to prevent frontend crash
      return NextResponse.json({
        success: true,
        users: []
      })
    }

    // Also try to fetch affiliate profiles if they exist
    const { data: affiliateProfiles } = await supabase
      .from('affiliate_profiles')
      .select('*')

    // Combine user data with affiliate profiles
    const usersWithAffiliateInfo = users?.map(user => {
      const affiliateProfile = affiliateProfiles?.find(ap => ap.user_id === user.id)
      return {
        ...user,
        affiliateProfile: affiliateProfile || null
      }
    })

    return NextResponse.json({
      success: true,
      users: usersWithAffiliateInfo || []
    })
  } catch (error) {
    console.error('Error:', error)
    // Return empty array instead of error to prevent frontend crash
    return NextResponse.json({
      success: true,
      users: []
    })
  }
}

// PATCH to update user role
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newRole, adminId } = body

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['admin', 'subscriber', 'affiliate']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, subscriber, or affiliate' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Get current user data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const oldRole = currentUser.role

    // Update user role in users table
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    // If promoting to affiliate, create affiliate profile
    if (newRole === 'affiliate' && oldRole !== 'affiliate') {
      const affiliateCode = 'AFF' + Math.random().toString(36).substr(2, 7).toUpperCase()

      const { error: affiliateError } = await supabase
        .from('affiliate_profiles')
        .upsert({
          user_id: userId,
          affiliate_code: affiliateCode,
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: adminId
        })

      if (affiliateError) {
        console.error('Error creating affiliate profile:', affiliateError)
        // Don't fail the whole operation if affiliate profile creation fails
      }
    }

    // Log the action
    await supabase
      .from('admin_actions_log')
      .insert({
        admin_id: adminId,
        target_user_id: userId,
        action: 'change_role',
        old_role: oldRole,
        new_role: newRole,
        details: { reason: 'Admin manual role change' }
      })

    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole}`,
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json(
      { error: 'Failed to update user role' },
      { status: 500 }
    )
  }
}

// POST - Create initial admin user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password, name } = body

    if (!email || !username || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if any admin exists
    const { data: existingAdmins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { error: 'Admin already exists. Use admin panel to create more admins.' },
        { status: 403 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const { data: newAdmin, error } = await supabase
      .from('users')
      .insert({
        email,
        username,
        password: hashedPassword,
        name,
        phone: '0000000000',
        role: 'admin',
        is_verified: true,
        is_active: true,
        email_verified: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating admin:', error)
      return NextResponse.json(
        { error: 'Failed to create admin user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        username: newAdmin.username,
        name: newAdmin.name
      }
    })
  } catch (error) {
    console.error('Error in POST /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}