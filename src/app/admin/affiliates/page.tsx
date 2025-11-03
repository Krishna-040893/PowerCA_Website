'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow  } from '@/components/ui/table'
import {Badge  } from '@/components/ui/badge'
import {Button  } from '@/components/ui/button'
import {Textarea  } from '@/components/ui/textarea'
import {RefreshCw, Star, CheckCircle, XCircle, Clock, Eye, Loader2, Calendar  } from 'lucide-react'
import { format } from 'date-fns'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger  } from '@/components/ui/dialog'
import {toast  } from 'sonner'
import { AdminPageWrapper } from '@/components/admin/admin-page-wrapper'
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
  account_number?: string
  ifsc_code?: string
  pan_number?: string
  gst_number?: string
  status: string
  admin_notes?: string
  created_at: string
  referral_code?: string
  approved_at?: string
  registrations: {
    username: string
    email: string
  }
}

interface AffiliateProfile {
  id: string
  user_id: string
  affiliate_id: string
  referral_code: string
  firm_name: string
  contact_email?: string
  contact_phone?: string
  commission_rate: number
  total_earnings: number
  status: string
  created_at: string
  user: {
    name: string
    email: string
  }
  referrals: ReferralData[]
}

interface ReferralData {
  id: string
  referred_email: string
  referred_name: string
  status: string
  created_at: string
  converted_at?: string
}


export default function AdminAffiliatesPage() {
  const { isAuthenticated, isLoading: isAuthLoading, adminUser, getAuthHeaders } = useAdminAuth()
  const [_activeTab, _setActiveTab] = useState<'applications' | 'profiles'>('profiles')
  const [applications, setApplications] = useState<AffiliateApplication[]>([])
  const [_affiliateProfiles, _setAffiliateProfiles] = useState<AffiliateProfile[]>([])
  const [_expandedProfile, _setExpandedProfile] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<AffiliateApplication | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Fetch data when authenticated

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
      setApplications(data)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchApplications()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const handleApplicationAction = async (applicationId: string, status: 'approved' | 'rejected') => {
    setProcessingId(applicationId)
    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          applicationId,
          status,
          adminNotes,
          approvedBy: adminUser?.username || 'Admin'
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Update the application in local state with referral code if approved
        setApplications(prev => prev.map(app =>
          app.id === applicationId
            ? {
                ...app,
                status,
                admin_notes: adminNotes,
                referral_code: result.referral_code || app.referral_code
              }
            : app
        ))
        setSelectedApp(null)
        setAdminNotes('')

        if (status === 'approved' && result.referral_code) {
          const appUrl = window.location.origin
          const affiliateAccountUrl = `${appUrl}/affiliate/referral`

          toast.success(
            <div className="space-y-2">
              <p className="font-semibold">✅ Application Approved!</p>
              <p className="text-sm">Referral Code: <code className="bg-green-100 px-1 rounded">{result.referral_code}</code></p>
              <p className="text-sm">Affiliate will receive an approval email.</p>
              <a
                href={affiliateAccountUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline block mt-1"
              >
                View Affiliate Account Page →
              </a>
            </div>,
            { duration: 8000 }
          )
        } else {
          toast.success(`Application ${status} successfully!`)
        }
      } else {
        toast.error(result.error || `Failed to ${status} application`)
      }
    } catch (err) {
      console.error(`Error ${status} application:`, err)
      toast.error(`Failed to ${status} application`)
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  }

  if (isAuthLoading) {
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
      title="Affiliate Management"
      description="Review and manage affiliate applications"
      actions={
        <Button
          onClick={fetchApplications}
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      }
    >
      <div>
        {/* Statistics Cards - Enhanced Mobile Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Total Applications</p>
                  <p className="text-3xl sm:text-4xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-blue-50">
                  <Star className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Pending Review</p>
                  <p className="text-3xl sm:text-4xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-yellow-50">
                  <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl sm:text-4xl font-bold">{stats.approved}</p>
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
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1">Rejected</p>
                  <p className="text-3xl sm:text-4xl font-bold">{stats.rejected}</p>
                  <p className="text-xs text-gray-500 mt-1">Declined</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-red-50">
                  <XCircle className="h-7 w-7 sm:h-8 sm:w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-sm border border-gray-100">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-bold">Affiliate Applications</CardTitle>
            <CardDescription className="text-xs sm:text-sm mt-1">
              Review affiliate applications and approve or reject them
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-600">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No affiliate applications found
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Referral Code</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications
                      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                      .map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.name}
                        </TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell>{application.phone}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(application.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(application.status)}
                              {application.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {application.referral_code ? (
                            <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono">
                              {application.referral_code}
                            </code>
                          ) : (
                            <span className="text-gray-400 text-sm">Not generated</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(application.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedApp(application)
                                  setAdminNotes(application.admin_notes || '')
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[90vw] sm:max-w-2xl bg-white rounded-xl">
                              <DialogHeader className="border-b pb-3">
                                <DialogTitle className="text-lg font-bold">Review Affiliate Application</DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm">
                                  Application from {selectedApp?.name}
                                </DialogDescription>
                              </DialogHeader>

                              {selectedApp && (
                                <div className="space-y-6 max-h-[600px] overflow-y-auto">
                                  {/* Personal Information */}
                                  <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Full Name</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedApp.name}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Email</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedApp.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Phone</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedApp.phone}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Location</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedApp.city}, {selectedApp.state}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Business Information */}
                                  <div className="bg-blue-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Business Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Business Type</label>
                                        <p className="text-sm text-gray-900 mt-1 capitalize">{selectedApp.business_type || 'Individual'}</p>
                                      </div>
                                      {selectedApp.company_name && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">Company Name</label>
                                          <p className="text-sm text-gray-900 mt-1">{selectedApp.company_name}</p>
                                        </div>
                                      )}
                                      {selectedApp.designation && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">Designation</label>
                                          <p className="text-sm text-gray-900 mt-1">{selectedApp.designation}</p>
                                        </div>
                                      )}
                                      {selectedApp.experience && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">Experience</label>
                                          <p className="text-sm text-gray-900 mt-1">{selectedApp.experience}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Affiliate Information */}
                                  <div className="bg-green-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Affiliate Information</h3>
                                    <div className="space-y-3">
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Promotion Method</label>
                                        <p className="text-sm text-gray-900 mt-1 p-3 bg-white rounded border">
                                          {selectedApp.promotion_method}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Target Audience</label>
                                        <p className="text-sm text-gray-900 mt-1 p-3 bg-white rounded border">
                                          {selectedApp.target_audience}
                                        </p>
                                      </div>
                                      {selectedApp.monthly_leads && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">Expected Monthly Referrals</label>
                                          <p className="text-sm text-gray-900 mt-1">{selectedApp.monthly_leads}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Payment Information */}
                                  <div className="bg-purple-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      {selectedApp.account_number && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">Account Number</label>
                                          <p className="text-sm text-gray-900 mt-1 font-mono">{selectedApp.account_number}</p>
                                        </div>
                                      )}
                                      {selectedApp.ifsc_code && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">IFSC Code</label>
                                          <p className="text-sm text-gray-900 mt-1 font-mono">{selectedApp.ifsc_code}</p>
                                        </div>
                                      )}
                                      {selectedApp.pan_number && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">PAN Number</label>
                                          <p className="text-sm text-gray-900 mt-1 font-mono">{selectedApp.pan_number}</p>
                                        </div>
                                      )}
                                      {selectedApp.gst_number && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">GST Number</label>
                                          <p className="text-sm text-gray-900 mt-1 font-mono">{selectedApp.gst_number}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Status Information */}
                                  {selectedApp.referral_code && (
                                    <div className="bg-yellow-50 p-4 rounded-xl">
                                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Referral Code</h3>
                                      <code className="bg-green-100 text-green-800 px-3 py-2 rounded font-mono text-lg">
                                        {selectedApp.referral_code}
                                      </code>
                                    </div>
                                  )}

                                  {/* Admin Notes */}
                                  <div>
                                    <label className="text-sm font-medium text-gray-900">Admin Notes</label>
                                    <Textarea
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Add notes about this application..."
                                      rows={3}
                                      className="mt-2"
                                    />
                                  </div>

                                  {/* Action Buttons */}
                                  {selectedApp.status === 'pending' && (
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                      <Button
                                        variant="outline"
                                        onClick={() => handleApplicationAction(selectedApp.id, 'rejected')}
                                        disabled={processingId === selectedApp.id}
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                      <Button
                                        onClick={() => handleApplicationAction(selectedApp.id, 'approved')}
                                        disabled={processingId === selectedApp.id}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                    </div>
                                  )}
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
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <Star className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm text-gray-900 truncate">{application.name}</p>
                                  <p className="text-xs text-gray-500 truncate">{application.email}</p>
                                </div>
                              </div>
                            </div>
                            <Badge className={getStatusBadgeColor(application.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(application.status)}
                                {application.status}
                              </div>
                            </Badge>
                          </div>

                          {/* Contact Info - Compact */}
                          <div className="space-y-1.5 bg-gray-50 rounded-lg p-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Phone:</span>
                              <span className="text-gray-700 font-medium">{application.phone}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Location:</span>
                              <span className="text-gray-700 font-medium">{application.city}, {application.state}</span>
                            </div>
                            {application.referral_code && (
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">Referral Code:</span>
                                <code className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-mono">
                                  {application.referral_code}
                                </code>
                              </div>
                            )}
                          </div>

                          {/* Date - Enhanced */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Calendar className="h-3.5 w-3.5 text-blue-500" />
                              <span className="font-medium">{format(new Date(application.created_at), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>

                          {/* Action Button - Enhanced */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedApp(application)
                                  setAdminNotes(application.admin_notes || '')
                                }}
                                className="w-full bg-gradient-to-r from-blue-50 to-blue-50 hover:from-blue-100 hover:to-blue-100 border-blue-200 text-blue-700 font-medium"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Review Application
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[90vw] sm:max-w-2xl bg-white rounded-xl">
                              <DialogHeader className="border-b pb-3">
                                <DialogTitle className="text-lg font-bold">Review Affiliate Application</DialogTitle>
                                <DialogDescription className="text-xs sm:text-sm">
                                  Application from {selectedApp?.name}
                                </DialogDescription>
                              </DialogHeader>

                              {selectedApp && (
                                <div className="space-y-6 max-h-[600px] overflow-y-auto">
                                  {/* Personal Information */}
                                  <div className="bg-gray-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Full Name</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedApp.name}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Email</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedApp.email}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Phone</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedApp.phone}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Location</label>
                                        <p className="text-sm text-gray-900 mt-1">{selectedApp.city}, {selectedApp.state}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Business Information */}
                                  <div className="bg-blue-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Business Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Business Type</label>
                                        <p className="text-sm text-gray-900 mt-1 capitalize">{selectedApp.business_type || 'Individual'}</p>
                                      </div>
                                      {selectedApp.company_name && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">Company Name</label>
                                          <p className="text-sm text-gray-900 mt-1">{selectedApp.company_name}</p>
                                        </div>
                                      )}
                                      {selectedApp.designation && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">Designation</label>
                                          <p className="text-sm text-gray-900 mt-1">{selectedApp.designation}</p>
                                        </div>
                                      )}
                                      {selectedApp.experience && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">Experience</label>
                                          <p className="text-sm text-gray-900 mt-1">{selectedApp.experience}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Affiliate Information */}
                                  <div className="bg-green-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Affiliate Information</h3>
                                    <div className="space-y-3">
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Promotion Method</label>
                                        <p className="text-sm text-gray-900 mt-1 p-3 bg-white rounded border">
                                          {selectedApp.promotion_method}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Target Audience</label>
                                        <p className="text-sm text-gray-900 mt-1 p-3 bg-white rounded border">
                                          {selectedApp.target_audience}
                                        </p>
                                      </div>
                                      {selectedApp.monthly_leads && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">Expected Monthly Referrals</label>
                                          <p className="text-sm text-gray-900 mt-1">{selectedApp.monthly_leads}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Payment Information */}
                                  <div className="bg-purple-50 p-4 rounded-xl">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      {selectedApp.account_number && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">Account Number</label>
                                          <p className="text-sm text-gray-900 mt-1 font-mono">{selectedApp.account_number}</p>
                                        </div>
                                      )}
                                      {selectedApp.ifsc_code && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">IFSC Code</label>
                                          <p className="text-sm text-gray-900 mt-1 font-mono">{selectedApp.ifsc_code}</p>
                                        </div>
                                      )}
                                      {selectedApp.pan_number && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">PAN Number</label>
                                          <p className="text-sm text-gray-900 mt-1 font-mono">{selectedApp.pan_number}</p>
                                        </div>
                                      )}
                                      {selectedApp.gst_number && (
                                        <div>
                                          <label className="text-xs font-medium text-gray-500">GST Number</label>
                                          <p className="text-sm text-gray-900 mt-1 font-mono">{selectedApp.gst_number}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Status Information */}
                                  {selectedApp.referral_code && (
                                    <div className="bg-yellow-50 p-4 rounded-xl">
                                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Referral Code</h3>
                                      <code className="bg-green-100 text-green-800 px-3 py-2 rounded font-mono text-lg">
                                        {selectedApp.referral_code}
                                      </code>
                                    </div>
                                  )}

                                  {/* Admin Notes */}
                                  <div>
                                    <label className="text-sm font-medium text-gray-900">Admin Notes</label>
                                    <Textarea
                                      value={adminNotes}
                                      onChange={(e) => setAdminNotes(e.target.value)}
                                      placeholder="Add notes about this application..."
                                      rows={3}
                                      className="mt-2"
                                    />
                                  </div>

                                  {/* Action Buttons */}
                                  {selectedApp.status === 'pending' && (
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                      <Button
                                        variant="outline"
                                        onClick={() => handleApplicationAction(selectedApp.id, 'rejected')}
                                        disabled={processingId === selectedApp.id}
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                      >
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Reject
                                      </Button>
                                      <Button
                                        onClick={() => handleApplicationAction(selectedApp.id, 'approved')}
                                        disabled={processingId === selectedApp.id}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Approve
                                      </Button>
                                    </div>
                                  )}
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
                totalItems={applications.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
                itemName="applications"
              />
            </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  )
}