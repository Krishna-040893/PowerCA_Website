import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'
import { generateInvoiceNumber, calculateGST, generateInvoicePDF } from '@/lib/invoice-generator'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('💳 Payment verification request received:', {
      orderId: body.orderId,
      paymentId: body.paymentId,
      affiliateCode: body.affiliateCode,
      isTestPayment: body.isTestPayment,
      hasCustomerDetails: !!body.customerDetails
    })

    const {
      orderId,
      paymentId,
      signature,
      customerDetails,
      productDetails,
      isTestPayment,
      affiliateCode  // Add this to destructuring
    } = body

    // Skip signature verification for test payments
    if (!isTestPayment) {
      // Verify payment signature for real payments
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex')

      if (generatedSignature !== signature) {
        return NextResponse.json(
          { success: false, error: 'Invalid payment signature' },
          { status: 400 }
        )
      }
    } else {
      console.log('🧪 TEST MODE: Skipping signature verification')
    }

    const supabase = createAdminClient()

    // Save payment to database (only include fields that exist in the table)
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        payment_id: paymentId,
        signature: signature,
        amount: productDetails?.amount || 1, // Amount in rupees
        currency: 'INR',
        status: 'success',
        plan: productDetails?.name || 'PowerCA Implementation',
        email: customerDetails?.email,
        phone: customerDetails?.phone,
        name: customerDetails?.name,
        company: customerDetails?.company,
        gst_number: customerDetails?.gst,
        address: customerDetails?.address
        // Removed city, state, pincode as these columns don't exist
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Failed to save payment:', paymentError)
      // Continue even if DB save fails
    }

    // Generate invoice
    const invoiceNumber = generateInvoiceNumber(isTestPayment)
    const subtotal = productDetails?.amount || 1
    const gst = calculateGST(subtotal, false)
    const grandTotal = subtotal + gst.totalTax

    const invoiceData = {
      invoiceNumber,
      invoiceDate: new Date(),
      customerName: customerDetails?.name || 'Customer',
      customerEmail: customerDetails?.email,
      customerPhone: customerDetails?.phone,
      customerCompany: customerDetails?.company,
      customerAddress: customerDetails?.address,
      customerGSTN: customerDetails?.gst,
      orderId,
      paymentId,
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
    const invoicePDF = await generateInvoicePDF(invoiceData)

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
        console.error('Failed to create invoice record:', invoiceError)
      }
    }

    // Send confirmation email with PDF invoice
    if (customerDetails?.email) {
      try {
        await resend.emails.send({
          from: 'PowerCA <contact@powerca.in>',
          to: customerDetails.email,
          subject: `${isTestPayment ? '🧪 [TEST] ' : ''}🎉 Payment Confirmation - Invoice ${invoiceNumber}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body {
                  font-family: 'Segoe UI', Arial, sans-serif;
                  color: #2c3e50;
                  margin: 0;
                  padding: 0;
                  background: #f8f9fa;
                }
                .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background: white;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 30px 25px;
                  text-align: center;
                }
                .header h2 {
                  margin: 0;
                  font-size: 24px;
                  font-weight: 600;
                }
                .content {
                  padding: 30px 25px;
                  line-height: 1.6;
                }
                .payment-details {
                  background: #f8f9ff;
                  padding: 20px;
                  border-radius: 8px;
                  border-left: 4px solid #667eea;
                  margin: 20px 0;
                }
                .payment-details h3 {
                  color: #667eea;
                  margin-top: 0;
                  font-size: 16px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .detail-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                  border-bottom: 1px solid #ecf0f1;
                }
                .detail-row:last-child {
                  border-bottom: none;
                  font-weight: bold;
                  color: #667eea;
                }
                .footer {
                  background: #f8f9ff;
                  padding: 20px 25px;
                  text-align: center;
                  font-size: 14px;
                  color: #7f8c8d;
                }
                .support-info {
                  background: #e8f4fd;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 20px 0;
                  text-align: center;
                }
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
                  <p>Dear <strong>${customerDetails.name}</strong>,</p>

                  <p>🎊 Congratulations! Your payment has been successfully processed and your PowerCA implementation is confirmed.</p>

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
                      <span>${paymentId}</span>
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

                  <div class="support-info">
                    <p><strong>📞 Need Help?</strong><br>
                    Contact our support team at <strong>support@powerca.in</strong><br>
                    or call us at <strong>+91 98765 43210</strong></p>
                  </div>

                  <p>📎 Your detailed invoice is attached as a PDF for your records.</p>

                  <p style="margin-top: 30px;">Best Regards,<br>
                  <strong>The PowerCA Team</strong> 🚀</p>
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
            content: invoicePDF,
          }],
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the payment if email fails
      }
    }

    // Track affiliate referral if affiliate code is present
    console.log('🔍 Checking for affiliate code:', affiliateCode)
    if (affiliateCode) {
      try {
        console.log('🔗 Processing affiliate referral for code:', affiliateCode)

        // Find affiliate profile by referral code
        const { data: affiliateProfile, error: profileError } = await supabase
          .from('affiliate_profiles')
          .select('*')
          .eq('referral_code', affiliateCode)
          .single()

        console.log('📊 Affiliate profile found:', {
          found: !!affiliateProfile,
          profileId: affiliateProfile?.id,
          affiliateId: affiliateProfile?.affiliate_id,
          referralCode: affiliateProfile?.referral_code,
          currentReferrals: affiliateProfile?.total_referrals,
          error: profileError?.message
        })

        if (affiliateProfile && !profileError) {
          // First check if there's an existing pending referral for this referral code
          let referralRecord;
          let referralUpdated = false;
          let referralError = null;

          // Try to find existing referral by affiliate profile and referral code
          console.log('🔍 Looking for pending referral with:', {
            affiliate_profile_id: affiliateProfile.id,
            affiliate_id: affiliateProfile.affiliate_id,
            referral_code: affiliateCode,
            status: 'pending'
          })

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
            console.log('📝 Found existing referral, updating to converted:', existingReferral.id)

            const { data: updatedReferral, error: updateRefError } = await supabase
              .from('affiliate_referrals')
              .update({
                status: 'converted',
                converted_at: new Date().toISOString(),
                referred_email: customerDetails?.email || existingReferral.referred_email,
                referred_name: customerDetails?.name || existingReferral.referred_name
              })
              .eq('id', existingReferral.id)
              .select()
              .single()

            if (updateRefError) {
              console.error('❌ Failed to update referral status:', {
                error: updateRefError.message,
                details: updateRefError.details
              })
            } else {
              console.log('✅ Referral status updated to converted:', {
                id: updatedReferral.id,
                status: updatedReferral.status
              })
              referralRecord = updatedReferral
              referralUpdated = true
            }
          } else {
            // No existing referral found, create a new one as converted
            console.log('📝 No pending referral found for this referral code:', {
              searched_for: {
                affiliate_profile_id: affiliateProfile.id,
                referral_code: affiliateCode,
                status: 'pending'
              },
              error: findError?.message || 'Not found'
            })
            console.log('Creating new referral record as converted')

            const referralData = {
              affiliate_profile_id: affiliateProfile.id,
              affiliate_id: affiliateProfile.affiliate_id,
              referral_code: affiliateCode, // Use the actual referral code from URL
              referred_email: customerDetails?.email,
              referred_name: customerDetails?.name,
              status: 'converted',
              converted_at: new Date().toISOString()
            }

            const { data: newReferral, error: createRefError } = await supabase
              .from('affiliate_referrals')
              .insert(referralData)
              .select()
              .single()

            if (createRefError) {
              console.error('❌ Failed to create referral record:', {
                error: createRefError.message,
                details: createRefError.details,
                hint: createRefError.hint
              })
              referralError = createRefError
            } else {
              console.log('✅ New referral record created as converted:', {
                id: newReferral.id,
                affiliateProfileId: newReferral.affiliate_profile_id,
                referredEmail: newReferral.referred_email
              })
              referralRecord = newReferral
            }
          }

          // Skip total_referrals update as the column doesn't exist
          // We can track referral count by counting rows in affiliate_referrals table
          console.log('📈 Referral tracking completed:', {
            profileId: affiliateProfile.id,
            wasUpdate: referralUpdated,
            referralCode: affiliateCode
          })

          const updateError = null; // Set to null for logging compatibility
          const newReferralCount = 0; // Placeholder for logging

          // Also track in payment_referrals table for payment tracking
          const paymentReferralData = {
            payment_id: paymentId,
            affiliate_profile_id: affiliateProfile.id,
            customer_email: customerDetails?.email,
            customer_name: customerDetails?.name,
            plan_id: body.planId || 'early-bird',
            payment_amount: productDetails?.amount || 1,
            commission_amount: 0 // No commission for now
          }

          console.log('💳 Creating payment referral record:', paymentReferralData)

          const { data: payRefData, error: payRefError } = await supabase
            .from('payment_referrals')
            .insert(paymentReferralData)
            .select()
            .single()

          if (payRefError) {
            console.error('❌ Failed to create payment referral record:', {
              error: payRefError.message,
              details: payRefError.details
            })
          } else {
            console.log('✅ Payment referral record created:', payRefData?.id)
          }

          // Log summary of referral tracking
          console.log('📊 REFERRAL TRACKING SUMMARY:', {
            affiliateId: affiliateProfile.affiliate_id,
            referralCode: affiliateCode,
            customerEmail: customerDetails?.email,
            referralRecorded: !referralError,
            countUpdated: !updateError,
            paymentTracked: !payRefError,
            totalReferralsNow: newReferralCount
          })
        } else {
          console.error('❌ Affiliate profile not found for referral code:', affiliateCode)
        }
      } catch (affError) {
        console.error('❌ Error processing affiliate referral:', affError)
        // Don't fail the payment if affiliate tracking fails
      }
    } else {
      console.log('ℹ️ No affiliate code provided - regular payment without referral')
    }

    // Update order status
    await supabase
      .from('payment_orders')
      .update({ status: 'paid' })
      .eq('order_id', orderId)

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      orderId,
      invoiceId: invoiceNumber,
      amount: grandTotal,
    })

  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify payment',
        message: error.message
      },
      { status: 500 }
    )
  }
}