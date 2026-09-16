'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Download, Mail, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { AdminPagination } from '@/components/admin/admin-pagination'
import {
  DataTablePanel,
  DataTableToolbar,
  ToolbarButton,
  adminButtonClass,
  dataTableCheckboxClass,
  dataTableClass,
} from '@/components/admin/data-table'
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
  const [itemsPerPage, setItemsPerPage] = useState(10)
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
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const allCurrentPageSelected = currentPageItems.length > 0 &&
    currentPageItems.every(item => selectedIds.has(item.id))

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
    >
      <DataTablePanel>
        <DataTableToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by email..."
          className="mb-5"
          actions={
            <>
              {selectedIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <ToolbarButton variant="danger" disabled={isDeleting}>
                      {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                      Delete ({selectedIds.size})
                    </ToolbarButton>
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
              )}
              <ToolbarButton onClick={fetchSubscribers} disabled={loading}>
                <RefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh
              </ToolbarButton>
              <ToolbarButton onClick={exportToCSV} disabled={loading || subscribers.length === 0}>
                <Download />
                Export CSV
              </ToolbarButton>
            </>
          }
        />

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
              <Table className={dataTableClass}>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={allCurrentPageSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                        className={dataTableCheckboxClass}
                      />
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscribed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(subscriber.id)}
                          onCheckedChange={(checked) => handleSelectOne(subscriber.id, checked)}
                          aria-label={`Select ${subscriber.email}`}
                          className={dataTableCheckboxClass}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>{subscriber.source || 'website'}</TableCell>
                      <TableCell>{subscriber.is_active ? 'Active' : 'Unsubscribed'}</TableCell>
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
                  className={dataTableCheckboxClass}
                />
                <span className="text-sm text-gray-600">Select all on this page</span>
              </div>
              {filteredSubscribers
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
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
                            className={dataTableCheckboxClass}
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
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1) }}
              itemName="subscribers"
            />
          </>
        )}
      </DataTablePanel>

      {/* Fixed Bottom Action Bar - Shows when items selected AND header is not visible */}
      {selectedIds.size > 0 && !isHeaderVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4 z-[9999] lg:left-64">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
              </span>
              <ToolbarButton onClick={() => setSelectedIds(new Set())} className="h-9 px-4">
                Clear
              </ToolbarButton>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <ToolbarButton variant="danger" disabled={isDeleting} className="h-9 px-4">
                  {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  Delete ({selectedIds.size})
                </ToolbarButton>
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
          </div>
        </div>
      )}
    </AdminPageWrapper>
  )
}
