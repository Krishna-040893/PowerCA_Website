'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Download, FileText, User, Mail, Phone, FileCheck, Clock, Upload, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { AdminPagination } from '@/components/admin/admin-pagination'
import {
  DataTableFilters,
  DataTablePanel,
  DataTableToolbar,
  FilterMenu,
  RowActions,
  RowIconButton,
  RowMenu,
  ToolbarButton,
  dataTableClass,
} from '@/components/admin/data-table'
import { formatPhone } from '@/lib/utils'

interface Agreement {
  id: string
  name: string
  email: string
  phone: string
  status: 'draft' | 'signed'
  downloadedAt: string | null
  uploadedAt: string | null
  filePath: string | null
  signingMethod: string | null
  companySignedAt: string | null
  companyFilePath: string | null
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
    link.setAttribute('download', `affiliate_agreements_${format(new Date(), 'yyyy-MM-dd')}.csv`)
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
      formData.append('affiliateId', selectedAgreementId)

      const response = await fetch('/api/admin/affiliate-agreements/upload-company-signed', {
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
      title="Affiliate Agreements"
      description="Manage affiliate partner agreement documents"
    >
      <DataTablePanel>
        <DataTableToolbar
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by name, email, or phone..."
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
              <Table className={dataTableClass}>
                <TableHeader>
                  <TableRow>
                    <TableHead>Affiliate</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signing Method</TableHead>
                    <TableHead>Downloaded</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgreements
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((agreement) => {
                      // Download: company-signed file if available, otherwise affiliate's signed file
                      const downloadPath = agreement.companyFilePath || agreement.filePath
                      const canCompanySign = agreement.status === 'signed' && !agreement.companySignedAt

                      return (
                        <TableRow key={agreement.id}>
                          <TableCell className="font-medium">{agreement.name || '-'}</TableCell>
                          <TableCell>
                            <div>{agreement.email || '-'}</div>
                            {agreement.phone && <div className="text-gray-500">{formatPhone(agreement.phone)}</div>}
                          </TableCell>
                          <TableCell>{agreement.status === 'signed' ? 'Signed' : 'Draft'}</TableCell>
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
                            {!downloadPath && !canCompanySign && !agreement.companySignedAt ? (
                              '-'
                            ) : (
                              <RowActions>
                                {downloadPath && (
                                  <RowIconButton label="Download" onClick={() => handleDownloadDocument(downloadPath)}>
                                    <Download />
                                  </RowIconButton>
                                )}
                                {agreement.companySignedAt && (
                                  <span title="Company signed" className="inline-flex h-8 w-8 items-center justify-center text-green-600">
                                    <CheckCircle2 className="h-[18px] w-[18px]" />
                                  </span>
                                )}
                                {canCompanySign &&
                                  (uploadingCompanySignId === agreement.id ? (
                                    <RowIconButton label="Uploading company-signed agreement" disabled>
                                      <Loader2 className="animate-spin" />
                                    </RowIconButton>
                                  ) : (
                                    <RowMenu
                                      items={[
                                        {
                                          label: 'Upload company signed',
                                          icon: <Upload />,
                                          onSelect: () => triggerCompanySignUpload(agreement.id),
                                        },
                                      ]}
                                    />
                                  ))}
                              </RowActions>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredAgreements
                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                .map((agreement) => (
                <Card key={agreement.id} className="border border-gray-200 shadow-sm">
                  <CardContent className="p-4">
                    <div className="space-y-3">
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

                      <div className="flex flex-col gap-2">
                        {(agreement.companyFilePath || agreement.filePath) && (
                          <ToolbarButton
                            onClick={() => handleDownloadDocument((agreement.companyFilePath || agreement.filePath)!)}
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
