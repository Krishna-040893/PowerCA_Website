'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowLeft, Download, Mail, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import confetti from 'canvas-confetti'
import { trackPurchase } from '@/components/google-analytics'
import { trackGTMPurchase } from '@/components/google-tag-manager'

interface InvoiceData {
  invoice_number: string
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
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [isTestMode, setIsTestMode] = useState(false)
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

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

  const handleDownloadInvoice = async () => {
    if (!invoiceData?.invoice_number) {
      alert('Invoice not available for download')
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch(`/api/invoice/download/${invoiceData.invoice_number}`)

      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PowerCA-Invoice-${invoiceData.invoice_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download invoice:', error)
      alert('Failed to download invoice. Please try again or contact support.')
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
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Calculate GST breakdown (18% total: 9% CGST + 9% SGST for intra-state)
  const calculateGSTBreakdown = (baseAmount: number) => {
    const gstRate = 0.18
    const totalGST = baseAmount * gstRate
    return {
      cgst: totalGST / 2,
      sgst: totalGST / 2,
      total: totalGST
    }
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
          <CardHeader className="text-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-b border-green-100 pb-8">
            <div className="mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto relative drop-shadow-lg" strokeWidth={2} />
            </div>
            <CardTitle className="text-4xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-xl text-gray-600 font-medium">
              Welcome to the PowerCA Family
            </CardDescription>
            <div className="flex justify-center mt-6">
              <Image
                src="/images/Group 12.png"
                alt="PowerCA Logo"
                width={220}
                height={220}
                className="object-contain drop-shadow-md"
              />
            </div>
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
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-200 shadow-md">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Tax Invoice</h3>
                      <p className="text-2xl font-bold text-gray-900">{invoiceData.invoice_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">Date</p>
                      <p className="font-semibold text-gray-900">{formatDate(invoiceData.issued_at)}</p>
                    </div>
                  </div>

                  <div className="border-t border-blue-200 pt-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Bill To */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Billing Address</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="font-medium text-gray-900">{invoiceData.payment.name}</p>
                          {(invoiceData.payment.firm_name || invoiceData.payment.company) && (
                            <p>{invoiceData.payment.firm_name || invoiceData.payment.company}</p>
                          )}
                          {invoiceData.payment.address && <p>{invoiceData.payment.address}</p>}
                          {invoiceData.payment.phone && <p>{invoiceData.payment.phone}</p>}
                          <p>{invoiceData.payment.email}</p>
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
                        <td className="px-4 py-3 text-sm text-gray-600">CGST (9%)</td>
                        <td className="px-4 py-3 text-right text-sm">{formatCurrency(calculateGSTBreakdown(invoiceData.amount).cgst)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm text-gray-600">SGST (9%)</td>
                        <td className="px-4 py-3 text-right text-sm">{formatCurrency(calculateGSTBreakdown(invoiceData.amount).sgst)}</td>
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
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-100 pt-6">
            <Button
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
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
            <Button
              variant="outline"
              className="w-full sm:flex-1 font-semibold border-2 hover:bg-gray-50 transition-all duration-200"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Home
              </Link>
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
