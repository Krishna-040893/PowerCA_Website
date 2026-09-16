'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Eye, RefreshCw, Phone, Mail, Building2, Users, MessageSquare, CheckCircle, Clock, XCircle } from 'lucide-react'
import { AdminPagination } from '@/components/admin/admin-pagination'
import {
  DataTablePanel,
  DataTableToolbar,
  RowActions,
  RowIconButton,
  RowMenu,
  ToolbarButton,
  adminButtonClass,
  dataTableClass,
} from '@/components/admin/data-table'
import { format } from 'date-fns'
import { formatPhone } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', icon: <Clock /> },
  { value: 'contacted', label: 'Contacted', icon: <Phone /> },
  { value: 'converted', label: 'Converted', icon: <CheckCircle /> },
  { value: 'rejected', label: 'Rejected', icon: <XCircle /> },
]

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
  const [itemsPerPage, setItemsPerPage] = useState(10)

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
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInquiries = filteredInquiries.slice(startIndex, startIndex + itemsPerPage)

  // Stats
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
    >
      <DataTablePanel>
        <DataTableToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by name, email, firm..."
          className="mb-5"
          actions={
            <ToolbarButton onClick={fetchInquiries} disabled={loading}>
              <RefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </ToolbarButton>
          }
        />

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
              <Table className={dataTableClass}>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Firm</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-center">Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell>{inquiry.firm_name}</TableCell>
                      <TableCell>
                        <div>{inquiry.email}</div>
                        <div className="text-gray-500">{formatPhone(inquiry.phone)}</div>
                      </TableCell>
                      <TableCell className="text-center">{inquiry.user_count}+</TableCell>
                      <TableCell>
                        {updatingStatus === inquiry.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          STATUS_OPTIONS.find((option) => option.value === inquiry.status)?.label ?? inquiry.status
                        )}
                      </TableCell>
                      <TableCell>
                        <div>{format(new Date(inquiry.created_at), 'dd/MM/yyyy')}</div>
                        <div className="text-gray-500">{new Date(inquiry.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                      </TableCell>
                      <TableCell>
                        <RowActions>
                          <Dialog>
                            <DialogTrigger asChild>
                              <RowIconButton label="View" onClick={() => setSelectedInquiry(inquiry)}>
                                <Eye />
                              </RowIconButton>
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
                                    <a href={`mailto:${selectedInquiry.email}`} className={adminButtonClass('primary', 'flex-1')}>
                                      <Mail />
                                      Send Email
                                    </a>
                                    <a href={`tel:${selectedInquiry.phone}`} className={adminButtonClass('outline', 'flex-1')}>
                                      <Phone />
                                      Call
                                    </a>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <RowMenu
                            label="Change status"
                            items={STATUS_OPTIONS.filter((option) => option.value !== inquiry.status).map((option) => ({
                              label: `Mark as ${option.label}`,
                              icon: option.icon,
                              onSelect: () => updateStatus(inquiry.id, option.value),
                              disabled: updatingStatus === inquiry.id,
                            }))}
                          />
                        </RowActions>
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
                          <ToolbarButton
                            onClick={() => setSelectedInquiry(inquiry)}
                            className="w-full"
                          >
                            <Eye />
                            View
                          </ToolbarButton>
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
                                <a href={`mailto:${selectedInquiry.email}`} className={adminButtonClass('primary', 'flex-1')}>
                                  <Mail />
                                  Send Email
                                </a>
                                <a href={`tel:${selectedInquiry.phone}`} className={adminButtonClass('outline', 'flex-1')}>
                                  <Phone />
                                  Call
                                </a>
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
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1) }}
              itemName="inquiries"
            />
          </>
        )}
      </DataTablePanel>
    </AdminPageWrapper>
  )
}
