/**
 * @fileoverview Tests for EnhancedContactForm component
 *
 * Tests cover:
 * - Form validation rules
 * - Error messages
 * - Successful submission
 * - Network error handling
 * - Form persistence
 */

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EnhancedContactForm } from '../enhanced-contact-form'
import { server } from '@/test/mocks/server'
import { rest } from 'msw'

describe('EnhancedContactForm', () => {
  it('should render all form fields', () => {
    render(<EnhancedContactForm />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  describe('Validation', () => {
    it('should validate required name field', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    })

    it('should validate name minimum length', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const nameInput = screen.getByLabelText(/name/i)
      await user.type(nameInput, 'A')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/name must be at least 2 characters/i)).toBeInTheDocument()
    })

    it('should validate required email field', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument()
    })

    it('should accept valid email formats', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const emailInput = screen.getByLabelText(/email/i)

      // Test various valid email formats
      const validEmails = [
        'test@example.com',
        'user.name@example.co.in',
        'user+tag@example.com',
        'user_name@example-domain.com',
      ]

      for (const email of validEmails) {
        await user.clear(emailInput)
        await user.type(emailInput, email)

        // Should not show email validation error
        const submitButton = screen.getByRole('button', { name: /submit/i })
        await user.click(submitButton)

        await waitFor(() => {
          expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument()
        })
      }
    })

    it('should validate phone number format', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const phoneInput = screen.getByLabelText(/phone/i)
      await user.type(phoneInput, 'invalid-phone')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/please enter a valid phone number/i)).toBeInTheDocument()
    })

    it('should accept valid phone number formats', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const phoneInput = screen.getByLabelText(/phone/i)

      const validPhones = [
        '9876543210',
        '+91 9876543210',
        '+91-9876543210',
        '(987) 654-3210',
      ]

      for (const phone of validPhones) {
        await user.clear(phoneInput)
        await user.type(phoneInput, phone)

        // Should not show phone validation error
        const submitButton = screen.getByRole('button', { name: /submit/i })
        await user.click(submitButton)

        await waitFor(() => {
          expect(screen.queryByText(/please enter a valid phone number/i)).not.toBeInTheDocument()
        })
      }
    })

    it('should validate required subject field', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/subject is required/i)).toBeInTheDocument()
    })

    it('should validate subject minimum length', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const subjectInput = screen.getByLabelText(/subject/i)
      await user.type(subjectInput, 'AB')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/subject must be at least 3 characters/i)).toBeInTheDocument()
    })

    it('should validate required message field', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/message is required/i)).toBeInTheDocument()
    })

    it('should validate message minimum length', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const messageInput = screen.getByLabelText(/message/i)
      await user.type(messageInput, 'Short')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/message must be at least 10 characters/i)).toBeInTheDocument()
    })

    it('should validate message maximum length', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const messageInput = screen.getByLabelText(/message/i)
      const longMessage = 'A'.repeat(1001) // Exceeds 1000 char limit

      await user.type(messageInput, longMessage)

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      expect(await screen.findByText(/message must be less than 1000 characters/i)).toBeInTheDocument()
    })
  })

  describe('Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      // Fill form with valid data
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/phone/i), '9876543210')
      await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message that meets minimum length requirements.')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      // Wait for success message
      await waitFor(() => {
        expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument()
      })
    })

    it('should show loading state during submission', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      // Fill form
      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message.')

      const submitButton = screen.getByRole('button', { name: /submit/i })
      await user.click(submitButton)

      // Check for loading state
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled()
    })

    it('should clear form after successful submission', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement

      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message.')

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(nameInput.value).toBe('')
        expect(emailInput.value).toBe('')
      })
    })

    it('should handle submission errors gracefully', async () => {
      server.use(
        rest.post('/api/contact', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({
              error: 'Failed to send message',
            })
          )
        })
      )

      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message.')

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText(/failed to send message/i)).toBeInTheDocument()
      })
    })

    it('should handle network errors', async () => {
      server.use(
        rest.post('/api/contact', (req, res) => {
          return res.networkError('Network error')
        })
      )

      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')
      await user.type(screen.getByLabelText(/subject/i), 'Test Subject')
      await user.type(screen.getByLabelText(/message/i), 'This is a test message.')

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Persistence', () => {
    it('should persist form data to localStorage', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      await user.type(screen.getByLabelText(/name/i), 'John Doe')
      await user.type(screen.getByLabelText(/email/i), 'john@example.com')

      // Wait for debounce
      await waitFor(() => {
        const savedData = localStorage.getItem('contact_form')
        expect(savedData).toBeTruthy()

        if (savedData) {
          const parsed = JSON.parse(savedData)
          expect(parsed.name).toBe('John Doe')
          expect(parsed.email).toBe('john@example.com')
        }
      }, { timeout: 1000 })
    })

    it('should restore form data from localStorage on mount', () => {
      const savedData = {
        name: 'Restored User',
        email: 'restored@example.com',
        phone: '9876543210',
        subject: 'Restored Subject',
        message: 'Restored message',
      }

      localStorage.setItem('contact_form', JSON.stringify(savedData))

      render(<EnhancedContactForm />)

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement

      expect(nameInput.value).toBe('Restored User')
      expect(emailInput.value).toBe('restored@example.com')
    })
  })

  describe('Accessibility', () => {
    it('should associate labels with inputs', () => {
      render(<EnhancedContactForm />)

      const nameInput = screen.getByLabelText(/name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const phoneInput = screen.getByLabelText(/phone/i)
      const subjectInput = screen.getByLabelText(/subject/i)
      const messageInput = screen.getByLabelText(/message/i)

      expect(nameInput).toHaveAttribute('id')
      expect(emailInput).toHaveAttribute('id')
      expect(phoneInput).toHaveAttribute('id')
      expect(subjectInput).toHaveAttribute('id')
      expect(messageInput).toHaveAttribute('id')
    })

    it('should show error messages with aria-invalid', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      await user.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/name/i)
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(<EnhancedContactForm />)

      const nameInput = screen.getByLabelText(/name/i)

      await user.tab()
      expect(nameInput).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/email/i)).toHaveFocus()

      await user.tab()
      expect(screen.getByLabelText(/phone/i)).toHaveFocus()
    })
  })
})
