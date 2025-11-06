/**
 * Test utilities and helpers for component testing
 *
 * @module test-utils
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Mock session data for authenticated tests
 */
export const mockSession = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'subscriber' as const,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

/**
 * Mock admin session data
 */
export const mockAdminSession = {
  user: {
    id: 'test-admin-id',
    email: 'admin@example.com',
    name: 'Admin User',
    username: 'admin',
    role: 'admin' as const,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

/**
 * Mock affiliate session data
 */
export const mockAffiliateSession = {
  user: {
    id: 'test-affiliate-id',
    email: 'affiliate@example.com',
    name: 'Affiliate User',
    role: 'affiliate' as const,
    status: 'approved' as const,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

/**
 * Creates a new QueryClient for testing
 *
 * @returns A configured QueryClient instance with retry disabled
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  })
}

/**
 * Props for AllTheProviders wrapper component
 */
interface AllTheProvidersProps {
  children: ReactNode
  session?: typeof mockSession | null
  queryClient?: QueryClient
}

/**
 * Wrapper component that provides all necessary contexts for testing
 *
 * @param props - Provider props
 * @returns Wrapped children with all providers
 */
function AllTheProviders({ children, session = null, queryClient }: AllTheProvidersProps) {
  const client = queryClient || createTestQueryClient()

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}

/**
 * Custom render options extending RTL's RenderOptions
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: typeof mockSession | null
  queryClient?: QueryClient
}

/**
 * Custom render function that includes all necessary providers
 *
 * @param ui - React element to render
 * @param options - Render options including session and query client
 * @returns Render result with rerender function
 *
 * @example
 * ```typescript
 * const { getByText } = renderWithProviders(<MyComponent />, {
 *   session: mockSession
 * })
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  { session = null, queryClient, ...options }: CustomRenderOptions = {}
): RenderResult {
  const client = queryClient || createTestQueryClient()

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders session={session} queryClient={client}>
        {children}
      </AllTheProviders>
    ),
    ...options,
  })
}

/**
 * Wait for a specific amount of time
 *
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Mock fetch response helper
 *
 * @param data - Data to return in response
 * @param options - Response options
 * @returns Mocked Response object
 */
export function mockFetchResponse<T>(
  data: T,
  options: { status?: number; statusText?: string } = {}
): Response {
  return {
    ok: (options.status || 200) >= 200 && (options.status || 200) < 300,
    status: options.status || 200,
    statusText: options.statusText || 'OK',
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
  } as Response
}

/**
 * Mock fetch error helper
 *
 * @param status - HTTP status code
 * @param message - Error message
 * @returns Mocked error Response object
 */
export function mockFetchError(status: number, message: string): Response {
  return {
    ok: false,
    status,
    statusText: message,
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
    headers: new Headers(),
  } as Response
}

/**
 * Creates a mock file for upload testing
 *
 * @param name - File name
 * @param size - File size in bytes
 * @param type - MIME type
 * @returns Mock File object
 */
export function createMockFile(
  name: string = 'test.jpg',
  size: number = 1024,
  type: string = 'image/jpeg'
): File {
  const blob = new Blob(['a'.repeat(size)], { type })
  return new File([blob], name, { type })
}

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    key: jest.fn((index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }),
    get length() {
      return Object.keys(store).length
    },
  }
})()

/**
 * Setup localStorage mock before tests
 */
export function setupLocalStorageMock(): void {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })
}

/**
 * Mock IntersectionObserver for component tests
 */
export function mockIntersectionObserver(): void {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords() {
      return []
    }
    get root() {
      return null
    }
    get rootMargin() {
      return ''
    }
    get thresholds() {
      return []
    }
  } as any
}

/**
 * Mock window.matchMedia for responsive tests
 *
 * @param matches - Whether media query matches
 */
export function mockMatchMedia(matches: boolean = false): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }
