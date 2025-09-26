import {NextRequest, NextResponse  } from 'next/server'
import bcrypt from 'bcryptjs'
import {createAdminClient  } from '@/lib/supabase/admin'
import {createErrorResponse, ErrorType, handleConfigurationError, handleDatabaseError, isServiceConfigured, handleValidationError  } from '@/lib/error-handler'
import {validatePassword  } from '@/lib/password-validator'
import {sanitizeInput, sanitizeEmail, sanitizePhone  } from '@/lib/sanitizer'
import {logger  } from '@/lib/logger'
import {syncMiddleware  } from '@/middleware/hubspot-sync'

interface FileUserData {
  id: string
  name: string
  email: string
  username?: string
  phone: string
  user_role?: string
  userRole?: string
  role?: string
  professional_type?: string
  professionalType?: string
  membership_no?: string
  membershipNo?: string
  membership_number?: string
  registration_no?: string
  registrationNo?: string
  registration_number?: string
  institute_name?: string
  instituteName?: string
  firm_name?: string
  isVerified?: boolean
  is_verified?: boolean
  createdAt?: string
  created_at?: string
}

export async function GET(_request: NextRequest) {
  try {
    // Check if Supabase is configured
    const isSupabaseConfigured = isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY') &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project')

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

        logger.error('Supabase fetch error', error)
      } catch (error) {
        logger.error('Supabase connection error', error)
      }
    }

    // Try to read from file as fallback
    if (typeof window === 'undefined') {
      const { promises: fs } = await import('fs')
      const path = await import('path')
      const usersFilePath = path.join(process.cwd(), 'users.json')

      try {
        const fileContent = await fs.readFile(usersFilePath, 'utf-8')
        const fileUsers = JSON.parse(fileContent)

        return NextResponse.json({
          success: true,
          users: fileUsers.map((user: FileUserData) => ({
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
      } catch {
        logger.debug('No users.json file found')
      }
    }

    // Return empty array if no data source available
    return NextResponse.json({
      success: true,
      users: [],
      message: 'No registration data available. Please configure Supabase to store registrations.'
    })
  } catch (error) {
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, username, password, phone, role, professionalType, membershipNo, registrationNo, instituteName, firmName, membershipNumber } = body

    // Validate required fields
    const validationErrors: string[] = []
    if (!name) validationErrors.push('Name is required')
    if (!email) validationErrors.push('Email is required')
    if (!password) validationErrors.push('Password is required')
    if (!phone) validationErrors.push('Phone is required')

    if (validationErrors.length > 0) {
      return handleValidationError(validationErrors)
    }

    // Validate role-specific fields
    if (role === 'Professional' && (!professionalType || !membershipNo)) {
      return handleValidationError(['Professional type and membership number are required for professionals'])
    }

    if (role === 'Student' && (!registrationNo || !instituteName)) {
      return handleValidationError(['Registration number and institute name are required for students'])
    }

    // Sanitize and validate email
    const sanitizedEmail = sanitizeEmail(email)
    if (!sanitizedEmail) {
      return handleValidationError(['Invalid email format'])
    }

    // Validate password strength using our secure password validator
    const passwordValidation = validatePassword(password, { email: sanitizedEmail, name, username })
    if (!passwordValidation.isValid) {
      return handleValidationError(passwordValidation.errors)
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name, { maxLength: 255 })
    const sanitizedPhone = sanitizePhone(phone)
    const sanitizedUsername = username ? sanitizeInput(username, { maxLength: 50 }) : null

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12) // Use 12 rounds for better security

    // Check if Supabase is configured
    const isSupabaseConfigured = isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY') &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('your-project')

    if (isSupabaseConfigured) {
      try {
        const supabase = createAdminClient()

        // Check if user already exists in registrations table
        const { data: existingUser, error: _checkError } = await supabase
          .from('registrations')
          .select('id')
          .or(`email.eq.${sanitizedEmail}${sanitizedUsername ? `,username.eq.${sanitizedUsername}` : ''}`)
          .maybeSingle()

        if (existingUser) {
          return createErrorResponse(
            ErrorType.VALIDATION,
            'User with this email or username already exists'
          )
        }

        // Insert into registrations table with correct column names
        const { data: newUser, error: insertError } = await supabase
          .from('registrations')
          .insert({
            name: sanitizedName,
            email: sanitizedEmail,
            username: sanitizedUsername,
            password: hashedPassword,
            phone: sanitizedPhone,
            role: role || 'user',
            professional_type: role === 'Professional' ? sanitizeInput(professionalType, { maxLength: 50 }) : null,
            membership_no: role === 'Professional' ? sanitizeInput(membershipNo || membershipNumber, { maxLength: 50 }) : null,
            registration_no: role === 'Student' ? sanitizeInput(registrationNo, { maxLength: 50 }) : null,
            institute_name: role === 'Student' ? sanitizeInput(instituteName, { maxLength: 255 }) : null,
            firm_name: firmName ? sanitizeInput(firmName, { maxLength: 255 }) : null
          })
          .select()
          .single()

        if (insertError) {
          // Check if it's a unique constraint violation
          if (insertError.message?.includes('duplicate') || insertError.code === '23505') {
            return createErrorResponse(
              ErrorType.VALIDATION,
              'User with this email or username already exists'
            )
          }

          return handleDatabaseError(insertError)
        }

        logger.info('User registration successful', { userId: newUser.id })

        // Sync to HubSpot (non-blocking)
        syncMiddleware.afterUserCreate({
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.name?.split(' ')[0],
          lastName: newUser.name?.split(' ').slice(1).join(' '),
          phone: newUser.phone,
          firmName: newUser.firm_name,
          caNumber: newUser.membership_no,
          status: 'lead'
        }).catch(error => {
          logger.error('Failed to sync to HubSpot', error)
        })

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
        logger.error('Supabase connection error', error)
        // Fall through to file storage
      }
    }

    // Fallback to file storage or demo mode if Supabase is not configured
    logger.debug('Supabase not configured, using file storage as fallback')

    const newUser = {
      id: `user_${Date.now()}`,
      email: sanitizedEmail,
      username: sanitizedUsername,
      name: sanitizedName,
      phone: sanitizedPhone,
      user_role: role || 'user',
      professional_type: role === 'Professional' ? professionalType : null,
      membership_no: role === 'Professional' ? (membershipNo || membershipNumber) : null,
      membership_number: role === 'Professional' ? (membershipNo || membershipNumber) : null,
      registration_no: role === 'Student' ? registrationNo : null,
      institute_name: role === 'Student' ? instituteName : null,
      firm_name: firmName || null,
      password: hashedPassword,
      role: 'user',
      is_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Save to file
    if (typeof window === 'undefined') {
      const { promises: fs } = await import('fs')
      const path = await import('path')
      const usersFilePath = path.join(process.cwd(), 'users.json')

      try {
        let existingUsers = []
        try {
          const fileContent = await fs.readFile(usersFilePath, 'utf-8')
          existingUsers = JSON.parse(fileContent)

          // Check if user already exists
          if (existingUsers.find((u: FileUserData) => u.email === sanitizedEmail || (sanitizedUsername && u.username === sanitizedUsername))) {
            return createErrorResponse(
              ErrorType.VALIDATION,
              'User with this email or username already exists'
            )
          }
        } catch {
          // File doesn't exist yet
        }

        existingUsers.push(newUser)
        await fs.writeFile(usersFilePath, JSON.stringify(existingUsers, null, 2))

        // Sync to HubSpot (non-blocking)
        syncMiddleware.afterUserCreate({
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.name?.split(' ')[0],
          lastName: newUser.name?.split(' ').slice(1).join(' '),
          phone: newUser.phone,
          firmName: newUser.firm_name,
          caNumber: newUser.membership_no || newUser.membership_number,
          status: 'lead'
        }).catch(error => {
          logger.error('Failed to sync to HubSpot', error)
        })

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
        logger.error('Error saving user to file', error)
      }
    }

    return handleConfigurationError('Database')
  } catch (error) {
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error
    )
  }
}