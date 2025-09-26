'use client'

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the global error
    logger.error('Global error handler triggered', error, {
      digest: error.digest,
      level: 'global',
    })
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>

                <h1 className="mt-4 text-xl font-bold text-gray-900">
                  Application Error
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                  The application encountered a critical error and needs to be restarted.
                </p>

                <div className="mt-6">
                  <button
                    onClick={() => reset()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Restart Application
                  </button>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full text-center py-2 px-4 text-sm text-blue-600 hover:text-blue-500"
                  >
                    Go to Homepage
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}