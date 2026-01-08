'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Search, Eye, RefreshCw, Phone, Mail, Building2, Users, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react'
import { AdminPagination } from '@/components/admin/admin-pagination'
import { format } from 'date-fns'
import { formatPhone } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EnterpriseInquiry {
  id: string
  name: string
  email: string
  phone: string
  firm_name: string
  user_count: number
  message?: string
  status: 'pending' | 'contacted' | 'converted' | 'rejected'
  created_at: string
  updated_at?: string
}

export default function AdminEnterpriseInquiriesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth()
  const [inquiries, setInquiries] = useState<EnterpriseInquiry[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<EnterpriseInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState<EnterpriseInquiry | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const ITEMS_PER_PAGE = 10

  const fetchInquiries = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/enterprise-inquiries', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        const data = await response.json()
        setInquiries(data.inquiries || [])
        setFilteredInquiries(data.inquiries || [])
      } else {
        toast.error('Failed to fetch enterprise inquiries')
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast.error('Error loading enterprise inquiries')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      fetchInquiries()
    }
  }, [isAuthenticated, fetchInquiries])

  // Filter inquiries based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = inquiries.filter(inquiry =>
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.firm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.phone.includes(searchTerm)
      )
      setFilteredInquiries(filtered)
      setCurrentPage(1)
    } else {
      setFilteredInquiries(inquiries)
    }
  }, [searchTerm, inquiries])

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatus(id)
    try {
      const response = await fetch('/api/admin/enterprise-inquiries', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus })
      })

      if (response.ok) {
        toast.success('Status updated successfully')
        fetchInquiries()
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error updating status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
      case 'contacted':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300"><Phone className="w-3 h-3 mr-1" /> Contacted</Badge>
      case 'converted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" /> Converted</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedInquiries = filteredInquiries.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Stats
  const stats = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    converted: inquiries.filter(i => i.status === 'converted').length,
    rejected: inquiries.filter(i => i.status === 'rejected').length,
    totalUsers: inquiries.reduce((sum, i) => sum + (i.user_count || 0), 0)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageWrapper title="Enterprise Inquiries">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-purple-700">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-blue-700">{stats.contacted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Converted</p>
                <p className="text-2xl font-bold text-green-700">{stats.converted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-indigo-700">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, firm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={fetchInquiries}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : paginatedInquiries.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No enterprise inquiries yet</p>
              <p className="text-sm">Inquiries from the pricing page will appear here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Firm</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-center">Users</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInquiries.map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell className="font-medium">{inquiry.name}</TableCell>
                    <TableCell>{inquiry.firm_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <a href={`mailto:${inquiry.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {inquiry.email}
                        </a>
                        <a href={`tel:${inquiry.phone}`} className="text-sm text-gray-600 hover:underline flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {formatPhone(inquiry.phone)}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {inquiry.user_count}+
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={inquiry.status}
                        onValueChange={(value) => updateStatus(inquiry.id, value)}
                        disabled={updatingStatus === inquiry.id}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue>
                            {updatingStatus === inquiry.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              getStatusBadge(inquiry.status)
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(inquiry.created_at), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Inquiry Details</DialogTitle>
                            <DialogDescription>
                              Enterprise inquiry from {selectedInquiry?.firm_name}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedInquiry && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Name</p>
                                  <p className="font-medium">{selectedInquiry.name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Firm Name</p>
                                  <p className="font-medium">{selectedInquiry.firm_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Email</p>
                                  <a href={`mailto:${selectedInquiry.email}`} className="font-medium text-blue-600 hover:underline">
                                    {selectedInquiry.email}
                                  </a>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Phone</p>
                                  <a href={`tel:${selectedInquiry.phone}`} className="font-medium text-blue-600 hover:underline">
                                    {formatPhone(selectedInquiry.phone)}
                                  </a>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Expected Users</p>
                                  <p className="font-medium text-purple-700">{selectedInquiry.user_count}+</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Status</p>
                                  {getStatusBadge(selectedInquiry.status)}
                                </div>
                              </div>
                              {selectedInquiry.message && (
                                <div>
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3" /> Message
                                  </p>
                                  <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                                    {selectedInquiry.message}
                                  </p>
                                </div>
                              )}
                              <div className="pt-4 border-t">
                                <p className="text-xs text-gray-400">
                                  Submitted on {format(new Date(selectedInquiry.created_at), 'dd MMM yyyy, hh:mm a')}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button asChild className="flex-1">
                                  <a href={`mailto:${selectedInquiry.email}`}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                  </a>
                                </Button>
                                <Button variant="outline" asChild className="flex-1">
                                  <a href={`tel:${selectedInquiry.phone}`}>
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call
                                  </a>
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredInquiries.length > ITEMS_PER_PAGE && (
        <div className="mt-6">
          <AdminPagination
            currentPage={currentPage}
            totalItems={filteredInquiries.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
            itemName="inquiries"
          />
        </div>
      )}
    </AdminPageWrapper>
  )
}
