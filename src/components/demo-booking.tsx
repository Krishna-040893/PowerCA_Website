'use client'

import {useState, useEffect  } from 'react'
import {motion, AnimatePresence  } from 'framer-motion'
import Calendar from 'react-calendar'
import { format, addDays, isSunday, isBefore, startOfDay, isToday  } from 'date-fns'
import {useForm  } from 'react-hook-form'
import {Clock, CheckCircle, X, ArrowLeft, AlertCircle, MapPin  } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import 'react-calendar/dist/Calendar.css'
import {toast  } from 'sonner'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

interface BookingFormData {
  name: string
  email: string
  phone: string
  firmName: string
  message?: string
}

interface TimeSlot {
  time: string
  displayTime: string
  startHour: number
}

const timeSlots: TimeSlot[] = [
  { time: '11:00 AM - 12:00 PM', displayTime: '11:00 AM - 12:00 PM', startHour: 11 },
  { time: '02:00 PM - 03:00 PM', displayTime: '2:00 PM - 3:00 PM', startHour: 14 },
  { time: '04:00 PM - 05:00 PM', displayTime: '4:00 PM - 5:00 PM', startHour: 16 }
]

// The accounts linked from the booking card, same set as the footer.
const demoSocialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.instagram.com/powerca24/',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/power-ca-tbs25100',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    label: 'X',
    href: 'https://x.com/Powerca_24',
    path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@powerCA-24',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
]

const SLOT_CAPACITY = 5

export function DemoBooking() {
  const [selectedDate, setSelectedDate] = useState<Value>(null)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [slotCounts, setSlotCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [step, setStep] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [phoneError, setPhoneError] = useState<string>('')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BookingFormData>()

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter available time slots based on selected date and current time
  useEffect(() => {
    if (selectedDate && selectedDate instanceof Date) {
      const now = new Date()
      const currentHour = now.getHours()
      const currentMinutes = now.getMinutes()

      let filteredSlots = [...timeSlots]

      // If selected date is today, filter out past time slots
      if (isToday(selectedDate)) {
        filteredSlots = timeSlots.filter(slot => {
          // Only filter out slots that have already started
          // If current time is 10:30, still show 11:00 slot
          // If current time is 11:00 or later, hide 11:00 slot
          if (currentHour < slot.startHour) {
            return true // Future slot, always show
          } else if (currentHour === slot.startHour) {
            // If we're in the same hour, only show if we haven't passed the start time
            return currentMinutes === 0 // Only hide if it's exactly the hour or past
          } else {
            return false // Past slot, hide
          }
        })
      }

      setAvailableSlots(filteredSlots)
      fetchBookedSlots(selectedDate)
    }
  }, [selectedDate])

  // Auto-deselect time if slot becomes full after re-fetch
  useEffect(() => {
    if (selectedTime && (slotCounts[selectedTime] || 0) >= SLOT_CAPACITY) {
      setSelectedTime('')
    }
  }, [slotCounts, selectedTime])

  const fetchBookedSlots = async (date: Date) => {
    try {
      const dateParam = format(date, 'yyyy-MM-dd')
      const response = await fetch(`/api/booking?date=${encodeURIComponent(dateParam)}`)
      if (!response.ok) throw new Error('Failed to fetch slots')
      const data = await response.json()
      setSlotCounts(data.slotCounts || {})
    } catch {
      setSlotCounts({})
    }
  }

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time for your demo.')
      return
    }

    // Validate phone number
    if (!phoneNumber) {
      setPhoneError('Phone number is required')
      return
    }
    if (phoneNumber.length < 10) {
      setPhoneError('Please enter a valid phone number')
      return
    }

    setLoading(true)
    try {
      // Format date as YYYY-MM-DD to ensure correct date is stored
      const formattedDate = selectedDate instanceof Date
        ? format(selectedDate, 'yyyy-MM-dd')
        : selectedDate;

      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          phone: phoneNumber,
          date: formattedDate,
          time: selectedTime
        })
      })

      let result;
      try {
        result = await response.json()
      } catch {
        toast.error('Server returned an unexpected response. Please try again.')
        return
      }

      if (result.success) {
        setShowConfirmation(true)
        reset()
        setPhoneNumber('')
        setPhoneError('')
        setSelectedDate(null)
        setSelectedTime('')
        setStep(1)

        // Auto-hide confirmation after 10 seconds
        setTimeout(() => setShowConfirmation(false), 10000)
      } else {
        // Handle error from both direct responses and createErrorResponse format
        const details = result.details || result.error?.type || result.error?.code
        // Extract message: could be result.error (string), result.error.message (object), or result.message
        const errorMessage = typeof result.error === 'string'
          ? result.error
          : result.error?.message || result.message

        if (details === 'duplicate') {
          toast.error('You have already booked this time slot. Please select a different time.')
          setStep(1)
          setSelectedTime('')
        } else if (details === 'slot_full') {
          toast.error('This time slot is now fully booked. Please select a different time.')
          setStep(1)
          setSelectedTime('')
          if (selectedDate instanceof Date) {
            fetchBookedSlots(selectedDate)
          }
        } else if (details === 'database' || details === 'DATABASE_ERROR' || details === 'CONFIGURATION_ERROR') {
          toast.error('Failed to book demo. Service is temporarily unavailable. Please try again in a moment.')
        } else if (details === 'validation' || details === 'VALIDATION_ERROR') {
          toast.error('Failed to book demo. Please check all required fields are filled correctly.')
        } else {
          toast.error(errorMessage || 'Failed to book demo. Please try again later.')
        }
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Unable to connect to the server. Please check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const tileDisabled = ({ date }: { date: Date }) => {
    // Disable Sundays and past dates
    return isSunday(date) || isBefore(date, startOfDay(new Date()))
  }

  const tileClassName = ({ date }: { date: Date }) => {
    if (isSunday(date)) return 'sunday-disabled'
    if (isBefore(date, startOfDay(new Date()))) return 'past-date'
    return ''
  }

  return (
    <div className="relative">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/login-bg.png')" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-7 sm:py-10 md:py-12 lg:py-[60px]">
        {/* Back to Home Button */}
        <div className="mb-4 max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#001525] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Two panels in one card: who you are meeting on the left, the
              booking itself on the right. */}
          <div className="grid overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_64px_-32px_rgba(16,24,40,0.30)] lg:grid-cols-[360px_1fr]">
            <aside className="border-b border-gray-100 p-6 text-center sm:p-8 lg:border-b-0 lg:border-r lg:p-10 lg:text-left">
              <Image
                src="/images/powerca-logo-horizontal.png"
                alt="Power CA"
                width={200}
                height={60}
                className="mx-auto h-10 w-auto lg:mx-0"
              />

              <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">
                Practice management for Chartered Accountants
              </p>

              <h1 className="mt-3 text-[30px] sm:text-[34px] font-normal leading-[1.2] tracking-tight text-[#001525] font-inter">
                Book Your
                <span className="mt-1 block font-semibold">Free Demo</span>
              </h1>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500 font-inter lg:mx-0">
                Schedule a personalized demo and discover how Power CA can transform your practice
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3 lg:flex-col lg:items-start lg:justify-start lg:gap-3.5">
                <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 lg:rounded-none lg:bg-transparent lg:items-start lg:px-0 lg:py-0">
                  <Clock className="h-4 w-4 shrink-0 text-gray-400 lg:mt-0.5" />
                  <span className="text-sm text-gray-500">
                    <span className="font-medium text-[#001525]">Monday - Saturday</span>
                    <span className="mx-1.5 text-gray-300">|</span>
                    <span>1 hour session</span>
                  </span>
                </span>
                <span className="inline-flex items-start gap-2 text-left">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                  <span className="max-w-[280px] text-sm leading-relaxed text-gray-500">
                    No. 130, II Floor, Muneer Complex, Palani Road, Udumalpet.
                  </span>
                </span>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
                {demoSocialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-[#001525] hover:text-[#001525]"
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </aside>

            <div className="p-6 sm:p-8 lg:p-10">
            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="mb-6 text-lg sm:text-xl font-semibold text-[#001525] font-inter">
                  Select Date &amp; Time
                </h2>

                <div>
                  <div>
                    <div className="calendar-wrapper">
                      <style jsx global>{`
                        .react-calendar {
                          width: 100%;
                          border: none;
                          border-radius: 12px;
                          padding: 12px;
                          background: transparent;
                          font-family: inherit;
                        }
                        @media (min-width: 640px) {
                          .react-calendar {
                            padding: 16px;
                          }
                        }
                        .react-calendar__tile {
                          padding: 8px 4px;
                          border-radius: 6px;
                          transition: all 0.2s;
                          font-size: 13px;
                        }
                        @media (min-width: 640px) {
                          .react-calendar__tile {
                            padding: 12px 8px;
                            border-radius: 8px;
                            font-size: 14px;
                          }
                        }
                        .react-calendar__tile {
                          background: #f3f4f6;
                          margin-bottom: 6px;
                        }
                        .react-calendar__tile:hover {
                          background: #e5e7eb !important;
                        }
                        .react-calendar__tile--active {
                          background: #001525 !important;
                          color: white !important;
                        }
                        .react-calendar__tile--active:hover {
                          background: #00223a !important;
                        }
                        .react-calendar__tile--now {
                          font-weight: 600;
                          color: #001525;
                        }
                        .react-calendar__month-view__days__day--neighboringMonth,
                        .react-calendar__tile:disabled {
                          background: transparent;
                        }
                        .sunday-disabled {
                          color: #ef4444 !important;
                          opacity: 0.5;
                          cursor: not-allowed !important;
                        }
                        .past-date {
                          opacity: 0.4;
                          cursor: not-allowed !important;
                        }
                        .react-calendar__navigation button {
                          color: #001525;
                          font-size: 16px;
                          font-weight: 600;
                          border-radius: 9999px;
                        }
                        @media (min-width: 640px) {
                          .react-calendar__navigation button {
                            font-size: 18px;
                          }
                        }
                        .react-calendar__navigation button:hover {
                          background: #f3f4f6;
                        }
                        .react-calendar__month-view__weekdays {
                          text-transform: uppercase;
                          font-size: 10px;
                          font-weight: 600;
                          color: #9ca3af;
                          padding-bottom: 8px;
                        }
                        .react-calendar__month-view__weekdays abbr {
                          text-decoration: none;
                        }
                        @media (min-width: 640px) {
                          .react-calendar__month-view__weekdays {
                            font-size: 12px;
                          }
                        }
                      `}</style>
                      {mounted && (
                        <Calendar
                          onChange={setSelectedDate}
                          value={selectedDate}
                          tileDisabled={tileDisabled}
                          tileClassName={tileClassName}
                          minDate={new Date()}
                          maxDate={addDays(new Date(), 60)}
                          locale="en-US"
                        />
                      )}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div className="mt-8">
                    <h3 className="mb-4 text-base font-semibold text-[#001525] font-inter">Available Times</h3>
                    {selectedDate ? (
                      availableSlots.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {availableSlots.map((slot) => {
                            const count = slotCounts[slot.time] || 0
                            const isFull = count >= SLOT_CAPACITY
                            return (
                              <motion.button
                                key={slot.time}
                                whileHover={{ scale: isFull ? 1 : 1.05 }}
                                whileTap={{ scale: isFull ? 1 : 0.95 }}
                                onClick={() => !isFull && setSelectedTime(slot.time)}
                                disabled={isFull}
                                className={`
                                  h-12 rounded-xl px-3 text-sm font-medium transition-colors
                                  ${isFull
                                    ? 'bg-red-50 text-red-400 cursor-not-allowed'
                                    : selectedTime === slot.time
                                      ? 'bg-[#001525] text-white'
                                      : 'bg-gray-100 text-[#001525] hover:bg-gray-200'
                                  }
                                `}
                              >
                                <div className="flex items-center justify-center gap-1 sm:gap-2">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span>{slot.displayTime}</span>
                                </div>
                                {isFull && (
                                  <span className="block text-[10px] sm:text-xs mt-1">Slot Full</span>
                                )}
                              </motion.button>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-6">
                          <div className="text-center">
                            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600 mx-auto mb-2 sm:mb-3" />
                            <p className="text-gray-700 font-medium text-sm sm:text-base">No available time slots for this date</p>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">
                              {isToday(selectedDate as Date)
                                ? 'All slots for today have passed. Please select another date.'
                                : 'Please select another date.'}
                            </p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center rounded-xl bg-gray-50 py-6">
                        <p className="text-sm text-gray-500">Please select a date first</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end mt-4 sm:mt-6">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedDate || !selectedTime}
                    className={`
                      h-12 w-full rounded-full px-8 text-sm font-medium transition-colors sm:w-auto
                      ${selectedDate && selectedTime
                        ? 'bg-[#001525] text-white hover:bg-[#00223a]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    Next: Enter Details
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <h2 className="mb-6 text-lg sm:text-xl font-semibold text-[#001525] font-inter">
                  Your Details
                </h2>

                {/* Selected DateTime Display */}
                <div className="mb-6 rounded-xl bg-gray-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">Selected Date &amp; Time</p>
                      <p className="mt-1 text-sm sm:text-base font-semibold text-[#001525]">
                        {selectedDate && format(selectedDate as Date, 'EEEE, MMMM d, yyyy')} at {selectedTime}
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="self-start text-sm font-medium text-gray-500 underline-offset-4 transition-colors hover:text-[#001525] hover:underline sm:self-auto"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Contact Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-[#001525]">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('name', { required: 'Name is required' })}
                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#001525] placeholder:text-gray-400 outline-none transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10"
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-[#001525]">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        type="email"
                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#001525] placeholder:text-gray-400 outline-none transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10"
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-[#001525]">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <PhoneInput
                        international
                        defaultCountry="IN"
                        value={phoneNumber}
                        onChange={(value) => {
                          setPhoneNumber(value || '')
                          setPhoneError('')
                        }}
                        className="flex gap-0 [&>input]:w-full [&>input]:px-3 [&>input]:py-2 [&>input]:sm:py-2.5 [&>input]:text-sm [&>input]:sm:text-base [&>input]:rounded-r-lg [&>input]:border [&>input]:border-gray-300 [&>input]:focus:border-primary-500 [&>input]:focus:ring-2 [&>input]:focus:ring-primary-200 [&>input]:transition-all [&>.PhoneInputCountry]:bg-transparent [&>.PhoneInputCountry]:border [&>.PhoneInputCountry]:border-gray-300 [&>.PhoneInputCountry]:border-r-0 [&>.PhoneInputCountry]:rounded-l-lg [&>.PhoneInputCountry]:px-3 [&>.PhoneInputCountry]:flex [&>.PhoneInputCountry]:items-center [&>.PhoneInputCountry]:gap-2 [&_.PhoneInputCountryIcon]:w-5 [&_.PhoneInputCountryIcon]:h-5 [&_.PhoneInputCountryIcon]:shadow-none [&_.PhoneInputCountrySelectArrow]:opacity-50"
                        numberInputProps={{
                          className: "flex-1"
                        }}
                        placeholder="Enter phone number"
                      />
                      {phoneError && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{phoneError}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-[#001525]">
                        Firm Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('firmName', { required: 'Firm name is required' })}
                        className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#001525] placeholder:text-gray-400 outline-none transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10"
                        placeholder="ABC & Associates"
                      />
                      {errors.firmName && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.firmName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#001525]">
                      Message (Optional)
                    </label>
                    <textarea
                      {...register('message')}
                      rows={3}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-white p-4 text-sm text-[#001525] placeholder:text-gray-400 outline-none transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10"
                      placeholder="Tell us about your requirements or any specific features you're interested in..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between sm:gap-0">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-12 w-full rounded-full border border-gray-200 px-6 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-[#001525] sm:w-auto"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`
                        h-12 w-full rounded-full px-8 text-sm font-medium transition-colors sm:w-auto
                        ${loading
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[#001525] text-white hover:bg-[#00223a]'
                        }
                      `}
                    >
                      {loading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowConfirmation(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="text-center">
                <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Booking Confirmed!
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-5 sm:mb-6 px-2">
                  Your demo has been successfully scheduled. You'll receive a confirmation email shortly with all the details.
                </p>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 text-sm sm:text-base"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
