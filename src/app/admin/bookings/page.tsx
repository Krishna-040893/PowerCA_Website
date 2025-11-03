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
import { AdminPagination } from '@/components/admin/admin-pagination'

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
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

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
        setBookings([])
      }
    } catch (error) {
      clearTimeout(timeoutId)
      // Only show error if it's not an abort error (which happens on component unmount)
      if (error instanceof Error && error.name !== 'AbortError') {
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
    if (isAuthenticated) {
      fetchBookings()
    }
  }, [isAuthenticated, fetchBookings, authLoading])

  useEffect(() => {
    filterBookings()
  }, [filterBookings])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!isAuthenticated || !adminUser) {
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
        {/* Stats Overview - Enhanced Mobile Design */}
        <Card className="shadow-sm border border-gray-100 mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Bookings</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">{bookings.length}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-blue-50">
                <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table - Enhanced */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold">All Bookings</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">View and manage demo bookings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search Filter - Enhanced Mobile */}
            <div className="flex gap-2 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Button
                onClick={fetchBookings}
                variant="outline"
                size="sm"
                className="px-3 border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Table / Cards */}
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
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
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
                      {filteredBookings
                        .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                        .map((booking) => (
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
                              <DialogContent className="bg-white max-w-md">
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
                                        <p className="break-all"><Mail className="inline h-4 w-4 mr-2" />{selectedBooking.email}</p>
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View - Professional Design */}
                <div className="md:hidden space-y-3">
                  {filteredBookings
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((booking) => (
                    <Card key={booking.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Name and Type Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm text-gray-900 truncate">{booking.name}</p>
                                  {booking.firm_name && (
                                    <p className="text-xs text-gray-500 truncate">{booking.firm_name}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">{booking.type}</Badge>
                          </div>

                          {/* Contact Info - Compact */}
                          <div className="space-y-1.5 bg-gray-50 rounded-lg p-2.5">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-700 truncate">{booking.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-700">{booking.phone}</span>
                            </div>
                          </div>

                          {/* Date and Time - Enhanced */}
                          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Calendar className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-medium">{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Clock className="h-3.5 w-3.5 text-green-500" />
                              <span className="font-medium">{booking.time}</span>
                            </div>
                          </div>

                          {/* Action Button - Enhanced */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                                className="w-full bg-gradient-to-r from-blue-50 to-blue-50 hover:from-blue-100 hover:to-blue-100 border-blue-200 text-blue-700 font-medium"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Full Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white max-w-[90vw] sm:max-w-md rounded-xl">
                              <DialogHeader className="border-b pb-3">
                                <DialogTitle className="text-lg font-bold">Booking Details</DialogTitle>
                                <DialogDescription className="text-xs text-gray-500 break-all">
                                  ID: {selectedBooking?.id.substring(0, 8)}...
                                </DialogDescription>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="space-y-4 pt-2">
                                  {/* Customer Section */}
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <h4 className="font-semibold text-sm text-blue-900 mb-2.5 flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      Customer Information
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex items-start gap-2">
                                        <User className="h-3.5 w-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{selectedBooking.name}</p>
                                          {selectedBooking.firm_name && (
                                            <p className="text-xs text-gray-600">{selectedBooking.firm_name}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Mail className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                        <p className="text-xs text-gray-700 break-all">{selectedBooking.email}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                        <p className="text-xs text-gray-700">{selectedBooking.phone}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Booking Info Section */}
                                  <div className="bg-green-50 rounded-lg p-3">
                                    <h4 className="font-semibold text-sm text-green-900 mb-2.5 flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      Booking Information
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                        <p className="text-sm font-medium text-gray-900">{selectedBooking.date}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                                        <p className="text-sm font-medium text-gray-900">{selectedBooking.time}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Message Section */}
                                  {selectedBooking.message && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <h4 className="font-semibold text-sm text-gray-900 mb-2">Message</h4>
                                      <p className="text-xs text-gray-700 leading-relaxed break-words">{selectedBooking.message}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                <AdminPagination
                  currentPage={currentPage}
                  totalItems={filteredBookings.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                  itemName="bookings"
                />
              </>
            )}
          </CardContent>
        </Card>
    </AdminPageWrapper>
  )
}
