'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, RefreshCw, Download, Mail, UserCheck, TrendingUp, Search } from 'lucide-react'
import { format } from 'date-fns'

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
  const [statusFilter, setStatusFilter] = useState('all')

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
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Request was aborted')
      } else {
        console.error('Error fetching subscribers:', err)
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
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && sub.is_active) ||
      (statusFilter === 'inactive' && !sub.is_active)
    return matchesSearch && matchesStatus
  })

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
      actions={
        <div className="flex gap-2">
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
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Subscriptions</p>
                <p className="text-3xl font-bold text-orange-600">{stats.today}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscriber List</CardTitle>
              <CardDescription>
                View and manage newsletter subscribers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Unsubscribed</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="text-center py-8 text-gray-500">
              No subscribers match your search criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>EMAIL</TableHead>
                    <TableHead>SOURCE</TableHead>
                    <TableHead>STATUS</TableHead>
                    <TableHead>SUBSCRIBED DATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
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
                          ? format(new Date(subscriber.subscribed_at), 'dd MMM yyyy HH:mm')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {subscribers.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredSubscribers.length} of {subscribers.length} total subscribers
            </div>
          )}
        </CardContent>
      </Card>
    </AdminPageWrapper>
  )
}
