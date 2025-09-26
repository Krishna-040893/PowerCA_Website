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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProfession((prev) => (prev + 1) % professionalTitles.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <span className="text-green-600 block">
      {professionalTitles[currentProfession]}
    </span>
  )
}