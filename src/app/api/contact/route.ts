import DOMPurify from 'isomorphic-dompurify'
import { NextRequest, NextResponse } from 'next/server'

import { sendContactFormEmail, sendWelcomeEmail } from '@/lib/send-emails'
import { logger } from '@/lib/logger'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const sanitizeRequired = (value: unknown) => {
  if (typeof value !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim()
}

const sanitizeOptional = (value: unknown) => {
  if (typeof value !== 'string') {
    return undefined
  }

  const sanitized = DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim()

  return sanitized || undefined
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const data = body as Record<string, unknown>

  const name = sanitizeRequired(data.name)
  const email = sanitizeRequired(data.email)
  const message = sanitizeRequired(data.message)
  const phone = sanitizeOptional(data.phone)
  const company = sanitizeOptional(data.company)

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  try {
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

    const welcomeResult = await sendWelcomeEmail({
      name,
      email,
    })

    if (!welcomeResult.success) {
      logger.error('Failed to send welcome email, but contact form was sent')
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
    })
  } catch (error) {
    logger.error('Contact form error', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}

