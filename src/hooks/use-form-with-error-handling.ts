import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

interface FormFieldError {
  field: string
  message: string
}

interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  submitError: string | null
  isValid: boolean
}

interface FormOptions<T> {
  initialData: T
  validate?: (data: T) => Partial<Record<keyof T, string>> | Promise<Partial<Record<keyof T, string>>>
  onSubmit: (data: T) => Promise<void>
  persistKey?: string // Key for sessionStorage persistence
  resetOnSuccess?: boolean
}

export function useFormWithErrorHandling<T extends Record<string, any>>({
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
  const setFieldValue = useCallback(async (field: keyof T, value: any) => {
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
        if ((error as any).status === 400 && (error as any).data?.errors) {
          const serverErrors = (error as any).data.errors
          if (typeof serverErrors === 'object') {
            setFieldErrors(serverErrors)
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
  }, [formState.data, validateForm, onSubmit, resetOnSuccess, initialData, persistKey])

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
    value: formState.data[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFieldValue(field, e.target.value)
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