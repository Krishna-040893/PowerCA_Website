import { NextResponse } from 'next/server'

export async function GET() {
  const keyId = process.env.RAZORPAY_KEY_ID

  return NextResponse.json({
    keyIdPrefix: keyId?.substring(0, 15),
    isLiveMode: keyId?.startsWith('rzp_live'),
    hasKey: !!keyId
  })
}
