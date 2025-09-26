import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Home, Search, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: '404 - Page Not Found | PowerCA',
  description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to PowerCA
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="mx-auto w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl font-bold text-blue-600">404</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
            It might have been moved, deleted, or the URL might be incorrect.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">
            <Link
              href="/"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Link>

            <Link
              href="/contact"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Support
            </Link>
          </div>

          {/* Popular Pages */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Popular Pages
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Link
                href="/pricing"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Pricing Plans
              </Link>
              <Link
                href="/book-demo"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Book Demo
              </Link>
              <Link
                href="/tools"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                CA Tools
              </Link>
              <Link
                href="/blog"
                className="text-blue-600 hover:text-blue-500 hover:underline"
              >
                Blog
              </Link>
            </div>
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-xs text-gray-500">
            <p>Still can't find what you're looking for?</p>
            <p className="mt-1">
              <Link href="/contact" className="text-blue-600 hover:underline">
                Get in touch with our support team
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}