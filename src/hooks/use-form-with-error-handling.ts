/**
 * @fileoverview Custom React hook for form handling with validation, error management, and persistence
 * @module hooks/use-form-with-error-handling
 */

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

/**
 * Form field error structure
 * @internal
 */
interface _FormFieldError {
  field: string
  message: string
}

/**
 * Form state containing data, errors, and submission status
 *
 * @template T - The shape of the form data
 */
interface FormState<T> {
  /** Current form field values */
  data: T
  /** Field-level validation errors */
  errors: Partial<Record<keyof T, string>>
  /** Fields that have been touched/blurred */
  touched: Partial<Record<keyof T, boolean>>
  /** Whether form is currently submitting */
  isSubmitting: boolean
  /** Top-level submission error message */
  submitError: string | null
  /** Whether form has no validation errors */
  isValid: boolean
}

/**
 * Configuration options for the form hook
 *
 * @template T - The shape of the form data
 */
interface FormOptions<T> {
  /** Initial values for form fields */
  initialData: T
  /** Optional validation function that returns field errors */
  validate?: (data: T) => Partial<Record<keyof T, string>> | Promise<Partial<Record<keyof T, string>>>
  /** Submission handler that receives validated form data */
  onSubmit: (data: T) => Promise<void>
  /** Optional key for persisting form data to sessionStorage */
  persistKey?: string
  /** Whether to reset form after successful submission (default: true) */
  resetOnSuccess?: boolean
}

/**
 * Custom hook for advanced form handling with validation and error management
 *
 * Provides:
 * - Real-time validation
 * - Field-level error tracking
 * - Touch tracking for showing errors only after blur
 * - Automatic form persistence to sessionStorage
 * - Loading state management
 * - Toast notifications for success/error
 *
 * @template T - The shape of the form data
 * @param options - Form configuration options
 * @returns Form state and handlers
 *
 * @example
 * ```typescript
 * interface ContactFormData {
 *   name: string
 *   email: string
 *   message: string
 * }
 *
 * const {
 *   data,
 *   errors,
 *   touched,
 *   isSubmitting,
 *   isValid,
 *   getFieldProps,
 *   handleSubmit,
 *   reset,
 * } = useFormWithErrorHandling<ContactFormData>({
 *   initialData: {
 *     name: '',
 *     email: '',
 *     message: '',
 *   },
 *   validate: async (data) => {
 *     const errors: Partial<Record<keyof ContactFormData, string>> = {}
 *     if (!data.name) errors.name = 'Name is required'
 *     if (!data.email) errors.email = 'Email is required'
 *     return errors
 *   },
 *   onSubmit: async (data) => {
 *     await fetch('/api/contact', {
 *       method: 'POST',
 *       body: JSON.stringify(data),
 *     })
 *   },
 *   persistKey: 'contact_form', // Auto-save to sessionStorage
 * })
 *
 * return (
 *   <form onSubmit={handleSubmit}>
 *     <input {...getFieldProps('name')} />
 *     {touched.name && errors.name && <span>{errors.name}</span>}
 *
 *     <input {...getFieldProps('email')} />
 *     {touched.email && errors.email && <span>{errors.email}</span>}
 *
 *     <button type="submit" disabled={!isValid || isSubmitting}>
 *       {isSubmitting ? 'Submitting...' : 'Submit'}
 *     </button>
 *   </form>
 * )
 * ```
 *
 * @see {@link FormState} for returned state shape
 * @see {@link FormOptions} for configuration options
 */
export function useFormWithErrorHandling<T extends Record<string, unknown>>({
  initialData,
  validate,
  onSubmit,
  persistKey,
  resetOnSuccess = true,
}: FormOptions<T>) {
  // Initialize form data with persisted data if available
  const [formState, setFormState] = useState<FormState<T>>(() => {
    let data = initialData

    // Try to restore from sessionStorage
    if (persistKey && typeof window !== 'undefined') {
      try {
        const persisted = sessionStorage.getItem(`form_${persistKey}`)
        if (persisted) {
          const parsedData = JSON.parse(persisted)
          data = { ...initialData, ...parsedData }
        }
      } catch (error) {
        logger.warn('Failed to restore form data from sessionStorage', error)
      }
    }

    return {
      data,
      errors: {},
      touched: {},
      isSubmitting: false,
      submitError: null,
      isValid: true,
    }
  })

  // Persist form data to sessionStorage
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(`form_${persistKey}`, JSON.stringify(formState.data))
      } catch (error) {
        logger.warn('Failed to persist form data to sessionStorage', error)
      }
    }
  }, [formState.data, persistKey])

  // Validate form data
  const validateForm = useCallback(async (data: T): Promise<Partial<Record<keyof T, string>>> => {
    if (!validate) return {}

    try {
      return await validate(data)
    } catch (error) {
      logger.error('Form validation error', error)
      return {}
    }
  }, [validate])

  // Update field value
  const setFieldValue = useCallback(async (field: keyof T, value: T[keyof T]) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      touched: { ...prev.touched, [field]: true },
      // Clear field error when user starts typing
      errors: { ...prev.errors, [field]: '' },
      // Clear submit error when user makes changes
      submitError: null,
    }))

    // Real-time validation after a short delay
    if (validate) {
      setTimeout(async () => {
        const newData = { ...formState.data, [field]: value }
        const errors = await validateForm(newData)

        setFormState(prev => ({
          ...prev,
          errors: { ...prev.errors, ...errors },
          isValid: Object.keys(errors).length === 0,
        }))
      }, 500) // Debounce validation
    }
  }, [formState.data, validate, validateForm])

  // Set field error
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
      isValid: false,
    }))
  }, [])

  // Clear field error
  const clearFieldError = useCallback((field: keyof T) => {
    setFormState(prev => {
      const newErrors = { ...prev.errors }
      delete newErrors[field]

      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      }
    })
  }, [])

  // Set multiple field errors (useful for server-side validation)
  const setFieldErrors = useCallback((errors: Partial<Record<keyof T, string>>) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors },
      isValid: Object.keys(errors).length === 0,
    }))
  }, [])

  // Set submit error
  const setSubmitError = useCallback((error: string | null) => {
    setFormState(prev => ({
      ...prev,
      submitError: error,
    }))
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      submitError: null
    }))

    try {
      // Validate form
      const errors = await validateForm(formState.data)

      if (Object.keys(errors).length > 0) {
        setFormState(prev => ({
          ...prev,
          errors,
          isSubmitting: false,
          isValid: false,
        }))

        // Focus first error field
        const firstErrorField = Object.keys(errors)[0]
        setTimeout(() => {
          const element = document.getElementById(firstErrorField)
          element?.focus()
        }, 100)

        return
      }

      // Submit form
      await onSubmit(formState.data)

      // Success handling
      if (resetOnSuccess) {
        setFormState({
          data: initialData,
          errors: {},
          touched: {},
          isSubmitting: false,
          submitError: null,
          isValid: true,
        })

        // Clear persisted data on success
        if (persistKey && typeof window !== 'undefined') {
          sessionStorage.removeItem(`form_${persistKey}`)
        }
      } else {
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          submitError: null,
        }))
      }

      toast.success('Form submitted successfully!')

    } catch (error) {
      logger.error('Form submission error', error)

      let errorMessage = 'An error occurred. Please try again.'

      if (error instanceof Error) {
        // Handle different types of errors
        if (error.message.includes('validation')) {
          errorMessage = 'Please check your input and try again.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.'
        } else {
          errorMessage = error.message
        }

        // Handle server validation errors
        const apiError = error as { status?: number; data?: { errors?: Record<string, string> } }
        if (apiError.status === 400 && apiError.data?.errors) {
          const serverErrors = apiError.data.errors
          if (typeof serverErrors === 'object') {
            setFieldErrors(serverErrors as Partial<Record<keyof T, string>>)
            setFormState(prev => ({
              ...prev,
              isSubmitting: false,
              submitError: null,
            }))
            return
          }
        }
      }

      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitError: errorMessage,
      }))

      toast.error(errorMessage)
    }
  }, [formState.data, validateForm, onSubmit, resetOnSuccess, initialData, persistKey, setFieldErrors])

  // Reset form
  const reset = useCallback(() => {
    setFormState({
      data: initialData,
      errors: {},
      touched: {},
      isSubmitting: false,
      submitError: null,
      isValid: true,
    })

    // Clear persisted data
    if (persistKey && typeof window !== 'undefined') {
      sessionStorage.removeItem(`form_${persistKey}`)
    }
  }, [initialData, persistKey])

  // Get field props for easier integration
  const getFieldProps = useCallback((field: keyof T) => ({
    value: String(formState.data[field] || ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFieldValue(field, e.target.value as T[keyof T])
    },
    onBlur: () => {
      setFormState(prev => ({
        ...prev,
        touched: { ...prev.touched, [field]: true },
      }))
    },
    'aria-invalid': !!formState.errors[field],
    'aria-describedby': formState.errors[field] ? `${String(field)}-error` : undefined,
    id: String(field),
  }), [formState.data, formState.errors, setFieldValue])

  return {
    // Form state
    data: formState.data,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    submitError: formState.submitError,
    isValid: formState.isValid,

    // Actions
    setFieldValue,
    setFieldError,
    clearFieldError,
    setFieldErrors,
    setSubmitError,
    handleSubmit,
    reset,
    getFieldProps,

    // Computed values
    hasErrors: Object.keys(formState.errors).length > 0,
    isDirty: Object.keys(formState.touched).length > 0,
  }
}