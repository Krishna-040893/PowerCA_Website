import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = createAdminClient()

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Map role to user_type
    const userType = body.role === 'Professional' ? 'Professional' :
                    body.role === 'Student' ? 'Student' : 'Other'

    // Extract registration data for users table
    const userData = {
      name: body.name,
      email: body.email,
      username: body.username,
      phone: body.phone,
      password: hashedPassword,
      role: 'subscriber', // Default role for all new registrations
      user_type: userType,
      professional_type: body.professionalType || null,
      membership_no: body.membershipNo || null,
      registration_no: body.registrationNo || null,
      institute_name: body.instituteName || null,
      is_verified: false,
      is_active: true,
      email_verified: false
    }

    // Store in Supabase registrations table with correct column names
    const registrationData = {
      name: body.name,
      email: body.email,
      username: body.username,
      phone: body.phone,
      password: hashedPassword, // Column is 'password' not 'password_hash'
      role: body.role || 'Student', // Use the role directly from form
      professional_type: body.professionalType || null,
      membership_no: body.membershipNo || null, // Column is membership_no
      registration_no: body.registrationNo || null, // Column is registration_no
      institute_name: body.instituteName || null
    }

    const { data: newUser, error: supabaseError } = await supabase
      .from('registrations')
      .insert([registrationData])
      .select()
      .single()

    if (supabaseError) {
      console.error('Supabase error:', supabaseError)

      // Check for duplicate key errors
      if (supabaseError.code === '23505') {
        if (supabaseError.message.includes('email')) {
          return NextResponse.json(
            { error: 'Email already registered' },
            { status: 400 }
          )
        }
        if (supabaseError.message.includes('username')) {
          return NextResponse.json(
            { error: 'Username already taken' },
            { status: 400 }
          )
        }
      }

      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 500 }
      )
    }

    // Supabase is our primary database, no fallback needed

    // Send confirmation email to user
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
              <p>Dear ${body.name},</p>
              <p>Thank you for registering with PowerCA. Your account has been successfully created.</p>

              <h3>Your Registration Details:</h3>
              <div class="info-row">
                <span class="label">Name:</span> ${body.name}
              </div>
              <div class="info-row">
                <span class="label">Email:</span> ${body.email}
              </div>
              <div class="info-row">
                <span class="label">Username:</span> ${body.username}
              </div>
              <div class="info-row">
                <span class="label">Phone:</span> ${body.phone}
              </div>
              <div class="info-row">
                <span class="label">Role:</span> ${body.role}
              </div>
              ${body.professionalType ? `
              <div class="info-row">
                <span class="label">Professional Type:</span> ${body.professionalType}
              </div>
              ` : ''}
              ${body.membershipNo ? `
              <div class="info-row">
                <span class="label">Membership No:</span> ${body.membershipNo}
              </div>
              ` : ''}
              ${body.registrationNo ? `
              <div class="info-row">
                <span class="label">Registration No:</span> ${body.registrationNo}
              </div>
              ` : ''}
              ${body.instituteName ? `
              <div class="info-row">
                <span class="label">Institute Name:</span> ${body.instituteName}
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
      const emailResult = await resend.emails.send({
        from: 'PowerCA <contact@powerca.in>',
        to: body.email,
        subject: 'Welcome to PowerCA - Registration Successful',
        html: userEmailHtml,
      })
      console.log('Email sent successfully to user:', body.email, emailResult)
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // If email fails due to test mode restrictions, try sending to verified address
      if (emailError && emailError.statusCode === 403) {
        try {
          console.log('Resend is in test mode. Attempting to send to verified address contact@powerca.in')
          const testEmailResult = await resend.emails.send({
            from: 'PowerCA <contact@powerca.in>',
            to: 'contact@powerca.in',
            subject: `Welcome to PowerCA - Registration for ${body.email}`,
            html: userEmailHtml.replace('Dear ' + body.name, `Dear ${body.name} (Email intended for: ${body.email})`),
            reply_to: body.email,
          })
          console.log('Test mode: Email sent to contact@powerca.in instead of', body.email, testEmailResult)
        } catch (testError) {
          console.error('Test email also failed:', testError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful!',
      id: newUser?.id,
      user: {
        name: body.name,
        email: body.email,
        username: body.username
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

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Fetch all registrations from Supabase registrations table
    const { data, error } = await supabase
      .from('registrations')
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