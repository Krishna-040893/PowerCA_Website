"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Phone,
  Mail,
  MapPin,
  User,
  Building,
  IndianRupee
} from "lucide-react"
import { format } from "date-fns"

interface Booking {
  id: string
  customerName: string
  email: string
  phone: string
  serviceName: string
  serviceType: 'CA Services' | 'Legal Services' | 'Business Registration' | 'Tax Filing'
  bookingDate: string
  serviceDate: string
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled'
  amount: number
  location: string
  notes?: string
  createdAt: string
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Simulate API call - replace with actual API
    setTimeout(() => {
      const mockBookings: Booking[] = [
        {
          id: "BK001",
          customerName: "Rajesh Kumar",
          email: "rajesh@example.com",
          phone: "+91 98765 43210",
          serviceName: "Annual Tax Filing",
          serviceType: "Tax Filing",
          bookingDate: "2024-01-15",
          serviceDate: "2024-01-20",
          status: "pending",
          amount: 5000,
          location: "Mumbai",
          notes: "First time client, needs guidance",
          createdAt: "2024-01-15T10:30:00Z"
        },
        {
          id: "BK002",
          customerName: "Priya Sharma",
          email: "priya@company.com",
          phone: "+91 87654 32109",
          serviceName: "GST Registration",
          serviceType: "Business Registration",
          bookingDate: "2024-01-14",
          serviceDate: "2024-01-18",
          status: "confirmed",
          amount: 3500,
          location: "Delhi",
          notes: "Urgent requirement",
          createdAt: "2024-01-14T14:20:00Z"
        },
        {
          id: "BK003",
          customerName: "Amit Patel",
          email: "amit@startup.in",
          phone: "+91 76543 21098",
          serviceName: "Company Incorporation",
          serviceType: "Business Registration",
          bookingDate: "2024-01-13",
          serviceDate: "2024-01-17",
          status: "in-progress",
          amount: 15000,
          location: "Bangalore",
          createdAt: "2024-01-13T09:15:00Z"
        },
        {
          id: "BK004",
          customerName: "Sunita Mehta",
          email: "sunita@business.com",
          phone: "+91 65432 10987",
          serviceName: "Audit Services",
          serviceType: "CA Services",
          bookingDate: "2024-01-12",
          serviceDate: "2024-01-16",
          status: "completed",
          amount: 8000,
          location: "Pune",
          createdAt: "2024-01-12T16:45:00Z"
        },
        {
          id: "BK005",
          customerName: "Vikram Singh",
          email: "vikram@legal.org",
          phone: "+91 54321 09876",
          serviceName: "Legal Consultation",
          serviceType: "Legal Services",
          bookingDate: "2024-01-11",
          serviceDate: "2024-01-15",
          status: "cancelled",
          amount: 2500,
          location: "Chennai",
          notes: "Client requested cancellation",
          createdAt: "2024-01-11T11:30:00Z"
        }
      ]
      setBookings(mockBookings)
      setLoading(false)
    }, 1000)
  }, [isClient])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'in-progress':
        return <RefreshCw className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const updateBookingStatus = (bookingId: string, newStatus: string) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: newStatus as Booking['status'] }
        : booking
    ))
    setSelectedBooking(null)
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    inProgress: bookings.filter(b => b.status === 'in-progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    totalRevenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.amount, 0)
  }

  if (!isClient || loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-24 bg-slate-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-700 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Bookings Management</h1>
            <p className="text-slate-400">Manage and track all customer bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Calendar className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Total Bookings</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Pending</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">In Progress</p>
                  <p className="text-2xl font-bold text-purple-400">{stats.inProgress}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Completed</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Revenue</p>
                  <p className="text-2xl font-bold text-emerald-400">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">All Bookings</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Booking ID</TableHead>
                    <TableHead className="text-slate-300">Customer</TableHead>
                    <TableHead className="text-slate-300">Service</TableHead>
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Amount</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id} className="border-slate-700 hover:bg-slate-700/30">
                      <TableCell className="font-medium text-white">{booking.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-white font-medium">{booking.customerName}</div>
                          <div className="text-slate-400 text-sm">{booking.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="text-white">{booking.serviceName}</div>
                          <div className="text-slate-400 text-sm">{booking.serviceType}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {format(new Date(booking.serviceDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(booking.status)} border`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-emerald-400 font-medium">
                        ₹{booking.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedBooking(booking)}
                                className="text-slate-400 hover:text-white hover:bg-slate-700"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Booking Details - {selectedBooking?.id}</DialogTitle>
                                <DialogDescription className="text-slate-400">
                                  Manage booking status and view customer information
                                </DialogDescription>
                              </DialogHeader>
                              {selectedBooking && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium text-emerald-400 mb-2">Customer Information</h4>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span>{selectedBooking.customerName}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            <span>{selectedBooking.email}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            <span>{selectedBooking.phone}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            <span>{selectedBooking.location}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-medium text-emerald-400 mb-2">Service Details</h4>
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <Building className="w-4 h-4 text-slate-400" />
                                            <span>{selectedBooking.serviceName}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>{format(new Date(selectedBooking.serviceDate), 'MMM dd, yyyy')}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <IndianRupee className="w-4 h-4 text-slate-400" />
                                            <span>₹{selectedBooking.amount.toLocaleString()}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {selectedBooking.notes && (
                                    <div>
                                      <h4 className="font-medium text-emerald-400 mb-2">Notes</h4>
                                      <p className="text-slate-300 bg-slate-700/50 p-3 rounded-lg">
                                        {selectedBooking.notes}
                                      </p>
                                    </div>
                                  )}

                                  <div>
                                    <h4 className="font-medium text-emerald-400 mb-3">Update Status</h4>
                                    <div className="flex gap-2 flex-wrap">
                                      {['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map((status) => (
                                        <Button
                                          key={status}
                                          variant={selectedBooking.status === status ? "default" : "outline"}
                                          size="sm"
                                          onClick={() => updateBookingStatus(selectedBooking.id, status)}
                                          className={selectedBooking.status === status
                                            ? "bg-emerald-600 hover:bg-emerald-700"
                                            : "border-slate-600 text-slate-300 hover:bg-slate-700"
                                          }
                                        >
                                          {getStatusIcon(status)}
                                          <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
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

            {filteredBookings.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No bookings found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}