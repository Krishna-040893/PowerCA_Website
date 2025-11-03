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

    console.log('🔧 Cashfree Environment Detection:', {
      appId: appId.substring(0, 10) + '...', // Log partial for security
      detectedEnvironment: environment,
      appBaseUrl: baseUrl,
      cashfreeApiUrl,
      returnUrl: `${baseUrl}/payment-success?gateway=cashfree&orderId={order_id}`,
      notifyUrl: `${baseUrl}/api/payment/cashfree/webhook`
    })

    const session = await getServerSession(authOptions)
    const body = await req.json()

    const {
      amount,
      productId = 'powerca_implementation',
      planType = 'implementation',
      planId,
      affiliateCode,
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
      session?.user?.email ||
      body.email ||
      'guest@powerca.in'

    const customerId = customerEmail.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()

    // ✅ GST Handling
    const gstNumber = (customerDetails?.gst || gstNo || '').trim().toUpperCase()
    const isValidGst =
      gstNumber &&
      gstNumber.length === 15 &&
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber)

    const gstNumeric = isValidGst
      ? gstNumber.substring(0, 2) + gstNumber.substring(5, 9)
      : '000000'

    // ✅ Build payload
    const cashfreeOrderPayload: any = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name:
          customerDetails?.name ||
          session?.user?.name ||
          body.name ||
          'Guest User',
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

    // ✅ Debug Log
    console.log('📦 Cashfree Order Payload:', cashfreeOrderPayload)

    // ✅ API Call
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

    if (!cashfreeResponse.ok) {
      logger.error('❌ Cashfree Order Failed', cashfreeOrder)
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              cashfreeOrder.message ||
              cashfreeOrder.error?.message ||
              'Failed to create Cashfree order',
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
          customerDetails?.name || session?.user?.name || body.name,
        customer_phone: customerDetails?.phone || body.phone,
        company: customerDetails?.company || body.company,
        firm_name: customerDetails?.firmName || body.firmName,
        gst_number: customerDetails?.gst || gstNo || body.gstNo,
        product_id: productId || planId,
        referral_code: referralInfo?.referralCode || null,
        customer_id: referralInfo?.customerId || null,
        is_affiliate_purchase: !!referralInfo?.referralCode,
        user_id: session?.user?.id || null,
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
