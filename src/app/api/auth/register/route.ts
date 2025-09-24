import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createAdminClient } from '@/lib/supabase/admin'

<<<<<<< HEAD
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isSupabaseConfigured = supabaseUrl &&
      supabaseUrl !== 'your-supabase-project-url' &&
      supabaseUrl !== 'https://your-project.supabase.co' &&
      supabaseUrl.startsWith('http')

    if (isSupabaseConfigured) {
      try {
        const supabase = createAdminClient()

        // Fetch from the registrations table
        const { data: users, error } = await supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && users) {
          return NextResponse.json({
            success: true,
            users: users.map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              username: user.username,
              phone: user.phone,
              userRole: user.user_role,
              professionalType: user.professional_type,
              membershipNo: user.membership_no || user.membership_number,
              registrationNo: user.registration_no,
              instituteName: user.institute_name,
              firmName: user.firm_name,
              role: user.role || 'user',
              isVerified: user.is_verified || false,
              createdAt: user.created_at
            }))
          })
        }

        console.error('Supabase fetch error:', error)
      } catch (error) {
        console.error('Supabase connection error:', error)
      }
    }

    // Try to read from file as fallback
    if (typeof window === 'undefined') {
      const fs = require('fs').promises
      const path = require('path')
      const usersFilePath = path.join(process.cwd(), 'users.json')

      try {
        const fileContent = await fs.readFile(usersFilePath, 'utf-8')
        const fileUsers = JSON.parse(fileContent)

        return NextResponse.json({
          success: true,
          users: fileUsers.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            phone: user.phone,
            userRole: user.user_role || user.userRole || user.role,
            professionalType: user.professional_type || user.professionalType,
            membershipNo: user.membership_no || user.membershipNo || user.membership_number,
            registrationNo: user.registration_no || user.registrationNo || user.registration_number,
            instituteName: user.institute_name || user.instituteName,
            role: 'user',
            isVerified: user.isVerified || user.is_verified || false,
            createdAt: user.createdAt || user.created_at
          }))
        })
      } catch (error) {
        console.log('No users.json file found')
      }
    }

    // Return empty array if no data source available
    return NextResponse.json({
      success: true,
      users: [],
      message: 'No registration data available. Please configure Supabase to store registrations.'
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, username, password, phone, role, professionalType, membershipNo, registrationNo, instituteName, firmName } = body

    // Validate required fields
    if (!name || !email || !username || !password || !phone || !role) {
=======
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, firmName, membershipNumber } = body

    // Validate required fields
    if (!name || !email || !password || !phone) {
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

<<<<<<< HEAD
    // Validate role-specific fields
    if (role === 'Professional' && (!professionalType || !membershipNo)) {
      return NextResponse.json(
        { error: 'Professional type and membership number are required for professionals' },
        { status: 400 }
      )
    }

    if (role === 'Student' && (!registrationNo || !instituteName)) {
      return NextResponse.json(
        { error: 'Registration number and institute name are required for students' },
        { status: 400 }
      )
    }

=======
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

<<<<<<< HEAD
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const isSupabaseConfigured = supabaseUrl &&
      supabaseUrl !== 'your-supabase-project-url' &&
      supabaseUrl !== 'https://your-project.supabase.co' &&
      supabaseUrl.startsWith('http')

    if (isSupabaseConfigured) {
      try {
        const supabase = createAdminClient()

        // Check if user already exists in registrations table
        const { data: existingUser, error: checkError } = await supabase
          .from('registrations')
          .select('id')
          .or(`email.eq.${email},username.eq.${username}`)
          .maybeSingle()

        if (existingUser) {
          return NextResponse.json(
            { error: 'User with this email or username already exists' },
            { status: 400 }
          )
        }

        // Insert into registrations table with correct column names
        const { data: newUser, error: insertError } = await supabase
          .from('registrations')
          .insert({
            name,
            email,
            username,
            password: hashedPassword, // Column is 'password' not 'password_hash'
            phone,
            role: role || 'Student',
            professional_type: role === 'Professional' ? professionalType : null,
            membership_no: role === 'Professional' ? membershipNo : null, // Column is membership_no
            registration_no: role === 'Student' ? registrationNo : null, // Column is registration_no
            institute_name: role === 'Student' ? instituteName : null
          })
          .select()
          .single()

        if (insertError) {
          console.error('Supabase insert error:', insertError)

          // Check if it's a unique constraint violation
          if (insertError.message?.includes('duplicate') || insertError.code === '23505') {
            return NextResponse.json(
              { error: 'User with this email or username already exists' },
              { status: 400 }
            )
          }

          return NextResponse.json(
            { error: 'Failed to create registration. Please try again.' },
            { status: 500 }
          )
        }

        return NextResponse.json(
          {
            success: true,
            message: 'Registration successful! Your data has been saved to the database.',
            user: {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              username: newUser.username
            }
          },
          { status: 201 }
        )
      } catch (error) {
        console.error('Supabase connection error:', error)
        // Fall through to file storage
      }
    }

    // Fallback to file storage if Supabase is not configured
    console.log('Supabase not configured, using file storage as fallback')

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      username,
      name,
      phone,
      user_role: role,  // Keep original case
      professional_type: role === 'Professional' ? professionalType : null,
      membership_no: role === 'Professional' ? membershipNo : null,
      membership_number: role === 'Professional' ? membershipNo : null,
      registration_no: role === 'Student' ? registrationNo : null,
      institute_name: role === 'Student' ? instituteName : null,
      password: hashedPassword,  // Match the users table column name
      role: 'user',  // Default role for authentication
      is_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Save to file
    if (typeof window === 'undefined') {
      const fs = require('fs').promises
      const path = require('path')
      const usersFilePath = path.join(process.cwd(), 'users.json')

      try {
        let existingUsers = []
        try {
          const fileContent = await fs.readFile(usersFilePath, 'utf-8')
          existingUsers = JSON.parse(fileContent)

          // Check if user already exists
          if (existingUsers.find((u: any) => u.email === email || u.username === username)) {
            return NextResponse.json(
              { error: 'User with this email or username already exists' },
              { status: 400 }
            )
          }
        } catch (error) {
          // File doesn't exist yet
        }

        existingUsers.push(newUser)
        await fs.writeFile(usersFilePath, JSON.stringify(existingUsers, null, 2))

        return NextResponse.json(
          {
            success: true,
            message: 'Registration successful! (Note: Data saved locally. Configure Supabase for database storage.)',
            user: {
              id: newUser.id,
              email: newUser.email,
              name: newUser.name,
              username: newUser.username
            }
          },
          { status: 201 }
        )
      } catch (error) {
        console.error('Error saving user to file:', error)
      }
    }

    return NextResponse.json(
      {
        error: 'Unable to save registration. Please configure Supabase in your environment variables.',
        details: 'Add NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY to your .env.local file'
      },
      { status: 503 }
=======
    // Hash password first
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {
      console.log('Supabase not configured, using demo mode')
      
      // Demo mode - just return success
      const demoUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        firm_name: firmName || null,
        membership_number: membershipNumber || null,
        role: 'user',
        is_verified: false
      }

      return NextResponse.json(
        { 
          success: true,
          message: 'Registration successful (demo mode)',
          user: {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name
          }
        },
        { status: 201 }
      )
    }

    // Try to use Supabase
    let newUser
    try {
      const supabase = createAdminClient()

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }

      // Create user
      const { data, error } = await supabase
        .from('users')
        .insert({
          name,
          email,
          password: hashedPassword,
          phone,
          firm_name: firmName || null,
          membership_number: membershipNumber || null,
          role: 'user',
          is_verified: false
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        // Fall back to demo mode
        newUser = {
          id: `user_${Date.now()}`,
          email,
          name,
          firm_name: firmName || null,
          membership_number: membershipNumber || null,
          role: 'user',
          is_verified: false
        }
        console.log('Using demo mode due to Supabase error')
      } else {
        newUser = data
      }
    } catch (fetchError) {
      console.error('Network error connecting to Supabase:', fetchError)
      // Fall back to demo mode
      newUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        firm_name: firmName || null,
        membership_number: membershipNumber || null,
        role: 'user',
        is_verified: false
      }
      console.log('Using demo mode due to network error')
    }

    // Send welcome email (optional - implement if needed)
    // await sendWelcomeEmail(email, name)

    return NextResponse.json(
      { 
        success: true,
        message: 'Registration successful',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        }
      },
      { status: 201 }
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}