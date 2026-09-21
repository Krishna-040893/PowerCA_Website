import { NextRequest } from 'next/server'

import { POST } from '../route'
import { sendContactFormEmail, sendWelcomeEmail } from '@/lib/send-emails'
import { forwardEnquiryToCrm } from '@/lib/crm'

jest.mock('@/lib/send-emails', () => ({
  sendContactFormEmail: jest.fn(),
  sendWelcomeEmail: jest.fn(),
}))

jest.mock('@/lib/crm', () => ({
  forwardEnquiryToCrm: jest.fn(),
}))

// jest.setup sets Supabase env vars, so the route saves the contact: answer
// that insert here instead of letting it reach the network.
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: () => ({
      insert: () => ({
        select: () => ({ single: () => Promise.resolve({ data: { id: 'contact-1' }, error: null }) }),
      }),
    }),
  })),
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
const mockForward = forwardEnquiryToCrm as unknown as jest.Mock

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

  it('forwards the enquiry to the CRM with the firm name', async () => {
    mockSendContactFormEmail.mockResolvedValue({ success: true })
    mockSendWelcomeEmail.mockResolvedValue({ success: true })

    await POST(
      createRequest({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        company: 'Doe & Associates',
        message: 'Need pricing for 8 users',
      })
    )

    expect(mockForward).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'contact',
        name: 'John Doe',
        organisation: 'Doe & Associates',
        email: 'john@example.com',
        phone: '9876543210',
        message: 'Need pricing for 8 users',
        externalId: 'contacts:contact-1',
      })
    )
  })

  it('does not forward an invalid submission', async () => {
    await POST(createRequest({ name: 'John Doe', email: 'not-an-email', message: 'Hello' }))
    expect(mockForward).not.toHaveBeenCalled()
  })
})
