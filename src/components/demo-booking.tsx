"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Calendar from "react-calendar"
import { format, addDays, isSunday, isAfter, isBefore, startOfDay, isToday, parseISO, isSameDay } from "date-fns"
import { useForm } from "react-hook-form"
import { Calendar as CalendarIcon, Clock, User, Building, Phone, Mail, MessageSquare, CheckCircle, X, Home, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import 'react-calendar/dist/Calendar.css'

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

interface BookingFormData {
  name: string
  email: string
  phone: string
  firmName?: string
  message?: string
}

interface TimeSlot {
  time: string
  displayTime: string
  startHour: number
}

const timeSlots: TimeSlot[] = [
  { time: "10:00 AM - 11:00 AM", displayTime: "10:00 AM - 11:00 AM", startHour: 10 },
  { time: "11:00 AM - 12:00 PM", displayTime: "11:00 AM - 12:00 PM", startHour: 11 },
  { time: "02:00 PM - 03:00 PM", displayTime: "2:00 PM - 3:00 PM", startHour: 14 },
  { time: "03:00 PM - 04:00 PM", displayTime: "3:00 PM - 4:00 PM", startHour: 15 },
  { time: "04:00 PM - 05:00 PM", displayTime: "4:00 PM - 5:00 PM", startHour: 16 }
]

export function DemoBooking() {
  const [selectedDate, setSelectedDate] = useState<Value>(null)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [step, setStep] = useState(1)
  const [mounted, setMounted] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  
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

  const fetchBookedSlots = async (date: Date) => {
    try {
      const response = await fetch(`/api/bookings/supabase?date=${date.toISOString()}`)
      const data = await response.json()
      setBookedSlots(data.bookedSlots || [])
    } catch (error) {
      console.error('Error fetching booked slots:', error)
      setBookedSlots([])
    }
  }

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time for your demo.')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/bookings/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          date: selectedDate,
          time: selectedTime
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setShowConfirmation(true)
        reset()
        setSelectedDate(null)
        setSelectedTime("")
        setStep(1)
        
        // Auto-hide confirmation after 10 seconds
        setTimeout(() => setShowConfirmation(false), 10000)
      } else {
        console.error('Booking failed:', result)
        let errorMsg = 'Failed to book demo. '
        
        if (result.details) {
          // Extract meaningful error message
          if (result.details.includes('database')) {
            errorMsg += 'Database connection issue. Please try again in a moment.'
          } else if (result.details.includes('validation')) {
            errorMsg += 'Please check all required fields are filled correctly.'
          } else if (result.details.includes('email')) {
            errorMsg += 'Email service is temporarily unavailable, but your booking will be saved.'
          } else {
            errorMsg += result.error || 'Please try again later.'
          }
        } else {
          errorMsg += result.error || 'Please try again.'
        }
        
        alert(errorMsg)
      }
    } catch (error) {
      console.error('Booking error:', error)
      alert('Unable to connect to the server. Please check your internet connection and try again.')
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
    <div className="relative min-h-screen py-12">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #1D91EB 1px, transparent 1px),
              linear-gradient(to bottom, #1D91EB 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Book Your Free Demo
            </h1>
            <p className="text-lg text-gray-600">
              Schedule a personalized demo and discover how PowerCA can transform your practice
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Select Date & Time</span>
              </div>
              <div className={`w-20 h-0.5 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="ml-2 font-medium hidden sm:inline">Your Details</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8"
              >
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Calendar */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2 text-primary-600" />
                      Select Date
                    </h2>
                    <div className="calendar-wrapper">
                      <style jsx global>{`
                        .react-calendar {
                          width: 100%;
                          border: none;
                          border-radius: 12px;
                          padding: 16px;
                          background: #f9fafb;
                          font-family: inherit;
                        }
                        .react-calendar__tile {
                          padding: 12px 8px;
                          border-radius: 8px;
                          transition: all 0.2s;
                        }
                        .react-calendar__tile:hover {
                          background: #e5e7eb !important;
                        }
                        .react-calendar__tile--active {
                          background: linear-gradient(135deg, #1D91EB, #1BAF69) !important;
                          color: white !important;
                        }
                        .react-calendar__tile--now {
                          background: #f3f4f6;
                          font-weight: bold;
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
                          color: #1D91EB;
                          font-size: 18px;
                          font-weight: 600;
                        }
                        .react-calendar__month-view__weekdays {
                          text-transform: uppercase;
                          font-size: 12px;
                          font-weight: 600;
                          color: #6b7280;
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
                    <p className="text-sm text-gray-500 mt-4">
                      * Available Monday to Saturday, 9:00 AM - 6:00 PM
                    </p>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-primary-600" />
                      Select Time
                    </h2>
                    {selectedDate ? (
                      availableSlots.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                          {availableSlots.map((slot) => {
                            const isBooked = bookedSlots.includes(slot.time)
                            return (
                              <motion.button
                                key={slot.time}
                                whileHover={{ scale: isBooked ? 1 : 1.05 }}
                                whileTap={{ scale: isBooked ? 1 : 0.95 }}
                                onClick={() => !isBooked && setSelectedTime(slot.time)}
                                disabled={isBooked}
                                className={`
                                  px-4 py-3 rounded-lg font-medium transition-all text-sm
                                  ${isBooked 
                                    ? 'bg-red-50 text-red-400 cursor-not-allowed line-through border border-red-200'
                                    : selectedTime === slot.time
                                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200'
                                  }
                                `}
                              >
                                <div className="flex items-center justify-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {slot.displayTime}
                                </div>
                                {isBooked && (
                                  <span className="block text-xs mt-1">Already Booked</span>
                                )}
                              </motion.button>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="text-center">
                            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                            <p className="text-gray-700 font-medium">No available time slots for this date</p>
                            <p className="text-gray-500 text-sm mt-2">
                              {isToday(selectedDate as Date) 
                                ? "All slots for today have passed. Please select another date."
                                : "Please select another date."}
                            </p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                        <p className="text-gray-500">Please select a date first</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedDate || !selectedTime}
                    className={`
                      px-8 py-3 rounded-full font-semibold transition-all
                      ${selectedDate && selectedTime
                        ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg transform hover:scale-105'
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
                className="p-8"
              >
                {/* Selected DateTime Display */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Selected Date & Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedDate && format(selectedDate as Date, 'EEEE, MMMM d, yyyy')} at {selectedTime}
                      </p>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Contact Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name *
                      </label>
                      <input
                        {...register("name", { required: "Name is required" })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address *
                      </label>
                      <input
                        {...register("email", { 
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        })}
                        type="email"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number *
                      </label>
                      <input
                        {...register("phone", { 
                          required: "Phone number is required",
                          pattern: {
                            value: /^[6-9]\d{9}$/,
                            message: "Invalid Indian phone number"
                          }
                        })}
                        type="tel"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        placeholder="9876543210"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="w-4 h-4 inline mr-1" />
                        Firm Name (Optional)
                      </label>
                      <input
                        {...register("firmName")}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
                        placeholder="ABC & Associates"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Message (Optional)
                    </label>
                    <textarea
                      {...register("message")}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all resize-none"
                      placeholder="Tell us about your requirements or any specific features you're interested in..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 rounded-full font-semibold text-gray-600 hover:text-gray-800 transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`
                        px-8 py-3 rounded-full font-semibold transition-all
                        ${loading
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:shadow-lg transform hover:scale-105'
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
              className="bg-white rounded-2xl p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setShowConfirmation(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Booking Confirmed!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your demo has been successfully scheduled. You'll receive a confirmation email shortly with all the details.
                </p>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
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