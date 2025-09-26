'use client'

import {useEffect, useState  } from 'react'

interface RotatingTextProps {
  words: string[]
  className?: string
}

export function RotatingText({ words, className = '' }: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [words.length])

  return (
    <div className={`relative inline-block ${className}`}>
      <span className="invisible font-light">{words[0]}</span>
      {words.map((word, index) => (
        <span
          key={index}
          className={`absolute left-0 top-0 transition-all duration-500 ease-in-out font-light text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600 ${
            index === currentIndex
              ? 'opacity-100 transform translate-y-0'
              : index === (currentIndex - 1 + words.length) % words.length
              ? 'opacity-0 transform -translate-y-2'
              : 'opacity-0 transform translate-y-2'
          }`}
        >
          {word}
        </span>
      ))}
    </div>
  )
}