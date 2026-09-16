'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
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
  DataTablePanel,
  DataTableToolbar,
  RowActions,
  RowIconButton,
  ToolbarButton,
  adminButtonClass,
  dataTableCheckboxClass,
  dataTableClass,
} from '@/components/admin/data-table'
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
                    <TableHead className="text-xs font-medium text-gray-500 w-[40px] px-2">S.No</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 px-2">Location</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 px-2">Date</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 text-right px-2">Amount</TableHead>
                    <TableHead className="text-xs font-medium text-gray-500 text-center px-2">Status</TableHead>
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
                    <ToolbarButton
                      onClick={() => setDialogPage(p => Math.max(1, p - 1))}
                      disabled={dialogPage === 1}
                      className="h-7 px-2"
                    >
                      Prev
                    </ToolbarButton>
                    <span className="text-xs text-gray-600 px-2">{dialogPage}/{totalPages}</span>
                    <ToolbarButton
                      onClick={() => setDialogPage(p => Math.min(totalPages, p + 1))}
                      disabled={dialogPage === totalPages}
                      className="h-7 px-2"
                    >
                      Next
                    </ToolbarButton>
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
                      className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <ToolbarButton
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={submitting || !commission.trim()}
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      'Submit'
                    )}
                  </ToolbarButton>
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
                    className="w-full pl-6 pr-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <ToolbarButton
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={submitting || !commission.trim()}
                >
                  {submitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    'Submit'
                  )}
                </ToolbarButton>
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
  const [itemsPerPage, setItemsPerPage] = useState(10)
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

  const getCommissionStatusText = (referral: Referral) => {
    const orders = referral.payments || []

    // No orders — use simple status
    if (orders.length === 0) {
      if (referral.commission_status === 'paid') return 'Paid'
      if (referral.commission_status === 'processing') return 'Processing'
      return 'Pending'
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

    if (paidCount === orders.length) return 'Paid'

    // Show breakdown
    return [
      paidCount > 0 && `${paidCount} Paid`,
      processingCount > 0 && `${processingCount} Processing`,
      waitingCount > 0 && `${waitingCount} Pending`,
    ]
      .filter(Boolean)
      .join(' · ')
  }

  // Calculate totals
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
    >
      <div>
        <DataTablePanel>
            <DataTableToolbar
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search affiliates, customers, codes..."
              className="mb-5"
              actions={
                <>
                  {selectedIds.size > 0 ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <ToolbarButton variant="danger" disabled={isDeleting}>
                          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                          Delete ({selectedIds.size})
                        </ToolbarButton>
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
                          <AlertDialogCancel className={adminButtonClass('outline')}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteSelected}
                            className={adminButtonClass('danger')}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : null}
                  <ToolbarButton variant="outline" onClick={fetchReferrals} disabled={loading}>
                    <RefreshCw className={loading ? 'animate-spin' : ''} />
                    Refresh
                  </ToolbarButton>
                </>
              }
            />

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
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
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
                        <Table className={dataTableClass}>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">
                                <Checkbox
                                  checked={allCurrentReferralsSelected}
                                  onCheckedChange={handleSelectAll}
                                  aria-label="Select all"
                                  className={dataTableCheckboxClass}
                                />
                              </TableHead>
                              <TableHead className="w-[60px]">S.No</TableHead>
                              <TableHead>Customer ID</TableHead>
                              <TableHead>Customer Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead className="text-center">Orders</TableHead>
                              <TableHead className="text-right">Collection</TableHead>
                              <TableHead>Commission Status</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.referrals.map((referral, index) => (
                              <TableRow key={referral.id} className={selectedIds.has(referral.id) ? 'bg-gray-50' : ''}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedIds.has(referral.id)}
                                    onCheckedChange={(checked) => handleSelectOne(referral.id, checked)}
                                    aria-label={`Select ${referral.referred_name || referral.referred_email}`}
                                    className={dataTableCheckboxClass}
                                  />
                                </TableCell>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{referral.customer_id}</TableCell>
                                <TableCell>{referral.referred_name || 'N/A'}</TableCell>
                                <TableCell>{referral.referred_email}</TableCell>
                                <TableCell>{referral.referred_phone || 'N/A'}</TableCell>
                                <TableCell className="text-center">{referral.payment_count || 0}</TableCell>
                                <TableCell className="text-right">
                                  {referral.total_payment_amount
                                    ? formatCurrency(Math.round(referral.total_payment_amount / 1.18))
                                    : '-'}
                                </TableCell>
                                <TableCell>{getCommissionStatusText(referral)}</TableCell>
                                <TableCell>
                                  {referral.payment_count > 0 ? (
                                    <RowActions>
                                      <RowIconButton
                                        label="View orders"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setViewReferral(referral)
                                        }}
                                      >
                                        <Eye />
                                      </RowIconButton>
                                    </RowActions>
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
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1) }}
                itemName="affiliates"
              />
              </>
            )}
        </DataTablePanel>
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
