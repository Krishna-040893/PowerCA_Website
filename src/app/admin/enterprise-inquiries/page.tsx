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
  const { isAuthenticated, isLoading: authLoading, adminUser } = useAdminAuth()
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
      title="Enterprise Inquiries"
      description="Manage enterprise/large practitioner inquiries"
      stats={[
        { label: 'Total', value: stats.total, color: 'bg-purple-100 text-purple-800' },
        { label: 'Pending', value: stats.pending, color: 'bg-yellow-100 text-yellow-800' },
        { label: 'Contacted', value: stats.contacted, color: 'bg-blue-100 text-blue-800' },
        { label: 'Converted', value: stats.converted, color: 'bg-green-100 text-green-800' },
        { label: 'Rejected', value: stats.rejected, color: 'bg-red-100 text-red-800' },
        { label: 'Total Users', value: stats.totalUsers, color: 'bg-indigo-100 text-indigo-800' },
      ]}
      actions={
        <div className="flex gap-2 flex-wrap items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInquiries}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      {/* Main Content Card */}
      <Card className="shadow-sm border border-gray-100">
        <CardContent>
          {/* Search Filter */}
          <div className="flex gap-2 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, firm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={fetchInquiries}
              variant="outline"
              size="sm"
              className="px-3 border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Table / Cards */}
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
              <p className="mt-2 text-gray-600">Loading inquiries...</p>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Enterprise Inquiries Found</h3>
              <p className="text-gray-500">Inquiries from the pricing page will appear here</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base font-bold">Name</TableHead>
                      <TableHead className="text-base font-bold">Firm</TableHead>
                      <TableHead className="text-base font-bold">Contact</TableHead>
                      <TableHead className="text-base font-bold text-center">Users</TableHead>
                      <TableHead className="text-base font-bold">Status</TableHead>
                      <TableHead className="text-base font-bold">Date</TableHead>
                      <TableHead className="text-base font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInquiries.map((inquiry) => (
                      <TableRow key={inquiry.id}>
                        <TableCell className="font-medium">{inquiry.name}</TableCell>
                        <TableCell>{inquiry.firm_name}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {inquiry.email}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {formatPhone(inquiry.phone)}
                            </div>
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
                            <SelectTrigger className="w-[130px] border-0 shadow-none">
                              <SelectValue>
                                {updatingStatus === inquiry.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  getStatusBadge(inquiry.status)
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{format(new Date(inquiry.created_at), 'dd/MM/yyyy')}</p>
                            <p className="text-xs text-gray-500">{new Date(inquiry.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedInquiry(inquiry)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white max-w-md">
                              <DialogHeader className="border-b pb-3">
                                <DialogTitle className="text-lg font-bold">Inquiry Details</DialogTitle>
                                <DialogDescription className="text-xs text-gray-500">
                                  Enterprise inquiry from {selectedInquiry?.firm_name}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedInquiry && (
                                <div className="space-y-4 pt-2">
                                  {/* Contact Info Section */}
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <h4 className="font-semibold text-sm text-blue-900 mb-2.5 flex items-center gap-2">
                                      <Users className="h-4 w-4" />
                                      Contact Information
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-xs font-medium text-gray-600">Name</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedInquiry.name}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-600">Firm Name</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedInquiry.firm_name}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-600">Email</label>
                                        <p className="text-sm font-medium text-gray-900 break-all">{selectedInquiry.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-600">Phone</label>
                                        <p className="text-sm font-medium text-gray-900">{formatPhone(selectedInquiry.phone)}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Enterprise Details Section */}
                                  <div className="bg-purple-50 rounded-lg p-3">
                                    <h4 className="font-semibold text-sm text-purple-900 mb-2.5 flex items-center gap-2">
                                      <Building2 className="h-4 w-4" />
                                      Enterprise Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <label className="text-xs font-medium text-gray-600">Expected Users</label>
                                        <p className="text-sm font-medium text-purple-700">{selectedInquiry.user_count}+</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-600">Status</label>
                                        <div className="mt-0.5">{getStatusBadge(selectedInquiry.status)}</div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Message Section */}
                                  {selectedInquiry.message && (
                                    <div className="bg-green-50 rounded-lg p-3">
                                      <h4 className="font-semibold text-sm text-green-900 mb-2.5 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4" />
                                        Message
                                      </h4>
                                      <p className="text-sm text-gray-700 leading-relaxed break-words">
                                        {selectedInquiry.message}
                                      </p>
                                    </div>
                                  )}

                                  {/* Submission Date */}
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="text-xs font-medium text-gray-600">Submitted On</label>
                                    <p className="text-sm font-medium text-gray-900">
                                      {format(new Date(selectedInquiry.created_at), 'dd MMM yyyy, hh:mm a')}
                                    </p>
                                  </div>

                                  {/* Action Buttons */}
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
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {paginatedInquiries.map((inquiry) => (
                  <Card key={inquiry.id} className="border shadow-sm hover:shadow-md transition-shadow border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Name and Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-4 w-4 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-gray-900 truncate">{inquiry.name}</p>
                              <p className="text-xs text-gray-500 truncate">{inquiry.firm_name}</p>
                            </div>
                          </div>
                          {getStatusBadge(inquiry.status)}
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-1.5 bg-gray-50 rounded-lg p-2.5">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700 truncate">{inquiry.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{formatPhone(inquiry.phone)}</span>
                          </div>
                        </div>

                        {/* Users and Date */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {inquiry.user_count}+ users
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(new Date(inquiry.created_at), 'dd MMM yyyy')}
                          </span>
                        </div>

                        {/* Action Button */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedInquiry(inquiry)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white max-w-[90vw] sm:max-w-md rounded-xl">
                            <DialogHeader className="border-b pb-3">
                              <DialogTitle className="text-lg font-bold">Inquiry Details</DialogTitle>
                              <DialogDescription className="text-xs text-gray-500">
                                Enterprise inquiry from {selectedInquiry?.firm_name}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedInquiry && (
                              <div className="space-y-4 pt-2">
                                {/* Contact Info Section */}
                                <div className="bg-blue-50 rounded-lg p-3">
                                  <h4 className="font-semibold text-sm text-blue-900 mb-2.5 flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    Contact Information
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Name</label>
                                      <p className="text-sm font-medium text-gray-900">{selectedInquiry.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Firm Name</label>
                                      <p className="text-sm font-medium text-gray-900">{selectedInquiry.firm_name}</p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Email</label>
                                      <p className="text-sm font-medium text-gray-900 break-all">{selectedInquiry.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Phone</label>
                                      <p className="text-sm font-medium text-gray-900">{formatPhone(selectedInquiry.phone)}</p>
                                    </div>
                                  </div>
                                </div>

                                {/* Enterprise Details Section */}
                                <div className="bg-purple-50 rounded-lg p-3">
                                  <h4 className="font-semibold text-sm text-purple-900 mb-2.5 flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    Enterprise Details
                                  </h4>
                                  <div className="space-y-2">
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Expected Users</label>
                                      <p className="text-sm font-medium text-purple-700">{selectedInquiry.user_count}+</p>
                                    </div>
                                    <div>
                                      <label className="text-xs font-medium text-gray-600">Status</label>
                                      <div className="mt-0.5">{getStatusBadge(selectedInquiry.status)}</div>
                                    </div>
                                  </div>
                                </div>

                                {/* Message Section */}
                                {selectedInquiry.message && (
                                  <div className="bg-green-50 rounded-lg p-3">
                                    <h4 className="font-semibold text-sm text-green-900 mb-2.5 flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4" />
                                      Message
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                                      {selectedInquiry.message}
                                    </p>
                                  </div>
                                )}

                                {/* Submission Date */}
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <label className="text-xs font-medium text-gray-600">Submitted On</label>
                                  <p className="text-sm font-medium text-gray-900">
                                    {format(new Date(selectedInquiry.created_at), 'dd MMM yyyy, hh:mm a')}
                                  </p>
                                </div>

                                {/* Action Buttons */}
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <AdminPagination
                currentPage={currentPage}
                totalItems={filteredInquiries.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemName="inquiries"
              />
            </>
          )}
        </CardContent>
      </Card>
    </AdminPageWrapper>
  )
}
