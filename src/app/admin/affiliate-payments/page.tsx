'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { Badge } from '@/components/ui/badge'
import {
  IndianRupee,
  Clock,
  CheckCircle,
  Search,
  RefreshCw,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronRight,
  Users,
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
  affiliate_name?: string
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
  processing_order_count?: number
  pending_order_count?: number
  paid_commission?: number
  pending_commission?: number
  commission_due?: number
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

interface AffiliateGroup {
  affiliate_id: string
  affiliate_name: string
  referral_code: string
  customers: AffiliatePayment[]
  totalCommissionDue: number
  totalPaidCommission: number
  totalCommission: number
  allPaid: boolean
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

  // Expanded groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<AffiliateGroup | null>(null)
  const [paymentMode, setPaymentMode] = useState<string>('')
  const [referenceNo, setReferenceNo] = useState<string>('')
  const [paymentDate, setPaymentDate] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  // Selection and delete state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

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

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true

    const search = searchTerm.toLowerCase()
    return (
      payment.affiliate_name?.toLowerCase().includes(search) ||
      payment.customer_name?.toLowerCase().includes(search) ||
      payment.customer_email?.toLowerCase().includes(search) ||
      payment.customer_firm_name?.toLowerCase().includes(search) ||
      payment.affiliate_id?.toLowerCase().includes(search) ||
      payment.referral_code?.toLowerCase().includes(search) ||
      payment.customer_id?.toLowerCase().includes(search)
    )
  })

  // Group payments by affiliate_id
  const affiliateGroups = useMemo(() => {
    const groupMap = new Map<string, AffiliateGroup>()

    filteredPayments.forEach(payment => {
      const key = payment.affiliate_id
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          affiliate_id: payment.affiliate_id,
          affiliate_name: payment.affiliate_name || payment.affiliate_id,
          referral_code: payment.referral_code,
          customers: [],
          totalCommissionDue: 0,
          totalPaidCommission: 0,
          totalCommission: 0,
          allPaid: true,
        })
      }

      const group = groupMap.get(key)!
      group.customers.push(payment)

      const due = payment.commission_due !== undefined ? payment.commission_due : (payment.pending_commission || 0)
      const paid = payment.paid_commission || 0

      group.totalCommissionDue += due
      group.totalPaidCommission += paid
      group.totalCommission += due + paid

      if (due > 0) {
        group.allPaid = false
      }
    })

    // Sort groups: unpaid first, then by affiliate name
    return Array.from(groupMap.values()).sort((a, b) => {
      if (a.allPaid !== b.allPaid) return a.allPaid ? 1 : -1
      return (a.affiliate_name || '').localeCompare(b.affiliate_name || '')
    })
  }, [filteredPayments])

  // Pagination on groups
  const totalGroups = affiliateGroups.length
  const currentPageGroups = affiliateGroups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const toggleGroup = (affiliateId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(affiliateId)) {
        next.delete(affiliateId)
      } else {
        next.add(affiliateId)
      }
      return next
    })
  }

  const handlePayGroupClick = (group: AffiliateGroup) => {
    setSelectedGroup(group)
    setPaymentMode('')
    setReferenceNo('')
    const now = new Date()
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setPaymentDate(localDateTime)
    setDialogOpen(true)
  }

  const handleSubmitGroupPayment = async () => {
    if (!selectedGroup) return

    if (!paymentMode || !referenceNo || !paymentDate) {
      toast.error('Please fill in all payment details')
      return
    }

    try {
      setSubmitting(true)

      // Process each pending customer in the group
      const pendingCustomers = selectedGroup.customers.filter(c => {
        const due = c.commission_due !== undefined ? c.commission_due : (c.pending_commission || 0)
        return due > 0
      })

      let successCount = 0
      let failCount = 0

      for (const payment of pendingCustomers) {
        const isEmailMatched = payment.id.startsWith('email-match-') || payment.id.startsWith('commission-')

        const requestBody: Record<string, unknown> = {
          paymentId: payment.id,
          commissionPaid: true,
          paymentMode,
          referenceNo: referenceNo || null,
          paymentDate,
        }

        if (isEmailMatched || (payment.pending_commission && payment.pending_commission > 0)) {
          requestBody.paymentData = {
            referral_id: payment.affiliate_referrals?.id || payment.referral_id,
            referral_code: payment.referral_code,
            affiliate_id: payment.affiliate_id,
            customer_id: payment.customer_id,
            order_id: payment.order_id,
            payment_id: payment.payment_id,
            customer_name: payment.customer_name,
            customer_email: payment.customer_email,
            customer_phone: payment.customer_phone,
            customer_firm_name: payment.customer_firm_name,
            payment_amount: payment.payment_amount,
            commission_amount: payment.commission_amount,
            commission_rate: payment.commission_rate,
            payment_completed_at: payment.payment_completed_at,
            payment_count: payment.payment_count || 1,
            paid_order_count: payment.paid_order_count || 0,
            pending_order_count: payment.pending_order_count || 0,
            paid_commission: payment.paid_commission || 0,
            pending_commission: payment.pending_commission || 0,
            payment_type: payment.payment_type || 'initial_payment',
          }
        }

        try {
          const response = await fetch('/api/admin/affiliate-payments', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          })

          const data = await response.json()
          if (response.ok && data.success) {
            successCount++
          } else {
            failCount++
          }
        } catch {
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Commission paid for ${successCount} customer(s)`)
      }
      if (failCount > 0) {
        toast.error(`Failed to process ${failCount} customer(s)`)
      }

      setDialogOpen(false)
      setSelectedGroup(null)
      setPaymentMode('')
      setReferenceNo('')
      setPaymentDate('')
      fetchPayments()
    } catch (error) {
      console.error('Failed to process group payment:', error)
      toast.error('Failed to process payment')
    } finally {
      setSubmitting(false)
    }
  }

  // Selection helpers - select all customer IDs across groups on current page
  const allCurrentPageIds = useMemo(() => {
    const ids: string[] = []
    currentPageGroups.forEach(g => g.customers.forEach(c => ids.push(c.id)))
    return ids
  }, [currentPageGroups])

  const allCurrentPageSelected = allCurrentPageIds.length > 0 &&
    allCurrentPageIds.every(id => selectedIds.has(id))

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedIds(new Set(allCurrentPageIds))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectGroup = (group: AffiliateGroup, checked: boolean | 'indeterminate') => {
    const newSelected = new Set(selectedIds)
    group.customers.forEach(c => {
      if (checked === true) {
        newSelected.add(c.id)
      } else {
        newSelected.delete(c.id)
      }
    })
    setSelectedIds(newSelected)
  }

  const isGroupSelected = (group: AffiliateGroup) => {
    return group.customers.length > 0 && group.customers.every(c => selectedIds.has(c.id))
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/affiliate-payments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
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
      minimumFractionDigits: 0,
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

  const getCustomerDue = (c: AffiliatePayment) => {
    return c.commission_due !== undefined ? c.commission_due : (c.pending_commission || 0)
  }

  return (
    <AdminPageWrapper
      title="Affiliate Payments"
      description="Track and manage affiliate commissions and payments"
      stats={[
        { label: 'Affiliates', value: affiliateGroups.length, color: 'bg-blue-100 text-blue-800' },
        { label: 'Pending', value: formatCurrency(summary.pendingCommission), color: 'bg-orange-100 text-orange-800' },
        { label: 'Paid', value: formatCurrency(summary.paidCommission), color: 'bg-green-100 text-green-800' },
      ]}
      actions={
        <div className="flex gap-2 flex-wrap items-center">
          {selectedIds.size > 0 && (
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
          )}
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
        <Card className="shadow-sm border border-gray-100">
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by affiliate, customer, email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                  className="pl-10 text-sm h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
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
            ) : affiliateGroups.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No payments found
              </div>
            ) : (
              <>
                {/* Select All */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg mb-3">
                  <Checkbox
                    checked={allCurrentPageSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                    className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                  />
                  <span className="text-sm text-gray-600">Select all on this page</span>
                </div>

                {/* Affiliate Groups */}
                <div className="space-y-3">
                  {currentPageGroups.map((group) => {
                    const isExpanded = expandedGroups.has(group.affiliate_id)
                    const groupSelected = isGroupSelected(group)
                    const pendingCustomers = group.customers.filter(c => getCustomerDue(c) > 0)

                    return (
                      <Card
                        key={group.affiliate_id}
                        className={`border shadow-sm transition-shadow ${
                          groupSelected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
                        }`}
                      >
                        <CardContent className="p-0">
                          {/* Group Header */}
                          <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleGroup(group.affiliate_id)}
                          >
                            {/* Checkbox */}
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={groupSelected}
                                onCheckedChange={(checked) => handleSelectGroup(group, checked)}
                                aria-label={`Select ${group.affiliate_name}`}
                                className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                              />
                            </div>

                            {/* Expand Icon */}
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            )}

                            {/* Affiliate Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900 text-sm">
                                  {group.affiliate_name}
                                </span>
                                <span className="font-mono text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  {group.affiliate_id}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {group.customers.length} customer{group.customers.length > 1 ? 's' : ''}
                                </span>
                                <span>
                                  Code: {group.referral_code}
                                </span>
                              </div>
                            </div>

                            {/* Commission Summary */}
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {group.totalPaidCommission > 0 && (
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Paid</p>
                                  <p className="font-bold text-green-600 text-sm">
                                    {formatCurrency(group.totalPaidCommission)}
                                  </p>
                                </div>
                              )}

                              {group.totalCommissionDue > 0 ? (
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Due</p>
                                  <p className="font-bold text-orange-600 text-sm">
                                    {formatCurrency(group.totalCommissionDue)}
                                  </p>
                                </div>
                              ) : (
                                <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  All Paid
                                </Badge>
                              )}

                              {/* Pay Button */}
                              {group.totalCommissionDue > 0 && (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    size="sm"
                                    onClick={() => handlePayGroupClick(group)}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Pay {formatCurrency(group.totalCommissionDue)}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Expanded: Customer Breakdown */}
                          {isExpanded && (
                            <div className="border-t border-gray-200">
                              {/* Desktop Table */}
                              <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 w-12">S.No</th>
                                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Customer</th>
                                      <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Firm</th>
                                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Orders</th>
                                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Paid</th>
                                      <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600">Due</th>
                                      <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {group.customers.map((customer, idx) => {
                                      const due = getCustomerDue(customer)
                                      const paidCount = customer.paid_order_count || 0
                                      const processingCount = customer.processing_order_count || 0
                                      const waitingCount = customer.pending_order_count || 0
                                      const allOrdersPaid = waitingCount === 0 && processingCount === 0 && due === 0 && customer.commission_amount > 0
                                      return (
                                        <tr key={customer.id} className="hover:bg-gray-50/50">
                                          <td className="px-4 py-2.5 text-gray-500">{idx + 1}</td>
                                          <td className="px-4 py-2.5">
                                            <div>
                                              <p className="font-medium text-gray-900">{customer.customer_name}</p>
                                              <p className="text-xs text-gray-500">{customer.customer_email}</p>
                                            </div>
                                          </td>
                                          <td className="px-4 py-2.5 text-gray-700">
                                            {customer.customer_firm_name || '-'}
                                          </td>
                                          <td className="px-4 py-2.5 text-center">
                                            <div className="flex flex-col items-center gap-0.5">
                                              {paidCount > 0 && (
                                                <span className="text-xs text-green-600 font-medium">{paidCount} paid</span>
                                              )}
                                              {processingCount > 0 && (
                                                <span className="text-xs text-blue-600 font-medium">{processingCount} processing</span>
                                              )}
                                              {waitingCount > 0 && (
                                                <span className="text-xs text-orange-600 font-medium">{waitingCount} waiting</span>
                                              )}
                                              {paidCount === 0 && processingCount === 0 && waitingCount === 0 && (
                                                <span className="text-gray-400">-</span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-4 py-2.5 text-right">
                                            {(customer.paid_commission && customer.paid_commission > 0) ? (
                                              <span className="font-semibold text-green-600">
                                                {formatCurrency(customer.paid_commission)}
                                              </span>
                                            ) : (
                                              <span className="text-gray-400">-</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-2.5 text-right">
                                            {due > 0 ? (
                                              <span className="font-semibold text-orange-600">
                                                {formatCurrency(due)}
                                              </span>
                                            ) : (
                                              <span className="text-gray-400">-</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-2.5 text-center">
                                            {allOrdersPaid ? (
                                              <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Paid
                                              </Badge>
                                            ) : due > 0 ? (
                                              <Badge className="bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Pending
                                              </Badge>
                                            ) : waitingCount > 0 ? (
                                              <Badge className="bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {waitingCount} Waiting
                                              </Badge>
                                            ) : (
                                              <span className="text-gray-400 text-xs">-</span>
                                            )}
                                          </td>
                                        </tr>
                                      )
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Mobile Cards */}
                              <div className="md:hidden p-3 space-y-2">
                                {group.customers.map((customer, idx) => {
                                  const due = getCustomerDue(customer)
                                  const paidCount = customer.paid_order_count || 0
                                  const processingCount = customer.processing_order_count || 0
                                  const waitingCount = customer.pending_order_count || 0
                                  const allOrdersPaid = waitingCount === 0 && processingCount === 0 && due === 0 && customer.commission_amount > 0
                                  return (
                                    <div key={customer.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                                      <div className="flex items-start justify-between">
                                        <div className="min-w-0 flex-1">
                                          <p className="font-medium text-sm text-gray-900">
                                            {idx + 1}. {customer.customer_name}
                                          </p>
                                          <p className="text-xs text-gray-500 truncate">{customer.customer_email}</p>
                                          {customer.customer_firm_name && (
                                            <p className="text-xs text-gray-500">{customer.customer_firm_name}</p>
                                          )}
                                        </div>
                                        {allOrdersPaid ? (
                                          <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100 text-xs flex-shrink-0">
                                            Paid
                                          </Badge>
                                        ) : due > 0 ? (
                                          <Badge className="bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100 text-xs flex-shrink-0">
                                            Pending
                                          </Badge>
                                        ) : processingCount > 0 ? (
                                          <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100 text-xs flex-shrink-0">
                                            {processingCount} Processing
                                          </Badge>
                                        ) : waitingCount > 0 ? (
                                          <Badge className="bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100 text-xs flex-shrink-0">
                                            {waitingCount} Waiting
                                          </Badge>
                                        ) : null}
                                      </div>
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500">Orders</span>
                                        <span className="text-gray-700">
                                          {paidCount > 0 && <span className="text-green-600">{paidCount} paid</span>}
                                          {paidCount > 0 && processingCount > 0 && ', '}
                                          {processingCount > 0 && <span className="text-blue-600">{processingCount} processing</span>}
                                          {(paidCount > 0 || processingCount > 0) && waitingCount > 0 && ', '}
                                          {waitingCount > 0 && <span className="text-orange-600">{waitingCount} waiting</span>}
                                        </span>
                                      </div>
                                      {customer.paid_commission && customer.paid_commission > 0 ? (
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">Paid</span>
                                          <span className="font-semibold text-green-600">{formatCurrency(customer.paid_commission)}</span>
                                        </div>
                                      ) : null}
                                      {due > 0 ? (
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="text-gray-500">Due</span>
                                          <span className="font-semibold text-orange-600">{formatCurrency(due)}</span>
                                        </div>
                                      ) : null}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Pagination */}
                <AdminPagination
                  currentPage={currentPage}
                  totalItems={totalGroups}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                  itemName="affiliates"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Pay Group Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white max-w-[90vw] sm:max-w-[520px] rounded-xl">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-lg font-bold">Pay Affiliate Commission</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                Pay total commission for {selectedGroup?.affiliate_name}
              </DialogDescription>
            </DialogHeader>

            {selectedGroup && (
              <div className="space-y-4 py-4">
                {/* Affiliate Summary */}
                <div className="bg-blue-50 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Affiliate:</span>
                    <span className="text-sm font-medium">{selectedGroup.affiliate_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Affiliate ID:</span>
                    <span className="text-sm font-mono">{selectedGroup.affiliate_id}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                    <span className="text-sm font-semibold text-gray-700">Total Commission Due:</span>
                    <span className="text-base font-bold text-green-600">
                      {formatCurrency(selectedGroup.totalCommissionDue)}
                    </span>
                  </div>
                </div>

                {/* Customer Breakdown */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer Breakdown</p>
                  <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                    {selectedGroup.customers
                      .filter(c => getCustomerDue(c) > 0)
                      .map((customer, idx) => (
                        <div key={customer.id} className="flex items-center justify-between px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {idx + 1}. {customer.customer_name}
                            </p>
                            {customer.customer_firm_name && (
                              <p className="text-xs text-gray-500 truncate">{customer.customer_firm_name}</p>
                            )}
                          </div>
                          <span className="text-sm font-semibold text-orange-600 flex-shrink-0 ml-2">
                            {formatCurrency(getCustomerDue(customer))}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Payment Mode and Reference No */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-mode" className="text-sm font-medium">
                      Payment Mode <span className="text-red-500">*</span>
                    </Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="reference-no" className="text-sm font-medium">
                      Reference No <span className="text-red-500">*</span>
                    </Label>
                    <input
                      id="reference-no"
                      type="text"
                      value={referenceNo}
                      onChange={(e) => setReferenceNo(e.target.value)}
                      placeholder="Transaction/UTR No."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    />
                  </div>
                </div>

                {/* Payment Date */}
                <div className="space-y-2">
                  <Label htmlFor="payment-date" className="text-sm font-medium">
                    Payment Date & Time <span className="text-red-500">*</span>
                  </Label>
                  <input
                    id="payment-date"
                    type="datetime-local"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm cursor-pointer"
                  />
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
                onClick={handleSubmitGroupPayment}
                disabled={submitting || !paymentMode || !referenceNo || !paymentDate}
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
                    Pay {selectedGroup ? formatCurrency(selectedGroup.totalCommissionDue) : ''}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPageWrapper>
  )
}
