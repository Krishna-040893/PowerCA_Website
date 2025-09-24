'use client'

import { useState, useEffect } from 'react'

export default function PromotionalBanner() {
  const [isVisible, setIsVisible] = useState(true)

  // Add/remove CSS custom property when banner visibility changes
  useEffect(() => {
    if (isVisible) {
      document.documentElement.style.setProperty('--banner-height', '48px')
    } else {
      document.documentElement.style.setProperty('--banner-height', '0px')
    }

    // Cleanup on unmount
    return () => {
      document.documentElement.style.removeProperty('--banner-height')
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed top-0 w-full bg-slate-900 text-white py-2.5 px-4 text-center text-sm z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {/* NEW badge */}
          <span className="inline-flex items-center px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
            NEW
          </span>

          {/* Promotional text */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-white font-medium">Special discount 75% for CAs – Till 31st Oct 2025</span>
            <span className="text-slate-300 italic text-xs hidden sm:inline">(Be an Early bird to Enjoy the Offer)</span>
          </div>

          {/* Click Here button */}
          <a
            href="/pricing"
            className="inline-flex items-center px-4 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-sm"
          >
            Click Here
          </a>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200 p-1"
        aria-label="Close banner"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}