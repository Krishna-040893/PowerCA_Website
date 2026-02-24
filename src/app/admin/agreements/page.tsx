'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, RefreshCw, Download, Search, FileText, User, Mail, Phone, FileCheck, Clock, AlertCircle, Upload, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { AdminPagination } from '@/components/admin/admin-pagination'
import { formatPhone } from '@/lib/utils'

interface Agreement {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: 'pending' | 'draft' | 'signed'
  downloadedAt: string | null
  uploadedAt: string | null
  filePath: string | null
  signingMethod: string | null
  companySignedAt: string | null
  companyFilePath: string | null
  finalDownloadedAt: string | null
  createdAt: string
}

export default function AdminAgreementsPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser, getAuthHeaders } = useAdminAuth()
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('signed')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [uploadingCompanySignId, setUploadingCompanySignId] = useState<string | null>(null)
  const companySignFileInputRef = useRef<HTMLInputElement>(null)
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
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

      const response = await fetch('/api/admin/agreements', {
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
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Draft</Badge>
      case 'pending':
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Not Started</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <FileCheck className="h-4 w-4 text-green-600" />
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'pending':
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const handleViewDocument = async (filePath: string) => {
    if (!filePath) return

    try {
      const response = await fetch(`/api/admin/agreements/download?path=${encodeURIComponent(filePath)}`, {
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
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Downloaded At', 'Uploaded At', 'Signing Method']
    const csvContent = [
      headers.join(','),
      ...agreements.map(agreement => {
        return [
          agreement.name,
          agreement.email,
          agreement.phone || '',
          agreement.status,
          agreement.downloadedAt ? format(new Date(agreement.downloadedAt), 'yyyy-MM-dd HH:mm:ss') : '',
          agreement.uploadedAt ? format(new Date(agreement.uploadedAt), 'yyyy-MM-dd HH:mm:ss') : '',
          agreement.signingMethod || ''
        ].map(field => `"${field}"`).join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `agreements_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCompanySignUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !selectedAgreementId) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setUploadingCompanySignId(selectedAgreementId)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', selectedAgreementId)

      const response = await fetch('/api/admin/agreements/upload-company-signed', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        await fetchAgreements()
        alert('Company-signed agreement uploaded successfully!')
      } else {
        alert(result.error || 'Failed to upload company-signed agreement')
      }
    } catch (err) {
      console.error('Error uploading company-signed agreement:', err)
      alert('Failed to upload. Please try again.')
    } finally {
      setUploadingCompanySignId(null)
      setSelectedAgreementId(null)
      if (companySignFileInputRef.current) {
        companySignFileInputRef.current.value = ''
      }
    }
  }

  const triggerCompanySignUpload = (agreementId: string) => {
    setSelectedAgreementId(agreementId)
    companySignFileInputRef.current?.click()
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
      title="Client Agreements"
      description="Manage client service agreement documents"
      stats={[
        { label: 'Total', value: stats.draft + stats.signed, color: 'bg-blue-100 text-blue-800' },
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
            <div className="text-center py-8 text-gray-500">
              No agreements found
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
                      <TableHead className="text-base font-bold">User</TableHead>
                      <TableHead className="text-base font-bold">Contact</TableHead>
                      <TableHead className="text-base font-bold">Status</TableHead>
                      <TableHead className="text-base font-bold">Signing Method</TableHead>
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
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{agreement.name || '-'}</p>
                              <p className="text-xs text-gray-500">{agreement.role}</p>
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
                                {formatPhone(agreement.phone)}
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
                          {agreement.signingMethod ? (
                            <Badge className={agreement.signingMethod === 'digital' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'}>
                              {agreement.signingMethod === 'digital' ? 'DSC' : 'Manual'}
                            </Badge>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
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
                          <div className="flex items-center gap-2">
                            {/* Download: company-signed file if available, otherwise client's signed file */}
                            {(agreement.companyFilePath || agreement.filePath) && (
                              <Button
                                size="sm"
                                onClick={() => handleViewDocument((agreement.companyFilePath || agreement.filePath)!)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                            {agreement.status === 'signed' && !agreement.companySignedAt ? (
                              <Button
                                size="sm"
                                onClick={() => triggerCompanySignUpload(agreement.id)}
                                disabled={uploadingCompanySignId === agreement.id}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                {uploadingCompanySignId === agreement.id ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Upload className="h-4 w-4 mr-1" />
                                )}
                                Company Sign
                              </Button>
                            ) : agreement.companySignedAt ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Company Signed
                              </Badge>
                            ) : null}
                            {!agreement.filePath && !agreement.companySignedAt && (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
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
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{agreement.name || '-'}</p>
                              <p className="text-xs text-gray-500">{agreement.role}</p>
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
                              <span className="text-xs text-gray-700">{formatPhone(agreement.phone)}</span>
                            </div>
                          )}
                        </div>

                        {/* Signing Method & Dates */}
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Signing:</span>
                            <span className="text-gray-700">
                              {agreement.signingMethod ? (
                                <Badge className={`text-[10px] ${agreement.signingMethod === 'digital' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                                  {agreement.signingMethod === 'digital' ? 'DSC' : 'Manual'}
                                </Badge>
                              ) : '-'}
                            </span>
                          </div>
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

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          {(agreement.companyFilePath || agreement.filePath) && (
                            <Button
                              size="sm"
                              onClick={() => handleViewDocument((agreement.companyFilePath || agreement.filePath)!)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download Document
                            </Button>
                          )}
                          {agreement.status === 'signed' && !agreement.companySignedAt ? (
                            <Button
                              size="sm"
                              onClick={() => triggerCompanySignUpload(agreement.id)}
                              disabled={uploadingCompanySignId === agreement.id}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              {uploadingCompanySignId === agreement.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4 mr-1" />
                              )}
                              Upload Company Signed
                            </Button>
                          ) : agreement.companySignedAt ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 justify-center py-1">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Company Signed
                            </Badge>
                          ) : null}
                        </div>
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

      {/* Hidden file input for company-signed upload */}
      <input
        ref={companySignFileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleCompanySignUpload}
        className="hidden"
      />
    </AdminPageWrapper>
  )
}
