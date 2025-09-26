import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DemoBooking } from '../demo-booking'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock the toast library
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

describe('DemoBooking Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ bookedSlots: [] }),
    })
  })

  it('should render the booking form', () => {
    render(<DemoBooking />)
    expect(screen.getByText(/Book Your Demo/i)).toBeInTheDocument()
  })

  it('should show calendar when component mounts', async () => {
    render(<DemoBooking />)

    await waitFor(() => {
      expect(screen.getByText(/Select Date/i)).toBeInTheDocument()
    })
  })

  it('should allow user to select a date', async () => {
    const user = userEvent.setup()
    render(<DemoBooking />)

    // Wait for the component to mount
    await waitFor(() => {
      expect(screen.getByText(/Select Date/i)).toBeInTheDocument()
    })

    // Find and click on a date button (looking for any date number)
    const dateButtons = screen.getAllByRole('button')
    const validDateButton = dateButtons.find(button =>
      button.textContent && /^\d+$/.test(button.textContent) && parseInt(button.textContent) > 0
    )

    if (validDateButton) {
      await user.click(validDateButton)

      // After selecting a date, time slots should be visible
      await waitFor(() => {
        expect(screen.getByText(/Select Time/i)).toBeInTheDocument()
      })
    }
  })

  it('should show form fields after selecting date and time', async () => {
    const user = userEvent.setup()
    render(<DemoBooking />)

    // Wait for mount
    await waitFor(() => {
      expect(screen.getByText(/Select Date/i)).toBeInTheDocument()
    })

    // Select a date
    const dateButtons = screen.getAllByRole('button')
    const validDateButton = dateButtons.find(button =>
      button.textContent && /^\d+$/.test(button.textContent) && parseInt(button.textContent) > 15
    )

    if (validDateButton) {
      await user.click(validDateButton)

      // Wait for time slots
      await waitFor(() => {
        expect(screen.getByText(/Select Time/i)).toBeInTheDocument()
      })

      // Select a time slot
      const timeButton = screen.getByText(/10:00 AM - 11:00 AM/i)
      await user.click(timeButton)

      // Click next button
      const nextButton = screen.getByText(/Next/i)
      await user.click(nextButton)

      // Form fields should be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument()
      })
    }
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<DemoBooking />)

    // Navigate to form step
    await waitFor(() => {
      expect(screen.getByText(/Select Date/i)).toBeInTheDocument()
    })

    // Select date
    const dateButtons = screen.getAllByRole('button')
    const validDateButton = dateButtons.find(button =>
      button.textContent && /^\d+$/.test(button.textContent) && parseInt(button.textContent) > 15
    )

    if (validDateButton) {
      await user.click(validDateButton)

      await waitFor(() => {
        expect(screen.getByText(/Select Time/i)).toBeInTheDocument()
      })

      const timeButton = screen.getByText(/10:00 AM - 11:00 AM/i)
      await user.click(timeButton)

      const nextButton = screen.getByText(/Next/i)
      await user.click(nextButton)

      // Try to submit without filling fields
      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Book Demo/i })
        expect(submitButton).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /Book Demo/i })
      await user.click(submitButton)

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
      })
    }
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bookedSlots: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Demo booked successfully!' }),
      })

    render(<DemoBooking />)

    await waitFor(() => {
      expect(screen.getByText(/Select Date/i)).toBeInTheDocument()
    })

    // Select date
    const dateButtons = screen.getAllByRole('button')
    const validDateButton = dateButtons.find(button =>
      button.textContent && /^\d+$/.test(button.textContent) && parseInt(button.textContent) > 15
    )

    if (validDateButton) {
      await user.click(validDateButton)

      await waitFor(() => {
        expect(screen.getByText(/Select Time/i)).toBeInTheDocument()
      })

      const timeButton = screen.getByText(/10:00 AM - 11:00 AM/i)
      await user.click(timeButton)

      const nextButton = screen.getByText(/Next/i)
      await user.click(nextButton)

      // Fill form
      await waitFor(() => {
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/Full Name/i), 'John Doe')
      await user.type(screen.getByLabelText(/Email Address/i), 'john@example.com')
      await user.type(screen.getByLabelText(/Phone Number/i), '9876543210')
      await user.type(screen.getByLabelText(/Firm Name/i), 'ABC & Associates')

      const submitButton = screen.getByRole('button', { name: /Book Demo/i })
      await user.click(submitButton)

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/Demo Booked Successfully/i)).toBeInTheDocument()
      })
    }
  })
})