'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import {AdminPageWrapper  } from '@/components/admin/admin-page-wrapper'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow  } from '@/components/ui/table'
import {Badge  } from '@/components/ui/badge'
import {Button  } from '@/components/ui/button'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle  } from '@/components/ui/dialog'
import {Textarea  } from '@/components/ui/textarea'
import {Label  } from '@/components/ui/label'
import {Loader2, RefreshCw, CheckCircle, XCircle, Eye, Clock, Star  } from 'lucide-react'
import { format } from 'date-fns'
import {toast  } from 'sonner'

interface AffiliateApplication {
  id: string
  user_id: string
  company_name: string
  website_url: string
  promotion_method: string
  expected_referrals: string
  reason: string
  status: string
  created_at: string
  user?: {
    name: string
    email: string
    phone: string
  }
}

export default function AdminAffiliateApprovalPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser, getAuthHeaders } = useAdminAuth()
  const [applications, setApplications] = useState<AffiliateApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<AffiliateApplication | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [processing, setProcessing] = useState(false)

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

      // Filter for pending applications
      const pendingApps = (data || []).filter((app: AffiliateApplication) => app.status === 'pending')
      setApplications(pendingApps)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')

      // Set sample data for demo
      setApplications([
        {
          id: '1',
          user_id: '1',
          company_name: 'CA Solutions Ltd',
          website_url: 'https://casolutions.com',
          promotion_method: 'Email marketing and social media campaigns',
          expected_referrals: '50-100',
          reason: 'We have a large client base of CAs who would benefit from your platform',
          status: 'pending',
          created_at: new Date().toISOString(),
          user: {
            name: 'Rahul Sharma',
            email: 'rahul@casolutions.com',
            phone: '9876543210'
          }
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications()
    }
  }, [isAuthenticated, fetchApplications])

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
      title="Affiliate Approvals"
      description="Review and approve affiliate partnership requests"
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
                  <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                  <p className="text-3xl font-bold text-yellow-600">{applications.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
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
                  <p className="text-3xl font-bold text-blue-600">12</p>
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
                <CardTitle>Pending Affiliate Applications</CardTitle>
                <CardDescription>Review and approve affiliate partnership requests</CardDescription>
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
                No pending affiliate applications
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Expected Referrals</TableHead>
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
                            <p className="font-medium">{application.user?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{application.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{application.company_name}</TableCell>
                        <TableCell>
                          {application.website_url ? (
                            <a
                              href={application.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Site
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{application.expected_referrals}</TableCell>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Affiliate Application</DialogTitle>
              <DialogDescription>
                Review the application details and make a decision
              </DialogDescription>
            </DialogHeader>

            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Applicant Name</label>
                    <p className="text-sm">{selectedApplication.user?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{selectedApplication.user?.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <p className="text-sm">{selectedApplication.company_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Website</label>
                    <p className="text-sm">{selectedApplication.website_url || '-'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Promotion Method</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                    {selectedApplication.promotion_method}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Reason for Partnership</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded">
                    {selectedApplication.reason}
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add any notes about this application..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowReviewDialog(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                onClick={() => selectedApplication && handleApplicationAction(selectedApplication.id, 'reject')}
                disabled={processing || !selectedApplication}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                onClick={() => selectedApplication && handleApplicationAction(selectedApplication.id, 'approve')}
                disabled={processing || !selectedApplication}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </AdminPageWrapper>
  )
}