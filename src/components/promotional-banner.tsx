'use client'

import { useState, useEffect } from 'react'

export default function PromotionalBanner() {
  const [isVisible, setIsVisible] = useState(true)

  // Add/remove CSS custom properties when banner visibility changes
  useEffect(() => {
    if (isVisible) {
      document.documentElement.style.setProperty('--banner-height', '48px')
      document.documentElement.style.setProperty('--content-padding-top', '128px') // 48px banner + 80px header
    } else {
      document.documentElement.style.setProperty('--banner-height', '0px')
      document.documentElement.style.setProperty('--content-padding-top', '80px') // Just header height
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.style.removeProperty('--banner-height')
      document.documentElement.style.removeProperty('--content-padding-top')
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed top-0 w-full bg-slate-900 text-white py-2 sm:py-2.5 px-2 sm:px-4 text-center text-sm z-50">
      <div className="container mx-auto pr-6 sm:pr-0">
        <div className="flex items-center justify-center gap-1.5 sm:gap-4">
          {/* Promotional text - responsive */}
          <span className="text-white font-medium text-[10px] sm:text-sm whitespace-nowrap">
            Launch Offer – 100% for CAs
          </span>

          {/* View Pricing button - visible on all screens */}
          <a
            href="/pricing"
            className="inline-flex items-center px-2 sm:px-4 py-0.5 sm:py-1.5 bg-white text-slate-900 text-[9px] sm:text-xs font-bold rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-sm whitespace-nowrap"
          >
            View Pricing
          </a>

        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200 p-1"
        aria-label="Close banner"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}