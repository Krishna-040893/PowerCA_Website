import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DemoBooking } from '../demo-booking'

// Mock react-calendar to provide deterministic date selection
jest.mock('react-calendar', () => {
  const CalendarMock = ({ onChange }: { onChange?: (date: Date) => void }) => (
    <div data-testid="calendar-mock">
      {[10, 16, 20].map(day => (
        <button key={day} onClick={() => onChange?.(new Date(2025, 0, day))}>
          {day}
        </button>
      ))}
    </div>
  )

  CalendarMock.displayName = 'CalendarMock'

  return CalendarMock
})

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
      <button {...props}>{children}</button>
    ),
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
    jest.useFakeTimers()
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ bookedSlots: [] }),
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('should render the booking form', async () => {
    render(<DemoBooking />)

    await screen.findByRole('heading', { name: 'Book Your Free Demo' })
  })

  it('should show calendar when component mounts', async () => {
    render(<DemoBooking />)

    await screen.findByRole('heading', { name: 'Select Date' })
    expect(screen.getByTestId('calendar-mock')).toBeInTheDocument()
  })

  it('should allow user to select a date', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<DemoBooking />)

    await screen.findByRole('heading', { name: 'Select Date' })

    const dateButton = screen.getByRole('button', { name: '16' })
    await user.click(dateButton)

    await screen.findByRole('heading', { name: 'Select Time' })
  })

  it('should show form fields after selecting date and time', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<DemoBooking />)

    await screen.findByRole('heading', { name: 'Select Date' })
    await user.click(screen.getByRole('button', { name: '20' }))

    await screen.findByRole('heading', { name: 'Select Time' })
    await user.click(screen.getByText(/10:00 AM - 11:00 AM/i))
    await user.click(screen.getByRole('button', { name: /Next/i }))

    await screen.findByPlaceholderText('John Doe')
    expect(screen.getByPlaceholderText('john@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('9876543210')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(<DemoBooking />)

    await screen.findByRole('heading', { name: 'Select Date' })
    await user.click(screen.getByRole('button', { name: '20' }))

    await screen.findByRole('heading', { name: 'Select Time' })
    await user.click(screen.getByText(/10:00 AM - 11:00 AM/i))
    await user.click(screen.getByRole('button', { name: /Next/i }))

    await screen.findByRole('button', { name: /Confirm Booking/i })
    await user.click(screen.getByRole('button', { name: /Confirm Booking/i }))

    await screen.findByText(/Name is required/i)
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
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

    await screen.findByRole('heading', { name: 'Select Date' })
    await user.click(screen.getByRole('button', { name: '20' }))

    await screen.findByRole('heading', { name: 'Select Time' })
    await user.click(screen.getByText(/10:00 AM - 11:00 AM/i))
    await user.click(screen.getByRole('button', { name: /Next/i }))

    await screen.findByPlaceholderText('John Doe')
    await user.type(screen.getByPlaceholderText('John Doe'), 'John Doe')
    await user.type(screen.getByPlaceholderText('john@example.com'), 'john@example.com')
    await user.type(screen.getByPlaceholderText('9876543210'), '9876543210')
    await user.type(screen.getByPlaceholderText('ABC & Associates'), 'ABC & Associates')

    await user.click(screen.getByRole('button', { name: /Confirm Booking/i }))

    await screen.findByText(/Booking Confirmed/i)
  })
})
