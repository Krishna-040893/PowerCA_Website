'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IndianRupee,
  TrendingUp,
  Clock,
  CheckCircle,
  Search,
  RefreshCw
} from 'lucide-react'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { toast } from 'sonner'

interface AffiliatePayment {
  id: string
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
  affiliate_referrals: {
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

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<AffiliatePayment | null>(null)
  const [paymentMode, setPaymentMode] = useState<string>('')
  const [paymentDate, setPaymentDate] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

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
    setPaymentDate('')
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
      const response = await fetch('/api/admin/affiliate-payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          commissionPaid: true,
          paymentMode,
          paymentDate
        })
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AdminPageWrapper
      title="Affiliate Referral Payments"
      description="Track and manage affiliate commissions and payments"
      actions={
        <Button
          onClick={fetchPayments}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      <div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalPayments}</p>
              </div>
              <IndianRupee className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalAmount)}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Commission</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.totalCommission)}</p>
              </div>
              <IndianRupee className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(summary.pendingCommission)}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Paid</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(summary.paidCommission)}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search by customer, email, firm, affiliate ID, referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affiliate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mr-2" />
                        <span className="text-gray-600">Loading payments...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.payment_completed_at || payment.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">{payment.customer_name}</p>
                          <p className="text-gray-500 text-xs">{payment.customer_firm_name}</p>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.payment_amount)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>
                          <p className="font-bold text-green-600">
                            {formatCurrency(payment.commission_amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            ({payment.commission_rate}%)
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {payment.commission_paid ? (
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
                        {!payment.commission_paid && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaidClick(payment)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mark Paid Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-white sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Mark Commission as Paid</DialogTitle>
              <DialogDescription>
                Enter payment details for affiliate commission
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-4 py-4">
                {/* Payment Summary */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
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
                      {formatCurrency(selectedPayment.commission_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Affiliate ID:</span>
                    <span className="text-sm font-mono">{selectedPayment.affiliate_id}</span>
                  </div>
                </div>

                {/* Payment Mode Field */}
                <div className="space-y-2">
                  <Label htmlFor="payment-mode">Payment Mode *</Label>
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger id="payment-mode">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="NEFT/RTGS">NEFT/RTGS</SelectItem>
                      <SelectItem value="IMPS">IMPS</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Date Field */}
                <div className="space-y-2">
                  <Label htmlFor="payment-date">Payment Date *</Label>
                  <Input
                    id="payment-date"
                    type="datetime-local"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmitPayment}
                disabled={submitting || !paymentMode || !paymentDate}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Payment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPageWrapper>
  )
}
