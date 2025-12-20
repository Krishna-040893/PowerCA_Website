'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CheckCircle, Mail, Home, Loader2, AlertCircle, FileText } from 'lucide-react'
import Link from 'next/link'
import confetti from 'canvas-confetti'

interface OrderDetails {
  orderId: string
  email: string
  name: string
  productName: string
  amount: number
}

function SuccessContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)

  const handleDownloadInvoice = async () => {
    if (!token) return

    setDownloadingInvoice(true)
    try {
      const response = await fetch(`/api/payment/app-download/invoice?token=${token}`)

      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PowerCA_Invoice_Demo_Version.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading invoice:', err)
      alert('Failed to download invoice. Please try again.')
    } finally {
      setDownloadingInvoice(false)
    }
  }

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!token) {
        setError('Invalid access. No token provided.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/payment/app-download/success-details?token=${token}`)
        const data = await response.json()

        if (data.success) {
          setOrderDetails(data.data)
          // Trigger confetti on successful load
          if (!showConfetti) {
            setShowConfetti(true)
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            })
          }
        } else {
          setError(data.error?.message || 'Invalid or expired link')
        }
      } catch {
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [token, showConfetti])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-xl">
          <Card className="shadow-2xl border-0 overflow-hidden">
            <CardHeader className="text-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 border-b border-red-100 pb-8">
              <div className="mx-auto mb-4">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto" strokeWidth={2} />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                Invalid Link
              </CardTitle>
              <CardDescription className="text-gray-600">
                {error}
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col gap-4 bg-gray-50 border-t border-gray-100 pt-6">
              <Button
                asChild
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <p className="text-center text-sm text-gray-500">
                Need help? Contact us at{' '}
                <a href="mailto:contact@powerca.in" className="text-blue-600 hover:underline">
                  contact@powerca.in
                </a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="shadow-2xl border-0 overflow-hidden">
          {/* Success Header */}
          <CardHeader className="text-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-b border-green-100 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="mx-auto mb-4 relative"
            >
              <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto relative drop-shadow-lg" strokeWidth={2} />
            </motion.div>
            <CardTitle className="text-4xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-xl text-gray-600 font-medium">
              Thank you for purchasing Demo Version
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Order Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Status</span>
                <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Confirmed
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">Download Link Sent To</span>
                <span className="font-semibold text-gray-900">{orderDetails?.email || 'Your email'}</span>
              </div>
            </motion.div>

            {/* Email Notification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-blue-50 rounded-xl p-6 border border-blue-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Check Your Email</h3>
                  <p className="text-gray-600 text-sm">
                    We&apos;ve sent the download link to <strong>{orderDetails?.email || 'your registered email'}</strong>.
                    The email should arrive within 5 minutes.
                  </p>
                </div>
              </div>
            </motion.div>

          </CardContent>

          <CardFooter className="flex flex-row gap-4 bg-gradient-to-r from-gray-50 to-slate-50 border-t border-gray-100 pt-6">
            <Button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
            >
              {downloadingInvoice ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Download Invoice
                </>
              )}
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50 font-semibold"
            >
              <Link href="/account">
                <Home className="w-4 h-4 mr-2" />
                Go to My Account
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Support Note - Outside the card */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          Didn&apos;t receive the email? Contact us at{' '}
          <a href="mailto:contact@powerca.in" className="text-blue-600 hover:underline">
            contact@powerca.in
          </a>
        </motion.p>
      </div>
    </div>
  )
}

export default function AppDownloadSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
