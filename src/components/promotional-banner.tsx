'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    <div className="fixed top-0 w-full bg-slate-900 text-white py-2.5 px-4 text-center text-sm z-50">
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
          {/* Promotional text - responsive */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            <span className="text-white font-medium text-[11px] sm:text-sm">
              Launch Offer – Free for CAs
            </span>
          </div>

          {/* View Pricing button - compact on mobile */}
          <a
            href="/pricing"
            className="inline-flex items-center px-2 sm:px-4 py-1 sm:py-1.5 bg-white text-slate-900 text-[10px] sm:text-xs font-bold rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105 shadow-sm whitespace-nowrap"
          >
            View Pricing
          </a>

          {/* Separator */}
          <span className="hidden sm:block w-px h-4 bg-slate-600"></span>

          {/* Download Demo Version - animated highlight */}
          <Link href="/app-download" className="relative group inline-flex">
            {/* Subtle glow effect */}
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 opacity-30 blur-sm group-hover:opacity-50 transition-opacity duration-300" />
            <div className="relative inline-flex items-center gap-1.5 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <span className="text-xs sm:text-sm">🎁</span>
              <span>Download Demo Version</span>
            </div>
          </Link>
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