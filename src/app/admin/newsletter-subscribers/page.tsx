'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, RefreshCw, Download, Mail, Search, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { AdminPagination } from '@/components/admin/admin-pagination'
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

interface NewsletterSubscriber {
  id: string
  email: string
  source: string
  is_active: boolean
  subscribed_at: string
  unsubscribed_at: string | null
  created_at: string
}

export default function NewsletterSubscribersPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser } = useAdminAuth()
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  const fetchSubscribers = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch('/api/admin/newsletter-subscribers', {
        credentials: 'include',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Failed to fetch subscribers: ${response.statusText}`)
      }

      const data = await response.json()
      setSubscribers(data.subscribers || [])
    } catch (err) {
      clearTimeout(timeoutId)
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    } finally {
      setLoading(false)
    }

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscribers()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

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

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const currentPageIds = currentPageItems.map(r => r.id)
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
      const response = await fetch('/api/admin/newsletter-subscribers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete subscribers')
      }

      toast.success(`Successfully deleted ${selectedIds.size} subscriber(s)`)
      setSelectedIds(new Set())
      fetchSubscribers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete subscribers')
    } finally {
      setIsDeleting(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['Email', 'Source', 'Status', 'Subscribed At']
    const csvContent = [
      headers.join(','),
      ...filteredSubscribers.map(sub => {
        return [
          sub.email,
          sub.source || 'website',
          sub.is_active ? 'Active' : 'Unsubscribed',
          format(new Date(sub.subscribed_at), 'yyyy-MM-dd HH:mm:ss')
        ].map(field => `"${field}"`).join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `newsletter_subscribers_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const currentPageItems = filteredSubscribers
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const allCurrentPageSelected = currentPageItems.length > 0 &&
    currentPageItems.every(item => selectedIds.has(item.id))

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.is_active).length,
    inactive: subscribers.filter(s => !s.is_active).length,
    today: subscribers.filter(s => {
      const today = new Date().toISOString().split('T')[0]
      return s.subscribed_at?.startsWith(today)
    }).length
  }

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
      title="Newsletter Subscribers"
      description="Manage newsletter subscriptions"
      stats={[
        { label: 'Total', value: stats.total, color: 'bg-blue-100 text-blue-800' },
        { label: 'Active', value: stats.active, color: 'bg-green-100 text-green-800' },
        { label: 'Today', value: stats.today, color: 'bg-orange-100 text-orange-800' }
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
                  <AlertDialogTitle>Delete Subscribers</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedIds.size} subscriber(s)?
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
            variant="outline"
            size="sm"
            onClick={fetchSubscribers}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={loading || subscribers.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      }
    >
      {/* Main Content Card - Enhanced */}
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="pt-6">
          {/* Search Control - Enhanced Mobile */}
          <div className="mb-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
              <p className="mt-2 text-gray-600">Loading subscribers...</p>
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No subscribers found
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="text-center py-16">
              <Mail className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Subscribers Found</h3>
              <p className="text-gray-500">No subscribers match your search criteria</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <Checkbox
                          checked={allCurrentPageSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                          className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                        />
                      </TableHead>
                      <TableHead className="text-base font-bold">Email</TableHead>
                      <TableHead className="text-base font-bold">Source</TableHead>
                      <TableHead className="text-base font-bold">Status</TableHead>
                      <TableHead className="text-base font-bold">Subscribed Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers
                      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                      .map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(subscriber.id)}
                            onCheckedChange={(checked) => handleSelectOne(subscriber.id, checked)}
                            aria-label={`Select ${subscriber.email}`}
                            className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{subscriber.source || 'website'}</Badge>
                        </TableCell>
                        <TableCell>
                          {subscriber.is_active ? (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Unsubscribed</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {subscriber.subscribed_at
                            ? format(new Date(subscriber.subscribed_at), 'dd/MM/yyyy HH:mm')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View - Professional Design */}
              <div className="md:hidden space-y-3">
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
                {filteredSubscribers
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((subscriber) => (
                  <Card key={subscriber.id} className={`border shadow-sm hover:shadow-md transition-shadow ${selectedIds.has(subscriber.id) ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Checkbox and Email */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Checkbox
                              checked={selectedIds.has(subscriber.id)}
                              onCheckedChange={(checked) => handleSelectOne(subscriber.id, checked)}
                              aria-label={`Select ${subscriber.email}`}
                              className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                            />
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Mail className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm text-gray-900 truncate">{subscriber.email}</p>
                                <p className="text-xs text-gray-500">
                                  {subscriber.subscribed_at
                                    ? format(new Date(subscriber.subscribed_at), 'dd/MM/yyyy')
                                    : '-'}
                                </p>
                              </div>
                            </div>
                          </div>
                          {subscriber.is_active ? (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs flex-shrink-0">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">Unsubscribed</Badge>
                          )}
                        </div>

                        {/* Source */}
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Source</span>
                            <Badge variant="outline" className="text-xs">{subscriber.source || 'website'}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <AdminPagination
                currentPage={currentPage}
                totalItems={filteredSubscribers.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemName="subscribers"
              />
            </>
          )}
        </CardContent>
      </Card>

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
                  <AlertDialogTitle>Delete Subscribers</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedIds.size} subscriber(s)?
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
