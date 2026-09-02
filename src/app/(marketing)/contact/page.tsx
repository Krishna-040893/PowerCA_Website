'use client'

import React, { useState } from 'react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { PageHero } from '@/components/layout/page-hero'

function HeroSection() {
  return (
    <PageHero
      backgroundImage="/images/contact-hero-bg.jpg"
      badge={{
        icon: (
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ),
        label: 'Connect With Us Today',
      }}
      title="Get in Touch"
      accent="With Us"
      description="We're always here to chat! Reach out to us with any questions or concerns you may have, and we'll be happy to help."
    />
  )
}

// The three ways to reach us, shown as a row beneath the form.
const contactChannels = [
  {
    title: 'Call & WhatsApp',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    lines: [
      { text: '+91 98422 24635', href: 'tel:+919842224635' },
      { text: '+91 96295 14635', href: 'tel:+919629514635' },
    ],
  },
  {
    title: 'Working Hours',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    lines: [
      { text: 'Mon - Sat: 9.30am - 6.30pm' },
      { text: 'Sunday: Closed' },
    ],
  },
  {
    title: 'Write to Us',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    lines: [
      { text: 'contact@powerca.in', href: 'mailto:contact@powerca.in' },
      { text: 'No. 130, II Floor, Muneer Complex, Palani Road, Udumalpet.' },
    ],
  },
]

const socialAccounts = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/powerca24/',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/power-ca-tbs25100',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    label: 'X',
    href: 'https://x.com/Powerca_24',
    path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@powerCA-24',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
]

function SocialLinks() {
  return (
    <div className="flex items-center gap-3">
      {socialAccounts.map((account) => (
        <a
          key={account.label}
          href={account.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={account.label}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-[#001525] transition-colors hover:bg-[#001525] hover:text-white"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d={account.path} />
          </svg>
        </a>
      ))}
    </div>
  )
}

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhoneChange = (value: string | undefined) => {
    setFormData(prev => ({
      ...prev,
      phone: value || ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', phone: '', message: '' })
      } else {
        setSubmitStatus('error')
        setErrorMessage(data.error || 'Failed to send message. Please try again.')
      }
    } catch {
      setSubmitStatus('error')
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldClass =
    'w-full h-12 rounded-lg border border-gray-200 bg-white px-4 text-sm text-[#001525] placeholder:text-gray-400 outline-none transition-all focus:border-[#306bea] focus:ring-2 focus:ring-[#306bea]/15 disabled:opacity-50'
  const labelClass = 'block text-[13px] font-medium text-[#001525] mb-1.5'

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-gray-50 p-6 sm:p-8 lg:p-10 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_16px_40px_-24px_rgba(16,24,40,0.18)]">
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-semibold text-[#001525] font-inter">Send us a message</h3>
        <p className="mt-1 text-sm text-gray-500">We usually reply within one working day.</p>
      </div>

      {submitStatus === 'success' && (
        <div className="mb-5 w-full rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
          <p className="text-sm font-medium text-green-800">
            Thank you! Your message has been sent successfully. We&apos;ll get back to you within 24 hours.
          </p>
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="mb-5 w-full rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4">
          <p className="text-sm font-medium text-red-800">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full">
        {/* Paired fields, stacking on narrow screens */}
        <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className={labelClass}>Name</label>
            <input
              id="contact-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Your full name"
              required
              disabled={isSubmitting}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="contact-email" className={labelClass}>Email</label>
            <input
              id="contact-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              required
              disabled={isSubmitting}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="mt-5 sm:mt-6">
          <label className={labelClass}>Phone Number</label>
          <PhoneInput
            international
            defaultCountry="IN"
            value={formData.phone}
            onChange={handlePhoneChange}
            disabled={isSubmitting}
            className="flex gap-0 [&>input]:h-12 [&>input]:flex-1 [&>input]:rounded-r-lg [&>input]:border [&>input]:border-gray-200 [&>input]:bg-white [&>input]:px-4 [&>input]:text-sm [&>input]:text-[#001525] [&>input]:outline-none [&>input]:transition-colors [&>input]:placeholder:text-gray-400 [&>input]:focus:border-[#306bea] [&>input]:focus:ring-2 [&>input]:focus:ring-[#306bea]/15 [&>input]:disabled:opacity-50 [&>.PhoneInputCountry]:h-12 [&>.PhoneInputCountry]:rounded-l-lg [&>.PhoneInputCountry]:border [&>.PhoneInputCountry]:border-r-0 [&>.PhoneInputCountry]:border-gray-200 [&>.PhoneInputCountry]:bg-white [&>.PhoneInputCountry]:px-3 [&>.PhoneInputCountry]:flex [&>.PhoneInputCountry]:items-center [&>.PhoneInputCountry]:gap-2 [&_.PhoneInputCountryIcon]:h-5 [&_.PhoneInputCountryIcon]:w-5 [&_.PhoneInputCountryIcon]:shadow-none [&_.PhoneInputCountrySelectArrow]:opacity-50"
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="mt-5 sm:mt-6">
          <label htmlFor="contact-message" className={labelClass}>Message</label>
          <textarea
            id="contact-message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Anything else we should know?"
            required
            disabled={isSubmitting}
            rows={4}
            className="w-full resize-none rounded-lg border border-gray-200 bg-white p-4 text-sm text-[#001525] placeholder:text-gray-400 outline-none transition-all focus:border-[#306bea] focus:ring-2 focus:ring-[#306bea]/15 disabled:opacity-50"
          />
        </div>

        {/* Dark pill with its own arrow button, as in the reference */}
        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#001525] px-7 text-sm font-medium text-white transition-colors hover:bg-[#00223a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            aria-label={isSubmitting ? 'Sending message' : 'Send message'}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#001525] text-white transition-colors hover:bg-[#00223a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-4 w-4 -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ContactPage() {
  return (
    <div className="bg-white relative w-full min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-6 py-7 sm:py-10 md:py-12 lg:py-[60px]">
        <div className="mb-8 sm:mb-10 lg:mb-12 text-center">
          <h2 className="text-2xl sm:text-4xl lg:text-[40px] font-normal tracking-tight leading-[1.15] text-[#001525] font-inter mb-4">
            Contact <span className="font-semibold">Information</span>
          </h2>
          <p className="mx-auto max-w-2xl text-[15px] sm:text-[17px] leading-relaxed text-gray-500 font-inter">
            Fill up the form and our team will get back to you within 24 hours
          </p>
        </div>

        {/* Form beside a tall image card, as in the reference */}
        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* The office on the map, beside the form. */}
          <div className="relative min-h-[320px] lg:min-h-0 overflow-hidden rounded-2xl border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d608.3352149153551!2d77.2527547!3d10.5836394!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba9cdb2ca3bf08f%3A0x5f8035bea3394e46!2sTBS%20Technologies%20Private%20Limited!5e1!3m2!1sen!2sin!4v1761385887270!5m2!1sen!2sin"
              className="absolute inset-0 h-full w-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="PowerCA office location - Muneer Complex, Udumalpet"
            />
            <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/70 bg-white/90 px-4 py-1.5 text-xs font-medium text-[#001525] shadow-sm backdrop-blur-sm">
              Find us here
            </span>
          </div>
        </div>

        {/* Ways to reach us */}
        <div className="mt-10 sm:mt-12 lg:mt-16 grid gap-8 sm:gap-10 sm:grid-cols-3">
          {contactChannels.map((channel) => (
            <div key={channel.title} className="flex flex-col items-center text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-[#001525]">
                {channel.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[#001525] font-inter">{channel.title}</h3>
              <div className="mt-2 space-y-1">
                {channel.lines.map((line) =>
                  line.href ? (
                    <a
                      key={line.text}
                      href={line.href}
                      className="block text-sm text-gray-500 hover:text-[#001525] transition-colors"
                    >
                      {line.text}
                    </a>
                  ) : (
                    <p key={line.text} className="text-sm text-gray-500">{line.text}</p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Follow us */}
        <div className="mt-10 sm:mt-12 flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-[#001525]">Follow our social media</p>
          <SocialLinks />
        </div>
      </div>

    </div>
  )
}
