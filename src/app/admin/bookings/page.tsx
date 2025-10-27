'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import {AdminPageWrapper  } from '@/components/admin/admin-page-wrapper'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow  } from '@/components/ui/table'
import {Badge  } from '@/components/ui/badge'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger  } from '@/components/ui/dialog'
import { Loader2, Calendar, Search, Eye, RefreshCw, Phone, Mail, User, Clock } from 'lucide-react'

interface Booking {
  id: string
  name: string
  email: string
  phone: string
  firm_name?: string
  date: string
  time: string
  type: string
  message?: string
  created_at: string
}

export default function AdminBookingsPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser } = useAdminAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const fetchBookings = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    setLoading(true)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      } else {
        console.error('Failed to fetch bookings:', response.status, response.statusText)
        setBookings([])
      }
    } catch (error) {
      clearTimeout(timeoutId)
      // Only show error if it's not an abort error (which happens on component unmount)
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted')
        // Don't set error state for abort errors
      } else {
        console.error('Error fetching bookings:', error)
        setBookings([])
      }
    } finally {
      setLoading(false)
    }

    // Return cleanup function
    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [isAuthenticated])

  const filterBookings = useCallback(() => {
    let filtered = [...bookings]

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm)
      )
    }

    setFilteredBookings(filtered)
  }, [bookings, searchTerm])

  useEffect(() => {
    console.log('🔐 Auth state changed:', { isAuthenticated, authLoading })
    if (isAuthenticated) {
      console.log('✅ User is authenticated, fetching bookings...')
      fetchBookings()
    } else if (!authLoading) {
      console.log('❌ User not authenticated')
    }
  }, [isAuthenticated, fetchBookings, authLoading])

  useEffect(() => {
    filterBookings()
  }, [filterBookings])

  console.log('🎨 Render state:', { authLoading, isAuthenticated, hasAdminUser: !!adminUser })

  if (authLoading) {
    console.log('⏳ Auth is loading...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!isAuthenticated || !adminUser) {
    console.log('❌ Not authenticated or no admin user, returning null')
    return null
  }

  return (
    <AdminPageWrapper
      title="Bookings Management"
      description="Manage and track demo bookings"
      actions={
        <Button onClick={fetchBookings} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>View and manage demo bookings</CardDescription>
              </div>
              <Button onClick={fetchBookings} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Filter */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
                <p className="mt-2 text-gray-600">Loading bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Booking Data Found</h3>
                <p className="text-gray-500">There are currently no bookings in the system.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.name}</p>
                            {booking.firm_name && (
                              <p className="text-sm text-gray-500">{booking.firm_name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {booking.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {booking.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{booking.date}</p>
                            <p className="text-sm text-gray-500">{booking.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{booking.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedBooking(booking)}
                                  className="bg-white hover:bg-gray-50"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white">
                                <DialogHeader>
                                  <DialogTitle>Booking Details</DialogTitle>
                                  <DialogDescription>
                                    Booking ID: {selectedBooking?.id}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedBooking && (
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Customer Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <p><User className="inline h-4 w-4 mr-2" />{selectedBooking.name}</p>
                                        <p><Mail className="inline h-4 w-4 mr-2" />{selectedBooking.email}</p>
                                        <p><Phone className="inline h-4 w-4 mr-2" />{selectedBooking.phone}</p>
                                        {selectedBooking.firm_name && (
                                          <p className="text-gray-600">Firm: {selectedBooking.firm_name}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Booking Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <p><Calendar className="inline h-4 w-4 mr-2" />{selectedBooking.date}</p>
                                        <p><Clock className="inline h-4 w-4 mr-2" />{selectedBooking.time}</p>
                                      </div>
                                    </div>
                                    {selectedBooking.message && (
                                      <div>
                                        <h4 className="font-medium mb-2">Message</h4>
                                        <p className="text-sm text-gray-600">{selectedBooking.message}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
    </AdminPageWrapper>
  )
}
