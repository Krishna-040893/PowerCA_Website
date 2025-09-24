"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RefreshCw, CheckCircle, XCircle, Eye, Clock } from "lucide-react"
import { format } from "date-fns"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const [applications, setApplications] = useState<AffiliateApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<AffiliateApplication | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch affiliate applications with user details
      const { data: apps, error: appsError } = await supabase
        .from('affiliate_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (appsError) throw appsError

      // Fetch user details for each application
      const applicationsWithUsers = await Promise.all(
        (apps || []).map(async (app) => {
          const { data: user } = await supabase
            .from('registrations')
            .select('name, email, phone')
            .eq('id', app.user_id)
            .single()

          return {
            ...app,
            user
          }
        })
      )

      setApplications(applicationsWithUsers)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedApplication) return

    setProcessing(true)
    const adminUser = JSON.parse(localStorage.getItem('user') || '{}')

    try {
      // Update application status
      const { error: appError } = await supabase
        .from('affiliate_applications')
        .update({
          status: 'approved',
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', selectedApplication.id)

      if (appError) throw appError

      // Update affiliate profile status
      const { error: profileError } = await supabase
        .from('affiliate_profiles')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: adminUser.id
        })
        .eq('user_id', selectedApplication.user_id)

      if (profileError) throw profileError

      alert('Application approved successfully!')
      setShowReviewDialog(false)
      setReviewNotes("")
      fetchApplications()
    } catch (err: any) {
      alert(`Failed to approve application: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApplication) return

    setProcessing(true)
    const adminUser = JSON.parse(localStorage.getItem('user') || '{}')

    try {
      // Update application status
      const { error: appError } = await supabase
        .from('affiliate_applications')
        .update({
          status: 'rejected',
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', selectedApplication.id)

      if (appError) throw appError

      // Update affiliate profile status
      const { error: profileError } = await supabase
        .from('affiliate_profiles')
        .update({
          status: 'rejected',
          approved_at: new Date().toISOString(),
          approved_by: adminUser.id
        })
        .eq('user_id', selectedApplication.user_id)

      if (profileError) throw profileError

      alert('Application rejected.')
      setShowReviewDialog(false)
      setReviewNotes("")
      fetchApplications()
    } catch (err: any) {
      alert(`Failed to reject application: ${err.message}`)
    } finally {
      setProcessing(false)
    }
  }

  const openReviewDialog = (application: AffiliateApplication) => {
    setSelectedApplication(application)
    setReviewNotes("")
    setShowReviewDialog(true)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      'website': 'Website/Blog',
      'social_media': 'Social Media',
      'email': 'Email Marketing',
      'referrals': 'Client Referrals',
      'events': 'Events & Workshops',
      'other': 'Other Methods'
    }
    return methods[method] || method
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Affiliate Applications</h1>
            <p className="text-slate-400">Review and approve affiliate applications</p>
          </div>
          <Button
            variant="outline"
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
            onClick={fetchApplications}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {applications.filter(a => a.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {applications.filter(a => a.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {applications.filter(a => a.status === 'rejected').length}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Applications</CardTitle>
            <CardDescription>Review affiliate applications and approve or reject them</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-600">Loading applications...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No affiliate applications found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Promotion Method</TableHead>
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
                            <p className="font-medium">{application.user?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{application.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{application.company_name}</TableCell>
                        <TableCell>
                          <a
                            href={application.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {application.website_url}
                          </a>
                        </TableCell>
                        <TableCell>{getMethodLabel(application.promotion_method)}</TableCell>
                        <TableCell>{application.expected_referrals}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeColor(application.status)}>
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(application.created_at), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openReviewDialog(application)}
                            disabled={application.status !== 'pending'}
                          >
                            <Eye className="w-4 h-4 mr-1" />
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
                Review the application details and decide whether to approve or reject.
              </DialogDescription>
            </DialogHeader>

            {selectedApplication && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold">Applicant:</p>
                    <p>{selectedApplication.user?.name}</p>
                    <p className="text-gray-500">{selectedApplication.user?.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Company:</p>
                    <p>{selectedApplication.company_name}</p>
                    <a
                      href={selectedApplication.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedApplication.website_url}
                    </a>
                  </div>
                  <div>
                    <p className="font-semibold">Promotion Method:</p>
                    <p>{getMethodLabel(selectedApplication.promotion_method)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Expected Referrals:</p>
                    <p>{selectedApplication.expected_referrals} per month</p>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-sm mb-1">Reason for Applying:</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedApplication.reason}
                  </p>
                </div>

                <div>
                  <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add any notes about this application..."
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {processing ? 'Processing...' : 'Approve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}