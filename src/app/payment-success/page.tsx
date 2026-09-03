
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowLeft, Download, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { trackPurchase } from '@/components/google-analytics'
import { trackGTMPurchase } from '@/components/google-tag-manager'

interface ReceiptData {
  invoice_number: string  // Keep field name for API compatibility
  amount: number
  gst: number
  total: number
  status: string
  issued_at: string
  payment: {
    order_id: string
    payment_id: string
    name: string
    email: string
    phone?: string
    firm_name?: string
    company?: string
    address?: string
    gst_number?: string
    amount: number
    created_at: string
  }
  discount_info?: {
    discount_percentage: number
    discount_amount: number
    original_amount: number | null
  }
  user_info?: {
    user_count: number
    plan_type: string
  }
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isTestMode, setIsTestMode] = useState(false)
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'cancelled' | 'failed' | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    // Check if it's a test payment
    const testParam = searchParams.get('test')
    const invoiceNumber = searchParams.get('invoiceNumber') || searchParams.get('invoiceId')
    const amount = parseFloat(searchParams.get('amount') || '0')

    if (testParam === 'true') {
      setIsTestMode(true)
    } else {
      // Track successful purchase in Google Analytics and GTM (only for real payments)
      trackPurchase(amount, 'powerca-implementation')

      // Track in Google Tag Manager for enhanced ecommerce
      trackGTMPurchase({
        transaction_id: invoiceNumber || `order_${Date.now()}`,
        value: amount,
        currency: 'INR',
        items: [{
          item_id: 'powerca-implementation',
          item_name: 'Power CA Implementation',
          price: amount,
          quantity: 1
        }]
      })
    }

    // Fetch receipt data if invoice number is provided
    if (invoiceNumber) {
      fetch(`/api/invoice/${invoiceNumber}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setReceiptData(data.data)
          }
          setIsLoading(false)
        })
        .catch(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Separate effect for confetti animation
  useEffect(() => {
    // Trigger confetti animation only on success
    if (paymentStatus === 'success' || receiptData) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [paymentStatus, receiptData])

  const handleDownloadReceipt = async () => {
    if (!receiptData?.invoice_number) {
      alert('Receipt not available for download')
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch(`/api/invoice/download/${receiptData.invoice_number}?regenerate=true`)

      if (!response.ok) {
        throw new Error('Failed to download receipt')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PowerCA-Receipt-${receiptData.invoice_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading receipt:', err)
      alert('Failed to download receipt. Please try again or contact support.')
    } finally {
      setIsDownloading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) {
      return 'Invalid Date'
    }
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Test Mode Banner */}
        {isTestMode && (
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-yellow-800">🧪 Test Payment Successful</p>
              <p className="text-sm text-yellow-700">
                This was a test payment. No real money was charged. All systems processed the payment as if it were real.
              </p>
            </div>
          </div>
        )}

        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Show different headers based on payment status */}
          {paymentStatus === 'cancelled' || paymentStatus === 'failed' || paymentStatus === 'pending' ? (
            <CardHeader className={`text-center border-b pb-8 ${
              paymentStatus === 'cancelled' ? 'bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 border-orange-100' :
              paymentStatus === 'failed' ? 'bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border-red-100' :
              'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-100'
            }`}>
              <div className="mx-auto mb-4 relative">
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 ${
                  paymentStatus === 'cancelled' ? 'bg-orange-400' :
                  paymentStatus === 'failed' ? 'bg-red-400' :
                  'bg-blue-400'
                }`}></div>
                {paymentStatus === 'cancelled' && (
                  <AlertCircle className="w-16 h-16 text-orange-600 mx-auto relative drop-shadow-lg" strokeWidth={2} />
                )}
                {paymentStatus === 'failed' && (
                  <AlertCircle className="w-16 h-16 text-red-600 mx-auto relative drop-shadow-lg" strokeWidth={2} />
                )}
                {paymentStatus === 'pending' && (
                  <Loader2 className="w-16 h-16 text-blue-600 mx-auto relative drop-shadow-lg animate-spin" strokeWidth={2} />
                )}
              </div>
              <CardTitle className="text-4xl font-bold text-gray-900 mb-2">
                {paymentStatus === 'cancelled' && 'Payment Cancelled'}
                {paymentStatus === 'failed' && 'Payment Failed'}
                {paymentStatus === 'pending' && 'Payment Pending'}
              </CardTitle>
              <CardDescription className="text-xl text-gray-600 font-medium">
                {paymentStatus === 'cancelled' && 'Your payment was not completed'}
                {paymentStatus === 'failed' && 'We could not process your payment'}
                {paymentStatus === 'pending' && 'Your payment is being verified'}
              </CardDescription>
            </CardHeader>
          ) : (
            <CardHeader className="text-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-b border-green-100 pb-4">
              <div className="mx-auto mb-2 relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto relative drop-shadow-lg" strokeWidth={2} />
              </div>
              <CardTitle className="text-4xl font-bold text-gray-900">
                Payment Successfully
              </CardTitle>
            </CardHeader>
          )}

          <CardContent className="space-y-6 pt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <span className="ml-3 text-gray-600">Loading receipt details...</span>
              </div>
            ) : paymentStatus === 'cancelled' || paymentStatus === 'failed' || paymentStatus === 'pending' ? (
              <div className={`rounded-lg p-6 ${
                paymentStatus === 'cancelled' ? 'bg-orange-50 border border-orange-200' :
                paymentStatus === 'failed' ? 'bg-red-50 border border-red-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <h3 className="font-semibold text-lg mb-3">
                  {paymentStatus === 'cancelled' && 'What happened?'}
                  {paymentStatus === 'failed' && 'What went wrong?'}
                  {paymentStatus === 'pending' && 'What\'s next?'}
                </h3>
                <p className="text-gray-600 mb-4">{errorMessage}</p>

                {paymentStatus === 'cancelled' && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">
                      <strong>No charges were made to your account.</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      You can try again by clicking the button below to return to the checkout page.
                    </p>
                  </div>
                )}

                {paymentStatus === 'failed' && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700">
                      <strong>If money was deducted from your account:</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>It will be automatically refunded within 5-7 business days</li>
                      <li>Contact your bank if you don't receive the refund</li>
                      <li>Contact our support team with your order ID</li>
                    </ul>
                  </div>
                )}

                {paymentStatus === 'pending' && (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Your payment is being processed by the bank. This usually takes a few minutes.
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Check your email for payment confirmation</li>
                      <li>Refresh this page in 2-3 minutes</li>
                      <li>Contact support if status doesn't update in 30 minutes</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : receiptData ? (
              <>
                {/* Amount Paid */}
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-1">Amount Paid</p>
                  <p className="text-5xl font-bold text-green-700">{formatCurrency(receiptData.total)}</p>
                  <span className="inline-flex items-center px-3 py-1 mt-3 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Payment Confirmed
                  </span>
                </div>

                {/* Payment Details */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Payment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Receipt No</span>
                      <span className="text-sm font-semibold text-gray-900">{receiptData.invoice_number}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Date</span>
                      <span className="text-sm font-semibold text-gray-900">{formatDate(receiptData.issued_at)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Order ID</span>
                      <span className="text-sm font-mono text-gray-900">{receiptData.payment.order_id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Payment ID</span>
                      <span className="text-sm font-mono text-gray-900">{receiptData.payment.payment_id}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                      <span className="text-sm text-gray-600">Paid by</span>
                      <span className="text-sm font-semibold text-gray-900">{receiptData.payment.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Email</span>
                      <span className="text-sm text-gray-900">{receiptData.payment.email}</span>
                    </div>
                    {(() => {
                      const userCountVal = receiptData.user_info?.user_count || parseInt(searchParams.get('userCount') || '0')
                      return userCountVal > 1 ? (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Users</span>
                          <span className="text-sm font-semibold text-gray-900">{userCountVal} users</span>
                        </div>
                      ) : null
                    })()}
                    {(() => {
                      const planTypeVal = receiptData.user_info?.plan_type || searchParams.get('planType')
                      const getPlanName = (pt: string | null) => {
                        switch (pt) {
                          case 'monthly': return 'Monthly Subscription'
                          case 'annual': return 'Annual Subscription'
                          case 'onetime': return '2 Year Pack'
                          default: return 'Power CA Implementation'
                        }
                      }
                      return (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Plan</span>
                          <span className="text-sm font-semibold text-gray-900">{getPlanName(planTypeVal)}</span>
                        </div>
                      )
                    })()}
                  </div>
                </div>

              </>
            ) : (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3">Order Confirmed</h3>
                <p className="text-gray-600">
                  Your payment has been successfully processed. You will receive a confirmation email with your receipt shortly.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-100 pt-6">
            {paymentStatus === 'cancelled' || paymentStatus === 'failed' ? (
              <>
                <Button
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  asChild
                >
                  <Link href="/checkout">
                    Try Again
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 font-semibold border-2 hover:bg-gray-50 transition-all duration-200"
                  asChild
                >
                  <Link href="/contact">
                    Contact Support
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 font-semibold border-2 hover:bg-gray-50 transition-all duration-200"
                  onClick={() => router.push('/account')}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Dashboard
                </Button>
              </>
            ) : paymentStatus === 'pending' ? (
              <>
                <Button
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={() => window.location.reload()}
                >
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Refresh Status
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 font-semibold border-2 hover:bg-gray-50 transition-all duration-200"
                  asChild
                >
                  <Link href="/contact">
                    Contact Support
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  onClick={handleDownloadReceipt}
                  disabled={isDownloading || !receiptData}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 w-4 h-4" />
                      Download Receipt
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:flex-1 font-semibold border-2 hover:bg-gray-50 transition-all duration-200"
                  onClick={() => router.push('/account')}
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Dashboard
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading payment status...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
