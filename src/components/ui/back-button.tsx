'use client'

import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const handleBack = () => {
    // If opened in a new tab (no history), close the tab
    if (window.history.length <= 1) {
      window.close()
    } else {
      window.history.back()
    }
  }

  return (
    <button
      onClick={handleBack}
      className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-8 text-sm font-medium text-[#001525] transition-colors hover:bg-gray-50 font-inter"
    >
      <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
      <span>
        Back
      </span>
    </button>
  )
}
