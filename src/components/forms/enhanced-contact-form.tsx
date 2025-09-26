'use client'

import { useFormWithErrorHandling } from '@/hooks/use-form-with-error-handling'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ButtonLoading } from '@/components/ui/loading-states'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { trackUserAction } from '@/lib/monitoring'

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  [key: string]: unknown // Add index signature for compatibility
}

export function EnhancedContactForm() {
  const {
    data,
    errors,
    touched,
    isSubmitting,
    submitError,
    isValid,
    getFieldProps,
    handleSubmit,
    reset,
    setSubmitError,
  } = useFormWithErrorHandling<ContactFormData>({
    initialData: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
    persistKey: 'contact_form',
    validate: async (data) => {
      const errors: Partial<Record<keyof ContactFormData, string>> = {}

      // Name validation
      if (!data.name.trim()) {
        errors.name = 'Name is required'
      } else if (data.name.length < 2) {
        errors.name = 'Name must be at least 2 characters'
      }

      // Email validation
      if (!data.email.trim()) {
        errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address'
      }

      // Phone validation (optional but must be valid if provided)
      if (data.phone && !/^[+]?[\d\s()-]+$/.test(data.phone)) {
        errors.phone = 'Please enter a valid phone number'
      }

      // Subject validation
      if (!data.subject.trim()) {
        errors.subject = 'Subject is required'
      } else if (data.subject.length < 3) {
        errors.subject = 'Subject must be at least 3 characters'
      }

      // Message validation
      if (!data.message.trim()) {
        errors.message = 'Message is required'
      } else if (data.message.length < 10) {
        errors.message = 'Message must be at least 10 characters'
      } else if (data.message.length > 1000) {
        errors.message = 'Message must be less than 1000 characters'
      }

      return errors
    },
    onSubmit: async (formData) => {
      // Track form submission
      trackUserAction('contact_form_submit', {
        subject: formData.subject,
      })

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to send message')
      }

      // Track successful submission
      trackUserAction('contact_form_success')
    },
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Success Message */}
      {!submitError && !isSubmitting && Object.keys(touched).length > 0 && isValid && !Object.keys(errors).length && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Message sent successfully! We'll get back to you within 24 hours.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{submitError}</span>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="ml-4 text-sm underline hover:no-underline"
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Field */}
        <div>
          <Label htmlFor="name" className="block mb-2">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            {...getFieldProps('name')}
            type="text"
            placeholder="John Doe"
            disabled={isSubmitting}
            className={errors.name && touched.name ? 'border-red-300 focus:ring-red-500' : ''}
          />
          {errors.name && touched.name && (
            <p id="name-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <Label htmlFor="email" className="block mb-2">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            {...getFieldProps('email')}
            type="email"
            placeholder="john@example.com"
            disabled={isSubmitting}
            className={errors.email && touched.email ? 'border-red-300 focus:ring-red-500' : ''}
          />
          {errors.email && touched.email && (
            <p id="email-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone Field */}
        <div>
          <Label htmlFor="phone" className="block mb-2">
            Phone
          </Label>
          <Input
            {...getFieldProps('phone')}
            type="tel"
            placeholder="+91 98765 43210"
            disabled={isSubmitting}
            className={errors.phone && touched.phone ? 'border-red-300 focus:ring-red-500' : ''}
          />
          {errors.phone && touched.phone && (
            <p id="phone-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Subject Field */}
        <div>
          <Label htmlFor="subject" className="block mb-2">
            Subject <span className="text-red-500">*</span>
          </Label>
          <Input
            {...getFieldProps('subject')}
            type="text"
            placeholder="How can we help?"
            disabled={isSubmitting}
            className={errors.subject && touched.subject ? 'border-red-300 focus:ring-red-500' : ''}
          />
          {errors.subject && touched.subject && (
            <p id="subject-error" role="alert" className="mt-1 text-sm text-red-600">
              {errors.subject}
            </p>
          )}
        </div>
      </div>

      {/* Message Field */}
      <div>
        <Label htmlFor="message" className="block mb-2">
          Message <span className="text-red-500">*</span>
        </Label>
        <Textarea
          {...getFieldProps('message')}
          rows={5}
          placeholder="Tell us about your requirements..."
          disabled={isSubmitting}
          className={errors.message && touched.message ? 'border-red-300 focus:ring-red-500' : ''}
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.message && touched.message && (
              <p id="message-error" role="alert" className="text-sm text-red-600">
                {errors.message}
              </p>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {data.message.length}/1000 characters
          </span>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="flex-1"
        >
          {isSubmitting ? (
            <ButtonLoading text="Sending" />
          ) : (
            'Send Message'
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={reset}
          disabled={isSubmitting}
        >
          Reset
        </Button>
      </div>

      {/* Form Persistence Indicator */}
      {Object.keys(touched).length > 0 && !isSubmitting && (
        <p className="text-xs text-gray-500 text-center">
          Your form data is being saved automatically
        </p>
      )}
    </form>
  )
}