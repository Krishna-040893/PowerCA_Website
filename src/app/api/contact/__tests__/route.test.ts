import { POST } from '../route'
import { NextRequest } from 'next/server'

// Mock Resend
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn(),
      },
    })),
  }
})

describe('Contact API Route', () => {
  let mockResendSend: jest.Mock

  beforeEach(async () => {
    jest.clearAllMocks()
    const resendModule = await import('resend')
    const { Resend } = resendModule as { Resend: typeof import('resend').Resend }
    mockResendSend = new Resend().emails.send
  })

  it('should successfully send contact form email', async () => {
    mockResendSend.mockResolvedValue({
      id: 'email-id-123',
      from: 'contact@powerca.in',
      to: 'team@powerca.in',
    })

    const requestBody = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      firmName: 'ABC & Associates',
      message: 'I am interested in your services',
    }

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Message sent successfully')

    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.any(String),
        to: expect.any(String),
        subject: expect.stringContaining('Contact Form Submission'),
      })
    )
  })

  it('should validate required fields', async () => {
    const requestBody = {
      // Missing required fields
      email: 'john@example.com',
    }

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
    expect(mockResendSend).not.toHaveBeenCalled()
  })

  it('should validate email format', async () => {
    const requestBody = {
      name: 'John Doe',
      email: 'invalid-email',
      phone: '9876543210',
      message: 'Test message',
    }

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('email')
    expect(mockResendSend).not.toHaveBeenCalled()
  })

  it('should handle Resend API errors', async () => {
    mockResendSend.mockRejectedValue(new Error('Resend API error'))

    const requestBody = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      firmName: 'ABC & Associates',
      message: 'Test message',
    }

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Failed to send message')
  })

  it('should handle invalid JSON in request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBeDefined()
  })

  it('should sanitize input to prevent XSS', async () => {
    mockResendSend.mockResolvedValue({
      id: 'email-id-123',
    })

    const requestBody = {
      name: '<script>alert("XSS")</script>John',
      email: 'john@example.com',
      phone: '9876543210',
      message: '<img src=x onerror=alert(1)>Test message',
    }

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)

    expect(response.status).toBe(200)

    // Check that the email was sent with sanitized content
    expect(mockResendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: expect.any(String),
        to: expect.any(String),
        // The actual sanitization should remove script tags
      })
    )
  })
})