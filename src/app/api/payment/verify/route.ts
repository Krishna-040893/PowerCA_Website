import {NextRequest, NextResponse  } from 'next/server'
import crypto from 'crypto'
import {createAdminClient  } from '@/lib/supabase/admin'
import {getServerSession  } from 'next-auth'
import {authOptions  } from '@/lib/auth'
import {Resend  } from 'resend'
import {generateInvoiceNumber, calculateGST, generateInvoicePDF  } from '@/lib/invoice-generator'
import {logger  } from '@/lib/logger'
import {createErrorResponse, ErrorType, handleConfigurationError, isServiceConfigured  } from '@/lib/error-handler'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    // Use secure logger instead of console.log
    logger.info('Payment verification request received', {
      orderId: body.orderId || body.razorpay_order_id,
      hasAffiliateCode: !!body.affiliateCode,
      hasCustomerDetails: !!body.customerDetails
    })

    const {
      orderId,
      paymentId,
      signature,
      customerDetails,
      productDetails,
      isTestPayment,
      affiliateCode,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = body

    // Normalize the payment data for compatibility
    const normalizedOrderId = orderId || razorpay_order_id
    const normalizedPaymentId = paymentId || razorpay_payment_id
    const normalizedSignature = signature || razorpay_signature

    // SECURITY: Only allow test payments in development environment
    const isTestMode = process.env.NODE_ENV === 'development' && isTestPayment === true

    if (isTestMode) {
      logger.debug('Test mode payment verification - development environment only')
    }

    // Always verify signature in production, only skip in dev for test payments
    if (!isTestMode) {
      // Verify payment signature for real payments
      if (!isServiceConfigured('RAZORPAY_KEY_SECRET')) {
        return handleConfigurationError('Payment gateway')
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET
      if (!keySecret) {
        throw new Error('Razorpay key secret not configured')
      }
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${normalizedOrderId}|${normalizedPaymentId}`)
        .digest('hex')

      if (generatedSignature !== normalizedSignature) {
        logger.security('Invalid payment signature attempted', {
          orderId: normalizedOrderId,
          paymentId: normalizedPaymentId,
          userEmail: customerDetails?.email
        })
        return createErrorResponse(
          ErrorType.PAYMENT,
          'Invalid payment signature'
        )
      }
    }

    const supabase = createAdminClient()

    // Get additional user data from headers or session
    const userData = req.headers.get('x-user-data')
    const userInfo = userData ? JSON.parse(userData) : {}

    // Prepare payment data
    const paymentAmount = productDetails?.amount || 22000 // Amount in rupees
    const customerEmail = customerDetails?.email || session?.user?.email || userInfo.email || 'guest@powerca.in'
    const customerName = customerDetails?.name || session?.user?.name || userInfo.name || 'Customer'

    // Save payment to database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: session?.user?.id || null,
        order_id: normalizedOrderId,
        payment_id: normalizedPaymentId,
        signature: normalizedSignature,
        amount: paymentAmount,
        currency: 'INR',
        status: 'success',
        plan: productDetails?.name || 'PowerCA Implementation',
        email: customerEmail,
        phone: customerDetails?.phone || userInfo.phone,
        name: customerName,
        company: customerDetails?.company || userInfo.company,
        gst_number: customerDetails?.gst || userInfo.gstNumber,
        address: customerDetails?.address || userInfo.address
      })
      .select()
      .single()

    if (paymentError) {
      logger.error('Failed to save payment', paymentError)
      // Continue even if DB save fails - we can retry via webhook
    }

    // Generate invoice
    const invoiceNumber = generateInvoiceNumber(isTestPayment)
    const subtotal = paymentAmount
    const gst = calculateGST(subtotal, false)
    const grandTotal = subtotal + gst.totalTax

    const invoiceData = {
      invoiceNumber,
      invoiceDate: new Date(),
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerDetails?.phone || userInfo.phone,
      customerCompany: customerDetails?.company || userInfo.company,
      customerAddress: customerDetails?.address || userInfo.address,
      customerGSTN: customerDetails?.gst || userInfo.gstNumber,
      orderId: normalizedOrderId,
      paymentId: normalizedPaymentId,
      paymentDate: new Date(),
      items: [{
        description: productDetails?.name || 'PowerCA Implementation - Complete setup with first year subscription FREE',
        quantity: 1,
        rate: subtotal,
        amount: subtotal,
      }],
      subtotal,
      ...gst,
      grandTotal,
      isTestMode: isTestPayment
    }

    // Generate PDF invoice
    let invoicePDF = null
    try {
      invoicePDF = await generateInvoicePDF(invoiceData)
    } catch (pdfError) {
      logger.error('Failed to generate PDF invoice', pdfError)
      // Continue without PDF if generation fails
    }

    // Save invoice to database
    if (payment) {
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          payment_id: payment.id,
          amount: subtotal,
          gst: gst.totalTax,
          total: grandTotal,
          status: 'paid',
        })

      if (invoiceError) {
        logger.error('Failed to create invoice record', invoiceError)
      }
    }

    // Send confirmation email
    if (customerEmail) {
      try {
        if (!resend) {
          console.warn('Resend not configured, skipping confirmation email')
          return
        }
        await resend.emails.send({
          from: 'PowerCA <contact@powerca.in>',
          to: customerEmail,
          subject: `${isTestPayment ? '🧪 [TEST] ' : ''}🎉 Payment Confirmation - Invoice ${invoiceNumber}`,
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
                ${isTestPayment ? `
                <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                  <strong>🧪 TEST MODE</strong><br>
                  This is a test payment. No real money was charged.
                </div>
                ` : ''}
                <div class="header">
                  <h2>🎉 Payment Successful!</h2>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for choosing PowerCA</p>
                </div>
                <div class="content">
                  <p>Dear <strong>${customerName}</strong>,</p>
                  <p>🎊 Congratulations! Your payment has been successfully processed and your PowerCA implementation is confirmed.</p>

                  <div class="payment-details">
                    <h3>💳 Payment Summary</h3>
                    <div class="detail-row">
                      <span>📋 Invoice Number</span>
                      <strong>${invoiceNumber}</strong>
                    </div>
                    <div class="detail-row">
                      <span>🔗 Order ID</span>
                      <span>${normalizedOrderId}</span>
                    </div>
                    <div class="detail-row">
                      <span>💰 Payment ID</span>
                      <span>${normalizedPaymentId}</span>
                    </div>
                    <div class="detail-row">
                      <span>📅 Date</span>
                      <span>${new Date().toLocaleDateString('en-IN')}</span>
                    </div>
                    <div class="detail-row">
                      <span>💵 Total Amount</span>
                      <strong>₹${grandTotal.toFixed(2)}</strong>
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
            content: invoicePDF,
          }] : [],
        })
      } catch (emailError) {
        logger.error('Failed to send confirmation email', emailError)
        // Don't fail the payment if email fails
      }
    }

    // Track affiliate referral if affiliate code is present
    logger.debug('Checking for affiliate code', { affiliateCode })
    if (affiliateCode) {
      try {
        logger.info('Processing affiliate referral', { affiliateCode })

        // Find affiliate profile by referral code
        const { data: affiliateProfile, error: profileError } = await supabase
          .from('affiliate_profiles')
          .select('*')
          .eq('referral_code', affiliateCode)
          .single()

        logger.info('Affiliate profile lookup result', {
          found: !!affiliateProfile,
          profileId: affiliateProfile?.id,
          affiliateId: affiliateProfile?.affiliate_id,
          referralCode: affiliateProfile?.referral_code,
          error: profileError?.message
        })

        if (affiliateProfile && !profileError) {
          // Try to find existing pending referral
          const { data: existingReferral, error: findError } = await supabase
            .from('affiliate_referrals')
            .select('*')
            .eq('affiliate_profile_id', affiliateProfile.id)
            .eq('referral_code', affiliateCode)
            .eq('status', 'pending')
            .limit(1)
            .single()

          if (existingReferral && !findError) {
            // Update existing referral to converted
            logger.info('Found existing referral, updating to converted', { referralId: existingReferral.id })

            const { data: updatedReferral, error: updateRefError } = await supabase
              .from('affiliate_referrals')
              .update({
                status: 'converted',
                converted_at: new Date().toISOString(),
                referred_email: customerEmail,
                referred_name: customerName
              })
              .eq('id', existingReferral.id)
              .select()
              .single()

            if (updateRefError) {
              logger.error('Failed to update referral status', updateRefError)
            } else {
              logger.info('Referral status updated to converted', { referralId: updatedReferral.id })
            }
          } else {
            // Create new referral record as converted
            logger.info('Creating new referral record as converted')

            const referralData = {
              affiliate_profile_id: affiliateProfile.id,
              affiliate_id: affiliateProfile.affiliate_id,
              referral_code: affiliateCode,
              referred_email: customerEmail,
              referred_name: customerName,
              status: 'converted',
              converted_at: new Date().toISOString()
            }

            const { data: newReferral, error: createRefError } = await supabase
              .from('affiliate_referrals')
              .insert(referralData)
              .select()
              .single()

            if (createRefError) {
              logger.error('Failed to create referral record', createRefError)
            } else {
              logger.info('New referral record created as converted', { referralId: newReferral.id })
            }
          }

          // Track payment referral for commission calculation
          const paymentReferralData = {
            payment_id: normalizedPaymentId,
            affiliate_profile_id: affiliateProfile.id,
            customer_email: customerEmail,
            customer_name: customerName,
            plan_id: body.planId || 'powerca-implementation',
            payment_amount: paymentAmount,
            commission_amount: 0 // Set commission rules as needed
          }

          logger.info('Creating payment referral record', { paymentId: normalizedPaymentId, affiliateId: affiliateProfile.id })

          const { data: payRefData, error: payRefError } = await supabase
            .from('payment_referrals')
            .insert(paymentReferralData)
            .select()
            .single()

          if (payRefError) {
            logger.error('Failed to create payment referral record', payRefError)
          } else {
            logger.info('Payment referral record created', { recordId: payRefData?.id })
          }

          logger.info('Referral tracking summary', {
            affiliateId: affiliateProfile.affiliate_id,
            referralCode: affiliateCode,
            referralTracked: true,
            paymentTracked: !payRefError
          })
        } else {
          logger.warn('Affiliate profile not found', { referralCode: affiliateCode })
        }
      } catch (affError) {
        logger.error('Error processing affiliate referral', affError)
        // Don't fail the payment if affiliate tracking fails
      }
    } else {
      logger.debug('No affiliate code provided - regular payment without referral')
    }

    // Update order status
    try {
      await supabase
        .from('payment_orders')
        .update({ status: 'paid' })
        .eq('order_id', normalizedOrderId)
    } catch (orderUpdateError) {
      logger.error('Failed to update order status', orderUpdateError)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: normalizedPaymentId,
        orderId: normalizedOrderId,
        invoiceNumber: invoiceNumber,
        amount: grandTotal,
        currency: 'INR',
      },
    })

  } catch (error) {
    return createErrorResponse(
      ErrorType.PAYMENT,
      error as Error,
      { logError: true }
    )
  }
}