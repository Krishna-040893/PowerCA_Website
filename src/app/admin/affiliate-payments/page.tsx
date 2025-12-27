'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  IndianRupee,
  Clock,
  CheckCircle,
  Search,
  RefreshCw,
  Trash2,
  Loader2
} from 'lucide-react'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { toast } from 'sonner'
import { AdminPagination } from '@/components/admin/admin-pagination'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface AffiliatePayment {
  id: string
  referral_id?: string
  referral_code: string
  customer_id: string
  affiliate_id: string
  order_id: string
  payment_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_firm_name: string
  payment_amount: number
  commission_amount: number
  commission_rate: number
  commission_paid: boolean
  commission_paid_at: string | null
  payment_status: string
  payment_completed_at: string
  created_at: string
  payment_count?: number
  paid_order_count?: number
  pending_order_count?: number
  paid_commission?: number
  pending_commission?: number
  payment_type?: 'initial_payment' | 'final_settlement'
  affiliate_referrals?: {
    id?: string
    referral_code: string
    customer_id: string
    referred_email: string
    referred_name: string
  }
}

interface PaymentSummary {
  totalPayments: number
  totalAmount: number
  totalCommission: number
  pendingCommission: number
  paidCommission: number
}

export default function AffiliatePaymentsPage() {
  const [payments, setPayments] = useState<AffiliatePayment[]>([])
  const [summary, setSummary] = useState<PaymentSummary>({
    totalPayments: 0,
    totalAmount: 0,
    totalCommission: 0,
    pendingCommission: 0,
    paidCommission: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<AffiliatePayment | null>(null)
  const [paymentMode, setPaymentMode] = useState<string>('')
  const [paymentDate, setPaymentDate] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  // Selection and delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      let url = '/api/admin/affiliate-payments'

      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setPayments(data.payments)
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  const handleMarkPaidClick = (payment: AffiliatePayment) => {
    setSelectedPayment(payment)
    setPaymentMode('')
    // Set current date and time as default
    const now = new Date()
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setPaymentDate(localDateTime)
    setDialogOpen(true)
  }

  const handleSubmitPayment = async () => {
    if (!selectedPayment) return

    if (!paymentMode || !paymentDate) {
      toast.error('Please fill in all payment details')
      return
    }

    try {
      setSubmitting(true)

      // Check if this is an email-matched payment (needs full data to create record)
      const isEmailMatched = selectedPayment.id.startsWith('email-match-')

      const requestBody: Record<string, unknown> = {
        paymentId: selectedPayment.id,
        commissionPaid: true,
        paymentMode,
        paymentDate
      }

      // For email-matched payments or partial payments, send full payment data
      // Always include paymentData for proper commission tracking
      if (isEmailMatched || (selectedPayment.pending_commission && selectedPayment.pending_commission > 0)) {
        requestBody.paymentData = {
          referral_id: selectedPayment.affiliate_referrals?.id || selectedPayment.referral_id,
          referral_code: selectedPayment.referral_code,
          affiliate_id: selectedPayment.affiliate_id,
          customer_id: selectedPayment.customer_id,
          order_id: selectedPayment.order_id,
          payment_id: selectedPayment.payment_id,
          customer_name: selectedPayment.customer_name,
          customer_email: selectedPayment.customer_email,
          customer_phone: selectedPayment.customer_phone,
          customer_firm_name: selectedPayment.customer_firm_name,
          payment_amount: selectedPayment.payment_amount,
          commission_amount: selectedPayment.commission_amount,
          commission_rate: selectedPayment.commission_rate,
          payment_completed_at: selectedPayment.payment_completed_at,
          payment_count: selectedPayment.payment_count || 1,
          paid_order_count: selectedPayment.paid_order_count || 0,
          pending_order_count: selectedPayment.pending_order_count || 0,
          paid_commission: selectedPayment.paid_commission || 0,
          pending_commission: selectedPayment.pending_commission || 0,
          payment_type: selectedPayment.payment_type || 'initial_payment'
        }
      }

      const response = await fetch('/api/admin/affiliate-payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast.success('Commission marked as paid successfully')
        setDialogOpen(false)
        setSelectedPayment(null)
        setPaymentMode('')
        setPaymentDate('')
        fetchPayments() // Refresh data
      } else {
        toast.error(data.error || 'Failed to update commission status')
      }
    } catch (error) {
      console.error('Failed to update commission status:', error)
      toast.error('Failed to update commission status')
    } finally {
      setSubmitting(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true

    const search = searchTerm.toLowerCase()
    return (
      payment.customer_name?.toLowerCase().includes(search) ||
      payment.customer_email?.toLowerCase().includes(search) ||
      payment.customer_firm_name?.toLowerCase().includes(search) ||
      payment.affiliate_id?.toLowerCase().includes(search) ||
      payment.referral_code?.toLowerCase().includes(search) ||
      payment.customer_id?.toLowerCase().includes(search)
    )
  })

  // Track scroll position for showing/hiding footer action bar
  useEffect(() => {
    const scrollContainer = document.querySelector('main.overflow-y-auto')

    const handleScroll = () => {
      if (scrollContainer) {
        const scrollTop = scrollContainer.scrollTop
        setIsHeaderVisible(scrollTop < 100)
      }
    }

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const currentPageItems = filteredPayments
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const allCurrentPageSelected = currentPageItems.length > 0 &&
    currentPageItems.every(item => selectedIds.has(item.id))

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const currentPageIds = currentPageItems.map(p => p.id)
      setSelectedIds(new Set(currentPageIds))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean | 'indeterminate') => {
    const newSelected = new Set(selectedIds)
    if (checked === true) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/affiliate-payments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete payments')
      }

      toast.success(data.message || `Successfully deleted ${selectedIds.size} payment(s)`)
      setSelectedIds(new Set())
      fetchPayments()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete payments')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const dateFormatted = date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const timeFormatted = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    return `${dateFormatted} ${timeFormatted}`
  }

  return (
    <AdminPageWrapper
      title="Affiliate Payments"
      description="Track and manage affiliate commissions and payments"
      stats={[
        { label: 'Total', value: summary.totalPayments, color: 'bg-blue-100 text-blue-800' },
        { label: 'Revenue', value: formatCurrency(summary.totalAmount), color: 'bg-green-100 text-green-800' },
        { label: 'Pending', value: formatCurrency(summary.pendingCommission), color: 'bg-orange-100 text-orange-800' },
        { label: 'Paid', value: formatCurrency(summary.paidCommission), color: 'bg-green-100 text-green-800' }
      ]}
      actions={
        <div className="flex gap-2 flex-wrap items-center">
          {selectedIds.size > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete ({selectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Affiliate Payments</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedIds.size} payment(s)?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSelected}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          <Button
            onClick={fetchPayments}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      <div>
        {/* Payments Table */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent>
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-5">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value)
                }}>
                  <SelectTrigger className="w-full sm:w-[180px] h-10 border-gray-200 bg-white">
                    <SelectValue placeholder="Filter by status">
                      {statusFilter === 'all' && 'All Statuses'}
                      {statusFilter === 'completed' && 'Paid'}
                      {statusFilter === 'pending' && 'Pending'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600">Loading payments...</span>
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No payments found
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 w-[50px]">
                    <Checkbox
                      checked={allCurrentPageSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-base font-bold">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-base font-bold">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-base font-bold">
                    Affiliate
                  </th>
                  <th className="px-6 py-3 text-left text-base font-bold">
                    Referral Info
                  </th>
                  <th className="px-6 py-3 text-center text-base font-bold">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-base font-bold">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-base font-bold">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-base font-bold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Checkbox
                          checked={selectedIds.has(payment.id)}
                          onCheckedChange={(checked) => handleSelectOne(payment.id, checked)}
                          aria-label={`Select ${payment.customer_name}`}
                          className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.payment_completed_at || payment.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{payment.customer_name}</p>
                          <p className="text-gray-400 text-xs">{payment.customer_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {payment.affiliate_id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          <p className="font-mono text-xs">
                            <span className="text-gray-500">Code:</span> {payment.referral_code}
                          </p>
                          <p className="font-mono text-xs">
                            <span className="text-gray-500">Cust:</span> {payment.customer_id}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-sm font-bold bg-blue-100 text-blue-700 border border-blue-300">
                          {payment.payment_count || 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          {payment.paid_commission !== undefined && payment.paid_commission > 0 && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="font-bold text-green-600">
                                {formatCurrency(payment.paid_commission)}
                              </span>
                              <span className="text-[10px] text-gray-400">({payment.paid_order_count} order{payment.paid_order_count !== 1 ? 's' : ''})</span>
                            </div>
                          )}
                          {payment.pending_commission !== undefined && payment.pending_commission > 0 && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-orange-500" />
                              <span className="font-bold text-orange-600">
                                {formatCurrency(payment.pending_commission)}
                              </span>
                              <span className="text-[10px] text-gray-400">({payment.pending_order_count} order{payment.pending_order_count !== 1 ? 's' : ''})</span>
                            </div>
                          )}
                          {(!payment.paid_commission && !payment.pending_commission) && (
                            <p className="font-bold text-green-600">
                              {formatCurrency(payment.commission_amount)}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Total: {formatCurrency(payment.commission_amount)} ({payment.commission_rate}%)
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.pending_commission && payment.pending_commission > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3 mr-1" />
                            {payment.paid_commission && payment.paid_commission > 0 ? 'Partial' : 'Pending'}
                          </span>
                        ) : payment.commission_paid ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.pending_commission && payment.pending_commission > 0 ? (
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaidClick(payment)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Pay ₹{payment.pending_commission.toLocaleString('en-IN')}
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
                </div>

                {/* Mobile Card View - Professional Design */}
                <div className="md:hidden p-4 space-y-3">
                  {/* Mobile Select All */}
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Checkbox
                      checked={allCurrentPageSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                    />
                    <span className="text-sm text-gray-600">Select all on this page</span>
                  </div>
                  {filteredPayments
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((payment) => (
                    <Card key={payment.id} className={`border shadow-sm hover:shadow-md transition-shadow ${selectedIds.has(payment.id) ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Checkbox, Customer and Status */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Checkbox
                                checked={selectedIds.has(payment.id)}
                                onCheckedChange={(checked) => handleSelectOne(payment.id, checked)}
                                aria-label={`Select ${payment.customer_name}`}
                                className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                              />
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                  <IndianRupee className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm text-gray-900 truncate">{payment.customer_name}</p>
                                  <p className="text-xs text-gray-500 truncate">{payment.customer_email}</p>
                                </div>
                              </div>
                            </div>
                            {payment.pending_commission && payment.pending_commission > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex-shrink-0">
                                <Clock className="w-3 h-3 mr-1" />
                                {payment.paid_commission && payment.paid_commission > 0 ? 'Partial' : 'Pending'}
                              </span>
                            ) : payment.commission_paid ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 flex-shrink-0">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 flex-shrink-0">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </div>

                          {/* Payment Info - Compact */}
                          <div className="space-y-1.5 bg-gray-50 rounded-lg p-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Orders:</span>
                              <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                                {payment.payment_count || 1}
                              </span>
                            </div>
                            {payment.paid_commission !== undefined && payment.paid_commission > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Paid ({payment.paid_order_count} order{payment.paid_order_count !== 1 ? 's' : ''}):</span>
                                <span className="text-green-700 font-bold">{formatCurrency(payment.paid_commission)}</span>
                              </div>
                            )}
                            {payment.pending_commission !== undefined && payment.pending_commission > 0 && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Pending ({payment.pending_order_count} order{payment.pending_order_count !== 1 ? 's' : ''}):</span>
                                <span className="text-orange-600 font-bold">{formatCurrency(payment.pending_commission)}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Total ({payment.commission_rate}%):</span>
                              <span className="text-gray-700 font-bold">{formatCurrency(payment.commission_amount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Affiliate ID:</span>
                              <code className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-mono">
                                {payment.affiliate_id}
                              </code>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Referral Code:</span>
                              <code className="text-gray-700 font-mono">{payment.referral_code}</code>
                            </div>
                          </div>

                          {/* Date and Action */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-medium">{formatDate(payment.payment_completed_at || payment.created_at)}</span>
                            </div>
                          </div>

                          {/* Mark Paid Button */}
                          {payment.pending_commission && payment.pending_commission > 0 && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkPaidClick(payment)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Pay ₹{payment.pending_commission.toLocaleString('en-IN')}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                <AdminPagination
                  currentPage={currentPage}
                  totalItems={filteredPayments.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                  itemName="payments"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Mark Paid Dialog - Enhanced */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white max-w-[90vw] sm:max-w-[500px] rounded-xl">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-lg font-bold">Mark Commission as Paid</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Enter payment details for affiliate commission
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-4 py-4">
                {/* Payment Summary */}
                <div className="bg-blue-50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="text-sm font-medium">{selectedPayment.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Firm:</span>
                    <span className="text-sm font-medium">{selectedPayment.customer_firm_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Commission Amount:</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(
                        selectedPayment.pending_commission && selectedPayment.pending_commission > 0
                          ? selectedPayment.pending_commission
                          : selectedPayment.commission_amount
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Affiliate ID:</span>
                    <span className="text-sm font-mono">{selectedPayment.affiliate_id}</span>
                  </div>
                </div>

                {/* Payment Mode and Date Fields - Side by Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Payment Mode Field */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-mode" className="text-sm font-medium">Payment Mode <span className="text-red-500">*</span></Label>
                    <select
                      id="payment-mode"
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    >
                      <option value="">Select payment mode</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="NEFT/RTGS">NEFT/RTGS</option>
                      <option value="IMPS">IMPS</option>
                      <option value="Cheque">Cheque</option>
                      <option value="Cash">Cash</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Payment Date Field */}
                  <div className="space-y-2">
                    <Label htmlFor="payment-date" className="text-sm font-medium">Payment Date <span className="text-red-500">*</span></Label>
                    <input
                      id="payment-date"
                      type="datetime-local"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="border-t pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmitPayment}
                disabled={submitting || !paymentMode || !paymentDate}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Confirm Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

        {/* Fixed Bottom Action Bar - Shows when items selected AND header is not visible */}
        {selectedIds.size > 0 && !isHeaderVisible && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4 z-[9999] lg:left-64">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete ({selectedIds.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Affiliate Payments</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedIds.size} payment(s)?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteSelected}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
    </AdminPageWrapper>
  )
}
