'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Search, Eye, RefreshCw, CheckCircle, XCircle, Clock, RotateCw } from 'lucide-react'
import { toast } from 'sonner'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface IndividualPayment {
  id: string
  user_id: string | null
  order_id: string
  payment_id?: string
  signature?: string
  amount: number
  currency: string
  status: string
  plan: string
  email: string
  phone?: string
  name: string
  company?: string
  gst_number?: string
  address?: string
  firm_name?: string
  created_at: string
  updated_at: string
  // Discount fields
  discount_percentage?: number
  discount_amount?: number
  original_amount?: number
  // Location fields
  location?: string
  city?: string
  state?: string
  postcode?: string
  country?: string
}

interface Payment {
  id: string
  email: string
  name: string
  firm_names: string[]
  phone?: string
  company?: string
  total_amount: number
  total_orders: number
  locations: string[]
  statuses: string[]
  latest_payment: IndividualPayment
  all_payments: IndividualPayment[]
  // Backward compatibility fields
  order_id: string
  payment_id?: string
  status: string
  created_at: string
  updated_at: string
  amount: number
  currency: string
  plan: string
}

export default function AdminPaymentsPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser, getAuthHeaders } = useAdminAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [syncingPayment, setSyncingPayment] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchPayments = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    setLoading(true)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch('/api/admin/payments', {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const text = await response.text()
        if (text) {
          try {
            const data = JSON.parse(text)
            setPayments(data.payments || [])
          } catch {
            setPayments([])
            toast.error('Failed to parse payment data')
          }
        } else {
          setPayments([])
        }
      } else {
        setPayments([])
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.')
        } else {
          toast.error('Failed to load payments')
        }
      }
    } catch (error) {
      clearTimeout(timeoutId)
      // Only show error if it's not an abort error (which happens on component unmount)
      if (error instanceof Error && error.name !== 'AbortError') {
        setPayments([])
        toast.error('Error loading payments')
      }
    } finally {
      setLoading(false)
    }

    // Return cleanup function
    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [getAuthHeaders, isAuthenticated])

  const filterPayments = useCallback(() => {
    let filtered = [...payments]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.firm_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPayments(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [payments, searchTerm])

  // Calculate pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPayments = filteredPayments.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  useEffect(() => {
    filterPayments()
  }, [filterPayments])

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      // Razorpay Payment Statuses - Success states
      case 'captured':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1 inline" />Captured</Badge>
      case 'authorized':
        return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle className="h-3 w-3 mr-1 inline" />Authorized</Badge>
      // Legacy statuses (for backward compatibility during migration)
      case 'paid':
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white"><CheckCircle className="h-3 w-3 mr-1 inline" />Paid</Badge>
      // Razorpay Payment Statuses - Failed/Refunded
      case 'failed':
        return <Badge className="bg-orange-500 hover:bg-orange-600 text-white"><XCircle className="h-3 w-3 mr-1 inline" />Failed</Badge>
      case 'refunded':
        return <Badge className="bg-orange-600 hover:bg-orange-700 text-white"><RotateCw className="h-3 w-3 mr-1 inline" />Refunded</Badge>
      // Razorpay Payment Statuses - Pending
      case 'created':
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1 inline" />Created</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStats = () => {
    // Count total individual payments
    const allPayments = payments.flatMap(p => p.all_payments || [])
    const total = allPayments.length
    // Include both Razorpay statuses (captured, authorized) and legacy statuses (paid, success)
    const paid = allPayments.filter(p => ['paid', 'captured', 'authorized', 'success'].includes(p.status.toLowerCase())).length
    const failed = allPayments.filter(p => p.status.toLowerCase() === 'failed').length
    const pending = allPayments.filter(p => ['created', 'pending'].includes(p.status.toLowerCase())).length
    const totalAmount = allPayments
      .filter(p => ['paid', 'captured', 'authorized', 'success'].includes(p.status.toLowerCase()))
      .reduce((sum, p) => sum + p.amount, 0)

    return { total, paid, failed, pending, totalAmount, totalCustomers: payments.length }
  }

  const stats = getStats()

  const syncPaymentStatus = async (payment: Payment) => {
    if (!payment.payment_id && !payment.order_id) {
      toast.error('No payment ID or order ID found')
      return
    }

    setSyncingPayment(payment.id)
    try {
      const response = await fetch('/api/admin/payments/sync-status', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: payment.payment_id,
          order_id: payment.order_id,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success(`Payment status synced: ${data.data.razorpay_status} → ${data.data.db_status}`)
        // Refresh payments list
        await fetchPayments()
      } else {
        toast.error(data.error || 'Failed to sync payment status')
      }
    } catch (error) {
      console.error('Error syncing payment status:', error)
      toast.error('Failed to sync payment status')
    } finally {
      setSyncingPayment(null)
    }
  }

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
      title="Payments"
      description="View and manage all payment transactions"
      stats={[
        { label: 'Customers', value: stats.totalCustomers, color: 'bg-purple-100 text-purple-800' },
        { label: 'Orders', value: stats.total, color: 'bg-blue-100 text-blue-800' },
        { label: 'Successful', value: stats.paid, color: 'bg-green-100 text-green-800' },
        { label: 'Revenue', value: `₹${stats.totalAmount.toFixed(0)}`, color: 'bg-indigo-100 text-indigo-800' }
      ]}
      actions={
        <Button onClick={fetchPayments} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      {/* Payments Table - Enhanced */}
      <Card className="shadow-sm border border-gray-100">
        <CardContent>
          {/* Search Filter - Enhanced Mobile */}
          <div className="flex gap-2 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table / Cards */}
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
              <p className="mt-2 text-gray-600">Loading payments...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No payments found
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base font-bold">Customer</TableHead>
                      <TableHead className="text-base font-bold text-center">Orders</TableHead>
                      <TableHead className="text-base font-bold">Locations</TableHead>
                      <TableHead className="text-base font-bold">Total Amount</TableHead>
                      <TableHead className="text-base font-bold">Status</TableHead>
                      <TableHead className="text-base font-bold">Last Payment</TableHead>
                      <TableHead className="text-base font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{payment.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[180px]">{payment.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-sm font-bold bg-blue-100 text-blue-700 border border-blue-300">
                            {payment.total_orders}
                          </span>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-blue-600 font-medium max-w-[200px]">
                            {payment.locations && payment.locations.length > 0
                              ? payment.locations.join(', ')
                              : <span className="text-gray-400">-</span>
                            }
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-green-600">₹{payment.total_amount.toFixed(2)}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {payment.statuses && payment.statuses.map((status, idx) => (
                              <span key={idx}>{getStatusBadge(status)}</span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{new Date(payment.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                          <p className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => syncPaymentStatus(payment)}
                              disabled={syncingPayment === payment.id}
                              className="bg-white hover:bg-gray-50"
                              title="Sync status from Razorpay"
                            >
                              <RotateCw className={`h-4 w-4 ${syncingPayment === payment.id ? 'animate-spin' : ''}`} />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedPayment(payment)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white max-w-[90vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Customer Payment Details</DialogTitle>
                                  <DialogDescription className="break-all">
                                    {selectedPayment?.name} - {selectedPayment?.email}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedPayment && (
                                  <div className="space-y-4">
                                    {/* Customer Summary */}
                                    <div className="bg-blue-50 rounded-lg p-4">
                                      <h4 className="font-medium mb-3 text-blue-800">Customer Summary</h4>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                        <div>
                                          <span className="text-gray-600">Name:</span>
                                          <p className="font-medium">{selectedPayment.name}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Email:</span>
                                          <p className="font-medium break-all text-xs">{selectedPayment.email}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Total Orders:</span>
                                          <p className="font-bold text-blue-600">{selectedPayment.total_orders}</p>
                                        </div>
                                        <div>
                                          <span className="text-gray-600">Total Amount:</span>
                                          <p className="font-bold text-green-600">₹{selectedPayment.total_amount.toFixed(2)}</p>
                                        </div>
                                        {selectedPayment.phone && (
                                          <div>
                                            <span className="text-gray-600">Phone:</span>
                                            <p className="font-medium">{selectedPayment.phone}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* All Payments List */}
                                    <div className="border rounded-lg">
                                      <h4 className="font-medium p-3 bg-gray-50 border-b">All Payments ({selectedPayment.all_payments?.length || 0})</h4>
                                      <div className="divide-y max-h-[300px] overflow-y-auto">
                                        {selectedPayment.all_payments?.map((p, idx) => (
                                          <div key={idx} className="p-3 hover:bg-gray-50">
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex-1 min-w-0">
                                                <p className="font-mono text-xs text-gray-600">{p.order_id}</p>
                                                {p.firm_name && (
                                                  <p className="text-sm font-medium text-gray-900">{p.firm_name}</p>
                                                )}
                                                {p.location && (
                                                  <p className="text-xs text-blue-600">{p.location}</p>
                                                )}
                                              </div>
                                              <div className="text-right flex-shrink-0">
                                                <p className="font-bold">₹{p.amount.toFixed(2)}</p>
                                                {getStatusBadge(p.status)}
                                              </div>
                                            </div>
                                            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                              <span>{new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                              {p.payment_id && (
                                                <span className="font-mono truncate max-w-[150px]">{p.payment_id}</span>
                                              )}
                                            </div>
                                          </div>
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

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-4">
                {currentPayments.map((payment) => (
                  <Card key={payment.id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header: Name, Amount, Orders */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base truncate">{payment.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-1">{payment.email}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <p className="font-bold text-lg text-green-600 whitespace-nowrap">₹{payment.total_amount.toFixed(2)}</p>
                            <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                              {payment.total_orders} orders
                            </span>
                          </div>
                        </div>

                        {/* Locations */}
                        {payment.locations && payment.locations.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-2.5">
                            <p className="text-xs text-gray-500 mb-1">Locations:</p>
                            <p className="text-sm text-blue-600 font-medium">{payment.locations.join(', ')}</p>
                          </div>
                        )}

                        {/* Statuses */}
                        <div className="flex flex-wrap gap-1">
                          {payment.statuses && payment.statuses.map((status, idx) => (
                            <span key={idx}>{getStatusBadge(status)}</span>
                          ))}
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>Last payment:</span>
                          <span>{new Date(payment.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => syncPaymentStatus(payment)}
                            disabled={syncingPayment === payment.id}
                            className="flex-1 bg-white hover:bg-gray-50"
                            title="Sync status from Razorpay"
                          >
                            <RotateCw className={`h-4 w-4 mr-2 ${syncingPayment === payment.id ? 'animate-spin' : ''}`} />
                            Sync
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View All
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white max-w-[90vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Customer Payment Details</DialogTitle>
                                <DialogDescription className="break-all">
                                  {selectedPayment?.name} - {selectedPayment?.email}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedPayment && (
                                <div className="space-y-4">
                                  {/* Customer Summary */}
                                  <div className="bg-blue-50 rounded-lg p-4">
                                    <h4 className="font-medium mb-3 text-blue-800">Customer Summary</h4>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                      <div>
                                        <span className="text-gray-600">Name:</span>
                                        <p className="font-medium">{selectedPayment.name}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Total Orders:</span>
                                        <p className="font-bold text-blue-600">{selectedPayment.total_orders}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Email:</span>
                                        <p className="font-medium break-all text-xs">{selectedPayment.email}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">Total Amount:</span>
                                        <p className="font-bold text-green-600">₹{selectedPayment.total_amount.toFixed(2)}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* All Payments List */}
                                  <div className="border rounded-lg">
                                    <h4 className="font-medium p-3 bg-gray-50 border-b">All Payments ({selectedPayment.all_payments?.length || 0})</h4>
                                    <div className="divide-y max-h-[250px] overflow-y-auto">
                                      {selectedPayment.all_payments?.map((p, idx) => (
                                        <div key={idx} className="p-3 hover:bg-gray-50">
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                              <p className="font-mono text-xs text-gray-600 truncate">{p.order_id}</p>
                                              {p.location && (
                                                <p className="text-sm text-blue-600 font-medium">{p.location}</p>
                                              )}
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                              <p className="font-bold">₹{p.amount.toFixed(2)}</p>
                                              {getStatusBadge(p.status)}
                                            </div>
                                          </div>
                                          <div className="mt-2 text-xs text-gray-500">
                                            {new Date(p.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredPayments.length)} of {filteredPayments.length} results
                  </div>
                  <Pagination>
                    <PaginationContent className="flex-wrap justify-center">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => goToPage(page)}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )
                        }
                        return null
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && goToPage(currentPage + 1)}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </AdminPageWrapper>
  )
}
