'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, RefreshCw, Download, Search, FileText, User, Mail, Phone, FileCheck, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { AdminPagination } from '@/components/admin/admin-pagination'

interface Agreement {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: 'draft' | 'signed'
  downloadedAt: string | null
  uploadedAt: string | null
  filePath: string | null
  createdAt: string
}

export default function AffiliateAgreementsPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser, getAuthHeaders } = useAdminAuth()
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    signed: 0
  })

  const fetchAgreements = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const authHeaders = getAuthHeaders()

      const response = await fetch('/api/admin/affiliate-agreements', {
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch agreements: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        setAgreements(data.agreements)
        setStats(data.stats)
      } else {
        throw new Error(data.error || 'Failed to fetch agreements')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, getAuthHeaders])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAgreements()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Signed</Badge>
      case 'draft':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Draft</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <FileCheck className="h-4 w-4 text-green-600" />
      case 'draft':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const handleDownloadDocument = async (filePath: string) => {
    if (!filePath) return

    try {
      // Download file from local folder
      const response = await fetch(`/api/admin/affiliate-agreements/download?path=${encodeURIComponent(filePath)}`, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filePath.split('/').pop() || 'agreement.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Downloaded At', 'Uploaded At']
    const csvContent = [
      headers.join(','),
      ...agreements.map(agreement => {
        return [
          agreement.name,
          agreement.email,
          agreement.phone || '',
          agreement.status,
          agreement.downloadedAt ? format(new Date(agreement.downloadedAt), 'yyyy-MM-dd HH:mm:ss') : '',
          agreement.uploadedAt ? format(new Date(agreement.uploadedAt), 'yyyy-MM-dd HH:mm:ss') : ''
        ].map(field => `"${field}"`).join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `affiliate_agreements_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredAgreements = agreements.filter(agreement => {
    const matchesSearch = agreement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agreement.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agreement.phone?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || agreement.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
      title="Affiliate Agreements"
      description="Manage affiliate partner agreement documents"
      stats={[
        { label: 'Total', value: stats.total, color: 'bg-blue-100 text-blue-800' },
        { label: 'Draft', value: stats.draft, color: 'bg-yellow-100 text-yellow-800' },
        { label: 'Signed', value: stats.signed, color: 'bg-green-100 text-green-800' }
      ]}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAgreements}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={loading || agreements.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      }
    >
      <Card className="shadow-sm border border-gray-100">
        <CardContent className="pt-0">
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 border-gray-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="signed">Signed</SelectItem>
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
              <p className="mt-2 text-gray-600">Loading agreements...</p>
            </div>
          ) : agreements.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Agreements Found</h3>
              <p className="text-gray-500">No affiliate agreements have been downloaded yet</p>
            </div>
          ) : filteredAgreements.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Agreements Found</h3>
              <p className="text-gray-500">No agreements match your search criteria</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base font-bold">Affiliate</TableHead>
                      <TableHead className="text-base font-bold">Contact</TableHead>
                      <TableHead className="text-base font-bold">Status</TableHead>
                      <TableHead className="text-base font-bold">Downloaded</TableHead>
                      <TableHead className="text-base font-bold">Uploaded</TableHead>
                      <TableHead className="text-base font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgreements
                      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                      .map((agreement) => (
                      <TableRow key={agreement.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{agreement.name || '-'}</p>
                              <p className="text-xs text-gray-500">Affiliate</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Mail className="h-3 w-3" />
                              {agreement.email || '-'}
                            </div>
                            {agreement.phone && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Phone className="h-3 w-3" />
                                {agreement.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(agreement.status)}
                            {getStatusBadge(agreement.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {agreement.downloadedAt ? (
                            <span className="text-sm text-gray-600">
                              {format(new Date(agreement.downloadedAt), 'dd MMM yyyy')}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {agreement.uploadedAt ? (
                            <span className="text-sm text-gray-600">
                              {format(new Date(agreement.uploadedAt), 'dd MMM yyyy')}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {agreement.filePath ? (
                            <Button
                              size="sm"
                              onClick={() => handleDownloadDocument(agreement.filePath!)}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredAgreements
                  .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                  .map((agreement) => (
                  <Card key={agreement.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Name and Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{agreement.name || '-'}</p>
                              <p className="text-xs text-gray-500">Affiliate</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(agreement.status)}
                            {getStatusBadge(agreement.status)}
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-1 bg-gray-50 rounded-lg p-2.5">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-xs text-gray-700 truncate">{agreement.email || '-'}</span>
                          </div>
                          {agreement.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs text-gray-700">{agreement.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Downloaded:</span>
                            <p className="text-gray-700">
                              {agreement.downloadedAt ? format(new Date(agreement.downloadedAt), 'dd MMM yyyy') : '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-500">Uploaded:</span>
                            <p className="text-gray-700">
                              {agreement.uploadedAt ? format(new Date(agreement.uploadedAt), 'dd MMM yyyy') : '-'}
                            </p>
                          </div>
                        </div>

                        {/* Action Button */}
                        {agreement.filePath && (
                          <Button
                            size="sm"
                            onClick={() => handleDownloadDocument(agreement.filePath!)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download Document
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination - only show when more than 10 entries */}
              {filteredAgreements.length > ITEMS_PER_PAGE && (
                <AdminPagination
                  currentPage={currentPage}
                  totalItems={filteredAgreements.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                  itemName="agreements"
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </AdminPageWrapper>
  )
}
