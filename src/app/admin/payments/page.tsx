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
import { Loader2, CreditCard, Search, Eye, RefreshCw, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'

interface Payment {
  id: string
  order_id: string
  amount: number
  currency: string
  status: string
  customer_email: string
  customer_name: string
  customer_phone: string
  company: string
  gst_number: string
  product_id: string
  firm_name: string
  customer_id: string
  referral_code: string
  is_affiliate_purchase: boolean
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

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/payments', {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  const filterPayments = useCallback(() => {
    let filtered = [...payments]

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status.toLowerCase() === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customer_id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPayments(filtered)
  }, [payments, statusFilter, searchTerm])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments()
    }
  }, [isAuthenticated, fetchPayments])

  useEffect(() => {
    filterPayments()
  }, [filterPayments])

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case 'paid':
      case 'captured':
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1 inline" />Paid</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1 inline" />Failed</Badge>
      case 'created':
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1 inline" />Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStats = () => {
    const total = payments.length
    const paid = payments.filter(p => ['paid', 'captured', 'success'].includes(p.status.toLowerCase())).length
    const failed = payments.filter(p => p.status.toLowerCase() === 'failed').length
    const pending = payments.filter(p => ['created', 'pending'].includes(p.status.toLowerCase())).length
    const totalAmount = payments
      .filter(p => ['paid', 'captured', 'success'].includes(p.status.toLowerCase()))
      .reduce((sum, p) => sum + p.amount, 0)

    return { total, paid, failed, pending, totalAmount }
  }

  const stats = getStats()

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Successful</p>
                <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Payments</CardTitle>
              <CardDescription>View and manage payment transactions</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, order ID, or customer ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="captured">Captured</SelectItem>
                <SelectItem value="created">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
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
            <div className="overflow-x-auto">
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
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.order_id}</p>
                          {payment.is_affiliate_purchase && (
                            <p className="text-xs text-blue-600">Affiliate: {payment.referral_code}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.customer_name}</p>
                          <p className="text-sm text-gray-500">{payment.customer_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">₹{payment.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{payment.currency}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <p className="text-sm">{new Date(payment.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleTimeString()}</p>
                      </TableCell>
                      <TableCell>
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
                          <DialogContent className="bg-white max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Payment Details</DialogTitle>
                              <DialogDescription>
                                Order ID: {selectedPayment?.order_id}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedPayment && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">Customer Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="font-medium">Name:</span> {selectedPayment.customer_name}</p>
                                      <p><span className="font-medium">Email:</span> {selectedPayment.customer_email}</p>
                                      <p><span className="font-medium">Phone:</span> {selectedPayment.customer_phone}</p>
                                      <p><span className="font-medium">Customer ID:</span> {selectedPayment.customer_id}</p>
                                      {selectedPayment.firm_name && (
                                        <p><span className="font-medium">Firm:</span> {selectedPayment.firm_name}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">Payment Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="font-medium">Amount:</span> ₹{selectedPayment.amount.toFixed(2)}</p>
                                      <p><span className="font-medium">Currency:</span> {selectedPayment.currency}</p>
                                      <p><span className="font-medium">Status:</span> {getStatusBadge(selectedPayment.status)}</p>
                                      <p><span className="font-medium">Product:</span> {selectedPayment.product_id}</p>
                                      {selectedPayment.gst_number && (
                                        <p><span className="font-medium">GST:</span> {selectedPayment.gst_number}</p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {selectedPayment.is_affiliate_purchase && (
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2 text-blue-900">Affiliate Purchase</h4>
                                    <p className="text-sm text-blue-800">Referral Code: {selectedPayment.referral_code}</p>
                                  </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
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
