import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { generateInvoiceNumber, generateInvoicePDF } from '@/lib/invoice-generator'
import { uploadInvoiceToStorage } from '@/lib/invoice-storage'
import { logger } from '@/lib/logger'
import { createErrorResponse, ErrorType } from '@/lib/error-handler'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(req: NextRequest) {
  try {
    logger.info('Cashfree webhook received')

    const body = await req.json()
    const signature = req.headers.get('x-webhook-signature')
    const timestamp = req.headers.get('x-webhook-timestamp')

    // Verify webhook signature
    const secretKey = process.env.CASHFREE_SECRET_KEY
    if (!secretKey) {
      throw new Error('Cashfree secret key not configured')
    }

    if (signature && timestamp) {
      const signatureData = `${timestamp}${JSON.stringify(body)}`
      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(signatureData)
        .digest('base64')

      if (signature !== expectedSignature) {
        logger.security('Invalid Cashfree webhook signature', {
          orderId: body.data?.order?.order_id
        })
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const { type, data } = body

    // Handle payment success event
    if (type === 'PAYMENT_SUCCESS_WEBHOOK') {
      const payment = data.payment
      const order = data.order

      const supabase = createAdminClient()

      // Get order details from database
      const { data: orderData, error: orderError } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('order_id', order.order_id)
        .single()

      if (orderError || !orderData) {
        logger.error('Order not found for webhook', { orderId: order.order_id })
        return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 })
      }

      // Calculate amounts
      const totalAmount = parseFloat(order.order_amount)
      const paymentAmount = parseFloat((totalAmount / 1.18).toFixed(2))
      const gstAmount = parseFloat((totalAmount - paymentAmount).toFixed(2))

      // Save payment record
      // Extract address from order data or order tags as fallback
      const orderTags = (order?.order_tags as Record<string, string>) || {}
      const fullAddress = orderData.customer_address || orderTags.address || null

      // Use user_id from order data (already validated during order creation)
      // No FK constraint validation needed since we use NextAuth custom tables
      const { data: paymentRecord, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: orderData.user_id,
          order_id: order.order_id,
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
        })
        .select()
        .single()

      if (paymentError) {
        logger.error('Failed to save Cashfree payment', paymentError)
      }

      // Create or update subscription for the user
      if (paymentRecord && orderData.user_id) {
        try {
          const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', orderData.user_id)
            .single()

          if (!existingSubscription) {
            const subscriptionData = {
              user_id: orderData.user_id,
              plan: 'launch_offer',
              status: 'ACTIVE',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
            }

            const { data: newSubscription, error: subError } = await supabase
              .from('subscriptions')
              .insert(subscriptionData)
              .select()
              .single()

            if (subError) {
              logger.error('Failed to create subscription', subError)
            } else {
              logger.info('✅ Subscription created', {
                subscriptionId: newSubscription.id,
                userId: orderData.user_id,
                plan: 'launch_offer'
              })
            }
          } else {
            logger.info('User already has active subscription', {
              subscriptionId: existingSubscription.id
            })
          }
        } catch (subscriptionError) {
          logger.error('Error handling subscription', subscriptionError)
        }
      }

      // Update order status
      await supabase
        .from('payment_orders')
        .update({ status: 'paid' })
        .eq('order_id', order.order_id)

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

      // Get discount information and user details from order data
      const discountPercentage = orderData.discount_percentage || 0
      const discountAmount = orderData.discount_amount || 0
      const originalAmount = orderData.original_amount || 0
      const userCount = orderData.user_count || 1
      const planType = orderData.plan_type || 'onetime'

      const invoiceData = {
        invoiceNumber,
        invoiceDate: new Date(),
        customerName: orderData.customer_name,
        customerEmail: orderData.customer_email,
        customerPhone: orderData.customer_phone,
        customerCompany: orderData.firm_name || orderData.company,
        customerAddress: orderData.customer_address || fullAddress,
        customerGSTN: orderData.gst_number || orderData.customer_gst_no,
        orderId: order.order_id,
        paymentId: payment.cf_payment_id,
        paymentDate: new Date(),
        items: [{
          description: 'PowerCA Implementation - Complete setup with first year subscription FREE',
          quantity: userCount,
          rate: userCount > 1 ? Math.round(subtotal / userCount) : subtotal,
          amount: subtotal,
        }],
        subtotal,
        ...gst,
        grandTotal: totalAmount,
        isTestMode: false,
        // Include discount information
        discountPercentage,
        discountAmount,
        originalAmount,
        // Include user and plan details
        user_count: userCount,
        planType: planType,
      }

      // Generate and upload invoice
      let invoicePDF = null
      let _storageUrl = null
      try {
        invoicePDF = await generateInvoicePDF(invoiceData)
        if (invoicePDF) {
          _storageUrl = await uploadInvoiceToStorage(invoiceNumber, invoicePDF)
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
              user_count: orderData.user_count || 1,
            })

          if (invoiceError) {
            logger.error('Failed to save invoice to database (webhook)', {
              orderId: order.order_id,
              invoiceNumber,
              paymentId: paymentRecord.id,
              error: invoiceError
            })
            // Don't throw - invoice is not critical, payment already succeeded
          } else {
            logger.info('Invoice saved to database (webhook)', { invoiceNumber, paymentId: paymentRecord.id })
          }
        } else {
          logger.info('Invoice already exists for payment (webhook)', {
            invoiceId: existingInvoice.id,
            invoiceNumber: existingInvoice.invoice_number
          })
        }
      }

      // Send confirmation email
      if (orderData.customer_email && resend) {
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
                        <span>${order.order_id}</span>
                      </div>
                      <div class="detail-row">
                        <span>💰 Payment ID</span>
                        <span>${payment.cf_payment_id}</span>
                      </div>
                      <div class="detail-row">
                        <span>📅 Date</span>
                        <span>${new Date().toLocaleDateString('en-IN')}</span>
                      </div>
                      ${discountAmount > 0 ? `
                      <div class="detail-row">
                        <span>💰 Original Amount</span>
                        <span style="text-decoration: line-through; color: #999;">₹${originalAmount.toFixed(2)}</span>
                      </div>
                      <div class="detail-row" style="color: #27ae60;">
                        <span>🎁 Discount (${discountPercentage}%)</span>
                        <span>-₹${discountAmount.toFixed(2)}</span>
                      </div>
                      ` : ''}
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
            attachments: invoicePDF ? [{
              filename: `PowerCA-Invoice-${invoiceNumber}.pdf`,
              content: Buffer.from(invoicePDF).toString('base64'),
            }] : [],
          })
          logger.info('Cashfree payment confirmation email sent')
        } catch (emailError) {
          logger.error('Failed to send Cashfree confirmation email', emailError)
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
                order_id: order.order_id,
                payment_id: payment.cf_payment_id
              })
              .eq('id', referralRecord.id)

            // Create affiliate payment record
            // Commission is 10% of BASE amount (excluding GST)
            // Example: Monthly ₹100 × 5 users = ₹500 base → Commission = ₹50
            const commissionAmount = parseFloat((paymentAmount * 0.10).toFixed(2))

            await supabase
              .from('affiliate_referral_payments')
              .insert({
                referral_id: referralRecord.id,
                referral_code: orderData.referral_code,
                customer_id: orderData.customer_id,
                affiliate_id: referralRecord.affiliate_id,

                // Payment details
                order_id: order.order_id,
                payment_id: payment.cf_payment_id,

                // Customer information
                customer_name: orderData.customer_name,
                customer_email: orderData.customer_email,
                customer_phone: orderData.customer_phone,
                customer_firm_name: orderData.firm_name,
                customer_company: orderData.company,
                customer_gst: orderData.gst_number,

                // Amount details
                payment_amount: paymentAmount,
                currency: 'INR',
                gst_amount: gstAmount,
                total_amount: totalAmount,

                // Product details
                product_id: orderData.product_id,
                plan_type: 'PowerCA Implementation',

                // Commission
                commission_amount: commissionAmount,
                commission_rate: 10.00,
                commission_paid: false,

                // Status
                payment_status: 'completed',
                payment_completed_at: new Date().toISOString(),
                payment_provider: 'cashfree',

                // Additional data
                notes: {
                  invoice_number: invoiceNumber,
                  payment_date: new Date().toISOString(),
                  referral_source: 'affiliate_program'
                }
              })

            logger.info('Cashfree affiliate referral processed')
          }
        } catch (affError) {
          logger.error('Error processing Cashfree affiliate referral', affError)
        }
      }

      return NextResponse.json({ status: 'success' })
    }

    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    return createErrorResponse(
      ErrorType.PAYMENT,
      error as Error,
      { logError: true }
    )
  }
}
