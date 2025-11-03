import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Debug endpoint to test payment insert
 * Tests if we can insert a payment record with Cashfree payment structure
 */
export async function GET() {
  try {
    const supabase = createAdminClient()

    // Test data matching what we try to insert from Cashfree
    const testPaymentData = {
      user_id: null, // Allow null for guest purchases
      order_id: `TEST_${Date.now()}`,
      payment_id: `CF_TEST_${Date.now()}`,
      amount: 12.98,
      currency: 'INR',
      status: 'captured',
      plan: 'powerca_implementation',
      email: 'test@example.com',
      phone: '9999999999',
      name: 'Test User',
      firm_name: 'Test Firm',
      company: 'Test Company',
      gst_number: '29AAAA0000A1Z5',
      address: 'Test Address'
    }

    console.log('Attempting to insert test payment:', testPaymentData)

    const { data, error } = await supabase
      .from('payments')
      .insert(testPaymentData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        },
        testData: testPaymentData
      }, { status: 500 })
    }

    // Clean up test record
    if (data) {
      await supabase
        .from('payments')
        .delete()
        .eq('id', data.id)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment insert test passed',
      insertedId: data?.id,
      testData: testPaymentData
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    }, { status: 500 })
  }
}
