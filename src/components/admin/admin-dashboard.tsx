'use client'

import {useEffect, useState, useCallback  } from 'react'
import {useSession, signOut  } from 'next-auth/react'
import {motion  } from 'framer-motion'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Button  } from '@/components/ui/button'
import {Badge  } from '@/components/ui/badge'
import {Calendar,
  LogOut,
  BarChart3,
 } from 'lucide-react'
import {BookingFilters  } from './booking-filters'
import {BookingTable  } from './booking-table'
import {AdminStats  } from './admin-stats'

interface Booking {
  id: string
  name: string
  email: string
  phone: string
  firm_name?: string
  date: string
  time: string
  type: string
  status: string
  message?: string
  created_at: string
}

export function AdminDashboard() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    today: 0,
    thisMonth: 0
  })

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true)

      // Get admin token from localStorage
      const token = localStorage.getItem('adminToken')

      const response = await fetch('/api/admin/bookings', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
        setFilteredBookings(data.bookings || [])
      } else {
        // Use sample data for demo
        const sampleBookings = generateSampleBookings()
        setBookings(sampleBookings)
        setFilteredBookings(sampleBookings)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      // Use sample data for demo
      const sampleBookings = generateSampleBookings()
      setBookings(sampleBookings)
      setFilteredBookings(sampleBookings)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateSampleBookings = (): Booking[] => {
    const today = new Date()
    const sampleBookings: Booking[] = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '9876543210',
        firm_name: 'Kumar & Associates',
        date: today.toISOString().split('T')[0],
        time: '10:00 AM - 11:00 AM',
        type: 'demo',
        status: 'CONFIRMED',
        message: 'Interested in practice management features',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '9876543211',
        firm_name: 'Sharma CA Firm',
        date: '2025-09-15',
        time: '02:00 PM - 03:00 PM',
        type: 'demo',
        status: 'PENDING',
        message: 'Need help with GST compliance',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Amit Patel',
        email: 'amit.patel@email.com',
        phone: '9876543212',
        firm_name: 'Patel & Co',
        date: '2025-09-12',
        time: '11:00 AM - 12:00 PM',
        type: 'demo',
        status: 'COMPLETED',
        message: 'Looking for client management solutions',
        created_at: new Date().toISOString()
      }
    ]
    return sampleBookings
  }

  const updateStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    setStats({
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'PENDING').length,
      confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
      completed: bookings.filter(b => b.status === 'COMPLETED').length,
      today: bookings.filter(b => b.date === today).length,
      thisMonth: bookings.filter(b => {
        const bookingDate = new Date(b.date)
        return bookingDate.getMonth() === currentMonth &&
               bookingDate.getFullYear() === currentYear
      }).length
    })
  }, [bookings])

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Update stats when bookings change
  useEffect(() => {
    updateStats()
  }, [updateStats])

  const handleFilterChange = (filters: { status?: string; date?: string; dateFrom?: string; dateTo?: string; search?: string }) => {
    let filtered = [...bookings]

    if (filters.status) {
      filtered = filtered.filter(booking =>
        booking.status.toLowerCase() === filters.status?.toLowerCase()
      )
    }

    if (filters.dateFrom) {
      const dateFrom = filters.dateFrom
      filtered = filtered.filter(booking => booking.date >= dateFrom)
    }

    if (filters.dateTo) {
      const dateTo = filters.dateTo
      filtered = filtered.filter(booking => booking.date <= dateTo)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const searchTerm = filters.search
      filtered = filtered.filter(booking =>
        booking.name.toLowerCase().includes(searchLower) ||
        booking.email.toLowerCase().includes(searchLower) ||
        booking.phone.includes(searchTerm) ||
        (booking.firm_name && booking.firm_name.toLowerCase().includes(searchLower))
      )
    }

    setFilteredBookings(filtered)
  }

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      // Update local state immediately for better UX
      const updatedBookings = bookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      )
      setBookings(updatedBookings)

      // Apply current filters to the updated bookings
      // This is a simplified version - you might want to re-apply the current filters
      setFilteredBookings(updatedBookings)

      // Send update to server
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        console.error('Failed to update booking status')
        // Revert the change if the server request failed
        setBookings(bookings)
        setFilteredBookings(bookings)
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      // Revert the change if there was an error
      setBookings(bookings)
      setFilteredBookings(bookings)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">PowerCA Admin</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {session?.user?.name || session?.user?.email}
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AdminStats stats={stats} isLoading={isLoading} />
        </motion.div>

        {/* Bookings Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Demo Bookings</span>
                  </CardTitle>
                  <CardDescription>
                    Manage and track all demo booking requests
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {filteredBookings.length} bookings
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Filters */}
                <BookingFilters onFilterChange={handleFilterChange} />

                {/* Bookings Table */}
                <BookingTable
                  bookings={filteredBookings}
                  isLoading={isLoading}
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}