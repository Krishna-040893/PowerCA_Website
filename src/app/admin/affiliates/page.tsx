"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { RefreshCw, Star, CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface AffiliateApplication {
  id: string
  name: string
  account_email: string
  payment_email: string
  website_url?: string
  promotion_method: string
  status: string
  admin_notes?: string
  created_at: string
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
  const [activeTab, setActiveTab] = useState<'applications' | 'profiles'>('profiles')
  const [applications, setApplications] = useState<AffiliateApplication[]>([])
  const [affiliateProfiles, setAffiliateProfiles] = useState<AffiliateProfile[]>([])
  const [expandedProfile, setExpandedProfile] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedApp, setSelectedApp] = useState<AffiliateApplication | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/affiliates')
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
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  const handleApplicationAction = async (applicationId: string, status: 'approved' | 'rejected') => {
    setProcessingId(applicationId)
    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status,
          adminNotes,
          approvedBy: 'Admin' // You can get this from current admin user
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Update the application in local state
        setApplications(prev => prev.map(app =>
          app.id === applicationId
            ? { ...app, status, admin_notes: adminNotes }
            : app
        ))
        setSelectedApp(null)
        setAdminNotes('')
        alert(`Application ${status} successfully!`)
      } else {
        alert(result.error || `Failed to ${status} application`)
      }
    } catch (err) {
      console.error(`Error ${status} application:`, err)
      alert(`Failed to ${status} application`)
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

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Affiliate Management</h1>
          <p className="text-sm text-gray-600">Review and manage affiliate applications</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Star className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
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
                  <p className="text-2xl font-bold">{stats.approved}</p>
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
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Affiliate Applications</CardTitle>
                <CardDescription>
                  Review affiliate applications and approve or reject them
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchApplications}
                disabled={loading}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-600">Loading applications...</p>
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
                      <TableHead>Account Email</TableHead>
                      <TableHead>Payment Email</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p>{application.name}</p>
                            <p className="text-sm text-gray-500">@{application.registrations.username}</p>
                          </div>
                        </TableCell>
                        <TableCell>{application.account_email}</TableCell>
                        <TableCell>{application.payment_email}</TableCell>
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
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(application.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(application.status)}
                              {application.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(application.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
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
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Review Affiliate Application</DialogTitle>
                                  <DialogDescription>
                                    Application from {selectedApp?.name}
                                  </DialogDescription>
                                </DialogHeader>

                                {selectedApp && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Name</label>
                                        <p className="text-sm text-gray-600">{selectedApp.name}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Account Email</label>
                                        <p className="text-sm text-gray-600">{selectedApp.account_email}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Payment Email</label>
                                        <p className="text-sm text-gray-600">{selectedApp.payment_email}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Website</label>
                                        <p className="text-sm text-gray-600">
                                          {selectedApp.website_url || 'Not provided'}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium">Promotion Method</label>
                                      <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded">
                                        {selectedApp.promotion_method}
                                      </p>
                                    </div>

                                    <div>
                                      <label className="text-sm font-medium">Admin Notes</label>
                                      <Textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add notes about this application..."
                                        rows={3}
                                        className="mt-1"
                                      />
                                    </div>

                                    {selectedApp.status === 'pending' && (
                                      <div className="flex justify-end gap-2 pt-4">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {applications.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Total applications: {applications.length}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}