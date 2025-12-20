import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import { createErrorResponse, ErrorType } from '@/lib/error-handler'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return createErrorResponse(
        ErrorType.VALIDATION,
        'Token is required'
      )
    }

    const supabase = createAdminClient()

    // Look up payment by success_token
    const { data: payment, error } = await supabase
      .from('app_download_payments')
      .select('order_id, email, name, product_name, amount, created_at, success_token_used')
      .eq('success_token', token)
      .single()

    if (error || !payment) {
      logger.warn('Invalid success token attempted', { token: token.substring(0, 8) + '...' })
      return createErrorResponse(
        ErrorType.NOT_FOUND,
        'Invalid or expired token'
      )
    }

    // Check if token was already used (optional - can allow multiple views)
    // For security, we mark it as used but still show the details
    if (!payment.success_token_used) {
      // Mark token as used
      await supabase
        .from('app_download_payments')
        .update({ success_token_used: true })
        .eq('success_token', token)
    }

    // Return order details with full email (user's own purchase)
    return NextResponse.json({
      success: true,
      data: {
        orderId: payment.order_id,
        email: payment.email,
        name: payment.name,
        productName: payment.product_name,
        amount: payment.amount,
        createdAt: payment.created_at
      }
    })

  } catch (error) {
    logger.error('Failed to fetch success details', error)
    return createErrorResponse(
      ErrorType.INTERNAL,
      'Failed to fetch order details'
    )
  }
}
