import {NextRequest, NextResponse  } from 'next/server'
import {sendContactFormEmail, sendWelcomeEmail  } from '@/lib/send-emails'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, email, phone, company, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Send contact form email to admin
    const contactResult = await sendContactFormEmail({
      name,
      email,
      phone,
      company,
      message,
    })

    if (!contactResult.success) {
      throw new Error('Failed to send contact email')
    }

    // Send welcome email to the user
    const welcomeResult = await sendWelcomeEmail({
      name,
      email,
    })

    if (!welcomeResult.success) {
      console.error('Failed to send welcome email, but contact form was sent')
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}