import { logger } from './logger'
import { trackError } from './monitoring'

interface ApiClientOptions extends RequestInit {
  timeout?: number
  retry?: number
  retryDelay?: number
  withAuth?: boolean
}

interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
  ok: boolean
}

class ApiClient {
  private baseURL: string
  private defaultTimeout: number = 10000
  private defaultRetry: number = 3
  private defaultRetryDelay: number = 1000

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  private async executeRequest<T = any>(
    url: string,
    options: ApiClientOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.defaultTimeout,
      retry = this.defaultRetry,
      retryDelay = this.defaultRetryDelay,
      withAuth = false,
      ...fetchOptions
    } = options

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retry; attempt++) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        // Add authentication header if needed
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(fetchOptions.headers as Record<string, string> || {}),
        }

        if (withAuth) {
          // Get auth token from session or storage
          const token = this.getAuthToken()
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
        }

        const response = await fetch(`${this.baseURL}${url}`, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Parse response
        let data: any = null
        const contentType = response.headers.get('content-type')

        if (contentType?.includes('application/json')) {
          try {
            data = await response.json()
          } catch (error) {
            logger.warn('Failed to parse JSON response', error)
          }
        } else {
          data = await response.text()
        }

        // Handle successful response
        if (response.ok) {
          return {
            data,
            status: response.status,
            ok: true,
          }
        }

        // Handle error response
        const error = data?.error || data?.message || response.statusText

        // Don't retry client errors (4xx)
        if (response.status >= 400 && response.status < 500) {
          return {
            error,
            status: response.status,
            ok: false,
            data,
          }
        }

        // Server error - might be worth retrying
        throw new Error(error || `HTTP ${response.status}`)

      } catch (error) {
        clearTimeout(timeoutId)
        lastError = error instanceof Error ? error : new Error('Unknown error')

        // Don't retry if request was aborted
        if (lastError.name === 'AbortError') {
          logger.error('Request timeout', { url, timeout })
          trackError(new Error(`Request timeout: ${url}`), { timeout })

          return {
            error: 'Request timeout',
            status: 0,
            ok: false,
          }
        }

        // Log the error
        logger.error('API request failed', lastError, {
          url,
          attempt: attempt + 1,
          maxRetries: retry + 1,
        })

        // Check if we should retry
        if (attempt < retry) {
          // Exponential backoff with jitter
          const delay = retryDelay * Math.pow(2, attempt) + Math.random() * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        // All retries exhausted
        trackError(lastError, {
          context: 'api_client',
          url,
          attempts: attempt + 1,
        })

        return {
          error: lastError.message,
          status: 0,
          ok: false,
        }
      }
    }

    // This should never be reached, but TypeScript needs it
    return {
      error: 'Request failed',
      status: 0,
      ok: false,
    }
  }

  private getAuthToken(): string | null {
    // Try to get token from different sources
    if (typeof window !== 'undefined') {
      // Check sessionStorage
      const sessionToken = sessionStorage.getItem('auth_token')
      if (sessionToken) return sessionToken

      // Check localStorage
      const localToken = localStorage.getItem('auth_token')
      if (localToken) return localToken

      // Check cookies (if using cookies for auth)
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [key, value] = cookie.trim().split('=')
        if (key === 'auth_token') return value
      }
    }

    return null
  }

  // HTTP Methods
  async get<T = any>(url: string, options?: ApiClientOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, {
      ...options,
      method: 'GET',
    })
  }

  async post<T = any>(
    url: string,
    data?: any,
    options?: ApiClientOptions
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T = any>(
    url: string,
    data?: any,
    options?: ApiClientOptions
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T = any>(
    url: string,
    data?: any,
    options?: ApiClientOptions
  ): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T = any>(url: string, options?: ApiClientOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(url, {
      ...options,
      method: 'DELETE',
    })
  }

  // File upload
  async upload<T = any>(
    url: string,
    formData: FormData,
    options?: ApiClientOptions
  ): Promise<ApiResponse<T>> {
    const { headers, ...restOptions } = options || {}

    // Don't set Content-Type for FormData (browser will set it with boundary)
    const cleanHeaders = { ...headers }
    delete (cleanHeaders as any)['Content-Type']

    return this.executeRequest<T>(url, {
      ...restOptions,
      method: 'POST',
      headers: cleanHeaders,
      body: formData,
    })
  }
}

// Create default instance
export const apiClient = new ApiClient('/api')

// Create admin API client
export const adminApiClient = new ApiClient('/api/admin')

// Helper function for handling API responses
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.ok) {
    throw new Error(response.error || 'API request failed')
  }
  return response.data as T
}

// Type-safe API endpoints
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiClient.post<{ token: string; user: any }>('/auth/login', credentials),

    register: (data: { email: string; password: string; name: string }) =>
      apiClient.post<{ token: string; user: any }>('/auth/register', data),

    logout: () => apiClient.post('/auth/logout'),

    getSession: () => apiClient.get<{ user: any }>('/auth/session', { withAuth: true }),
  },

  // Contact endpoints
  contact: {
    send: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
      apiClient.post('/contact', data),
  },

  // Booking endpoints
  bookings: {
    create: (data: any) => apiClient.post('/bookings', data),
    list: () => apiClient.get('/bookings', { withAuth: true }),
    get: (id: string) => apiClient.get(`/bookings/${id}`, { withAuth: true }),
    update: (id: string, data: any) => apiClient.put(`/bookings/${id}`, data, { withAuth: true }),
    delete: (id: string) => apiClient.delete(`/bookings/${id}`, { withAuth: true }),
  },

  // Admin endpoints
  admin: {
    users: {
      list: () => adminApiClient.get('/users', { withAuth: true }),
      get: (id: string) => adminApiClient.get(`/users/${id}`, { withAuth: true }),
      update: (id: string, data: any) => adminApiClient.put(`/users/${id}`, data, { withAuth: true }),
      delete: (id: string) => adminApiClient.delete(`/users/${id}`, { withAuth: true }),
    },

    stats: {
      dashboard: () => adminApiClient.get('/stats/dashboard', { withAuth: true }),
    },
  },
}

export default apiClient