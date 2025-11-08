'use client'

import { useState, useEffect } from 'react'

const professionalTitles = [
  'Chartered Accountants',
  'Company Secretaries',
  'Cost Accountants',
  'All Practice Professionals'
]

export function ProfessionRotator() {
  const [currentProfession, setCurrentProfession] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentProfession((prev) => (prev + 1) % professionalTitles.length)
        setIsAnimating(false)
      }, 300) // Half of transition duration
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <span
      className={`text-green-600 block transition-all duration-600 ease-in-out ${
        isAnimating
          ? 'opacity-0 transform -translate-y-4'
          : 'opacity-100 transform translate-y-0'
      }`}
    >
      {professionalTitles[currentProfession]}
    </span>
  )
}