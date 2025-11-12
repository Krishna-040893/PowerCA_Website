'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import {AdminPageWrapper  } from '@/components/admin/admin-page-wrapper'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow  } from '@/components/ui/table'
import {Badge  } from '@/components/ui/badge'
import {Button  } from '@/components/ui/button'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle  } from '@/components/ui/dialog'
import {Loader2, RefreshCw, CheckCircle, XCircle, Eye, Clock, Star  } from 'lucide-react'
import { format } from 'date-fns'
import { AdminPagination } from '@/components/admin/admin-pagination'

interface AffiliateApplication {
  id: string
  name: string
  email: string
  phone: string
  city: string
  state: string
  business_type: string
  company_name?: string
  designation?: string
  experience?: string
  promotion_method: string
  target_audience: string
  monthly_leads?: string
  status: string
  created_at: string
  referral_code?: string
  approved_at?: string
  registrations: {
    username: string
    email: string
  }
}

export default function AdminAffiliateApprovalPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser, getAuthHeaders } = useAdminAuth()
  const [applications, setApplications] = useState<AffiliateApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<AffiliateApplication | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/affiliates', {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch affiliate applications')
      }

      const data = await response.json()

      // Filter for approved affiliates only
      const approvedApps = (data || []).filter((app: AffiliateApplication) => app.status === 'approved')
      setApplications(approvedApps)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchApplications()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading])

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    }
    const { color, icon: Icon } = config[status as keyof typeof config] || config.pending
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
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
      title="Approved Affiliates"
      description="View and manage approved affiliate partners"
      actions={
        <Button onClick={fetchApplications} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
        {/* Stats - Enhanced Mobile Design */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Approved Affiliates</p>
                  <p className="text-3xl sm:text-4xl font-bold text-green-600">{applications.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Active partners</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-green-50">
                  <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Approved Today</p>
                  <p className="text-3xl sm:text-4xl font-bold text-green-600">0</p>
                  <p className="text-xs text-gray-500 mt-1">New today</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-green-50">
                  <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm col-span-2 lg:col-span-1">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Affiliates</p>
                  <p className="text-3xl sm:text-4xl font-bold text-blue-600">{applications.length}</p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-blue-50">
                  <Star className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold">Approved</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">All approved and active affiliate partners</CardDescription>
              </div>
              <Button onClick={fetchApplications} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
                <p className="mt-2 text-gray-600">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No approved affiliates found
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-base font-bold">Applicant</TableHead>
                      <TableHead className="text-base font-bold">Company</TableHead>
                      <TableHead className="text-base font-bold">Location & Phone</TableHead>
                      <TableHead className="text-base font-bold">Expected Leads</TableHead>
                      <TableHead className="text-base font-bold">Status</TableHead>
                      <TableHead className="text-base font-bold">Applied Date</TableHead>
                      <TableHead className="text-base font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications
                      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                      .map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{application.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{application.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{application.company_name || '-'}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{application.phone || '-'}</p>
                            <p className="text-xs text-gray-500">{application.city}, {application.state}</p>
                          </div>
                        </TableCell>
                        <TableCell>{application.monthly_leads || '-'}</TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell>
                          {format(new Date(application.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application)
                              setShowReviewDialog(true)
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View - Professional Design */}
              <div className="md:hidden space-y-3">
                  {applications
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((application) => (
                    <Card key={application.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Name and Status Badge */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm text-gray-900 truncate">{application.name || 'Unknown'}</p>
                                  <p className="text-xs text-gray-500 truncate">{application.email}</p>
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(application.status)}
                          </div>

                          {/* Contact Info - Compact */}
                          <div className="space-y-1.5 bg-gray-50 rounded-lg p-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Company:</span>
                              <span className="text-gray-700 font-medium">{application.company_name || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Phone:</span>
                              <span className="text-gray-700 font-medium">{application.phone || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Location:</span>
                              <span className="text-gray-700 font-medium">{application.city}, {application.state}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Expected Leads:</span>
                              <span className="text-gray-700 font-medium">{application.monthly_leads || '-'}</span>
                            </div>
                          </div>

                          {/* Date - Enhanced */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Clock className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-medium">{format(new Date(application.created_at), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>

                          {/* Action Button - Enhanced */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application)
                              setShowReviewDialog(true)
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Pagination */}
              <AdminPagination
                currentPage={currentPage}
                totalItems={applications.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemName="affiliates"
              />
            </>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog - Enhanced */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-[90vw] sm:max-w-2xl bg-white rounded-xl">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="text-lg font-bold">Approved Affiliate Details</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                View the approved affiliate information
              </DialogDescription>
            </DialogHeader>

            {selectedApplication && (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {/* Personal & Business Info */}
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Applicant Name</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedApplication.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedApplication.email || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedApplication.phone || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Location</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedApplication.city}, {selectedApplication.state}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Company</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedApplication.company_name || '-'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Business Type</label>
                      <p className="text-sm text-gray-900 mt-1 capitalize">{selectedApplication.business_type || 'Individual'}</p>
                    </div>
                  </div>
                </div>

                {/* Marketing Strategy */}
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Marketing Strategy</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500">Promotion Method</label>
                      <p className="text-sm text-gray-900 mt-1 p-3 bg-white rounded border">
                        {selectedApplication.promotion_method}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500">Target Audience</label>
                      <p className="text-sm text-gray-900 mt-1 p-3 bg-white rounded border">
                        {selectedApplication.target_audience}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Referral Code */}
                {selectedApplication.referral_code && (
                  <div className="bg-green-50 p-4 rounded-xl">
                    <label className="text-sm font-semibold text-gray-900">Referral Code</label>
                    <div className="mt-2">
                      <code className="bg-white text-green-700 px-3 py-2 rounded border border-green-200 font-mono text-lg inline-block">
                        {selectedApplication.referral_code}
                      </code>
                    </div>
                  </div>
                )}

                {/* Approval Status */}
                {selectedApplication.approved_at && (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <label className="text-sm font-semibold text-green-800">Approval Status</label>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-700 font-medium">
                        Approved on {format(new Date(selectedApplication.approved_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="border-t pt-3">
              <Button
                onClick={() => setShowReviewDialog(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </AdminPageWrapper>
  )
}