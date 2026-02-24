'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Clock, XCircle, FileX } from 'lucide-react'
import { Button } from '@/components/ui/button'

const errorMessages: Record<string, {
  title: string
  message: string
  icon: React.ElementType
  iconColor: string
}> = {
  missing_token: {
    title: 'Invalid Download Link',
    message: 'The download link is incomplete or invalid. Please use the link provided in your email.',
    icon: XCircle,
    iconColor: 'text-red-500'
  },
  invalid_token: {
    title: 'Invalid Download Link',
    message: 'This download link is not valid. Please check your email for the correct download link.',
    icon: XCircle,
    iconColor: 'text-red-500'
  },
  expired: {
    title: 'Download Link Expired',
    message: 'This download link has expired. Download links are valid for 7 days after purchase. Please contact support or make a new purchase.',
    icon: Clock,
    iconColor: 'text-orange-500'
  },
  already_used: {
    title: 'Download Link Already Used',
    message: 'This download link has already been used. Each link can only be used once. Please contact support if you need to download again.',
    icon: Clock,
    iconColor: 'text-orange-500'
  },
  file_not_found: {
    title: 'File Not Available',
    message: 'The download file is temporarily unavailable. Please try again later or contact support.',
    icon: FileX,
    iconColor: 'text-gray-500'
  },
  server_error: {
    title: 'Something Went Wrong',
    message: 'An error occurred while processing your download. Please try again later or contact support.',
    icon: AlertCircle,
    iconColor: 'text-red-500'
  }
}

function DownloadErrorContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'server_error'
  const orderId = searchParams.get('orderId')

  const errorInfo = errorMessages[reason] || errorMessages.server_error
  const IconComponent = errorInfo.icon

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white flex items-center justify-center py-6 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        {/* Icon */}
        <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center`}>
          <IconComponent className={`w-10 h-10 ${errorInfo.iconColor}`} />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {errorInfo.title}
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          {errorInfo.message}
        </p>

        {/* Order ID if available */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-mono text-sm text-gray-700">{orderId}</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/">
              Go to Home
            </Link>
          </Button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Need help? Email us at{' '}
            <a href="mailto:contact@powerca.in" className="text-purple-600 hover:underline">
              contact@powerca.in
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function DownloadErrorPage() {
  return (
    <Suspense fallback={
      <div className="py-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <DownloadErrorContent />
    </Suspense>
  )
}
