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
      className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
    >
      <ArrowLeft className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
        Back
      </span>
    </button>
  )
}
