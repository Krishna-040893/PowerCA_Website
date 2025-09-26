'use client'

import {useState  } from 'react'
import {Badge  } from '@/components/ui/badge'
import {Button  } from '@/components/ui/button'
import {Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
 } from '@/components/ui/table'
import {Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
 } from '@/components/ui/dialog'
import {Eye, CheckCircle, XCircle, Clock, Phone, Mail, Building,
  Calendar
 } from 'lucide-react'
import { format as _format } from 'date-fns'

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

interface BookingTableProps {
  bookings: Booking[]
  isLoading: boolean
  onStatusUpdate: (bookingId: string, newStatus: string) => void
}

export function BookingTable({ bookings, isLoading, onStatusUpdate }: BookingTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800' },
      COMPLETED: { variant: 'secondary' as const, className: 'bg-green-100 text-green-800' },
      CANCELLED: { variant: 'secondary' as const, className: 'bg-red-100 text-red-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING

    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    )
  }

  const formatDate = (dateStr: string) => {
    try {
      return _format(new Date(dateStr), 'MMM dd, yyyy')
    } catch {
      return dateStr
    }
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
        <p className="text-gray-500">No bookings match your current filters.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">Date & Time</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-gray-50">
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">{booking.name}</div>
                    {booking.firm_name && (
                      <div className="text-sm text-gray-500 flex items-center">
                        <Building className="w-3 h-3 mr-1" />
                        {booking.firm_name}
                      </div>
                    )}
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-3 h-3 mr-1" />
                      {booking.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-3 h-3 mr-1" />
                      {booking.phone}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatDate(booking.date)}
                    </div>
                    <div className="text-sm text-gray-500">{booking.time}</div>
                  </div>
                </TableCell>

                <TableCell>
                  {getStatusBadge(booking.status)}
                </TableCell>

                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(booking)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {booking.status === 'PENDING' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStatusUpdate(booking.id, 'CONFIRMED')}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onStatusUpdate(booking.id, 'CANCELLED')}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStatusUpdate(booking.id, 'COMPLETED')}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Complete information for this booking request
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Client Name</label>
                  <p className="text-sm text-gray-900">{selectedBooking.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedBooking.status)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{selectedBooking.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-sm text-gray-900">{selectedBooking.phone}</p>
              </div>

              {selectedBooking.firm_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Firm Name</label>
                  <p className="text-sm text-gray-900">{selectedBooking.firm_name}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedBooking.date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Time</label>
                  <p className="text-sm text-gray-900">{selectedBooking.time}</p>
                </div>
              </div>

              {selectedBooking.message && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Message</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg mt-1">
                    {selectedBooking.message}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Booking Created</label>
                <p className="text-sm text-gray-900">
                  {_format(new Date(selectedBooking.created_at), 'PPP at p')}
                </p>
              </div>

              {/* Quick Actions */}
              {selectedBooking.status === 'PENDING' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    onClick={() => {
                      onStatusUpdate(selectedBooking.id, 'CONFIRMED')
                      setSelectedBooking(null)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      onStatusUpdate(selectedBooking.id, 'CANCELLED')
                      setSelectedBooking(null)
                    }}
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}