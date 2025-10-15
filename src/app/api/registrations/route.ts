import {NextRequest, NextResponse  } from 'next/server'
import {Resend  } from 'resend'
import {createAdminClient  } from '@/lib/supabase/admin'
import {escapeHtml  } from '@/lib/sanitizer'
import {REGISTRATION_FORMS_TABLE, PROFESSIONAL_REGISTRATIONS_TABLE, STUDENT_REGISTRATIONS_TABLE  } from '@/lib/constants/tables'
import bcrypt from 'bcryptjs'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

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

const normalizeUsername = (value: unknown, fallback: string) => {
  const base =
    typeof value === 'string' && value.trim().length > 0
      ? value.trim()
      : fallback
  const sanitized = base.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 50)
  if (sanitized) {
    return sanitized.toLowerCase()
  }
  return `user${Math.random().toString(36).slice(-8)}`
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

export async function POST(request: NextRequest) {
  try {
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

    const emailUsernameFallback = email.split('@')[0] || ''
    const nameFallback = name.replace(/\s+/g, '')
    const usernameFallback = emailUsernameFallback || nameFallback || 'user'
    const username = normalizeUsername(body.username, usernameFallback)

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

    let finalMembershipNumber = membershipNumber
    if (role === 'professional' && !finalMembershipNumber && professionalType === 'NA') {
      finalMembershipNumber = 'NA'
    }

    if (!name || !email || !username || !phone || !password) {
      return NextResponse.json(
        { error: 'Name, email, phone, username, and password are required.' },
        { status: 400 }
      )
    }

    if (role === 'professional' && (!professionalType || !finalMembershipNumber)) {
      return NextResponse.json(
        {
          error:
            'Professional type and membership number are required for professional registrations.'
        },
        { status: 400 }
      )
    }

    if (role === 'student' && (!registrationNumber || !instituteName)) {
      return NextResponse.json(
        {
          error:
            'Registration number and institute name are required for student registrations.'
        },
        { status: 400 }
      )
    }

    if (!agreedToTerms) {
      return NextResponse.json(
        {
          error: 'You must accept the terms and conditions to register.'
        },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const registrationData = {
      name,
      email,
      username,
      phone,
      password_hash: hashedPassword,
      role,
      professional_type: role === 'professional' ? professionalType : null,
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
      console.error('Supabase registration insert error:', supabaseError)

      if (supabaseError.code === '23505') {
        if (supabaseError.message.includes('email')) {
          return NextResponse.json(
            { error: 'Email already registered.' },
            { status: 400 }
          )
        }
        if (supabaseError.message.includes('username')) {
          return NextResponse.json(
            { error: 'Username already taken. Please try again.' },
            { status: 400 }
          )
        }
      }

      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 500 }
      )
    }

    // If this is a referral signup, update the affiliate_referrals table
    if (referralCode && customerId && newUser?.id) {
      console.log('🔗 Linking referral:', { referralCode, customerId, userId: newUser.id })

      try {
        // Find and update the referral record
        const { data: referralRecord, error: referralFindError } = await supabase
          .from('affiliate_referrals')
          .select('*')
          .eq('referral_code', referralCode)
          .eq('customer_id', customerId)
          .eq('referred_email', email)
          .single()

        if (referralFindError) {
          console.error('❌ Error finding referral record:', referralFindError)
        } else if (referralRecord) {
          // Update the referral record with user details
          const { error: referralUpdateError } = await supabase
            .from('affiliate_referrals')
            .update({
              referred_user_id: newUser.id,
              referred_name: name,
              referred_phone: phone,
              updated_at: new Date().toISOString()
            })
            .eq('id', referralRecord.id)

          if (referralUpdateError) {
            console.error('❌ Error updating referral record:', referralUpdateError)
          } else {
            console.log('✅ Referral record updated successfully')
          }
        } else {
          console.log('⚠️ No matching referral record found')
        }
      } catch (referralError) {
        console.error('❌ Error processing referral:', referralError)
        // Don't fail the registration if referral update fails
      }
    }

    if (role === 'professional') {
      const professionalData = {
        name,
        email,
        phone,
        username,
        password_hash: hashedPassword,
        professional_type: professionalType,
        membership_number: finalMembershipNumber,
        agreed_to_terms: agreedToTerms
      }

      const { error: professionalError } = await supabase
        .from(PROFESSIONAL_REGISTRATIONS_TABLE)
        .insert([professionalData])

      if (professionalError) {
        console.error('Professional registration insert error:', professionalError)
        await supabase.from(REGISTRATION_FORMS_TABLE).delete().eq('id', newUser.id)
        if (professionalError.code === '23505') {
          const duplicateField = professionalError.message?.includes('email') ? 'Email' : 'Membership number'
          return NextResponse.json(
            { error: `${duplicateField} already registered.` },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: professionalError.message || 'Registration failed. Please try again.' },
          { status: 500 }
        )
      }
    } else {
      const studentData = {
        name,
        email,
        phone,
        username,
        password_hash: hashedPassword,
        institute_name: instituteName,
        registration_number: registrationNumber,
        agreed_to_terms: agreedToTerms
      }

      const { error: studentError } = await supabase
        .from(STUDENT_REGISTRATIONS_TABLE)
        .insert([studentData])

      if (studentError) {
        console.error('Student registration insert error:', studentError)
        await supabase.from(REGISTRATION_FORMS_TABLE).delete().eq('id', newUser.id)
        if (studentError.code === '23505') {
          const duplicateField = studentError.message?.includes('email') ? 'Email' : 'Registration number'
          return NextResponse.json(
            { error: `${duplicateField} already registered.` },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { error: studentError.message || 'Registration failed. Please try again.' },
          { status: 500 }
        )
      }
    }

    const displayRole = role === 'professional' ? 'Professional' : 'Student'
    const htmlName = escapeHtml(name)
    const htmlEmail = escapeHtml(email)
    const htmlUsername = escapeHtml(username)
    const htmlPhone = escapeHtml(phone)
    const htmlProfessionalType =
      role === 'professional' && professionalType
        ? escapeHtml(professionalType)
        : null
    const htmlMembershipNumber =
      role === 'professional' && finalMembershipNumber
        ? escapeHtml(finalMembershipNumber)
        : null
    const htmlRegistrationNumber =
      role === 'student' && registrationNumber
        ? escapeHtml(registrationNumber)
        : null
    const htmlInstituteName =
      role === 'student' && instituteName
        ? escapeHtml(instituteName)
        : null

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
              <p>Thank you for registering with PowerCA. Your account has been successfully created.</p>

              <h3>Your Registration Details:</h3>
              <div class="info-row">
                <span class="label">Name:</span> ${htmlName}
              </div>
              <div class="info-row">
                <span class="label">Email:</span> ${htmlEmail}
              </div>
              <div class="info-row">
                <span class="label">Username:</span> ${htmlUsername}
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
                <p>Best Regards,<br>PowerCA Team</p>
                <p>© 2024 PowerCA. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    try {
      // Send confirmation email to the user only (no admin email)
      if (!resend) {
        console.warn('Resend not configured, skipping confirmation email')
      } else {
        const _emailResult = await resend.emails.send({
        from: 'PowerCA <contact@powerca.in>',
        to: email,
        subject: 'Welcome to PowerCA - Registration Successful',
        html: userEmailHtml,
      })
      }
      // Email sent successfully
    } catch (emailError) {
      // If email fails due to test mode restrictions, try sending to verified address
      const emailErrorStatus = emailError && typeof emailError === 'object' && 'statusCode' in emailError ? (emailError as { statusCode: number }).statusCode : null
      if (emailErrorStatus === 403) {
        try {
          if (resend) {
            const _testEmailResult = await resend.emails.send({
            from: 'PowerCA <contact@powerca.in>',
            to: 'contact@powerca.in',
            subject: `Welcome to PowerCA - Registration for ${email}`,
            html: userEmailHtml.replace('Dear ' + htmlName, `Dear ${htmlName} (Email intended for: ${htmlEmail})`),
            replyTo: email,
          })
          }
          // Test mode: Email sent to contact@powerca.in instead
        } catch {
          // Test email also failed
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      id: newUser?.id,
      user: {
        name,
        email,
        username
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to process registration' },
      { status: 500 }
    )
  }
}

export async function GET(_request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Fetch all registrations from Supabase registrations table
    const { data, error } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching registrations:', error)
      return NextResponse.json(
        { error: 'Failed to fetch registrations from database' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    )
  }
}
