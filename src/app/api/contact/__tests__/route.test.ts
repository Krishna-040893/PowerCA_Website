import { NextRequest } from 'next/server'

import { POST } from '../route'
import { sendContactFormEmail, sendWelcomeEmail } from '@/lib/send-emails'

jest.mock('@/lib/send-emails', () => ({
  sendContactFormEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}))

// Mock rate limiting to prevent 429 responses in tests
jest.mock('@/lib/middleware', () => ({
  withRateLimit: jest.fn((handler: any) => handler),
  RateLimits: {
    contactForm: { points: 100, duration: 60 },
  },
}))

const mockSendContactFormEmail = sendContactFormEmail as unknown as jest.Mock
const mockSendWelcomeEmail = sendWelcomeEmail as unknown as jest.Mock

const createRequest = (body: unknown) =>
  new NextRequest('http://localhost:3000/api/contact', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })

describe('Contact API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns success when emails are sent', async () => {
    mockSendContactFormEmail.mockResolvedValue({ success: true })
    mockSendWelcomeEmail.mockResolvedValue({ success: true })

    const response = await POST(
      createRequest({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        company: 'ACME',
        message: 'Hello there',
      })
    )

    expect(response.status).toBe(200)
    const payload = mockSendContactFormEmail.mock.calls[0][0]
    expect(payload).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      company: 'ACME',
      message: 'Hello there',
    })
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    })
  })

  it('sanitizes incoming fields before sending', async () => {
    mockSendContactFormEmail.mockResolvedValue({ success: true })
    mockSendWelcomeEmail.mockResolvedValue({ success: true })

    const response = await POST(
      createRequest({
        name: '<script>alert("x")</script>John',
        email: 'john@example.com',
        message: '<img src=x onerror=alert(1)>Hello',
      })
    )

    expect(response.status).toBe(200)
    const payload = mockSendContactFormEmail.mock.calls[0][0]
    expect(payload.name).toBe('John')
    expect(payload.message).toContain('Hello')
    expect(payload.message).not.toContain('<img')
  })

  it('returns 400 when required fields are missing', async () => {
    const response = await POST(createRequest({ email: 'john@example.com' }))

    expect(response.status).toBe(400)
    expect(mockSendContactFormEmail).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid email addresses', async () => {
    const response = await POST(
      createRequest({
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Hello',
      })
    )

    expect(response.status).toBe(400)
    expect(mockSendContactFormEmail).not.toHaveBeenCalled()
  })

  it('returns 500 when sending the contact email fails', async () => {
    mockSendContactFormEmail.mockResolvedValue({ success: false })

    const response = await POST(
      createRequest({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello',
      })
    )

    expect(response.status).toBe(500)
  })

  it('returns 400 for invalid JSON payloads', async () => {
    const response = await POST(createRequest('not-json'))

    expect(response.status).toBe(400)
    expect(mockSendContactFormEmail).not.toHaveBeenCalled()
  })
})

