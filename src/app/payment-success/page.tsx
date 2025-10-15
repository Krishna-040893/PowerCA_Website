'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowRight, Download, Mail, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'
import { trackPurchase } from '@/components/google-analytics'
import { trackGTMPurchase } from '@/components/google-tag-manager'

interface InvoiceData {
  invoice_number: string
  amount: number
  gst: number
  total: number
  status: string
  created_at: string
  payment: {
    order_id: string
    payment_id: string
    name: string
    email: string
    phone?: string
    company?: string
    address?: string
    gst_number?: string
    amount: number
  }
}

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isTestMode, setIsTestMode] = useState(false)
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    // Check if it's a test payment
    const testParam = searchParams.get('test')
    const invoiceNumber = searchParams.get('invoiceNumber')
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
          item_name: 'PowerCA Implementation',
          price: amount,
          quantity: 1
        }]
      })
    }

    // Fetch invoice data if invoice number is provided
    if (invoiceNumber) {
      fetch(`/api/invoice/${invoiceNumber}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setInvoiceData(data.data)
          }
          setIsLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch invoice:', err)
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }

    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }, [searchParams])

  const handleDownloadInvoice = () => {
    setIsDownloading(true)
    // In a real implementation, this would generate and download the PDF
    window.print()
    setTimeout(() => setIsDownloading(false), 1000)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
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

        <Card className="shadow-xl border-green-200">
          <CardHeader className="text-center bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="mx-auto mb-4">
              <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
            </div>
            <CardTitle className="text-3xl text-green-800">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              Welcome to PowerCA Family
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                <span className="ml-3 text-gray-600">Loading invoice details...</span>
              </div>
            ) : invoiceData ? (
              <>
                {/* Invoice Details */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">Tax Invoice</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{invoiceData.invoice_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{formatDate(invoiceData.created_at)}</p>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Bill To */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Bill To</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium text-gray-900">{invoiceData.payment.name}</p>
                          {invoiceData.payment.company && <p>{invoiceData.payment.company}</p>}
                          <p>{invoiceData.payment.email}</p>
                          {invoiceData.payment.phone && <p>{invoiceData.payment.phone}</p>}
                          {invoiceData.payment.gst_number && (
                            <p className="mt-2">
                              <span className="font-medium">GSTIN:</span> {invoiceData.payment.gst_number}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Payment Details</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Order ID:</span>{' '}
                            <span className="font-mono text-xs">{invoiceData.payment.order_id}</span>
                          </p>
                          <p>
                            <span className="font-medium">Payment ID:</span>{' '}
                            <span className="font-mono text-xs">{invoiceData.payment.payment_id}</span>
                          </p>
                          <p>
                            <span className="font-medium">Status:</span>{' '}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Paid
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items & Amount Breakdown */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-4 py-4">
                          <div className="font-medium text-gray-900">PowerCA Implementation</div>
                          <div className="text-sm text-gray-500 mt-1">
                            Complete setup with first year subscription FREE
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-medium">{formatCurrency(invoiceData.amount)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600">GST (18%)</td>
                        <td className="px-4 py-3 text-right text-sm">{formatCurrency(invoiceData.gst)}</td>
                      </tr>
                      <tr className="bg-green-50">
                        <td className="px-4 py-4 font-bold text-gray-900">Grand Total</td>
                        <td className="px-4 py-4 text-right font-bold text-xl text-green-700">
                          {formatCurrency(invoiceData.total)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-3">Order Confirmed</h3>
                <p className="text-gray-600">
                  Your payment has been successfully processed. You will receive a confirmation email with your invoice shortly.
                </p>
              </div>
            )}

            {/* What's Next Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What happens next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-1 mr-3 mt-0.5">
                    <Mail className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium">Check your email</p>
                    <p className="text-sm text-gray-600">
                      We've sent your invoice and confirmation details to your email
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-1 mr-3 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium">Account setup</p>
                    <p className="text-sm text-gray-600">
                      Our team will contact you within 24 hours to begin setup
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-primary-100 rounded-full p-1 mr-3 mt-0.5">
                    <Download className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium">Download invoice</p>
                    <p className="text-sm text-gray-600">
                      Your GST invoice is ready for download and has been emailed to you
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Support Section */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Need help?</strong> Our support team is available 24/7.
                Call us at <a href="tel:+919876543210" className="underline">+91 98765 43210</a> or
                email <a href="mailto:support@powerca.in" className="underline">support@powerca.in</a>
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 bg-gray-50">
            <Button
              className="w-full sm:flex-1 bg-primary-600 hover:bg-primary-700"
              asChild
            >
              <Link href="/">
                Back to Home
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full sm:flex-1"
              onClick={handleDownloadInvoice}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2 w-4 h-4" />
                  Download Invoice
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment status...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
