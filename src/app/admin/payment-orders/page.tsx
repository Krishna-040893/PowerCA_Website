'use client'

import { useEffect, useState } from 'react'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
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

interface IndividualOrder {
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
  discount_percentage: number | null
  discount_amount: number | null
  original_amount: number | null
  location: string | null
  customer_address: string | null
  customer_city: string | null
  customer_state: string | null
  customer_postcode: string | null
  customer_country: string | null
  payment_type: string | null
}

interface PaymentOrder {
  id: string
  customer_email: string | null
  customer_name: string | null
  customer_phone: string | null
  company: string | null
  firm_names: string[]
  gst_number: string | null
  total_amount: number
  paid_amount: number
  pending_amount: number
  total_orders: number
  locations: string[]
  statuses: string[]
  is_affiliate_purchase: boolean
  referral_code: string | null
  latest_order: IndividualOrder
  all_orders: IndividualOrder[]
  // Backward compatibility
  order_id: string
  amount: number
  currency: string
  status: string
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
  const [dialogSearchTerm, setDialogSearchTerm] = useState('')
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
      // Check if search term is a number (for order count exact match)
      const isNumberSearch = /^\d+$/.test(search.trim())

      filtered = filtered.filter(order => {
        // If searching for a number, check for exact order count match first
        if (isNumberSearch && order.total_orders?.toString() === search.trim()) {
          return true
        }
        // Otherwise search in text fields
        return (
          order.order_id?.toLowerCase().includes(search) ||
          order.customer_name?.toLowerCase().includes(search) ||
          order.customer_email?.toLowerCase().includes(search) ||
          order.firm_names?.some(name => name?.toLowerCase().includes(search)) ||
          order.customer_phone?.toLowerCase().includes(search) ||
          order.locations?.some(loc => loc?.toLowerCase().includes(search))
        )
      })
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

  const getPaymentTypeBadge = (paymentType: string | null, status: string) => {
    const isPaid = status === 'paid'

    if (paymentType === 'final_settlement') {
      return (
        <Badge className={`text-xs ${isPaid ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-orange-100 text-orange-700 border border-orange-300'}`}>
          Final Settlement {isPaid ? '✓' : '- Pending'}
        </Badge>
      )
    }
    // Installation & Support - only show paid status, no "Pending" label
    return (
      <Badge className={`text-xs ${isPaid ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-blue-100 text-blue-700 border border-blue-300'}`}>
        Installation & Support {isPaid ? '✓' : ''}
      </Badge>
    )
  }

  // Determine payment type based on order sequence for same location
  // First order = Installation & Support, Second order = Final Settlement
  const getPaymentTypeBySequence = (order: IndividualOrder, allOrders: IndividualOrder[]) => {
    // Group orders by location (address_id or location)
    const locationKey = order.location || 'unknown'

    // Get all orders for the same location, sorted by created_at ascending (oldest first)
    const ordersForLocation = allOrders
      .filter(o => (o.location || 'unknown') === locationKey)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    // Find the index of current order in the sorted list
    const orderIndex = ordersForLocation.findIndex(o => o.order_id === order.order_id)

    // First order (index 0) = initial_payment, Second order (index 1) = final_settlement
    return orderIndex === 0 ? 'initial_payment' : 'final_settlement'
  }

  // Group orders by location for popup display
  interface LocationGroup {
    location: string
    firmName: string | null
    initialPayment: IndividualOrder | null
    finalSettlement: IndividualOrder | null
    totalAmount: number
  }

  const getOrdersGroupedByLocation = (orders: IndividualOrder[]): LocationGroup[] => {
    const locationMap = new Map<string, LocationGroup>()

    // Sort orders by created_at ascending (oldest first)
    const sortedOrders = [...orders].sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    sortedOrders.forEach(order => {
      const locationKey = order.location || 'No Location'

      if (!locationMap.has(locationKey)) {
        locationMap.set(locationKey, {
          location: locationKey,
          firmName: order.firm_name,
          initialPayment: null,
          finalSettlement: null,
          totalAmount: 0
        })
      }

      const group = locationMap.get(locationKey)!
      group.totalAmount += order.amount || 0

      // First order for this location = initial payment
      // Second order for this location = final settlement
      if (!group.initialPayment) {
        group.initialPayment = order
      } else if (!group.finalSettlement) {
        group.finalSettlement = order
      }

      // Update firm name if available
      if (order.firm_name) {
        group.firmName = order.firm_name
      }
    })

    return Array.from(locationMap.values())
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
    return `${dateFormatted}\n${timeFormatted}`
  }

  const handleViewDetails = (order: PaymentOrder) => {
    setSelectedOrder(order)
    setDialogSearchTerm('')  // Reset search when opening dialog
    setDialogOpen(true)
  }

  // Filter orders inside dialog
  const getFilteredDialogOrders = () => {
    if (!selectedOrder?.all_orders) return []
    if (!dialogSearchTerm) return selectedOrder.all_orders

    const search = dialogSearchTerm.toLowerCase()
    return selectedOrder.all_orders.filter(o =>
      o.order_id?.toLowerCase().includes(search) ||
      o.firm_name?.toLowerCase().includes(search) ||
      o.location?.toLowerCase().includes(search) ||
      o.status?.toLowerCase().includes(search) ||
      o.amount?.toString().includes(search)
    )
  }

  const stats = {
    totalCustomers: filteredOrders.length,
    total: orders.flatMap(o => o.all_orders || []).length,
    paid: orders.flatMap(o => o.all_orders || []).filter(o => o.status === 'paid').length,
    created: orders.flatMap(o => o.all_orders || []).filter(o => o.status === 'created').length,
    totalAmount: filteredOrders.reduce((sum, o) => sum + o.total_amount, 0),
  }

  return (
    <AdminPageWrapper
      title="Payment Orders"
      description="Manage and track all payment orders"
      stats={[
        { label: 'Customers', value: stats.totalCustomers, color: 'bg-purple-100 text-purple-800' },
        { label: 'Orders', value: stats.total, color: 'bg-blue-100 text-blue-800' },
        { label: 'Paid', value: stats.paid, color: 'bg-green-100 text-green-800' },
        { label: 'Revenue', value: formatCurrency(stats.totalAmount), color: 'bg-indigo-100 text-indigo-800' }
      ]}
    >
      {/* Orders Table - Enhanced */}
      <Card className="shadow-sm border border-gray-100">
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, order ID, firm, location..."
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
              </SelectContent>
            </Select>
          </div>

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
                    <th className="px-6 py-3 text-left text-base font-bold">Customer</th>
                    <th className="px-6 py-3 text-center text-base font-bold">Orders</th>
                    <th className="px-6 py-3 text-left text-base font-bold">Locations</th>
                    <th className="px-6 py-3 text-left text-base font-bold">Amount</th>
                    <th className="px-6 py-3 text-left text-base font-bold">Status</th>
                    <th className="px-6 py-3 text-left text-base font-bold">Affiliate</th>
                    <th className="px-6 py-3 text-left text-base font-bold">Last Order</th>
                    <th className="px-6 py-3 text-left text-base font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{order.customer_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{order.customer_email || 'N/A'}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full text-sm font-bold bg-blue-100 text-blue-700 border border-blue-300">
                          {order.total_orders}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-blue-600 font-medium max-w-[200px]">
                          {order.locations && order.locations.length > 0
                            ? order.locations.join(', ')
                            : <span className="text-gray-400">-</span>
                          }
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-bold text-green-600 flex items-center">
                            <IndianRupee className="h-3 w-3" />
                            {(order.paid_amount || 0).toFixed(2)}
                          </div>
                          {(order.pending_amount || 0) > 0 && (
                            <div className="text-xs text-orange-600 flex items-center">
                              <IndianRupee className="h-2.5 w-2.5" />
                              {order.pending_amount.toFixed(2)} pending
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {order.statuses && order.statuses.map((status, idx) => (
                            <span key={idx}>{getStatusBadge(status)}</span>
                          ))}
                        </div>
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
                        <div className="text-sm text-gray-900">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.created_at ? new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View All
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
                        {/* Header: Customer Name, Amount, Orders count */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm text-gray-900 truncate">{order.customer_name || 'N/A'}</p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">{order.customer_email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <p className="font-bold text-base text-green-600 whitespace-nowrap flex items-center">
                              <IndianRupee className="h-3 w-3" />
                              {(order.paid_amount || 0).toFixed(2)}
                            </p>
                            {(order.pending_amount || 0) > 0 && (
                              <p className="text-xs text-orange-600 whitespace-nowrap flex items-center">
                                <IndianRupee className="h-2.5 w-2.5" />
                                {order.pending_amount.toFixed(2)} pending
                              </p>
                            )}
                            <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-300">
                              {order.total_orders} orders
                            </span>
                          </div>
                        </div>

                        {/* Locations */}
                        {order.locations && order.locations.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-2.5">
                            <p className="text-xs text-gray-500 mb-1">Locations:</p>
                            <p className="text-sm text-blue-600 font-medium">{order.locations.join(', ')}</p>
                          </div>
                        )}

                        {/* Statuses */}
                        <div className="flex flex-wrap gap-1">
                          {order.statuses && order.statuses.map((status, idx) => (
                            <span key={idx}>{getStatusBadge(status)}</span>
                          ))}
                        </div>

                        {/* Date and Affiliate */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">
                            Last order: {formatDate(order.created_at)}
                          </span>
                          {order.is_affiliate_purchase && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              Affiliate
                            </Badge>
                          )}
                        </div>

                        {/* Action Button - Enhanced */}
                        <Button
                          size="sm"
                          onClick={() => handleViewDetails(order)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View All Orders
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
        <DialogContent className="max-w-[90vw] sm:max-w-3xl max-h-[80vh] overflow-y-auto bg-white rounded-xl">
          <DialogHeader className="border-b pb-3 mb-2">
            <DialogTitle className="text-xl font-bold text-gray-900">
              {selectedOrder?.customer_name || 'Customer'} - Order Details
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              {selectedOrder?.customer_email}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-blue-800 mb-3">Customer Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedOrder.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium break-all text-xs">{selectedOrder.customer_email || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Orders:</span>
                    <p className="font-bold text-blue-600">{selectedOrder.total_orders}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Paid Amount:</span>
                    <p className="font-bold text-green-600 flex items-center">
                      <IndianRupee className="h-3 w-3" />
                      {(selectedOrder.paid_amount || 0).toFixed(2)}
                    </p>
                  </div>
                  {(selectedOrder.pending_amount || 0) > 0 && (
                    <div>
                      <span className="text-gray-600">Pending Amount:</span>
                      <p className="font-bold text-orange-600 flex items-center">
                        <IndianRupee className="h-3 w-3" />
                        {selectedOrder.pending_amount.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {selectedOrder.gst_number && (
                    <div>
                      <span className="text-gray-600">GST:</span>
                      <p className="font-medium font-mono">{selectedOrder.gst_number}</p>
                    </div>
                  )}
                  {selectedOrder.customer_phone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <p className="font-medium">{selectedOrder.customer_phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Affiliate Info */}
              {selectedOrder.is_affiliate_purchase && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Affiliate Purchase
                    </Badge>
                    {selectedOrder.referral_code && (
                      <span className="text-xs text-gray-600">Referral Code: <span className="font-mono font-medium">{selectedOrder.referral_code}</span></span>
                    )}
                  </div>
                </div>
              )}

              {/* All Orders List - Grouped by Location */}
              <div className="border rounded-lg">
                <div className="p-3 bg-gray-50 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4 className="font-medium">Locations ({getOrdersGroupedByLocation(selectedOrder.all_orders || []).length})</h4>
                    {/* Search inside dialog */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5" />
                      <Input
                        placeholder="Search locations..."
                        value={dialogSearchTerm}
                        onChange={(e) => setDialogSearchTerm(e.target.value)}
                        className="pl-8 h-8 text-xs w-full sm:w-[200px] border-gray-200"
                      />
                    </div>
                  </div>
                </div>
                <div className="divide-y max-h-[300px] overflow-y-auto">
                  {getOrdersGroupedByLocation(selectedOrder.all_orders || [])
                    .filter(group =>
                      !dialogSearchTerm ||
                      group.location.toLowerCase().includes(dialogSearchTerm.toLowerCase()) ||
                      (group.firmName && group.firmName.toLowerCase().includes(dialogSearchTerm.toLowerCase()))
                    )
                    .map((group, idx) => (
                      <div key={idx} className="p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            {group.firmName && (
                              <p className="text-sm font-medium text-gray-900">{group.firmName}</p>
                            )}
                            <p className="text-sm text-blue-600">{group.location}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold flex items-center justify-end">
                              <IndianRupee className="h-3 w-3" />
                              {group.totalAmount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {/* Payment Status Row */}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {/* Installation & Support Status */}
                          {group.initialPayment && (
                            <Badge className={`text-xs ${group.initialPayment.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-blue-100 text-blue-700 border border-blue-300'}`}>
                              Installation & Support {group.initialPayment.status === 'paid' ? '✓' : ''}
                            </Badge>
                          )}
                          {/* Final Settlement Status */}
                          {group.finalSettlement ? (
                            <Badge className={`text-xs ${group.finalSettlement.status === 'paid' ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-orange-100 text-orange-700 border border-orange-300'}`}>
                              Final Settlement {group.finalSettlement.status === 'paid' ? '✓' : '- Pending'}
                            </Badge>
                          ) : group.initialPayment?.status === 'paid' ? (
                            <Badge className="text-xs bg-gray-100 text-gray-500 border border-gray-300">
                              Final Settlement - Not Started
                            </Badge>
                          ) : null}
                        </div>
                        {/* Order dates */}
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          {group.initialPayment && (
                            <span>Initial: {new Date(group.initialPayment.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          )}
                          {group.finalSettlement && (
                            <span>Final: {new Date(group.finalSettlement.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                          )}
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPageWrapper>
  )
}
