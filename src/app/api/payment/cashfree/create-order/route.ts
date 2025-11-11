import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import {
  createErrorResponse,
  ErrorType,
  handleConfigurationError,
  isServiceConfigured,
} from '@/lib/error-handler'

export async function POST(req: NextRequest) {
  try {
    logger.info('Creating Cashfree payment order')

    // ✅ Check if Cashfree is configured
    if (!isServiceConfigured('NEXT_PUBLIC_CASHFREE_APP_ID', 'CASHFREE_SECRET_KEY')) {
      return handleConfigurationError('Cashfree payment gateway')
    }

    const appId = process.env.NEXT_PUBLIC_CASHFREE_APP_ID
    const secretKey = process.env.CASHFREE_SECRET_KEY

    // Auto-detect the current domain from request headers
    const host = req.headers.get('host') || req.headers.get('x-forwarded-host')
    const protocol = req.headers.get('x-forwarded-proto') || 'https'
    const baseUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3009')

    if (!appId || !secretKey) {
      return handleConfigurationError('Cashfree credentials')
    }

    // ✅ Choose environment based on App ID prefix
    // Cashfree App IDs: TEST* = sandbox, production IDs start with numbers
    const environment = appId.toUpperCase().startsWith('TEST') ? 'sandbox' : 'production'
    const cashfreeApiUrl =
      environment === 'production'
        ? 'https://api.cashfree.com/pg'
        : 'https://sandbox.cashfree.com/pg'

    const session = await getServerSession(authOptions)

    // ✅ Enforce authentication - no guest checkout allowed
    if (!session || !session.user || !session.user.id) {
      logger.warn('Unauthenticated payment attempt blocked')
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Authentication required',
            code: 'AUTH_REQUIRED',
            details: 'You must be logged in to make a payment. Please log in and try again.'
          }
        },
        { status: 401 }
      )
    }

    const body = await req.json()

    const {
      amount,
      productId = 'powerca_implementation',
      planType = 'implementation',
      planId,
      _affiliateCode,
      customerDetails,
      referralInfo,
      country,
      address,
      city,
      state,
      postcode,
      gstNo,
      gstAmount,
      gstPercentage,
    } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment amount' },
        { status: 400 }
      )
    }

    // ✅ Create IDs
    const orderId = `POWERCA_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const invoiceNumber = `INV-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`

    const customerEmail =
      customerDetails?.email ||
      session.user.email ||
      body.email

    const customerId = customerEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()

    // ✅ GST Handling
    const gstNumber = (customerDetails?.gst || gstNo || '').trim().toUpperCase()
    const isValidGst =
      gstNumber &&
      gstNumber.length === 15 &&
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber)

    // ✅ Build payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cashfreeOrderPayload: any = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name:
          customerDetails?.name ||
          session.user.name ||
          body.name,
        customer_email: customerEmail,
        customer_phone: customerDetails?.phone || body.phone || '9999999999',
      },
      order_meta: {
        return_url: `${baseUrl}/payment-success?gateway=cashfree&orderId={order_id}`,
        notify_url: `${baseUrl}/api/payment/cashfree/webhook`,
      },
      order_note: `PowerCA ${planType} - ${productId}`,

      // ✅ FIXED: order_tags must be map<string, string>
      // Note: Only include fields with valid values - Cashfree rejects empty strings
      order_tags: {
        productId: String(productId),
        planType: String(planType || 'PowerCA Implementation'),
        ...(customerDetails?.company || body.company ? { company: String(customerDetails?.company || body.company) } : {}),
        ...(customerDetails?.firmName || body.firmName ? { firmName: String(customerDetails?.firmName || body.firmName) } : {}),
        ...(referralInfo?.referralCode ? { referralCode: String(referralInfo.referralCode) } : {}),
        ...(referralInfo?.customerId ? { customerId: String(referralInfo.customerId) } : {}),
        isAffiliatePurchase: referralInfo?.referralCode ? 'true' : 'false',
        invoice_number: String(invoiceNumber),
        invoice_date: new Date().toISOString(),
        invoice_name: `PowerCA Invoice - ${invoiceNumber}`,
        // Store address information for later retrieval
        ...(address && city && state && postcode ? {
          address: String(`${address}, ${city}, ${state} - ${postcode}`)
        } : {}),
        ...(country ? { country: String(country) } : {}),
      },
    }

    // ✅ GST field handling - Cashfree merchant account requires both 'gst' and 'gstin'
    // Based on error responses:
    // - 'gst' must be numeric and represents GST rate percentage (0, 5, 12, 18, 28)
    // - 'gstin' must be present (15-char alphanumeric GSTIN or placeholder)
    const gstRate = gstPercentage || 18 // Default to 18% GST for India
    cashfreeOrderPayload.order_tags.gst = String(gstRate)
    cashfreeOrderPayload.order_tags.gst_percentage = String(gstRate)

    // GSTIN is REQUIRED by merchant config - use actual GSTIN or standard placeholder
    if (isValidGst) {
      cashfreeOrderPayload.order_tags.gstin = String(gstNumber)
    } else {
      // Use standard unregistered GSTIN placeholder format: URP (Unregistered Person)
      // Format: State Code (29=Karnataka) + "URP" + PAN placeholder + "Z" + checksum
      cashfreeOrderPayload.order_tags.gstin = '29ZZZZZ9999Z9Z9'
    }

    // Add GST amount if provided
    if (gstAmount) {
      cashfreeOrderPayload.order_tags.gst_amount = String(gstAmount)
    }

    // ✅ API Call
    logger.info('Sending request to Cashfree', {
      url: `${cashfreeApiUrl}/orders`,
      orderId,
      amount,
      environment,
      hasGSTIN: !!cashfreeOrderPayload.order_tags.gstin
    })

    const cashfreeResponse = await fetch(`${cashfreeApiUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(cashfreeOrderPayload),
    })

    const cashfreeOrder = await cashfreeResponse.json()

    // Log the response for debugging
    if (!cashfreeResponse.ok) {
      logger.error('Cashfree API Error Response', {
        status: cashfreeResponse.status,
        statusText: cashfreeResponse.statusText,
        response: cashfreeOrder,
        requestPayload: {
          orderId: cashfreeOrderPayload.order_id,
          amount: cashfreeOrderPayload.order_amount,
          currency: cashfreeOrderPayload.order_currency,
          environment
        }
      })
    }

    if (!cashfreeResponse.ok) {
      logger.error('❌ Cashfree Order Failed', cashfreeOrder)

      // Check if it's an amount limit error
      const errorMessage = cashfreeOrder.message || cashfreeOrder.error?.message || ''
      const isAmountLimitError = errorMessage.toLowerCase().includes('max order amount') ||
                                  errorMessage.toLowerCase().includes('amount limit')

      let userFriendlyMessage = errorMessage || 'Failed to create Cashfree order'

      if (isAmountLimitError && environment === 'sandbox') {
        userFriendlyMessage = `Cashfree Sandbox has a transaction limit (typically ₹10,000 max). Your order amount (₹${amount.toLocaleString()}) exceeds this limit. Please either:\n\n1. Use Production Cashfree credentials for real payments\n2. Use Razorpay payment gateway instead\n3. Contact support for assistance`
      }

      // Log to console for easier debugging
      console.error('Cashfree Order Creation Failed:', {
        status: cashfreeResponse.status,
        message: userFriendlyMessage,
        fullError: cashfreeOrder,
        requestAmount: amount,
        environment
      })

      return NextResponse.json(
        {
          success: false,
          error: {
            message: userFriendlyMessage,
            code: isAmountLimitError ? 'AMOUNT_LIMIT_EXCEEDED' : 'CASHFREE_ERROR',
            environment,
            amount,
            fullError: cashfreeOrder, // Include full error for debugging
            details: cashfreeOrder,
          },
        },
        { status: cashfreeResponse.status }
      )
    }

    // ✅ Store order in DB
    try {
      const supabase = createAdminClient()

      // Construct full address for storage
      const fullAddress = (address && city && state && postcode)
        ? `${address}, ${city}, ${state} - ${postcode}`
        : null

      const { error } = await supabase.from('payment_orders').insert({
        order_id: orderId,
        amount,
        currency: 'INR',
        status: 'created',
        customer_email: customerEmail,
        customer_name:
          customerDetails?.name || session.user.name || body.name,
        customer_phone: customerDetails?.phone || body.phone,
        company: customerDetails?.company || body.company,
        firm_name: customerDetails?.firmName || body.firmName,
        gst_number: customerDetails?.gst || gstNo || body.gstNo,
        product_id: productId || planId,
        referral_code: referralInfo?.referralCode || null,
        customer_id: referralInfo?.customerId || null,
        is_affiliate_purchase: !!referralInfo?.referralCode,
        user_id: session.user.id, // ✅ Always valid - auth check above ensures this exists
        customer_address: fullAddress,
        customer_country: country || null,
        customer_city: city || null,
        customer_state: state || null,
        customer_postcode: postcode || null,
      })

      if (error) {
        logger.error('❌ Failed to save order to database', error)
      } else {
        logger.info('✅ Order saved to database', { orderId })
      }
    } catch (dbError) {
      logger.error('DB insert error', { dbError })
    }

    logger.info('✅ Cashfree order created', { orderId })

    return NextResponse.json({
      success: true,
      orderId,
      invoiceNumber,
      paymentSessionId: cashfreeOrder.payment_session_id,
      environment,
      order: cashfreeOrder,
    })
  } catch (error) {
    return createErrorResponse(ErrorType.PAYMENT, error as Error, {
      logError: true,
    })
  }
}
