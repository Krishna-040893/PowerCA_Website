'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Download, FileText, User, Mail, Phone, FileCheck, Clock, AlertCircle, Upload, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { AdminPagination } from '@/components/admin/admin-pagination'
import {
  dataTableClass,
  DataTableFilters,
  DataTablePanel,
  DataTableToolbar,
  FilterMenu,
  RowActions,
  RowIconButton,
  RowMenu,
  ToolbarButton,
} from '@/components/admin/data-table'
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
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [uploadingCompanySignId, setUploadingCompanySignId] = useState<string | null>(null)
  const companySignFileInputRef = useRef<HTMLInputElement>(null)
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null)
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

  const statusLabels: Record<string, string> = {
    signed: 'Signed',
    draft: 'Draft',
    pending: 'Not Started',
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

  const currentPageItems = filteredAgreements
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
    >
      <DataTablePanel>
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by name, email, or phone"
            actions={
              <>
                <ToolbarButton onClick={fetchAgreements} disabled={loading}>
                  <RefreshCw className={loading ? 'animate-spin' : ''} />
                  Refresh
                </ToolbarButton>
                <ToolbarButton onClick={exportToCSV} disabled={loading || agreements.length === 0}>
                  <Download />
                  Export CSV
                </ToolbarButton>
              </>
            }
          />

          <DataTableFilters>
            <FilterMenu
              label="Status"
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'signed', label: 'Signed' },
              ]}
            />
          </DataTableFilters>

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
                <Table className={dataTableClass}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Signing Method</TableHead>
                      <TableHead>Downloaded</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPageItems.map((agreement) => (
                      <TableRow key={agreement.id}>
                        <TableCell>
                          <p>{agreement.name || '-'}</p>
                          <p className="text-xs text-gray-500">{agreement.role}</p>
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
                        <TableCell>{statusLabels[agreement.status] ?? statusLabels.pending}</TableCell>
                        <TableCell>
                          {agreement.signingMethod ? (agreement.signingMethod === 'digital' ? 'DSC' : 'Manual') : '-'}
                        </TableCell>
                        <TableCell>
                          {agreement.downloadedAt ? format(new Date(agreement.downloadedAt), 'dd MMM yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          {agreement.uploadedAt ? format(new Date(agreement.uploadedAt), 'dd MMM yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <RowActions>
                            {/* Download: company-signed file if available, otherwise client's signed file */}
                            {(agreement.companyFilePath || agreement.filePath) && (
                              <RowIconButton
                                label="Download"
                                onClick={() => handleViewDocument((agreement.companyFilePath || agreement.filePath)!)}
                              >
                                <Download />
                              </RowIconButton>
                            )}
                            {uploadingCompanySignId === agreement.id ? (
                              <RowIconButton label="Uploading company signed agreement" disabled>
                                <Loader2 className="animate-spin" />
                              </RowIconButton>
                            ) : agreement.status === 'signed' && !agreement.companySignedAt ? (
                              <RowMenu
                                items={[
                                  {
                                    label: 'Upload company signed',
                                    icon: <Upload className="h-4 w-4" />,
                                    onSelect: () => triggerCompanySignUpload(agreement.id),
                                  },
                                ]}
                              />
                            ) : agreement.companySignedAt ? (
                              <span className="ml-1 inline-flex items-center gap-1 whitespace-nowrap">
                                <CheckCircle2 className="h-4 w-4" />
                                Company Signed
                              </span>
                            ) : null}
                            {!agreement.filePath && !agreement.companySignedAt && (
                              <span className="text-gray-400">-</span>
                            )}
                          </RowActions>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {currentPageItems.map((agreement) => (
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
                            <ToolbarButton
                              onClick={() => handleViewDocument((agreement.companyFilePath || agreement.filePath)!)}
                              className="w-full"
                            >
                              <Download />
                              Download Document
                            </ToolbarButton>
                          )}
                          {agreement.status === 'signed' && !agreement.companySignedAt ? (
                            <ToolbarButton
                              variant="primary"
                              onClick={() => triggerCompanySignUpload(agreement.id)}
                              disabled={uploadingCompanySignId === agreement.id}
                              className="w-full"
                            >
                              {uploadingCompanySignId === agreement.id ? <Loader2 className="animate-spin" /> : <Upload />}
                              Upload Company Signed
                            </ToolbarButton>
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

              <AdminPagination
                currentPage={currentPage}
                totalItems={filteredAgreements.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1) }}
                itemName="agreements"
              />
            </>
          )}
      </DataTablePanel>

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
