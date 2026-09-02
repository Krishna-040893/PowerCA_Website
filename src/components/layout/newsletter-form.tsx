'use client'

import { useState } from 'react'
import { toast } from 'sonner'

/** Footer newsletter signup, kept client-side so the footer itself can stay static. */
export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || 'Successfully subscribed to newsletter!')
        setEmail('')
      } else {
        toast.error(data.error || 'Failed to subscribe. Please try again.')
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error('An error occurred. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:justify-center md:justify-end">
      <label htmlFor="footer-newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-newsletter-email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
        className="h-10 min-w-0 rounded-lg border border-[#272c35] bg-[#1c2027] px-3 text-sm text-white placeholder-gray-500 transition-colors focus:border-gray-500 focus:outline-none disabled:opacity-50 sm:w-48"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-10 shrink-0 rounded-lg bg-white px-4 text-sm font-medium text-[#111418] transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  )
}
