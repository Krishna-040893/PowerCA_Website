'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CreditCard, Search, Eye, RefreshCw, IndianRupee, CheckCircle, XCircle, Clock, RotateCw } from 'lucide-react'
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

interface Payment {
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
}

export default function AdminPaymentsPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser, getAuthHeaders } = useAdminAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [syncingPayment, setSyncingPayment] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

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
        console.log('📥 Response received, length:', text?.length)
        if (text) {
          try {
            const data = JSON.parse(text)
            console.log('✅ Parsed data:', { paymentsCount: data.payments?.length, total: data.total })
            setPayments(data.payments || [])
            if (data.payments && data.payments.length > 0) {
              console.log('💾 Set payments state with', data.payments.length, 'payments')
            } else {
              console.warn('⚠️ No payments in response')
            }
          } catch (parseError) {
            console.error('JSON parse error:', parseError, 'Response:', text)
            setPayments([])
            toast.error('Failed to parse payment data')
          }
        } else {
          console.warn('⚠️ Empty response text')
          setPayments([])
        }
      } else {
        console.error('Response not OK:', response.status, response.statusText)
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
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was aborted')
        // Don't show toast for abort errors
      } else {
        console.error('Error fetching payments:', error)
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
    console.log('🔍 Filtering payments:', { paymentsCount: payments.length, statusFilter, searchTerm })
    let filtered = [...payments]

    // Filter by status
    if (statusFilter !== 'all') {
      console.log('📊 Filtering by status:', statusFilter)
      filtered = filtered.filter(payment => payment.status.toLowerCase() === statusFilter)
      console.log('📊 After status filter:', filtered.length)
    }

    // Filter by search term
    if (searchTerm) {
      console.log('🔎 Filtering by search term:', searchTerm)
      filtered = filtered.filter(payment =>
        payment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.firm_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      console.log('🔎 After search filter:', filtered.length)
    }

    console.log('✅ Final filtered count:', filtered.length)
    setFilteredPayments(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [payments, statusFilter, searchTerm])

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
    const total = payments.length
    // Include both Razorpay statuses (captured, authorized) and legacy statuses (paid, success)
    const paid = payments.filter(p => ['paid', 'captured', 'authorized', 'success'].includes(p.status.toLowerCase())).length
    const failed = payments.filter(p => p.status.toLowerCase() === 'failed').length
    const pending = payments.filter(p => ['created', 'pending'].includes(p.status.toLowerCase())).length
    const totalAmount = payments
      .filter(p => ['paid', 'captured', 'authorized', 'success'].includes(p.status.toLowerCase()))
      .reduce((sum, p) => sum + p.amount, 0)

    return { total, paid, failed, pending, totalAmount }
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
      title="Payments Management"
      description="View and manage all payment transactions"
      actions={
        <Button onClick={fetchPayments} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Successful</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">₹{stats.totalAmount.toFixed(2)}</p>
              </div>
              <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">All Payments</CardTitle>
              <CardDescription className="text-sm">View and manage payment transactions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="captured">Captured</SelectItem>
                <SelectItem value="authorized">Authorized</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
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
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{payment.order_id}</p>
                            {payment.payment_id && (
                              <p className="text-xs text-gray-500 truncate max-w-[150px]">{payment.payment_id}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{payment.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[180px]">{payment.email}</p>
                            {payment.firm_name && (
                              <p className="text-xs text-gray-500">{payment.firm_name}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">₹{payment.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{payment.currency}</p>
                        </TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell>
                          <p className="text-sm">{new Date(payment.created_at).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleTimeString()}</p>
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
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPayment(payment)}
                                  className="bg-white hover:bg-gray-50"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Payment Details</DialogTitle>
                                  <DialogDescription className="break-all">
                                    Order ID: {selectedPayment?.order_id}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedPayment && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-2">Customer Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <p><span className="font-medium">Name:</span> {selectedPayment.name}</p>
                                          <p className="break-all"><span className="font-medium">Email:</span> {selectedPayment.email}</p>
                                          {selectedPayment.phone && (
                                            <p><span className="font-medium">Phone:</span> {selectedPayment.phone}</p>
                                          )}
                                          {selectedPayment.firm_name && (
                                            <p><span className="font-medium">Firm:</span> {selectedPayment.firm_name}</p>
                                          )}
                                          {selectedPayment.company && (
                                            <p><span className="font-medium">Company:</span> {selectedPayment.company}</p>
                                          )}
                                          {selectedPayment.address && (
                                            <p className="break-words"><span className="font-medium">Address:</span> {selectedPayment.address}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-2">Payment Information</h4>
                                        <div className="space-y-2 text-sm">
                                          <p><span className="font-medium">Amount:</span> ₹{selectedPayment.amount.toFixed(2)}</p>
                                          <p><span className="font-medium">Currency:</span> {selectedPayment.currency}</p>
                                          <p><span className="font-medium">Status:</span> {getStatusBadge(selectedPayment.status)}</p>
                                          <p><span className="font-medium">Plan:</span> {selectedPayment.plan}</p>
                                          {selectedPayment.payment_id && (
                                            <p className="font-mono text-xs break-all"><span className="font-medium">Payment ID:</span> {selectedPayment.payment_id}</p>
                                          )}
                                          {selectedPayment.gst_number && (
                                            <p><span className="font-medium">GST:</span> {selectedPayment.gst_number}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 pt-4 border-t">
                                      <div>
                                        <p><span className="font-medium">Created:</span> {new Date(selectedPayment.created_at).toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <p><span className="font-medium">Updated:</span> {new Date(selectedPayment.updated_at).toLocaleString()}</p>
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
                        {/* Header: Name, Amount, Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base truncate">{payment.name}</p>
                            {payment.firm_name && (
                              <p className="text-xs text-gray-500 truncate">{payment.firm_name}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <p className="font-bold text-lg whitespace-nowrap">₹{payment.amount.toFixed(2)}</p>
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>

                        {/* Order & Payment IDs */}
                        <div className="space-y-1 text-sm">
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-gray-600 whitespace-nowrap">Order:</span>
                            <span className="text-gray-900 break-all">{payment.order_id}</span>
                          </div>
                          {payment.payment_id && (
                            <div className="flex items-start gap-2">
                              <span className="font-medium text-gray-600 whitespace-nowrap">Payment:</span>
                              <span className="text-gray-900 break-all text-xs font-mono">{payment.payment_id}</span>
                            </div>
                          )}
                        </div>

                        {/* Email */}
                        <div className="text-sm">
                          <span className="text-gray-500 break-all">{payment.email}</span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{new Date(payment.created_at).toLocaleTimeString()}</span>
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
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                                className="flex-1 bg-white hover:bg-gray-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white max-w-[90vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Payment Details</DialogTitle>
                                <DialogDescription className="break-all">
                                  Order ID: {selectedPayment?.order_id}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedPayment && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Customer Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Name:</span> {selectedPayment.name}</p>
                                        <p className="break-all"><span className="font-medium">Email:</span> {selectedPayment.email}</p>
                                        {selectedPayment.phone && (
                                          <p><span className="font-medium">Phone:</span> {selectedPayment.phone}</p>
                                        )}
                                        {selectedPayment.firm_name && (
                                          <p><span className="font-medium">Firm:</span> {selectedPayment.firm_name}</p>
                                        )}
                                        {selectedPayment.company && (
                                          <p><span className="font-medium">Company:</span> {selectedPayment.company}</p>
                                        )}
                                        {selectedPayment.address && (
                                          <p className="break-words"><span className="font-medium">Address:</span> {selectedPayment.address}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Payment Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Amount:</span> ₹{selectedPayment.amount.toFixed(2)}</p>
                                        <p><span className="font-medium">Currency:</span> {selectedPayment.currency}</p>
                                        <p><span className="font-medium">Status:</span> {getStatusBadge(selectedPayment.status)}</p>
                                        <p><span className="font-medium">Plan:</span> {selectedPayment.plan}</p>
                                        {selectedPayment.payment_id && (
                                          <p className="font-mono text-xs break-all"><span className="font-medium">Payment ID:</span> {selectedPayment.payment_id}</p>
                                        )}
                                        {selectedPayment.gst_number && (
                                          <p><span className="font-medium">GST:</span> {selectedPayment.gst_number}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600 pt-4 border-t">
                                    <div>
                                      <p><span className="font-medium">Created:</span> {new Date(selectedPayment.created_at).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p><span className="font-medium">Updated:</span> {new Date(selectedPayment.updated_at).toLocaleString()}</p>
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
