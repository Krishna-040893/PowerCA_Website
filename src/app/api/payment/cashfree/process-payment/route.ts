import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { generateInvoiceNumber, generateInvoicePDF } from '@/lib/invoice-generator'
import { uploadInvoiceToStorage } from '@/lib/invoice-storage'
import { logger } from '@/lib/logger'
import { createErrorResponse, ErrorType } from '@/lib/error-handler'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

/**
 * Process Cashfree payment after successful redirect
 * This endpoint is called from the payment-success page to generate invoice and send email
 * if the webhook hasn't processed it yet
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      )
    }

    logger.info('Processing Cashfree payment', { orderId })

    const supabase = createAdminClient()

    // Get order details (might not exist if DB insert failed during order creation)
    const { data: existingOrder, error: orderError } = await supabase
      .from('payment_orders')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (orderError && orderError.code !== 'PGRST116') {
      logger.error('Failed to fetch order from database', {
        orderId,
        error: orderError,
      })
    }

    if (!existingOrder) {
      logger.warn('Cashfree order missing in database, will backfill', { orderId })
    }

    let orderData: any = existingOrder || null

    // Check if payment already exists
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (existingPayment) {
      // Payment already processed, check if invoice exists
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('payment_id', existingPayment.id)
        .single()

      if (existingInvoice) {
        logger.info('Payment and invoice already exist', { orderId })
        return NextResponse.json({
          success: true,
          alreadyProcessed: true,
          invoiceNumber: existingInvoice.invoice_number,
          payment: existingPayment
        })
      }
    }

    // Verify payment status with Cashfree API
    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    if (!appId || !secretKey) {
      throw new Error('Cashfree credentials not configured')
    }

    // ✅ Choose environment based on App ID prefix (same logic as create-order)
    // Cashfree App IDs: TEST* = sandbox, production IDs start with numbers
    const environment = appId.toUpperCase().startsWith('TEST') ? 'sandbox' : 'production'
    const baseUrl =
      environment === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg'

    // Fetch order status from Cashfree
    const cashfreeResponse = await fetch(`${baseUrl}/orders/${orderId}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    })

    const cashfreeOrder = await cashfreeResponse.json()

    if (!cashfreeResponse.ok || cashfreeOrder.order_status !== 'PAID') {
      logger.warn('Payment not completed yet', { orderId, status: cashfreeOrder.order_status })
      return NextResponse.json({
        success: false,
        error: 'Payment not completed',
        status: cashfreeOrder.order_status
      }, { status: 400 })
    }

    // Get payment details
    const paymentsResponse = await fetch(`${baseUrl}/orders/${orderId}/payments`, {
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
    })

    const paymentsData = await paymentsResponse.json()

    // Log the response format for debugging
    logger.info('Cashfree payments response', {
      orderId,
      isArray: Array.isArray(paymentsData),
      dataType: typeof paymentsData,
      keys: paymentsData ? Object.keys(paymentsData) : []
    })

    const payment = Array.isArray(paymentsData) ? paymentsData[0] : paymentsData

    if (!payment || !payment.cf_payment_id) {
      logger.error('Payment details not found or invalid', {
        orderId,
        paymentsData,
        hasPayment: !!payment
      })
      throw new Error('Payment details not found')
    }

    // Calculate amounts
    const totalAmount = parseFloat(cashfreeOrder.order_amount)
    const paymentAmount = parseFloat((totalAmount / 1.18).toFixed(2))
    const gstAmount = parseFloat((totalAmount - paymentAmount).toFixed(2))

    const paymentCustomer = payment?.customer_details || payment?.customer || {}
    const cashfreeCustomer = cashfreeOrder?.customer_details || {}
    const orderTags = (cashfreeOrder?.order_tags as Record<string, string>) || {}

    if (!orderData) {
      const affiliateFlag =
        (orderTags.isAffiliatePurchase ?? '').toString().toLowerCase()

      const fallbackOrder: any = {
        order_id: orderId,
        amount: totalAmount,
        currency: cashfreeOrder?.order_currency || 'INR',
        status: 'paid',
        customer_email:
          cashfreeCustomer.customer_email ??
          paymentCustomer.customer_email ??
          existingPayment?.email ??
          null,
        customer_name:
          cashfreeCustomer.customer_name ??
          paymentCustomer.customer_name ??
          existingPayment?.name ??
          'PowerCA Customer',
        customer_phone:
          cashfreeCustomer.customer_phone ??
          paymentCustomer.customer_phone ??
          existingPayment?.phone ??
          null,
        company: orderTags.company ?? existingPayment?.company ?? null,
        firm_name: orderTags.firmName ?? orderTags.firm_name ?? existingPayment?.firm_name ?? null,
        gst_number: orderTags.gstin ?? existingPayment?.gst_number ?? null,
        product_id: orderTags.productId ?? existingPayment?.plan ?? 'powerca_implementation',
        referral_code: orderTags.referralCode ?? null,
        customer_id:
          cashfreeCustomer.customer_id ?? orderTags.customerId ?? null,
        is_affiliate_purchase:
          affiliateFlag === 'true' ||
          affiliateFlag === '1' ||
          !!orderTags.referralCode,
        user_id: existingPayment?.user_id ?? null,
        customer_address: orderTags.address ?? existingPayment?.address ?? null,
        customer_country: orderTags.country ?? null,
      }

      if (!fallbackOrder.customer_email) {
        throw new Error('Unable to determine customer email for Cashfree order')
      }

      try {
        const { data: insertedOrder, error: insertError } = await supabase
          .from('payment_orders')
          .insert(fallbackOrder)
          .select()
          .single()

        if (insertError) {
          if (insertError.code === '23505') {
            const { data: dedupedOrder } = await supabase
              .from('payment_orders')
              .select('*')
              .eq('order_id', orderId)
              .single()

            if (dedupedOrder) {
              orderData = dedupedOrder
            } else {
              orderData = fallbackOrder
            }
          } else {
            logger.error('Failed to backfill payment order from Cashfree', insertError)
            orderData = fallbackOrder
          }
        } else {
          orderData = insertedOrder
          logger.info('Backfilled payment order from Cashfree response', { orderId })
        }
      } catch (insertErr) {
        logger.error('Error inserting fallback payment order', insertErr)
        orderData = fallbackOrder
      }
    }

    if (!orderData) {
      throw new Error('Could not resolve order details for Cashfree payment')
    }

    // Save payment record if not exists
    let paymentRecord = existingPayment
    if (!existingPayment) {
      // Construct address from order data or order tags as fallback
      const fullAddress = orderData.customer_address || orderTags.address || orderTags.customerAddress || null

      const paymentInsertData = {
        user_id: orderData.user_id || null,
        order_id: orderId,
        payment_id: payment.cf_payment_id,
        amount: totalAmount,
        currency: 'INR',
        status: 'captured',
        plan: orderData.product_id || 'PowerCA Implementation',
        email: orderData.customer_email,
        phone: orderData.customer_phone,
        name: orderData.customer_name,
        firm_name: orderData.firm_name,
        company: orderData.company,
        gst_number: orderData.gst_number,
        address: fullAddress
      }

      logger.info('Attempting to insert payment record', {
        orderId,
        cf_payment_id: payment.cf_payment_id,
        user_id: orderData.user_id,
        amount: totalAmount
      })

      const { data, error: paymentError } = await supabase
        .from('payments')
        .insert(paymentInsertData)
        .select()
        .single()

      if (paymentError) {
        logger.error('Failed to save payment to database', {
          orderId,
          cf_payment_id: payment.cf_payment_id,
          error: paymentError,
          errorCode: paymentError.code,
          errorMessage: paymentError.message,
          errorDetails: paymentError.details,
          errorHint: paymentError.hint,
          insertData: paymentInsertData
        })
        throw new Error(`Database error: ${paymentError.message} (Code: ${paymentError.code})`)
      }

      logger.info('Payment record saved successfully', {
        orderId,
        paymentId: data?.id,
        cf_payment_id: payment.cf_payment_id
      })

      paymentRecord = data
    }

    // Create subscription if needed
    if (paymentRecord && orderData.user_id) {
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', orderData.user_id)
        .single()

      if (!existingSubscription) {
        await supabase
          .from('subscriptions')
          .insert({
            user_id: orderData.user_id,
            plan: 'launch_offer',
            status: 'ACTIVE',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
          })

        logger.info('Subscription created', { userId: orderData.user_id })
      }
    }

    // Update order status
    await supabase
      .from('payment_orders')
      .update({ status: 'paid' })
      .eq('order_id', orderId)

    // Generate invoice
    const invoiceNumber = generateInvoiceNumber(false)
    const subtotal = paymentAmount
    const gst = {
      cgstRate: 9,
      cgstAmount: gstAmount / 2,
      sgstRate: 9,
      sgstAmount: gstAmount / 2,
      totalTax: gstAmount
    }

    const invoiceData = {
      invoiceNumber,
      invoiceDate: new Date(),
      customerName: orderData.customer_name,
      customerEmail: orderData.customer_email,
      customerPhone: orderData.customer_phone,
      customerCompany: orderData.firm_name || orderData.company,
      customerAddress: orderData.customer_address || paymentRecord?.address || orderTags.address || orderTags.customerAddress || null,
      customerGSTN: orderData.gst_number,
      orderId: orderId,
      paymentId: payment.cf_payment_id,
      paymentDate: new Date(),
      items: [{
        description: 'PowerCA Implementation - Complete setup with first year subscription FREE',
        quantity: 1,
        rate: subtotal,
        amount: subtotal,
      }],
      subtotal,
      ...gst,
      grandTotal: totalAmount,
      isTestMode: false
    }

    // Generate and upload invoice
    let invoicePDF = null
    let storageUrl = null
    try {
      invoicePDF = await generateInvoicePDF(invoiceData)
      if (invoicePDF) {
        storageUrl = await uploadInvoiceToStorage(invoiceNumber, invoicePDF)
        logger.info('Invoice uploaded', { invoiceNumber, storageUrl })
      }
    } catch (pdfError) {
      logger.error('Failed to generate PDF invoice', pdfError)
    }

    // Save invoice to database (check for existing invoice first to handle idempotency)
    if (paymentRecord) {
      const { data: existingInvoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('payment_id', paymentRecord.id)
        .single()

      if (!existingInvoice) {
        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            invoice_number: invoiceNumber,
            payment_id: paymentRecord.id,
            amount: subtotal,
            gst: gst.totalTax,
            total: totalAmount,
            status: 'paid',
          })

        if (invoiceError) {
          logger.error('Failed to save invoice to database', {
            orderId,
            invoiceNumber,
            paymentId: paymentRecord.id,
            error: invoiceError
          })
          // Don't throw - invoice is not critical, payment already succeeded
        } else {
          logger.info('Invoice saved to database', { invoiceNumber, paymentId: paymentRecord.id })
        }
      } else {
        logger.info('Invoice already exists for payment', {
          invoiceId: existingInvoice.id,
          invoiceNumber: existingInvoice.invoice_number
        })
      }
    }

    // Send confirmation email
    if (orderData.customer_email && resend && invoicePDF) {
      try {
        await resend.emails.send({
          from: 'PowerCA <contact@powerca.in>',
          to: orderData.customer_email,
          subject: `🎉 Payment Confirmation - Invoice ${invoiceNumber}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; color: #2c3e50; margin: 0; padding: 0; background: #f8f9fa; }
                .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 25px; text-align: center; }
                .header h2 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 30px 25px; line-height: 1.6; }
                .payment-details { background: #f8f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0; }
                .payment-details h3 { color: #667eea; margin-top: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
                .detail-row:last-child { border-bottom: none; font-weight: bold; color: #667eea; }
                .footer { background: #f8f9ff; padding: 20px 25px; text-align: center; font-size: 14px; color: #7f8c8d; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>🎉 Payment Successful!</h2>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for choosing PowerCA</p>
                </div>
                <div class="content">
                  <p>Dear <strong>${orderData.customer_name}</strong>,</p>
                  <p>🎊 Congratulations! Your payment has been successfully processed via Cashfree and your PowerCA implementation is confirmed.</p>

                  <div class="payment-details">
                    <h3>💳 Payment Summary</h3>
                    <div class="detail-row">
                      <span>📋 Invoice Number</span>
                      <strong>${invoiceNumber}</strong>
                    </div>
                    <div class="detail-row">
                      <span>🔗 Order ID</span>
                      <span>${orderId}</span>
                    </div>
                    <div class="detail-row">
                      <span>💰 Payment ID</span>
                      <span>${payment.cf_payment_id}</span>
                    </div>
                    <div class="detail-row">
                      <span>📅 Date</span>
                      <span>${new Date().toLocaleDateString('en-IN')}</span>
                    </div>
                    <div class="detail-row">
                      <span>💵 Total Amount</span>
                      <strong>₹${totalAmount.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #27ae60; margin-top: 0;">🎁 What's Next?</h3>
                    <ul style="margin: 0; padding-left: 20px;">
                      <li>📧 You'll receive implementation details within 24 hours</li>
                      <li>🎓 Free training session will be scheduled</li>
                      <li>🛠️ Complete setup and configuration included</li>
                      <li>🎉 First year subscription is absolutely FREE!</li>
                    </ul>
                  </div>

                  <p>📎 Your detailed invoice is attached as a PDF for your records.</p>
                  <p style="margin-top: 30px;">Best Regards,<br><strong>The PowerCA Team</strong> 🚀</p>
                </div>
                <div class="footer">
                  <p>© 2024 PowerCA - Complete CA Practice Management Solution<br>
                  This is an automated email. Please do not reply to this message.</p>
                </div>
              </div>
            </body>
            </html>
          `,
          attachments: [{
            filename: `PowerCA-Invoice-${invoiceNumber}.pdf`,
            content: Buffer.from(invoicePDF).toString('base64'),
          }],
        })
        logger.info('Payment confirmation email sent', { to: orderData.customer_email })
      } catch (emailError) {
        logger.error('Failed to send confirmation email', emailError)
      }
    }

    // Handle affiliate referrals
    if (orderData.is_affiliate_purchase && orderData.referral_code && orderData.customer_id) {
      try {
        const { data: referralRecord } = await supabase
          .from('affiliate_referrals')
          .select('*')
          .eq('referral_code', orderData.referral_code)
          .eq('customer_id', orderData.customer_id)
          .eq('status', 'pending')
          .single()

        if (referralRecord) {
          await supabase
            .from('affiliate_referrals')
            .update({
              status: 'completed',
              converted_at: new Date().toISOString(),
              payment_amount: paymentAmount,
              order_id: orderId,
              payment_id: payment.cf_payment_id
            })
            .eq('id', referralRecord.id)

          const commissionAmount = parseFloat((paymentAmount * 0.10).toFixed(2))

          await supabase
            .from('affiliate_referral_payments')
            .insert({
              referral_id: referralRecord.id,
              referral_code: orderData.referral_code,
              customer_id: orderData.customer_id,
              affiliate_id: referralRecord.affiliate_id,
              order_id: orderId,
              payment_id: payment.cf_payment_id,
              customer_name: orderData.customer_name,
              customer_email: orderData.customer_email,
              customer_phone: orderData.customer_phone,
              customer_firm_name: orderData.firm_name,
              customer_company: orderData.company,
              customer_gst: orderData.gst_number,
              payment_amount: paymentAmount,
              currency: 'INR',
              gst_amount: gstAmount,
              total_amount: totalAmount,
              product_id: orderData.product_id,
              plan_type: 'PowerCA Implementation',
              commission_amount: commissionAmount,
              commission_rate: 10.00,
              commission_paid: false,
              payment_status: 'completed',
              payment_completed_at: new Date().toISOString(),
              payment_provider: 'cashfree',
              notes: {
                invoice_number: invoiceNumber,
                payment_date: new Date().toISOString(),
                referral_source: 'affiliate_program'
              }
            })

          logger.info('Affiliate referral processed')
        }
      } catch (affError) {
        logger.error('Error processing affiliate referral', affError)
      }
    }

    return NextResponse.json({
      success: true,
      invoiceNumber,
      payment: paymentRecord,
      emailSent: !!resend && !!invoicePDF
    })

  } catch (error) {
    // Enhanced error logging to identify the exact failure point
    logger.error('Cashfree payment processing failed', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error,
      errorType: typeof error
    })

    return createErrorResponse(
      ErrorType.PAYMENT,
      error as Error,
      { logError: true }
    )
  }
}
