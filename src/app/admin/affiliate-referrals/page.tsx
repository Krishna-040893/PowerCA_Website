'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Mail,
  Trash2,
  Loader2,
  Eye,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
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

interface PaymentOrder {
  order_id: string
  amount: number
  address_id: string | null
  customer_city: string | null
  payment_id: string | null
  order_commission: number | null
  order_commission_paid: boolean
  created_at: string | null
}

interface Referral {
  id: string
  customer_id: string
  referred_email: string
  referred_name: string
  referred_phone: string
  status: string
  created_at: string
  total_payment_amount: number | null
  payment_count: number
  payments: PaymentOrder[]
  commission_amount: number | null
  paid_commission: number
  commission_status: string
  last_commission_date: string | null
  last_commission_set_date: string | null
}

interface AffiliateReferralGroup {
  affiliate_id: string
  affiliate_name: string
  affiliate_email: string
  affiliate_company: string
  referral_code: string
  referrals: Referral[]
  stats: {
    total: number
    pending: number
    completed: number
    converted: number
  }
}

// Order detail dialog — read-only orders table + single total commission input
function OrderDetailDialog({
  referral,
  open,
  onClose,
  onCommissionSaved,
}: {
  referral: Referral | null
  open: boolean
  onClose: () => void
  onCommissionSaved: () => void
}) {
  const [commission, setCommission] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dialogPage, setDialogPage] = useState(1)
  const DIALOG_ITEMS_PER_PAGE = 10

  useEffect(() => {
    if (open) {
      setCommission('')
      setDialogPage(1)
    }
  }, [open])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleSubmit = async () => {
    if (!referral) return
    const val = commission.trim()
    if (!val) return

    const amount = parseFloat(val)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid commission amount')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/admin/affiliate-referrals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          referralId: referral.id,
          commissionAmount: amount,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        toast.error(result.error || 'Failed to save commission')
        return
      }

      toast.success(`Commission ₹${amount.toLocaleString('en-IN')} submitted`)
      setCommission('')
      onCommissionSaved()
      onClose()
    } catch {
      toast.error('Failed to save commission')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  if (!referral) return null

  const orders = referral.payments || []
  const totalPages = Math.ceil(orders.length / DIALOG_ITEMS_PER_PAGE)
  const paginatedOrders = orders.slice(
    (dialogPage - 1) * DIALOG_ITEMS_PER_PAGE,
    dialogPage * DIALOG_ITEMS_PER_PAGE
  )
  const lastCommPaidDate = referral.last_commission_date ? new Date(referral.last_commission_date) : null
  const lastCommSetDate = referral.last_commission_set_date ? new Date(referral.last_commission_set_date) : null
  const hasPaidCommission = referral.commission_amount !== null && referral.commission_amount !== undefined && referral.commission_amount > 0

  // 3-state logic: Paid / Processing / Waiting
  const getOrderStatus = (order: PaymentOrder): 'paid' | 'processing' | 'waiting' => {
    if (!order.created_at) return 'waiting'
    const orderDate = new Date(order.created_at)

    // Orders before or on paid date = "Paid"
    if (lastCommPaidDate && orderDate <= lastCommPaidDate) return 'paid'
    // Orders after paid date but before or on set date = "Processing" (commission set, not yet paid)
    if (lastCommSetDate && orderDate <= lastCommSetDate) return 'processing'
    // Everything else = "Waiting"
    return 'waiting'
  }

  const waitingOrders = orders.filter(o => getOrderStatus(o) === 'waiting')
  const hasWaitingOrders = waitingOrders.length > 0

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-[95vw] sm:max-w-[580px] rounded-xl max-h-[85vh] overflow-y-auto p-4 sm:p-5">
        <DialogHeader className="border-b pb-2">
          <DialogTitle className="text-base font-bold">
            Order Details — {referral.referred_name}
          </DialogTitle>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
            <span>ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{referral.customer_id}</code></span>
            <span>{referral.referred_email}</span>
          </div>
        </DialogHeader>

        {orders.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">No orders found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold w-[40px] px-2">S.No</TableHead>
                    <TableHead className="text-xs font-bold px-2">Location</TableHead>
                    <TableHead className="text-xs font-bold px-2">Date</TableHead>
                    <TableHead className="text-xs font-bold text-right px-2">Amount</TableHead>
                    <TableHead className="text-xs font-bold text-center px-2">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOrders.map((order, index) => {
                    const amt = Math.round(order.amount / 1.18)
                    const globalIndex = (dialogPage - 1) * DIALOG_ITEMS_PER_PAGE + index
                    const status = getOrderStatus(order)
                    return (
                      <TableRow key={order.order_id || index}>
                        <TableCell className="font-medium text-gray-500 text-sm px-2">{globalIndex + 1}</TableCell>
                        <TableCell className="font-medium text-sm px-2">{order.customer_city || 'N/A'}</TableCell>
                        <TableCell className="text-sm text-gray-600 px-2 whitespace-nowrap">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-700 text-sm px-2">
                          {formatCurrency(amt)}
                        </TableCell>
                        <TableCell className="text-center px-2">
                          {status === 'paid' ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100 text-[10px] px-1.5 py-0.5">
                              Paid
                            </Badge>
                          ) : status === 'processing' ? (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100 text-[10px] px-1.5 py-0.5">
                              Processing
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100 text-[10px] px-1.5 py-0.5">
                              Waiting
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              {/* Pagination inside dialog */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t">
                  <span className="text-xs text-gray-500">
                    {(dialogPage - 1) * DIALOG_ITEMS_PER_PAGE + 1}–{Math.min(dialogPage * DIALOG_ITEMS_PER_PAGE, orders.length)} of {orders.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDialogPage(p => Math.max(1, p - 1))}
                      disabled={dialogPage === 1}
                      className="h-7 px-2 text-xs"
                    >
                      Prev
                    </Button>
                    <span className="text-xs text-gray-600 px-2">{dialogPage}/{totalPages}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDialogPage(p => Math.min(totalPages, p + 1))}
                      disabled={dialogPage === totalPages}
                      className="h-7 px-2 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Commission input — show when there are new waiting orders */}
            {hasWaitingOrders ? (
              <div className="mt-3 pt-3 border-t">
                {hasPaidCommission && (
                  <p className="text-xs text-orange-600 mb-2 font-medium">
                    {waitingOrders.length} new order{waitingOrders.length > 1 ? 's' : ''} waiting for commission
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Commission:</label>
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={submitting}
                      placeholder="Enter commission for new orders"
                      className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !commission.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 px-4"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Submit'
                    )}
                  </Button>
                </div>
              </div>
            ) : !hasPaidCommission ? (
              <div className="mt-3 pt-3 border-t flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Commission:</label>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={submitting}
                    placeholder="Enter total commission"
                    className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !commission.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 px-4"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            ) : null}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function AffiliateReferralsPage() {
  const [data, setData] = useState<AffiliateReferralGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedAffiliate, setExpandedAffiliate] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewReferral, setViewReferral] = useState<Referral | null>(null)

  const fetchReferrals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/affiliate-referrals')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch referrals:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferrals()
  }, [])

  const filteredData = data.filter((group) => {
    if (!searchTerm) return true

    const search = searchTerm.toLowerCase()
    return (
      group.affiliate_name?.toLowerCase().includes(search) ||
      group.affiliate_email?.toLowerCase().includes(search) ||
      group.affiliate_company?.toLowerCase().includes(search) ||
      group.affiliate_id?.toLowerCase().includes(search) ||
      group.referral_code?.toLowerCase().includes(search) ||
      group.referrals.some(
        (ref) =>
          ref.referred_name?.toLowerCase().includes(search) ||
          ref.referred_email?.toLowerCase().includes(search) ||
          ref.customer_id?.toLowerCase().includes(search)
      )
    )
  })

  const toggleAffiliate = (affiliateId: string) => {
    setExpandedAffiliate(expandedAffiliate === affiliateId ? null : affiliateId)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getCommissionStatusBadge = (referral: Referral) => {
    const orders = referral.payments || []

    // No orders — use simple status
    if (orders.length === 0) {
      if (referral.commission_status === 'paid') {
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">
            Paid
          </Badge>
        )
      }
      if (referral.commission_status === 'processing') {
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100">
            Processing
          </Badge>
        )
      }
      return (
        <Badge variant="outline" className="text-gray-500 border-gray-300">
          Pending
        </Badge>
      )
    }

    // Calculate per-order statuses
    const lastCommPaidDate = referral.last_commission_date ? new Date(referral.last_commission_date) : null
    const lastCommSetDate = referral.last_commission_set_date ? new Date(referral.last_commission_set_date) : null

    let paidCount = 0
    let processingCount = 0
    let waitingCount = 0

    orders.forEach(order => {
      if (!order.created_at) { waitingCount++; return }
      const orderDate = new Date(order.created_at)
      if (lastCommPaidDate && orderDate <= lastCommPaidDate) paidCount++
      else if (lastCommSetDate && orderDate <= lastCommSetDate) processingCount++
      else waitingCount++
    })

    // All paid — single green badge
    if (paidCount === orders.length) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">
          Paid
        </Badge>
      )
    }

    // Show breakdown
    return (
      <div className="flex flex-wrap gap-1">
        {paidCount > 0 && (
          <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100 text-[10px] px-1.5 py-0.5">
            {paidCount} Paid
          </Badge>
        )}
        {processingCount > 0 && (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-100 text-[10px] px-1.5 py-0.5">
            {processingCount} Processing
          </Badge>
        )}
        {waitingCount > 0 && (
          <Badge className="bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-100 text-[10px] px-1.5 py-0.5">
            {waitingCount} Pending
          </Badge>
        )}
      </div>
    )
  }

  // Calculate totals
  const totalStats = data.reduce(
    (acc, group) => ({
      total: acc.total + group.stats.total,
      pending: acc.pending + group.stats.pending,
      completed: acc.completed + group.stats.completed,
      converted: acc.converted + group.stats.converted,
    }),
    { total: 0, pending: 0, completed: 0, converted: 0 }
  )

  // Get all referrals from the current expanded affiliate for selection purposes
  const getCurrentExpandedReferrals = () => {
    if (!expandedAffiliate) return []
    const group = data.find(g => g.affiliate_id === expandedAffiliate)
    return group?.referrals || []
  }

  const currentExpandedReferrals = getCurrentExpandedReferrals()
  const allCurrentReferralsSelected = currentExpandedReferrals.length > 0 &&
    currentExpandedReferrals.every(ref => selectedIds.has(ref.id))

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const currentReferralIds = currentExpandedReferrals.map(r => r.id)
      setSelectedIds(new Set(currentReferralIds))
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
      const response = await fetch('/api/admin/affiliate-referrals', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete referrals')
      }

      toast.success(`Successfully deleted ${selectedIds.size} referral(s)`)
      setSelectedIds(new Set())
      fetchReferrals()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete referrals')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AdminPageWrapper
      title="Affiliate Referrals"
      description="View all referral customers grouped by affiliate"
      stats={[
        { label: 'Total', value: totalStats.total, color: 'bg-blue-100 text-blue-800' },
        { label: 'Pending', value: totalStats.pending, color: 'bg-orange-100 text-orange-800' },
        { label: 'Completed', value: totalStats.completed, color: 'bg-green-100 text-green-800' },
        { label: 'Affiliates', value: data.length, color: 'bg-purple-100 text-purple-800' }
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
                  <AlertDialogTitle>Delete Referrals</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedIds.size} referral(s)?
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
            onClick={fetchReferrals}
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
        {/* Main Content */}
        <Card className="shadow-sm border border-gray-100">
          <CardContent>
            {/* Search Filter */}
            <div className="flex gap-2 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search affiliates, customers, codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                <span className="text-gray-600">Loading referrals...</span>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'No referrals match your search' : 'No referrals found'}
              </div>
            ) : (
              <>
              <div className="space-y-4">
                {filteredData
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((group) => (
                  <div key={group.affiliate_id} className="border rounded-lg overflow-hidden">
                    {/* Affiliate Header */}
                    <div
                      className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleAffiliate(group.affiliate_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div>
                            {expandedAffiliate === group.affiliate_id ? (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-gray-900">
                                {group.affiliate_name}
                              </h3>
                              <Badge variant="outline" className="font-mono text-xs">
                                {group.referral_code}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {group.affiliate_email}
                              </span>
                              {group.affiliate_company && (
                                <span>• {group.affiliate_company}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-lg font-bold text-gray-900">
                              {group.stats.total}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Pending</p>
                            <p className="text-lg font-bold text-orange-600">
                              {group.stats.pending}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Completed</p>
                            <p className="text-lg font-bold text-green-600">
                              {group.stats.completed}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Referrals Table */}
                    {expandedAffiliate === group.affiliate_id && (
                      <div className="bg-white overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">
                                <Checkbox
                                  checked={allCurrentReferralsSelected}
                                  onCheckedChange={handleSelectAll}
                                  aria-label="Select all"
                                  className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                                />
                              </TableHead>
                              <TableHead className="text-base font-bold w-[60px]">S.No</TableHead>
                              <TableHead className="text-base font-bold">Customer ID</TableHead>
                              <TableHead className="text-base font-bold">Customer Name</TableHead>
                              <TableHead className="text-base font-bold">Email</TableHead>
                              <TableHead className="text-base font-bold">Phone</TableHead>
                              <TableHead className="text-base font-bold text-center">Orders</TableHead>
                              <TableHead className="text-base font-bold text-right">Collection</TableHead>
                              <TableHead className="text-base font-bold">Commission Status</TableHead>
                              <TableHead className="text-base font-bold text-center">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.referrals.map((referral, index) => (
                              <TableRow key={referral.id} className={selectedIds.has(referral.id) ? 'bg-blue-50/50' : ''}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedIds.has(referral.id)}
                                    onCheckedChange={(checked) => handleSelectOne(referral.id, checked)}
                                    aria-label={`Select ${referral.referred_name || referral.referred_email}`}
                                    className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                                  />
                                </TableCell>
                                <TableCell className="font-medium text-gray-500">
                                  {index + 1}
                                </TableCell>
                                <TableCell>
                                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                    {referral.customer_id}
                                  </code>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {referral.referred_name || 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-gray-600">
                                    {referral.referred_email}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-gray-600">
                                    {referral.referred_phone || 'N/A'}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  {referral.payment_count > 0 ? (
                                    <span className="font-semibold text-gray-900">
                                      {referral.payment_count}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">0</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {referral.total_payment_amount ? (
                                    <span className="font-semibold text-green-700">
                                      {formatCurrency(Math.round(referral.total_payment_amount / 1.18))}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {getCommissionStatusBadge(referral)}
                                </TableCell>
                                <TableCell className="text-center">
                                  {referral.payment_count > 0 ? (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setViewReferral(referral)
                                      }}
                                      className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <Eye className="w-4 h-4 mr-1.5" />
                                      View
                                    </Button>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <AdminPagination
                currentPage={currentPage}
                totalItems={filteredData.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemName="affiliates"
              />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        referral={viewReferral}
        open={!!viewReferral}
        onClose={() => setViewReferral(null)}
        onCommissionSaved={() => {
          fetchReferrals()
        }}
      />
    </AdminPageWrapper>
  )
}
