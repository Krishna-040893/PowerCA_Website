import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'
import { trackError } from '@/lib/monitoring'

interface UseApiCallOptions {
  retry?: number
  retryDelay?: number
  timeout?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showErrorToast?: boolean
}

interface ApiCallState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export function useApiCall<T = any>() {
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(async (
    apiCall: (signal?: AbortSignal) => Promise<Response>,
    options: UseApiCallOptions = {}
  ) => {
    const {
      retry = 3,
      retryDelay = 1000,
      timeout = 10000,
      onSuccess,
      onError,
      showErrorToast = true,
    } = options

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    setState(prev => ({ ...prev, loading: true, error: null }))

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        // Setup timeout
        const timeoutId = setTimeout(() => {
          abortControllerRef.current?.abort()
        }, timeout)

        const response = await apiCall(signal)

        clearTimeout(timeoutId)

        // Check if request was aborted
        if (signal.aborted) {
          throw new Error('Request was cancelled')
        }

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error?.message ||
                             errorData.message ||
                             `HTTP ${response.status}: ${response.statusText}`

          throw new ApiError(errorMessage, response.status, errorData)
        }

        // Parse response
        const data = await response.json()

        setState({
          data,
          loading: false,
          error: null,
        })

        onSuccess?.(data)
        return data

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')

        // Handle specific error types
        if (lastError.name === 'AbortError' || lastError.message.includes('cancelled')) {
          setState(prev => ({ ...prev, loading: false }))
          return // Don't retry cancelled requests
        }

        // Log error for monitoring
        logger.error('API call failed', lastError, {
          attempt: attempt + 1,
          maxRetries: retry + 1,
          url: 'api-call', // You might want to pass URL for better tracking
        })

        trackError(lastError, {
          context: 'api_call',
          attempt: attempt + 1,
          maxRetries: retry + 1,
        })

        // Determine if we should retry
        const shouldRetry = attempt < retry && isRetryableError(lastError)

        if (shouldRetry) {
          // Exponential backoff with jitter
          const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        // All retries exhausted or non-retryable error
        setState({
          data: null,
          loading: false,
          error: lastError,
        })

        onError?.(lastError)

        if (showErrorToast) {
          displayErrorToast(lastError)
        }

        throw lastError
      }
    }

    throw lastError || new Error('API call failed')
  }, [])

  // Cancel ongoing request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  // Retry last failed request
  const retry = useCallback(async () => {
    // This would need the last apiCall stored, which is complex
    // For now, just reset the error state
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    execute,
    cancel,
    retry,
  }
}

// Custom error class for API errors
class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 0,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Determine if an error is retryable
function isRetryableError(error: Error): boolean {
  if (error instanceof ApiError) {
    // Retry server errors but not client errors
    return error.status >= 500 || error.status === 0
  }

  // Retry network errors and timeouts
  return (
    error.message.includes('NetworkError') ||
    error.message.includes('timeout') ||
    error.message.includes('fetch') ||
    error.name === 'TypeError'
  )
}

// Display appropriate error toast based on error type
function displayErrorToast(error: Error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        toast.error('Invalid request. Please check your input.')
        break
      case 401:
        toast.error('Please log in to continue.')
        break
      case 403:
        toast.error('You don\'t have permission to perform this action.')
        break
      case 404:
        toast.error('The requested resource was not found.')
        break
      case 429:
        toast.error('Too many requests. Please wait a moment and try again.')
        break
      case 500:
        toast.error('Server error. Please try again later.')
        break
      default:
        toast.error(error.message || 'An error occurred. Please try again.')
    }
  } else if (error.message.includes('NetworkError') || error.name === 'TypeError') {
    toast.error('Network connection error. Please check your internet and try again.')
  } else if (error.message.includes('timeout')) {
    toast.error('Request timed out. Please try again.')
  } else {
    toast.error(error.message || 'An unexpected error occurred.')
  }
}

// Convenience hook for simple GET requests
export function useApiGet<T = any>(url: string, options?: UseApiCallOptions) {
  const { execute, ...rest } = useApiCall<T>()

  const get = useCallback(() => {
    return execute(
      (signal) => fetch(url, { signal }),
      options
    )
  }, [url, execute, options])

  return {
    ...rest,
    get,
  }
}

// Convenience hook for POST requests
export function useApiPost<T = any>(url: string, options?: UseApiCallOptions) {
  const { execute, ...rest } = useApiCall<T>()

  const post = useCallback((data?: any) => {
    return execute(
      (signal) => fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
        signal,
      }),
      options
    )
  }, [url, execute, options])

  return {
    ...rest,
    post,
  }
}