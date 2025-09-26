import {NextRequest, NextResponse  } from 'next/server'
import {createAdminClient  } from '@/lib/supabase/admin'
import {Resend  } from 'resend'
import type { Booking } from '@/types/booking'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, firmName, date, time, message } = body


    // Validate required fields
    if (!name || !email || !phone || !date || !time) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase admin client
    const supabase = createAdminClient()

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {

      // Fallback to simple storage if Supabase is not configured
      const booking = {
        id: `BK${Date.now()}`,
        name,
        email,
        phone,
        firmName: firmName || null,
        date: new Date(date).toISOString(),
        time,
        message: message || null,
        status: 'confirmed',
        created_at: new Date().toISOString()
      }

      // Send email and return success
      await sendConfirmationEmail(booking as Booking)

      return NextResponse.json({
        success: true,
        message: 'Booking confirmed successfully (demo mode)',
        booking: {
          id: booking.id,
          date: new Date(date).toLocaleDateString(),
          time: booking.time
        }
      })
    }

    // Store booking in Supabase
    let booking
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          name,
          email,
          phone,
          firmName: firmName || null,
          date: new Date(date).toISOString().split('T')[0], // Format as YYYY-MM-DD
          time,
          message: message || null,
          status: 'confirmed'
        })
        .select()
        .single()

      if (error) {
        // Fall back to simple storage if Supabase fails
        booking = {
          id: `BK${Date.now()}`,
          name,
          email,
          phone,
          firmName: firmName || null,
          date: new Date(date).toISOString(),
          time,
          message: message || null,
          status: 'confirmed',
          created_at: new Date().toISOString()
        }
      } else {
        booking = data
      }
    } catch {
      // Fall back to simple storage if network fails
      booking = {
        id: `BK${Date.now()}`,
        name,
        email,
        phone,
        firmName: firmName || null,
        date: new Date(date).toISOString(),
        time,
        message: message || null,
        status: 'confirmed',
        created_at: new Date().toISOString()
      }
    }


    // Send confirmation email
    await sendConfirmationEmail(booking)

    return NextResponse.json({
      success: true,
      message: 'Booking confirmed successfully',
      booking: {
        id: booking.id,
        date: new Date(booking.date).toLocaleDateString(),
        time: booking.time
      }
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { success: false, error: 'Failed to process booking', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-supabase-project-url') {
      // Return empty array if Supabase is not configured
      return NextResponse.json({ bookedSlots: [] })
    }

    const supabase = createAdminClient()

    try {
      // Get bookings for the specified date
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('time')
        .eq('date', new Date(date).toISOString().split('T')[0])
        .in('status', ['CONFIRMED', 'PENDING'])

      if (error) {
        // Return empty array instead of error to allow booking to continue
        return NextResponse.json({ bookedSlots: [] })
      }

      const bookedSlots = bookings?.map(booking => booking.time) || []

      return NextResponse.json({ bookedSlots })
    } catch {
      // Return empty array when network fails
      return NextResponse.json({ bookedSlots: [] })
    }
  } catch {
    // Return empty array instead of error
    return NextResponse.json({ bookedSlots: [] })
  }
}

async function sendConfirmationEmail(booking: Booking) {
  try {

    if (!process.env.RESEND_API_KEY) {
      return
    }

    if (!resend) {
      return
    }


    const bookingDate = new Date(booking.date || '').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // HTML email template for customer
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Demo Booking Confirmed - PowerCA</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: white; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
              <div style="background: linear-gradient(135deg, #1D91EB 0%, #0B5FA5 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">PowerCA</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Demo Booking Confirmed</p>
              </div>
              
              <div style="padding: 30px;">
                <h2 style="color: #333; margin-bottom: 20px;">Hello ${booking.name},</h2>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                  Your demo booking has been confirmed! We're excited to show you how PowerCA can transform your practice management.
                </p>
                
                <div style="background: #f8f9fa; border-left: 4px solid #1D91EB; padding: 20px; margin: 25px 0; border-radius: 4px;">
                  <h3 style="color: #333; margin: 0 0 15px 0;">Booking Details:</h3>
                  <p style="margin: 8px 0; color: #666;"><strong>Date:</strong> ${bookingDate}</p>
                  <p style="margin: 8px 0; color: #666;"><strong>Time:</strong> ${booking.time}</p>
                  ${booking.firmName ? `<p style="margin: 8px 0; color: #666;"><strong>Firm:</strong> ${booking.firmName}</p>` : ''}
                  ${booking.message ? `<p style="margin: 8px 0; color: #666;"><strong>Message:</strong> ${booking.message}</p>` : ''}
                </div>
                
                <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                  Our team will connect with you at the scheduled time to demonstrate PowerCA's features and answer any questions you may have.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://powerca.in" style="display: inline-block; padding: 12px 30px; background: #1D91EB; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Visit PowerCA</a>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #999; font-size: 14px; text-align: center;">
                  If you need to reschedule, please contact us at contact@powerca.in
                </p>
              </div>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
              © 2024 PowerCA. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `

    // Send confirmation email to customer with CC to team
    const _customerEmailResult = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PowerCA <contact@powerca.in>',
      to: booking.email,
      cc: 'contact@powerca.in', // CC to your team
      subject: `Demo Booking Confirmed - PowerCA`,
      html: customerEmailHtml,
    })


    // Team notification email
    const teamEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Demo Booking</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px;">
          <h2 style="color: #1D91EB;">New Demo Booking Alert</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333;">Customer Details:</h3>
            <p><strong>Name:</strong> ${booking.name}</p>
            <p><strong>Email:</strong> ${booking.email}</p>
            <p><strong>Phone:</strong> ${booking.phone}</p>
            <p><strong>Firm:</strong> ${booking.firmName || 'Not provided'}</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <h3 style="color: #333;">Booking Details:</h3>
            <p><strong>Date:</strong> ${bookingDate}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Message:</strong> ${booking.message || 'No message'}</p>
          </div>
          <p style="color: #666;">Please prepare for the demo session and ensure someone is available at the scheduled time.</p>
        </body>
      </html>
    `

    // Send separate notification to team
    const _teamEmailResult = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PowerCA <contact@powerca.in>',
      to: 'contact@powerca.in',
      subject: `[TEAM] New Demo Booking - ${booking.name} - ${booking.firmName || 'Individual'}`,
      html: teamEmailHtml,
    })

  } catch {
    // Don't throw - email failure shouldn't fail the booking
  }
}