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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Users,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  IndianRupee,
  RotateCw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { toast } from 'sonner'

interface Referral {
  id: string
  customer_id: string
  referred_email: string
  referred_name: string
  referred_phone: string
  status: string
  created_at: string
  converted_at: string | null
  payment_amount: number | null
  order_id: string | null
  payment_id: string | null
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

export default function AffiliateReferralsPage() {
  const [data, setData] = useState<AffiliateReferralGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedAffiliate, setExpandedAffiliate] = useState<string | null>(null)
  const [syncingReferral, setSyncingReferral] = useState<string | null>(null)

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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'outline' | 'default' | 'destructive'; icon: React.ComponentType<{ className?: string }>; label: string }> = {
      pending: { variant: 'outline', icon: Clock, label: 'Pending' },
      completed: { variant: 'default', icon: CheckCircle, label: 'Completed' },
      converted: { variant: 'default', icon: IndianRupee, label: 'Paid' },
      expired: { variant: 'destructive', icon: XCircle, label: 'Expired' },
    }

    const config = variants[status] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
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

  const syncReferralStatus = async (referral: Referral) => {
    if (!referral.payment_id && !referral.order_id) {
      toast.error('No payment information available for this referral')
      return
    }

    setSyncingReferral(referral.id)
    try {
      const adminToken = localStorage.getItem('adminToken')
      const response = await fetch('/api/admin/payments/sync-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          payment_id: referral.payment_id,
          order_id: referral.order_id,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success(`Status synced from Razorpay: ${result.data.razorpay_status}`)
        // Refresh the referrals list
        await fetchReferrals()
      } else {
        toast.error(result.error || 'Failed to sync status')
      }
    } catch (error) {
      console.error('Error syncing referral status:', error)
      toast.error('Failed to sync status from Razorpay')
    } finally {
      setSyncingReferral(null)
    }
  }

  return (
    <AdminPageWrapper
      title="Affiliate Referrals"
      description="View all referral customers grouped by affiliate"
      actions={
        <Button
          onClick={fetchReferrals}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      <div>
        {/* Stats removed from here as they'll be in the page content */}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 -mt-2">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStats.total}</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{totalStats.pending}</p>
                </div>
                <Clock className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{totalStats.completed}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Affiliates</p>
                  <p className="text-2xl font-bold text-gray-900">{data.length}</p>
                </div>
                <Users className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search by affiliate name, email, customer name, referral code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Referral Details by Affiliate</CardTitle>
            <CardDescription>
              Click on an affiliate to view their referral customers
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              <div className="space-y-4">
                {filteredData.map((group) => (
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
                      <div className="bg-white">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer ID</TableHead>
                              <TableHead>Customer Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Phone</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Payment</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {group.referrals.map((referral) => (
                              <TableRow key={referral.id}>
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
                                <TableCell>{getStatusBadge(referral.status)}</TableCell>
                                <TableCell>
                                  {referral.payment_amount ? (
                                    <div>
                                      <p className="font-semibold text-green-600">
                                        {formatCurrency(referral.payment_amount)}
                                      </p>
                                      {referral.converted_at && (
                                        <p className="text-xs text-gray-500">
                                          {formatDate(referral.converted_at)}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 text-sm">No payment</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(referral.created_at)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {(referral.payment_id || referral.order_id) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => syncReferralStatus(referral)}
                                      disabled={syncingReferral === referral.id}
                                      className="bg-white hover:bg-gray-50"
                                      title="Sync status from Razorpay"
                                    >
                                      <RotateCw className={`h-4 w-4 ${syncingReferral === referral.id ? 'animate-spin' : ''}`} />
                                    </Button>
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
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  )
}
