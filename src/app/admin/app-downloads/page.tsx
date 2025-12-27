'use client'

import { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useSearchParams, useRouter } from 'next/navigation'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2, Search, Eye, RefreshCw, CheckCircle, XCircle, Download, Package, CreditCard, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface AppDownloadPayment {
  id: string
  user_id: string | null
  order_id: string
  payment_id: string
  amount: number
  currency: string
  status: string
  product_id: string
  product_name: string
  email: string
  phone: string | null
  name: string
  download_token: string
  download_count: number
  last_download_at: string | null
  created_at: string
}

interface AppDownloadOrder {
  id: string
  order_id: string
  amount: number
  currency: string
  status: string
  customer_email: string
  customer_name: string
  customer_phone: string | null
  product_id: string
  product_name: string
  user_id: string | null
  created_at: string
}

// Grouped payments by email
interface GroupedPayment {
  email: string
  customerName: string
  customerPhone: string
  totalPurchases: number
  totalAmount: number
  payments: AppDownloadPayment[]
}

function AdminAppDownloadsContent() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [payments, setPayments] = useState<AppDownloadPayment[]>([])
  const [paymentsGroupedByEmail, setPaymentsGroupedByEmail] = useState<GroupedPayment[]>([])
  const [orders, setOrders] = useState<AppDownloadOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<AppDownloadPayment | null>(null)
  const [selectedGroupedPayment, setSelectedGroupedPayment] = useState<GroupedPayment | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<AppDownloadOrder | null>(null)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'payments')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<Set<string>>(new Set())
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  // Update active tab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && (tab === 'orders' || tab === 'payments')) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
    router.push(`/admin/app-downloads?tab=${value}`)
  }

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/app-downloads', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
        setPaymentsGroupedByEmail(data.paymentsGroupedByEmail || [])
        setOrders(data.orders || [])
      } else {
        toast.error('Failed to load app downloads data')
      }
    } catch (error) {
      console.error('Error fetching app downloads:', error)
      toast.error('Error loading data')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, fetchData])

  // Filter grouped payments for Payments tab
  const filteredGroupedPayments = useMemo(() => {
    const search = searchTerm.toLowerCase()
    return paymentsGroupedByEmail.filter(group =>
      group.email?.toLowerCase().includes(search) ||
      group.customerName?.toLowerCase().includes(search) ||
      group.payments.some(p =>
        p.order_id?.toLowerCase().includes(search) ||
        p.payment_id?.toLowerCase().includes(search)
      )
    )
  }, [paymentsGroupedByEmail, searchTerm])

  // Filter orders for Orders tab (only "created" status - pending orders)
  const filteredOrders = useMemo(() => {
    const search = searchTerm.toLowerCase()
    return orders.filter(order =>
      order.customer_email?.toLowerCase().includes(search) ||
      order.customer_name?.toLowerCase().includes(search) ||
      order.order_id?.toLowerCase().includes(search)
    )
  }, [orders, searchTerm])

  // Pagination for grouped payments
  const totalPaymentPages = Math.ceil(filteredGroupedPayments.length / itemsPerPage)
  const paginatedGroupedPayments = filteredGroupedPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Pagination for orders (pending orders only)
  const totalOrderPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'captured':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Captured</Badge>
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>
      case 'created':
        return <Badge className="bg-yellow-100 text-yellow-800"><Package className="w-3 h-3 mr-1" />Created</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDownloadBadge = (downloadCount: number) => {
    if (downloadCount > 0) {
      return <Badge className="bg-green-100 text-green-800"><Download className="w-3 h-3 mr-1" />Downloaded</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">Not Downloaded</Badge>
  }

  // Calculate stats
  const stats = {
    totalPayments: payments.length,
    downloaded: payments.filter(p => p.download_count > 0).length,
    pendingDownloads: payments.filter(p => p.download_count === 0).length,
    uniqueCustomers: paymentsGroupedByEmail.length,
    pendingOrders: orders.length
  }

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

  // Get current page payment IDs (from the flat payments array, not grouped)
  const currentPagePaymentIds = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage
    const endIdx = currentPage * itemsPerPage
    // Get payment IDs from paginatedGroupedPayments
    const currentPageGroups = filteredGroupedPayments.slice(startIdx, endIdx)
    const ids: string[] = []
    currentPageGroups.forEach(group => {
      group.payments.forEach(p => ids.push(p.id))
    })
    return ids
  }, [filteredGroupedPayments, currentPage, itemsPerPage])

  // Get current page order IDs
  const currentPageOrderIds = useMemo(() => {
    return paginatedOrders.map(o => o.id)
  }, [paginatedOrders])

  const allCurrentPagePaymentsSelected = currentPagePaymentIds.length > 0 &&
    currentPagePaymentIds.every(id => selectedPaymentIds.has(id))

  const allCurrentPageOrdersSelected = currentPageOrderIds.length > 0 &&
    currentPageOrderIds.every(id => selectedOrderIds.has(id))

  const handleSelectAllPayments = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedPaymentIds(new Set(currentPagePaymentIds))
    } else {
      setSelectedPaymentIds(new Set())
    }
  }

  const handleSelectAllOrders = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedOrderIds(new Set(currentPageOrderIds))
    } else {
      setSelectedOrderIds(new Set())
    }
  }

  const handleSelectOneOrder = (id: string, checked: boolean | 'indeterminate') => {
    const newSelected = new Set(selectedOrderIds)
    if (checked === true) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedOrderIds(newSelected)
  }

  const handleDeleteSelectedPayments = async () => {
    if (selectedPaymentIds.size === 0) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/app-downloads', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids: Array.from(selectedPaymentIds), type: 'payments' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete payments')
      }

      toast.success(`Successfully deleted ${selectedPaymentIds.size} payment(s)`)
      setSelectedPaymentIds(new Set())
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete payments')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteSelectedOrders = async () => {
    if (selectedOrderIds.size === 0) return

    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/app-downloads', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids: Array.from(selectedOrderIds), type: 'orders' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete orders')
      }

      toast.success(`Successfully deleted ${selectedOrderIds.size} order(s)`)
      setSelectedOrderIds(new Set())
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete orders')
    } finally {
      setIsDeleting(false)
    }
  }

  // Get currently selected IDs based on active tab
  const currentSelectedIds = activeTab === 'payments' ? selectedPaymentIds : selectedOrderIds
  const handleDeleteSelected = activeTab === 'payments' ? handleDeleteSelectedPayments : handleDeleteSelectedOrders
  const setCurrentSelectedIds = activeTab === 'payments' ? setSelectedPaymentIds : setSelectedOrderIds

  if (authLoading || loading) {
    return (
      <AdminPageWrapper title="Demo Downloads">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminPageWrapper>
    )
  }

  return (
    <AdminPageWrapper
      title="Demo Downloads"
      description="View and manage demo version purchases and downloads"
      stats={[
        { label: 'Total Payments', value: stats.totalPayments, color: 'bg-blue-100 text-blue-800' },
        { label: 'Downloaded', value: stats.downloaded, color: 'bg-green-100 text-green-800' },
        { label: 'Pending Downloads', value: stats.pendingDownloads, color: 'bg-yellow-100 text-yellow-800' },
        { label: 'Customers', value: stats.uniqueCustomers, color: 'bg-purple-100 text-purple-800' },
        { label: 'Pending Orders', value: stats.pendingOrders, color: 'bg-orange-100 text-orange-800' }
      ]}
      actions={
        <div className="flex gap-2 flex-wrap items-center">
          {currentSelectedIds.size > 0 ? (
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
                  Delete ({currentSelectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {activeTab === 'payments' ? 'Payments' : 'Orders'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {currentSelectedIds.size} {activeTab === 'payments' ? 'payment' : 'order'}(s)?
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
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      <Card className="shadow-sm border border-gray-100">
        <CardContent>
          {/* Search Filter */}
          <div className="flex gap-2 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by email, name, order ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 text-sm h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="bg-gray-100 p-1 rounded-lg mb-4">
              <TabsTrigger
                value="payments"
                className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 py-2 rounded-md transition-all"
              >
                <CreditCard className="h-4 w-4" />
                Payments ({paymentsGroupedByEmail.length} customers)
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 py-2 rounded-md transition-all"
              >
                <Package className="h-4 w-4" />
                Pending Orders ({orders.length})
              </TabsTrigger>
            </TabsList>

            {/* Payments Tab - Grouped by email */}
            <TabsContent value="payments">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={allCurrentPagePaymentsSelected}
                          onCheckedChange={handleSelectAllPayments}
                          aria-label="Select all"
                          className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                        />
                      </TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold text-center">Purchases</TableHead>
                      <TableHead className="font-semibold">Total Amount</TableHead>
                      <TableHead className="font-semibold">Downloaded</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedGroupedPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          No payments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedGroupedPayments.map((group) => {
                        // Check if all payments in this group are selected
                        const allGroupPaymentsSelected = group.payments.every(p => selectedPaymentIds.has(p.id))
                        const someGroupPaymentsSelected = group.payments.some(p => selectedPaymentIds.has(p.id))

                        return (
                          <TableRow key={group.email} className={someGroupPaymentsSelected ? 'bg-blue-50/30' : ''}>
                            <TableCell>
                              <Checkbox
                                checked={allGroupPaymentsSelected}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(selectedPaymentIds)
                                  if (checked === true) {
                                    group.payments.forEach(p => newSelected.add(p.id))
                                  } else {
                                    group.payments.forEach(p => newSelected.delete(p.id))
                                  }
                                  setSelectedPaymentIds(newSelected)
                                }}
                                aria-label={`Select all payments for ${group.customerName}`}
                                className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{group.customerName}</p>
                                <p className="text-sm text-gray-500">{group.email}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-bold text-blue-600 text-lg">{group.totalPurchases}</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold text-green-600">₹{group.totalAmount?.toLocaleString('en-IN')}</span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                {group.payments.filter(p => p.download_count > 0).length > 0 ? (
                                  <Badge className="bg-green-100 text-green-800 w-fit">
                                    <Download className="w-3 h-3 mr-1" />
                                    {group.payments.filter(p => p.download_count > 0).length} Downloaded
                                  </Badge>
                                ) : null}
                                {group.payments.filter(p => p.download_count === 0).length > 0 && (
                                  <Badge className="bg-gray-100 text-gray-600 w-fit">
                                    {group.payments.filter(p => p.download_count === 0).length} Pending
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => setSelectedGroupedPayment(group)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View All
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination for payments */}
              {totalPaymentPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPaymentPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalPaymentPages, p + 1))}
                          className={currentPage === totalPaymentPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>

            {/* Orders Tab - Pending orders only (created status) */}
            <TabsContent value="orders">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={allCurrentPageOrdersSelected}
                          onCheckedChange={handleSelectAllOrders}
                          aria-label="Select all"
                          className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                        />
                      </TableHead>
                      <TableHead className="font-semibold">Customer</TableHead>
                      <TableHead className="font-semibold">Order ID</TableHead>
                      <TableHead className="font-semibold">Product</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No pending orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedOrders.map((order) => (
                        <TableRow key={order.id} className={selectedOrderIds.has(order.id) ? 'bg-blue-50/30' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={selectedOrderIds.has(order.id)}
                              onCheckedChange={(checked) => handleSelectOneOrder(order.id, checked)}
                              aria-label={`Select ${order.customer_name}`}
                              className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{order.customer_name}</p>
                              <p className="text-sm text-gray-500">{order.customer_email}</p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{order.order_id}</TableCell>
                          <TableCell className="text-sm">{order.product_name}</TableCell>
                          <TableCell>
                            <span className="font-medium">₹{order.amount.toLocaleString('en-IN')}</span>
                          </TableCell>
                          <TableCell>{getStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-sm">{formatDate(order.created_at)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination for orders */}
              {totalOrderPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalOrderPages, p + 1))}
                          className={currentPage === totalOrderPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Details Dialog - for Payments tab */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              {/* Customer Summary Header */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-blue-800">Customer Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedPayment.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium break-all text-xs">{selectedPayment.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedPayment.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <p className="font-bold text-blue-600">₹{selectedPayment.amount?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-gray-800">Order Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <p className="font-mono text-xs">{selectedPayment.order_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment ID:</span>
                    <p className="font-mono text-xs">{selectedPayment.payment_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Product:</span>
                    <p className="font-medium">{selectedPayment.product_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Payment Date:</span>
                    <p className="font-medium">{formatDate(selectedPayment.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-green-800">Status Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Payment Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Download Status:</span>
                    <div className="mt-1">{getDownloadBadge(selectedPayment.download_count)}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Downloaded At:</span>
                    <p className="font-medium">
                      {selectedPayment.last_download_at
                        ? formatDate(selectedPayment.last_download_at)
                        : 'Not downloaded yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Grouped Payment Details Dialog - for Payments tab */}
      <Dialog open={!!selectedGroupedPayment} onOpenChange={() => setSelectedGroupedPayment(null)}>
        <DialogContent className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Customer Payment History</DialogTitle>
          </DialogHeader>
          {selectedGroupedPayment && (
            <div className="space-y-4">
              {/* Customer Summary Header */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-blue-800">Customer Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedGroupedPayment.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium break-all text-xs">{selectedGroupedPayment.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedGroupedPayment.customerPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Amount:</span>
                    <p className="font-bold text-blue-600">₹{selectedGroupedPayment.totalAmount.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="flex justify-center gap-4">
                <div className="bg-green-50 rounded-lg p-4 text-center min-w-[120px]">
                  <p className="text-3xl font-bold text-green-600">{selectedGroupedPayment.totalPurchases}</p>
                  <p className="text-sm text-gray-600">Total Purchases</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center min-w-[120px]">
                  <p className="text-3xl font-bold text-blue-600">{selectedGroupedPayment.payments.filter(p => p.download_count > 0).length}</p>
                  <p className="text-sm text-gray-600">Downloaded</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center min-w-[120px]">
                  <p className="text-3xl font-bold text-yellow-600">{selectedGroupedPayment.payments.filter(p => p.download_count === 0).length}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>

              {/* All Payments List */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-gray-800">
                  <CreditCard className="w-4 h-4 inline mr-2" />
                  All Payments ({selectedGroupedPayment.payments.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedGroupedPayment.payments.map((payment) => (
                    <div key={payment.id} className="bg-white rounded p-3 text-sm border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-xs text-gray-500">{payment.order_id}</p>
                          <p className="font-medium">₹{payment.amount?.toLocaleString('en-IN')}</p>
                          <p className="text-xs text-gray-500">{payment.product_name}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex flex-col gap-1">
                            {getStatusBadge(payment.status)}
                            {getDownloadBadge(payment.download_count)}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(payment.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog - for Orders tab */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Pending Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Summary Header */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-blue-800">Customer Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium break-all text-xs">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <p className="font-medium">{selectedOrder.customer_phone || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <p className="font-bold text-blue-600">₹{selectedOrder.amount?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 text-gray-800">Order Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <p className="font-mono text-xs">{selectedOrder.order_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Product:</span>
                    <p className="font-medium">{selectedOrder.product_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-yellow-800">
                  <Package className="w-4 h-4 inline mr-2" />
                  Order Status
                </h4>
                <p className="text-sm text-gray-600">
                  This order was created but payment was not completed. The customer may have abandoned checkout.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fixed Bottom Action Bar - Shows when items selected AND header is not visible */}
      {currentSelectedIds.size > 0 && !isHeaderVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4 z-[9999] lg:left-64">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {currentSelectedIds.size} item{currentSelectedIds.size > 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentSelectedIds(new Set())}
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
                  Delete ({currentSelectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {activeTab === 'payments' ? 'Payments' : 'Orders'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {currentSelectedIds.size} {activeTab === 'payments' ? 'payment' : 'order'}(s)?
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

export default function AdminAppDownloadsPage() {
  return (
    <Suspense fallback={
      <AdminPageWrapper title="Demo Downloads">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminPageWrapper>
    }>
      <AdminAppDownloadsContent />
    </Suspense>
  )
}
