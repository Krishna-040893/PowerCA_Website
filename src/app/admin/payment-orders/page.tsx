'use client'

import { useEffect, useState } from 'react'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { IndianRupee, Search, Eye, ShoppingCart, CheckCircle, Clock, XCircle, User, Mail } from 'lucide-react'

interface PaymentOrder {
  id: string
  order_id: string
  amount: number
  currency: string
  status: string
  customer_email: string | null
  customer_name: string | null
  customer_phone: string | null
  company: string | null
  firm_name: string | null
  gst_number: string | null
  customer_id: string | null
  referral_code: string | null
  is_affiliate_purchase: boolean
  created_at: string
  updated_at: string
}

export default function PaymentOrdersPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<PaymentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrder | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, orders])

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/payment-orders')
      const data = await response.json()

      if (data.success) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching payment orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = [...orders]

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(order =>
        order.order_id?.toLowerCase().includes(search) ||
        order.customer_name?.toLowerCase().includes(search) ||
        order.customer_email?.toLowerCase().includes(search) ||
        order.firm_name?.toLowerCase().includes(search) ||
        order.customer_phone?.toLowerCase().includes(search)
      )
    }

    setFilteredOrders(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white">
            <CheckCircle className="h-3 w-3 mr-1 inline" />
            Paid
          </Badge>
        )
      case 'created':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
            <Clock className="h-3 w-3 mr-1 inline" />
            Created
          </Badge>
        )
      case 'attempted':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="h-3 w-3 mr-1 inline" />
            Attempted
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleViewDetails = (order: PaymentOrder) => {
    setSelectedOrder(order)
    setDialogOpen(true)
  }

  const stats = {
    total: orders.length,
    paid: orders.filter(o => o.status === 'paid').length,
    created: orders.filter(o => o.status === 'created').length,
    attempted: orders.filter(o => o.status === 'attempted').length,
    totalAmount: orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0),
  }

  return (
    <AdminPageWrapper
      title="Payment Orders"
      description="Manage and track all Razorpay payment orders"
    >
      {/* Stats Cards - 2 Columns on Mobile, 5 on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-blue-50">
                <ShoppingCart className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Paid</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.paid}</p>
                <p className="text-xs text-gray-500 mt-1">Completed</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-green-50">
                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Created</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.created}</p>
                <p className="text-xs text-gray-500 mt-1">Pending</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-blue-50">
                <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Attempted</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900">{stats.attempted}</p>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-yellow-50">
                <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
                <p className="text-xs text-gray-500 mt-1">Earned</p>
              </div>
              <div className="p-3 sm:p-4 rounded-xl bg-green-50">
                <IndianRupee className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Enhanced */}
      <Card className="shadow-sm border border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl font-bold">Filter Orders</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">Search and filter payment orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by order ID, name, email, phone, or firm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-10 border-gray-200 bg-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="attempted">Attempted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table - Enhanced */}
      <Card className="shadow-sm border border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
            <ShoppingCart className="h-5 w-5" />
            Payment Orders ({filteredOrders.length})
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            All payment orders from Razorpay
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading payment orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Payment Orders Found</h3>
              <p className="text-gray-500">No payment orders match your search criteria</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firm Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-mono text-gray-900">{order.order_id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{order.customer_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{order.customer_email || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{order.firm_name || order.company || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          <IndianRupee className="h-3 w-3" />
                          {order.amount.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3">
                        {order.is_affiliate_purchase ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            <XCircle className="h-3 w-3 mr-1" />
                            No
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{formatDate(order.created_at)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              {/* Mobile Card View - Professional Design */}
              <div className="md:hidden space-y-3">
                {currentOrders.map((order) => (
                  <Card key={order.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header: Customer Name, Amount, Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm text-gray-900 truncate">{order.customer_name || 'N/A'}</p>
                                {order.firm_name && (
                                  <p className="text-xs text-gray-500 truncate">{order.firm_name}</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <p className="font-bold text-base whitespace-nowrap flex items-center">
                              <IndianRupee className="h-3 w-3" />
                              {order.amount.toFixed(2)}
                            </p>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Order ID */}
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-gray-500">Order ID</p>
                              <p className="text-xs font-mono text-gray-900 truncate">{order.order_id}</p>
                            </div>
                          </div>
                        </div>

                        {/* Customer Email */}
                        {order.customer_email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 truncate">{order.customer_email}</span>
                          </div>
                        )}

                        {/* Date and Affiliate */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            {formatDate(order.created_at)}
                          </span>
                          {order.is_affiliate_purchase && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              Affiliate
                            </Badge>
                          )}
                        </div>

                        {/* Action Button - Enhanced */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                          className="w-full bg-gradient-to-r from-blue-50 to-blue-50 hover:from-blue-100 hover:to-blue-100 border-blue-200 text-blue-700 font-medium"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Full Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} results
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && goToPage(currentPage - 1)}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>

                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1
                        // Show first page, last page, current page, and pages around current
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

      {/* View Details Dialog - Enhanced */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold">Order Details</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">Complete information about this payment order</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <p className="font-mono font-medium">{selectedOrder.order_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <p className="font-medium flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {selectedOrder.amount.toFixed(2)} {selectedOrder.currency}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedOrder.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedOrder.customer_email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedOrder.customer_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Customer ID:</span>
                    <p className="font-medium">{selectedOrder.customer_id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Business Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Firm Name:</span>
                    <p className="font-medium">{selectedOrder.firm_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Company:</span>
                    <p className="font-medium">{selectedOrder.company || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">GST Number:</span>
                    <p className="font-medium font-mono">{selectedOrder.gst_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Affiliate Information */}
              {selectedOrder.is_affiliate_purchase && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm text-gray-700 mb-3">Affiliate Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Affiliate Purchase:</span>
                      <p className="font-medium text-green-600">Yes</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Referral Code:</span>
                      <p className="font-medium font-mono">{selectedOrder.referral_code || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  )
}
