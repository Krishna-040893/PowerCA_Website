import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { escapeHtml } from '@/lib/sanitizer'
import { REGISTRATION_FORMS_TABLE, PROFESSIONAL_REGISTRATIONS_TABLE, STUDENT_REGISTRATIONS_TABLE } from '@/lib/constants/tables'
import bcrypt from 'bcryptjs'
import { withRateLimit, RateLimits } from '@/lib/middleware'
import {
  createErrorResponse,
  handleConfigurationError,
  handleDatabaseError,
  isServiceConfigured,
  ErrorType
} from '@/lib/error-handler'
import { logger } from '@/lib/logger'

const normalizeString = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

const normalizeEmail = (value: unknown) => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim().toLowerCase()
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(trimmed) ? trimmed : ''
}

const normalizePhone = (value: unknown) => {
  if (typeof value !== 'string') return ''
  const cleaned = value.replace(/[^\d+]/g, '')
  return cleaned.slice(0, 20)
}

const normalizeBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const lowered = value.toLowerCase().trim()
    return lowered === 'true' || lowered === '1' || lowered === 'yes'
  }
  if (typeof value === 'number') {
    return value === 1
  }
  return false
}

async function handleRegistration(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')) {
      return handleConfigurationError('Database')
    }

    const body = await request.json()
    const supabase = createAdminClient()

    // Extract referral parameters if provided
    const referralCode = body.referralCode || body.ref || null
    const customerId = body.customerId || body.cus || null

    const roleInput =
      typeof body.role === 'string' ? body.role.toLowerCase() : ''
    const role = roleInput === 'student' ? 'student' : 'professional'

    const name = normalizeString(body.name, 255)
    const email = normalizeEmail(body.email)
    const phone = normalizePhone(body.phone ?? body.mobile)
    const password =
      typeof body.password === 'string' ? body.password.trim() : ''

    const professionalType =
      role === 'professional'
        ? normalizeString(
            body.professionalType ?? body.professional_type,
            50
          )
        : ''
    const membershipNumber =
      role === 'professional'
        ? normalizeString(
            body.membershipNumber ??
              body.membershipNo ??
              body.membership_number,
            50
          )
        : ''
    const registrationNumber =
      role === 'student'
        ? normalizeString(
            body.registrationNumber ??
              body.registrationNo ??
              body.registration_number,
            50
          )
        : ''
    const instituteName =
      role === 'student'
        ? normalizeString(body.instituteName ?? body.institute_name, 255)
        : ''
    const agreedToTerms = normalizeBoolean(
      body.agreedToTerms ?? body.agreed_to_terms ?? body.terms
    )

    // Normalize professionalType: client sends 'Others', DB expects 'NA'
    let finalProfessionalType = professionalType
    if (role === 'professional' && (professionalType === 'Others' || professionalType === 'NA')) {
      finalProfessionalType = 'NA'
    }

    let finalMembershipNumber = membershipNumber
    if (role === 'professional' && !finalMembershipNumber && finalProfessionalType === 'NA') {
      finalMembershipNumber = 'NA'
    }

    logger.info('Registration attempt', { email, name, role })

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Name, email, phone, and password are required.',
        { statusCode: 400 }
      )
    }

    if (role === 'professional' && !finalProfessionalType) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Professional type is required for professional registrations.',
        { statusCode: 400 }
      )
    }

    if (role === 'professional' && finalProfessionalType !== 'NA' && !finalMembershipNumber) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Membership number is required for CA, CMA, and CS registrations.',
        { statusCode: 400 }
      )
    }

    if (role === 'student' && (!registrationNumber || !instituteName)) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Registration number and institute name are required for student registrations.',
        { statusCode: 400 }
      )
    }

    if (!agreedToTerms) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'You must accept the terms and conditions to register.',
        { statusCode: 400 }
      )
    }

    // Check if email is already registered as a client
    const { data: existingClient } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (existingClient) {
      logger.warn('Email already registered as client', { email })
      return createErrorResponse(
        ErrorType.VALIDATION,
        'This email is already registered. Please try another email address.',
        { statusCode: 400 }
      )
    }

    // Check if email is already registered as an affiliate
    const { data: existingAffiliate } = await supabase
      .from('affiliate_registrations')
      .select('id, email, status')
      .eq('email', email)
      .maybeSingle()

    if (existingAffiliate) {
      logger.warn('Email already registered as affiliate, cannot use for client', { email })
      return createErrorResponse(
        ErrorType.VALIDATION,
        'This email is already registered. Please try another email address.',
        { statusCode: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const registrationData = {
      name,
      email,
      phone,
      password_hash: hashedPassword,
      role,
      professional_type: role === 'professional' ? finalProfessionalType : null,
      membership_number: role === 'professional' ? finalMembershipNumber : null,
      registration_number: role === 'student' ? registrationNumber : null,
      institute_name: role === 'student' ? instituteName : null,
      agreed_to_terms: agreedToTerms,
      is_verified: false,
      is_active: true,
      last_login: null,
      login_count: 0
    }

    const { data: newUser, error: supabaseError } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .insert([registrationData])
      .select()
      .single()

    if (supabaseError) {
      logger.error('Supabase registration insert error', supabaseError, { email, name })

      if (supabaseError.code === '23505') {
        if (supabaseError.message.includes('email')) {
          return createErrorResponse(
            ErrorType.VALIDATION,
            'This email is already registered. Please try another email address.',
            { statusCode: 400 }
          )
        }
      }

      return handleDatabaseError(supabaseError)
    }

    logger.info('User registration successful', { userId: newUser.id, email, role })

    // Check if email exists in affiliate_referrals table (regardless of referral link usage)
    try {
      // First, check if this is a direct referral link signup
      if (referralCode && customerId) {
        const { data: referralRecord, error: referralFindError } = await supabase
          .from('affiliate_referrals')
          .select('*')
          .eq('referral_code', referralCode)
          .eq('customer_id', customerId)
          .eq('referred_email', email)
          .single()

        if (!referralFindError && referralRecord) {
          // Update the referral record with user details
          const { error: referralUpdateError } = await supabase
            .from('affiliate_referrals')
            .update({
              referred_user_id: newUser.id,
              referred_name: name,
              referred_phone: phone,
              status: 'pending', // Keep as pending until payment
              updated_at: new Date().toISOString()
            })
            .eq('id', referralRecord.id)

          if (referralUpdateError) {
            logger.error('Error updating affiliate referral', referralUpdateError, {
              referralId: referralRecord.id,
              userId: newUser.id
            })
          } else {
            logger.info('Affiliate referral linked', { referralId: referralRecord.id, userId: newUser.id })
          }
        }
      } else {
        // No referral link was used, but check if email was referred by an affiliate
        const { data: emailReferral, error: emailCheckError } = await supabase
          .from('affiliate_referrals')
          .select('*')
          .eq('referred_email', email)
          .eq('status', 'pending')
          .single()

        if (!emailCheckError && emailReferral) {
          // Update the referral record with the newly registered user
          const { error: emailReferralUpdateError } = await supabase
            .from('affiliate_referrals')
            .update({
              referred_user_id: newUser.id,
              referred_name: name,
              referred_phone: phone,
              status: 'pending', // Keep as pending until payment
              updated_at: new Date().toISOString()
            })
            .eq('id', emailReferral.id)

          if (emailReferralUpdateError) {
            logger.error('Error linking to affiliate referral', emailReferralUpdateError, {
              referralId: emailReferral.id,
              userId: newUser.id
            })
          } else {
            logger.info('Email-based affiliate referral linked', { referralId: emailReferral.id, userId: newUser.id })
          }
        }
      }
    } catch (referralError) {
      logger.error('Error processing affiliate referral', referralError, { userId: newUser.id, email })
      // Don't fail the registration if referral update fails
    }

    // Insert into role-specific table
    if (role === 'professional') {
      const professionalData = {
        name,
        email,
        phone,
        password_hash: hashedPassword,
        professional_type: finalProfessionalType,
        membership_number: finalMembershipNumber,
        agreed_to_terms: agreedToTerms
      }

      const { error: professionalError } = await supabase
        .from(PROFESSIONAL_REGISTRATIONS_TABLE)
        .insert([professionalData])

      if (professionalError) {
        logger.error('Professional registration insert error', professionalError, { email, userId: newUser.id })

        // Rollback main registration
        await supabase.from(REGISTRATION_FORMS_TABLE).delete().eq('id', newUser.id)

        if (professionalError.code === '23505') {
          return createErrorResponse(
            ErrorType.VALIDATION,
            professionalError.message?.includes('email')
              ? 'This email is already registered. Please try another email address.'
              : 'Membership number already registered.',
            { statusCode: 400 }
          )
        }

        return handleDatabaseError(professionalError)
      }

      logger.info('Professional registration completed', { userId: newUser.id, professionalType: finalProfessionalType })
    } else {
      const studentData = {
        name,
        email,
        phone,
        password_hash: hashedPassword,
        institute_name: instituteName,
        registration_number: registrationNumber,
        agreed_to_terms: agreedToTerms
      }

      const { error: studentError } = await supabase
        .from(STUDENT_REGISTRATIONS_TABLE)
        .insert([studentData])

      if (studentError) {
        logger.error('Student registration insert error', studentError, { email, userId: newUser.id })

        // Rollback main registration
        await supabase.from(REGISTRATION_FORMS_TABLE).delete().eq('id', newUser.id)

        if (studentError.code === '23505') {
          return createErrorResponse(
            ErrorType.VALIDATION,
            studentError.message?.includes('email')
              ? 'This email is already registered. Please try another email address.'
              : 'Registration number already registered.',
            { statusCode: 400 }
          )
        }

        return handleDatabaseError(studentError)
      }

      logger.info('Student registration completed', { userId: newUser.id, instituteName })
    }

    // Send confirmation email to client
    await sendConfirmationEmail(email, name, role, {
      professionalType: role === 'professional' ? finalProfessionalType : null,
      membershipNumber: role === 'professional' ? finalMembershipNumber : null,
      registrationNumber: role === 'student' ? registrationNumber : null,
      instituteName: role === 'student' ? instituteName : null,
      phone
    })

    // Send notification email to admin (non-blocking)
    import('@/lib/send-emails').then(({ sendAdminRegistrationNotification }) => {
      sendAdminRegistrationNotification({
        userName: name,
        userEmail: email,
        userPhone: phone,
        userRole: role,
        professionalType: role === 'professional' ? finalProfessionalType : undefined,
        membershipNo: role === 'professional' ? finalMembershipNumber : undefined,
        registrationNo: role === 'student' ? registrationNumber : undefined,
        instituteName: role === 'student' ? instituteName : undefined,
        registeredAt: new Date().toISOString(),
      }).catch(error => {
        logger.error('Failed to send admin notification', error)
      })
    }).catch(error => {
      logger.error('Failed to import admin email function', error)
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      id: newUser?.id,
      user: {
        name,
        email
      }
    })

  } catch (error) {
    logger.error('Registration error', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error,
      { logError: true }
    )
  }
}

async function sendConfirmationEmail(
  email: string,
  name: string,
  role: string,
  details: {
    professionalType: string | null
    membershipNumber: string | null
    registrationNumber: string | null
    instituteName: string | null
    phone: string
  }
) {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn('Resend API key not configured, skipping confirmation email')
      return
    }

    // Initialize Resend inside handler (not at module level)
    const resend = new Resend(process.env.RESEND_API_KEY)

    const displayRole = role === 'professional' ? 'Professional' : 'Student'
    const htmlName = escapeHtml(name)
    const htmlEmail = escapeHtml(email)
    const htmlPhone = escapeHtml(details.phone)
    const htmlProfessionalType = details.professionalType ? escapeHtml(details.professionalType) : null
    const htmlMembershipNumber = details.membershipNumber ? escapeHtml(details.membershipNumber) : null
    const htmlRegistrationNumber = details.registrationNumber ? escapeHtml(details.registrationNumber) : null
    const htmlInstituteName = details.instituteName ? escapeHtml(details.instituteName) : null

    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
            .info-row { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
            .label { font-weight: bold; color: #6b7280; }
            .footer { margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Registration Successful!</h2>
            </div>
            <div class="content">
              <p>Dear ${htmlName},</p>
              <p>Thank you for registering with Power CA. Your account has been successfully created.</p>

              <h3>Your Registration Details:</h3>
              <div class="info-row">
                <span class="label">Name:</span> ${htmlName}
              </div>
              <div class="info-row">
                <span class="label">Email:</span> ${htmlEmail}
              </div>
              <div class="info-row">
                <span class="label">Phone:</span> ${htmlPhone}
              </div>
              <div class="info-row">
                <span class="label">Role:</span> ${displayRole}
              </div>
              ${htmlProfessionalType ? `
              <div class="info-row">
                <span class="label">Professional Type:</span> ${htmlProfessionalType}
              </div>
              ` : ''}
              ${htmlMembershipNumber ? `
              <div class="info-row">
                <span class="label">Membership No:</span> ${htmlMembershipNumber}
              </div>
              ` : ''}
              ${htmlRegistrationNumber ? `
              <div class="info-row">
                <span class="label">Registration No:</span> ${htmlRegistrationNumber}
              </div>
              ` : ''}
              ${htmlInstituteName ? `
              <div class="info-row">
                <span class="label">Institute Name:</span> ${htmlInstituteName}
              </div>
              ` : ''}

              <p style="margin-top: 20px;">You can now log in to your account using your email and password.</p>
              <p>If you have any questions, please contact our support team.</p>

              <div class="footer">
                <p>Best Regards,<br>Power CA Team</p>
                <p>© 2024 Power CA. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      await resend.emails.send({
        from: 'Power CA <contact@powerca.in>',
        to: email,
        subject: 'Welcome to Power CA - Registration Successful',
        html: userEmailHtml,
      })
      logger.info('Registration confirmation email sent', { email })
    } catch (emailError) {
      // If email fails due to test mode restrictions, try sending to verified address
      const emailErrorStatus = emailError && typeof emailError === 'object' && 'statusCode' in emailError ? (emailError as { statusCode: number }).statusCode : null
      if (emailErrorStatus === 403) {
        try {
          await resend.emails.send({
            from: 'Power CA <contact@powerca.in>',
            to: 'contact@powerca.in',
            subject: `Welcome to Power CA - Registration for ${email}`,
            html: userEmailHtml.replace('Dear ' + htmlName, `Dear ${htmlName} (Email intended for: ${htmlEmail})`),
            replyTo: email,
          })
          logger.info('Test mode: Registration confirmation sent to contact email', { intendedRecipient: email })
        } catch (testEmailError) {
          logger.error('Failed to send test mode email', testEmailError, { email })
        }
      } else {
        logger.error('Failed to send registration confirmation email', emailError, { email })
      }
    }
  } catch (error) {
    logger.error('Error in sendConfirmationEmail', error, { email })
    // Don't throw - email failure shouldn't fail the registration
  }
}

async function handleGetRegistrations(_request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')) {
      return handleConfigurationError('Database')
    }

    const supabase = createAdminClient()

    // Fetch all registrations from Supabase registrations table
    const { data, error } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching registrations', error)
      return handleDatabaseError(error)
    }

    logger.info('Registrations fetched', { count: data?.length || 0 })

    return NextResponse.json(data || [])
  } catch (error) {
    logger.error('Get registrations error', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error,
      { logError: true }
    )
  }
}

async function handleDeleteRegistrations(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')) {
      return handleConfigurationError('Database')
    }

    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Please provide an array of registration IDs to delete.',
        { statusCode: 400 }
      )
    }

    const supabase = createAdminClient()

    // First, get the registrations to find their roles and related data
    const { data: registrations, error: fetchError } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('id, email, role')
      .in('id', ids)

    if (fetchError) {
      logger.error('Error fetching registrations for deletion', fetchError)
      return handleDatabaseError(fetchError)
    }

    if (!registrations || registrations.length === 0) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'No registrations found with the provided IDs.',
        { statusCode: 404 }
      )
    }

    // Delete from role-specific tables first
    const professionalEmails = registrations
      .filter(r => r.role === 'professional')
      .map(r => r.email)
    const studentEmails = registrations
      .filter(r => r.role === 'student')
      .map(r => r.email)

    if (professionalEmails.length > 0) {
      const { error: profError } = await supabase
        .from(PROFESSIONAL_REGISTRATIONS_TABLE)
        .delete()
        .in('email', professionalEmails)

      if (profError) {
        logger.error('Error deleting from professional registrations', profError)
      }
    }

    if (studentEmails.length > 0) {
      const { error: studentError } = await supabase
        .from(STUDENT_REGISTRATIONS_TABLE)
        .delete()
        .in('email', studentEmails)

      if (studentError) {
        logger.error('Error deleting from student registrations', studentError)
      }
    }

    // Delete from main registration table
    const { error: deleteError } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .delete()
      .in('id', ids)

    if (deleteError) {
      logger.error('Error deleting registrations', deleteError)
      return handleDatabaseError(deleteError)
    }

    logger.info('Registrations deleted successfully', { count: ids.length, ids })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${ids.length} registration(s).`,
      deletedCount: ids.length
    })
  } catch (error) {
    logger.error('Delete registrations error', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error,
      { logError: true }
    )
  }
}

// Apply strict rate limiting (3 requests per minute for registration)
export const POST = withRateLimit(handleRegistration, RateLimits.STRICT)

// Apply relaxed rate limiting (30 requests per minute for fetching registrations)
export const GET = withRateLimit(handleGetRegistrations, RateLimits.RELAXED)

// Apply relaxed rate limiting for delete operations
export const DELETE = withRateLimit(handleDeleteRegistrations, RateLimits.RELAXED)
