const { TextDecoder, TextEncoder } = require('util')
const { ReadableStream, WritableStream, TransformStream } = require('stream/web')
const { MessageChannel, MessagePort, MessageEvent } = require('worker_threads')

if (!globalThis.TextEncoder) {
  globalThis.TextEncoder = TextEncoder
}

if (!globalThis.TextDecoder) {
  globalThis.TextDecoder = TextDecoder
}

if (!globalThis.ReadableStream) {
  globalThis.ReadableStream = ReadableStream
}

if (!globalThis.WritableStream) {
  globalThis.WritableStream = WritableStream
}

if (!globalThis.TransformStream) {
  globalThis.TransformStream = TransformStream
}

if (!globalThis.MessageChannel) {
  globalThis.MessageChannel = MessageChannel
}

if (!globalThis.MessagePort) {
  globalThis.MessagePort = MessagePort
}

if (!globalThis.MessageEvent) {
  globalThis.MessageEvent = MessageEvent
}

const {
  fetch: undiciFetch,
  Headers,
  Request: UndiciRequest,
  Response,
  FormData,
  File,
} = require('undici')

if (!globalThis.fetch) {
  globalThis.fetch = undiciFetch
}

if (!globalThis.Headers) {
  globalThis.Headers = Headers
}

if (!globalThis.Request) {
  globalThis.Request = UndiciRequest
}

if (!globalThis.Response) {
  globalThis.Response = Response
}

if (!globalThis.FormData) {
  globalThis.FormData = FormData
}

if (!globalThis.File) {
  globalThis.File = File
}

require('@testing-library/jest-dom')

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: jest.fn(),
  })),
  SessionProvider: ({ children }) => children,
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Suppress console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

