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
import {toast  } from 'sonner'

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

  const handleApplicationAction = async (applicationId: string, action: 'approve' | 'reject') => {
    setProcessing(true)
    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          applicationId,
          status: action === 'approve' ? 'approved' : 'rejected',
          adminNotes: reviewNotes,
          approvedBy: adminUser?.username
        })
      })

      if (response.ok) {
        await fetchApplications()
        setShowReviewDialog(false)
        setReviewNotes('')
        setSelectedApplication(null)
        toast.success(`Application ${action}d successfully`)
      } else {
        throw new Error(`Failed to ${action} application`)
      }
    } catch (err) {
      console.error(`Error ${action}ing application:`, err)
      toast.error(`Failed to ${action} application`)
    } finally {
      setProcessing(false)
    }
  }

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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Affiliates</p>
                  <p className="text-3xl font-bold text-green-600">{applications.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved Today</p>
                  <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Affiliates</p>
                  <p className="text-3xl font-bold text-blue-600">{applications.length}</p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Approved Affiliate Partners</CardTitle>
                <CardDescription>All approved and active affiliate partners</CardDescription>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location & Phone</TableHead>
                      <TableHead>Expected Leads</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
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
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application)
                              setShowReviewDialog(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Dialog */}
        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>Approved Affiliate Details</DialogTitle>
              <DialogDescription>
                View the approved affiliate information
              </DialogDescription>
            </DialogHeader>

            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Applicant Name</label>
                    <p className="text-sm">{selectedApplication.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{selectedApplication.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-sm">{selectedApplication.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Location</label>
                    <p className="text-sm">{selectedApplication.city}, {selectedApplication.state}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <p className="text-sm">{selectedApplication.company_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Business Type</label>
                    <p className="text-sm capitalize">{selectedApplication.business_type || 'Individual'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Promotion Method</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                    {selectedApplication.promotion_method}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Target Audience</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                    {selectedApplication.target_audience}
                  </p>
                </div>

                {selectedApplication.referral_code && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Referral Code</label>
                    <p className="text-sm mt-1 p-3 bg-green-50 rounded border border-green-200">
                      <code className="font-mono font-bold text-green-700">{selectedApplication.referral_code}</code>
                    </p>
                  </div>
                )}

                {selectedApplication.approved_at && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <label className="text-sm font-medium text-green-800">Approval Status</label>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-green-700">
                        Approved on {format(new Date(selectedApplication.approved_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                onClick={() => setShowReviewDialog(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </AdminPageWrapper>
  )
}