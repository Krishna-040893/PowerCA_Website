import {NextRequest, NextResponse  } from 'next/server'
import crypto from 'crypto'
import {createAdminClient  } from '@/lib/supabase/admin'
import {getServerSession  } from 'next-auth'
import {authOptions  } from '@/lib/auth'
import {Resend  } from 'resend'
import {generateInvoiceNumber, generateInvoicePDF  } from '@/lib/invoice-generator'
import {uploadInvoiceToStorage  } from '@/lib/invoice-storage'
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
      razorpay_signature,
      paymentType // 'initial_payment' or 'final_settlement'
    } = body

    const isFinalSettlement = paymentType === 'final_settlement'

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
    // Amount received is TOTAL (including GST)
    const totalAmount = productDetails?.amount || 59000 // Total amount in rupees (including 18% GST) - 50000 base + 18% GST

    // Calculate base amount (excluding GST): base = total / 1.18
    const paymentAmount = parseFloat((totalAmount / 1.18).toFixed(2))

    // Calculate GST amount: 18% of base amount
    const gstAmount = parseFloat((totalAmount - paymentAmount).toFixed(2))

    const customerEmail = customerDetails?.email || session?.user?.email || userInfo.email || 'guest@powerca.in'
    const customerName = customerDetails?.name || session?.user?.name || userInfo.name || 'Customer'

    // Check if user exists before saving payment
    let validUserId = null
    if (session?.user?.id) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (existingUser) {
        validUserId = session.user.id
      } else {
        logger.warn('Session user ID does not exist in users table, saving payment without user_id', {
          sessionUserId: session.user.id
        })
      }
    }

    // Save payment to database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: validUserId,
        order_id: normalizedOrderId,
        payment_id: normalizedPaymentId,
        signature: normalizedSignature,
        amount: totalAmount, // Store total amount (including GST) for payments table
        currency: 'INR',
        status: 'captured', // Use actual Razorpay payment status
        plan: productDetails?.name || 'PowerCA Implementation',
        email: customerEmail,
        phone: customerDetails?.phone || userInfo.phone,
        name: customerName,
        firm_name: customerDetails?.firmName || userInfo.firmName,
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

    // Create or update subscription for the user
    if (payment && session?.user?.id) {
      try {
        // Get order data to determine plan type and user count
        const { data: orderDataForSub } = await supabase
          .from('payment_orders')
          .select('plan_type, address_id, user_count')
          .eq('order_id', normalizedOrderId)
          .single()

        const planType = orderDataForSub?.plan_type || 'monthly'
        const addressId = orderDataForSub?.address_id
        const userCount = orderDataForSub?.user_count || 1

        // Calculate next due date based on plan type
        const now = new Date()
        let nextDueDate: Date | null = null

        switch (planType) {
          case 'monthly':
            nextDueDate = new Date(now)
            nextDueDate.setMonth(nextDueDate.getMonth() + 1)
            break
          case 'annual':
            nextDueDate = new Date(now)
            nextDueDate.setFullYear(nextDueDate.getFullYear() + 1)
            break
          case 'onetime':
            nextDueDate = null // Lifetime, no renewal
            break
          case 'installment':
            nextDueDate = new Date(now)
            nextDueDate.setMonth(nextDueDate.getMonth() + 1) // Monthly installment
            break
          default:
            nextDueDate = new Date(now)
            nextDueDate.setMonth(nextDueDate.getMonth() + 1)
        }

        // Check if user already has a subscription for this address
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('address_id', addressId)
          .single()

        if (existingSubscription) {
          // Update existing subscription with new plan type, user count, and next due date
          const { data: updatedSubscription, error: updateError } = await supabase
            .from('subscriptions')
            .update({
              plan_type: planType,
              user_count: userCount,
              status: 'active',
              current_period_start: now.toISOString(),
              current_period_end: nextDueDate?.toISOString() || null,
              next_due_date: nextDueDate?.toISOString() || null,
              updated_at: now.toISOString()
            })
            .eq('id', existingSubscription.id)
            .select()
            .single()

          if (updateError) {
            logger.error('Failed to update subscription', updateError)
          } else {
            logger.info('✅ Subscription updated', {
              subscriptionId: updatedSubscription.id,
              userId: session.user.id,
              planType: planType,
              nextDueDate: nextDueDate?.toISOString()
            })
          }
        } else {
          // Create new subscription
          const subscriptionData = {
            user_id: session.user.id,
            address_id: addressId,
            plan_type: planType,
            user_count: userCount,
            status: 'active',
            current_period_start: now.toISOString(),
            current_period_end: nextDueDate?.toISOString() || null,
            next_due_date: nextDueDate?.toISOString() || null
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
              userId: session.user.id,
              planType: planType,
              nextDueDate: nextDueDate?.toISOString()
            })
          }
        }
      } catch (subscriptionError) {
        logger.error('Error handling subscription', subscriptionError)
        // Don't fail payment if subscription creation fails
      }
    }

    // Generate invoice
    const invoiceNumber = generateInvoiceNumber(isTestPayment)

    // Get user_count from payment_orders for invoice
    const { data: orderForInvoice } = await supabase
      .from('payment_orders')
      .select('user_count')
      .eq('order_id', normalizedOrderId)
      .single()
    const invoiceUserCount = orderForInvoice?.user_count || 1

    // Use already calculated values (no need to recalculate GST)
    const subtotal = paymentAmount // Base amount (excluding GST)
    const gst = {
      cgstRate: 9,
      cgstAmount: gstAmount / 2,
      sgstRate: 9,
      sgstAmount: gstAmount / 2,
      totalTax: gstAmount
    }
    const grandTotal = totalAmount // Total amount (including GST)

    const invoiceData = {
      invoiceNumber,
      invoiceDate: new Date(),
      customerName: customerName,
      customerEmail: customerEmail,
      customerPhone: customerDetails?.phone || userInfo.phone,
      customerCompany: customerDetails?.firmName || userInfo.firmName || customerDetails?.company || userInfo.company,
      customerAddress: customerDetails?.address || userInfo.address,
      customerGSTN: customerDetails?.gst || userInfo.gstNumber,
      orderId: normalizedOrderId,
      paymentId: normalizedPaymentId,
      paymentDate: new Date(),
      items: [{
        description: isFinalSettlement
          ? 'PowerCA Final Settlement - Complete your service payment'
          : (productDetails?.name || 'PowerCA Implementation - Complete setup with first year subscription FREE'),
        quantity: 1,
        rate: subtotal,
        amount: subtotal,
      }],
      subtotal,
      ...gst,
      grandTotal,
      isTestMode: isTestPayment
    }

    // Generate PDF invoice and upload to storage
    let invoicePDF = null
    let storageUrl = null
    try {
      logger.info('Generating PDF invoice', { invoiceNumber })
      invoicePDF = await generateInvoicePDF(invoiceData)
      logger.info('PDF invoice generated successfully', {
        invoiceNumber,
        pdfSize: invoicePDF ? invoicePDF.length : 0
      })

      // Upload to Supabase Storage for future access
      if (invoicePDF) {
        storageUrl = await uploadInvoiceToStorage(invoiceNumber, invoicePDF)
        if (storageUrl) {
          logger.info('Invoice uploaded to storage', { invoiceNumber, storageUrl })
        }
      }
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
          user_count: invoiceUserCount,
        })

      if (invoiceError) {
        logger.error('Failed to create invoice record', invoiceError)
      }
    }

    // Send confirmation email
    if (customerEmail) {
      try {
        if (!resend) {
          logger.warn('Resend not configured, skipping confirmation email')
          return
        }
        logger.info('Sending payment confirmation email', {
          to: customerEmail,
          invoiceNumber,
          hasAttachment: !!invoicePDF
        })
        await resend.emails.send({
          from: 'PowerCA <contact@powerca.in>',
          to: customerEmail,
          subject: `${isTestPayment ? '🧪 [TEST] ' : ''}🎉 Payment Confirmation - Receipt ${invoiceNumber}`,
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
                      <span>📋 Receipt Number</span>
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

                  <p>📎 Your detailed receipt is attached as a PDF for your records.</p>
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
            filename: `PowerCA-Receipt-${invoiceNumber}.pdf`,
            content: Buffer.from(invoicePDF).toString('base64'),
          }] : [],
        })
        logger.info('Payment confirmation email sent successfully', {
          to: customerEmail,
          invoiceNumber,
          attachmentIncluded: !!invoicePDF
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
          // Commission is 10% of BASE amount (excluding GST)
          // Example: Monthly ₹100 × 5 users = ₹500 base → Commission = ₹50
          const commissionAmount = parseFloat((paymentAmount * 0.10).toFixed(2))

          const paymentReferralData = {
            payment_id: normalizedPaymentId,
            affiliate_profile_id: affiliateProfile.id,
            customer_email: customerEmail,
            customer_name: customerName,
            plan_id: body.planId || 'powerca-implementation',
            payment_amount: paymentAmount,
            commission_amount: commissionAmount
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

    // Update order status and handle new affiliate referral system
    try {
      // Get order with referral information
      const { data: orderData, error: orderError } = await supabase
        .from('payment_orders')
        .select('*')
        .eq('order_id', normalizedOrderId)
        .single()

      logger.info('📦 Payment order data retrieved', {
        orderId: normalizedOrderId,
        hasOrder: !!orderData,
        isAffiliatePurchase: orderData?.is_affiliate_purchase,
        referralCode: orderData?.referral_code,
        customerId: orderData?.customer_id,
        firmName: orderData?.firm_name,
        error: orderError?.message
      })

      // Update order status to paid
      await supabase
        .from('payment_orders')
        .update({ status: 'paid' })
        .eq('order_id', normalizedOrderId)

      // Handle new affiliate referral system (with customer_id)
      if (orderData?.is_affiliate_purchase && orderData.referral_code && orderData.customer_id) {
        logger.info('Processing affiliate referral purchase', {
          referralCode: orderData.referral_code,
          customerId: orderData.customer_id
        })

        // Find and update the affiliate_referrals record
        const { data: referralRecord, error: findReferralError } = await supabase
          .from('affiliate_referrals')
          .select('*')
          .eq('referral_code', orderData.referral_code)
          .eq('customer_id', orderData.customer_id)
          .eq('status', 'pending')
          .single()

        if (referralRecord && !findReferralError) {
          // Update referral status to completed
          const { error: updateError } = await supabase
            .from('affiliate_referrals')
            .update({
              status: 'completed',
              converted_at: new Date().toISOString(),
              payment_amount: paymentAmount, // Store base amount (excluding GST)
              order_id: normalizedOrderId,
              payment_id: normalizedPaymentId
            })
            .eq('id', referralRecord.id)

          if (updateError) {
            logger.error('Failed to update affiliate referral status', updateError)
          } else {
            logger.info('✅ Affiliate referral completed successfully', {
              referralId: referralRecord.id,
              customerId: orderData.customer_id,
              affiliateId: referralRecord.affiliate_id,
              amount: paymentAmount
            })

            // Create record in affiliate_referral_payments table
            try {
              const commissionRate = 10.00 // 10% commission
              // Commission is 10% of BASE amount (excluding GST)
              // Example: Monthly ₹100 × 5 users = ₹500 base → Commission = ₹50
              const commissionAmount = parseFloat((paymentAmount * (commissionRate / 100)).toFixed(2))

              const { data: affiliatePaymentRecord, error: paymentRecordError } = await supabase
                .from('affiliate_referral_payments')
                .insert({
                  referral_id: referralRecord.id,
                  referral_code: orderData.referral_code,
                  customer_id: orderData.customer_id,
                  affiliate_id: referralRecord.affiliate_id,

                  // Payment details
                  order_id: normalizedOrderId,
                  payment_id: normalizedPaymentId,
                  razorpay_signature: normalizedSignature,

                  // Customer information
                  customer_name: customerName,
                  customer_email: customerEmail,
                  customer_phone: customerDetails?.phone || orderData.customer_phone,
                  customer_firm_name: customerDetails?.firmName || orderData.firm_name,
                  customer_company: customerDetails?.company || orderData.company,
                  customer_gst: customerDetails?.gst || orderData.gst_number,
                  customer_address: customerDetails?.address,
                  customer_city: body.city,
                  customer_state: body.state,
                  customer_postcode: body.postcode,

                  // Amount details (properly structured)
                  payment_amount: paymentAmount,    // Base amount (e.g., 1.00)
                  currency: 'INR',
                  gst_amount: gstAmount,            // 18% GST (e.g., 0.18)
                  total_amount: totalAmount,        // Total with GST (e.g., 1.18)

                  // Product details
                  product_id: orderData.product_id || productDetails?.name,
                  plan_type: productDetails?.name || 'PowerCA Implementation',

                  // Commission (10% of BASE amount)
                  commission_amount: commissionAmount,  // e.g., 0.10 (10% of 1.00)
                  commission_rate: commissionRate,
                  commission_paid: false,

                  // Status
                  payment_status: 'completed',
                  payment_completed_at: new Date().toISOString(),

                  // Payment type for tracking two-stage commissions
                  payment_type: paymentType || 'initial_payment',

                  // Additional data
                  notes: {
                    invoice_number: invoiceNumber,
                    payment_date: new Date().toISOString(),
                    referral_source: 'affiliate_program'
                  }
                })
                .select()
                .single()

              if (paymentRecordError) {
                logger.error('❌ Failed to create affiliate_referral_payments record', paymentRecordError)
              } else {
                logger.info('✅ Affiliate referral payment record created', {
                  paymentRecordId: affiliatePaymentRecord.id,
                  affiliateId: referralRecord.affiliate_id,
                  commissionAmount: commissionAmount,
                  paymentAmount: paymentAmount
                })
              }
            } catch (paymentRecordError) {
              logger.error('Exception creating affiliate referral payment record', paymentRecordError)
            }
          }
        } else {
          logger.warn('Affiliate referral record not found or already processed', {
            referralCode: orderData.referral_code,
            customerId: orderData.customer_id,
            error: findReferralError?.message
          })
        }
      }
    } catch (orderUpdateError) {
      logger.error('Failed to update order status or process referral', orderUpdateError)
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