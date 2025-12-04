import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { sendContactFormEmail, sendWelcomeEmail } from '@/lib/send-emails'
import { logger } from '@/lib/logger'
import { withRateLimit, RateLimits } from '@/lib/middleware'
import {
  createErrorResponse,
  handleConfigurationError as _handleConfigurationError,
  handleDatabaseError as _handleDatabaseError,
  isServiceConfigured,
  ErrorType
} from '@/lib/error-handler'
import { sanitizeRequired, sanitizeOptional } from '@/lib/sanitize'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function handleContactForm(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return createErrorResponse(
      ErrorType.VALIDATION,
      'Invalid JSON body',
      { statusCode: 400 }
    )
  }

  if (typeof body !== 'object' || body === null) {
    return createErrorResponse(
      ErrorType.VALIDATION,
      'Invalid request payload',
      { statusCode: 400 }
    )
  }

  const data = body as Record<string, unknown>

  const name = sanitizeRequired(data.name)
  const email = sanitizeRequired(data.email)
  const message = sanitizeRequired(data.message)
  const phone = sanitizeOptional(data.phone)
  const company = sanitizeOptional(data.company)

  if (!name || !email || !message) {
    return createErrorResponse(
      ErrorType.VALIDATION,
      'Missing required fields: name, email, and message are required',
      { statusCode: 400 }
    )
  }

  if (!emailRegex.test(email)) {
    return createErrorResponse(
      ErrorType.VALIDATION,
      'Invalid email address',
      { statusCode: 400 }
    )
  }

  logger.info('Contact form submission', { email, name })

  try {
    // Initialize Supabase inside handler (not at module level)
    let contact = null
    if (isServiceConfigured('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')) {
      // Environment variables are already validated by isServiceConfigured above
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string
      const supabase = createClient(supabaseUrl, supabaseKey)

      // Save contact to database
      const { data: contactData, error: dbError } = await supabase
        .from('contacts')
        .insert([
          {
            name,
            email,
            phone: phone || null,
            message,
            status: 'new',
          },
        ])
        .select()
        .single()

      if (dbError) {
        logger.error('Failed to save contact to database', dbError)
        // Continue with email even if database save fails
      } else {
        contact = contactData
        logger.info('Contact saved to database', { contactId: contact?.id })
      }
    }

    const contactResult = await sendContactFormEmail({
      name,
      email,
      phone,
      company,
      message,
    })

    if (!contactResult.success) {
      logger.error('Failed to send contact email', { email })
      return createErrorResponse(
        ErrorType.EXTERNAL_SERVICE,
        'Failed to send message. Please try again later.',
        { statusCode: 500 }
      )
    }

    logger.info('Contact email sent successfully', { email })

    const welcomeResult = await sendWelcomeEmail({
      name,
      email,
    })

    if (!welcomeResult.success) {
      logger.warn('Failed to send welcome email, but contact form was sent', { email })
    } else {
      logger.info('Welcome email sent successfully', { email })
    }

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
      contactId: contact?.id,
    })
  } catch (error) {
    logger.error('Contact form error', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      error as Error,
      { logError: true }
    )
  }
}

// Apply strict rate limiting (3 requests per minute for contact form)
export const POST = withRateLimit(handleContactForm, RateLimits.STRICT)

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

// Handle GET requests (return method not allowed)
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Please use POST to submit the contact form.' },
    {
      status: 405,
      headers: {
        'Allow': 'POST, OPTIONS',
      },
    }
  )
}
