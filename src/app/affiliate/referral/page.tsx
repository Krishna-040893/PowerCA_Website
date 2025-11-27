'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useRouter  } from 'next/navigation'
import {useSession, signOut  } from 'next-auth/react'
import {Building2, User, Save, AlertCircle, Clock, XCircle, LogOut, ChevronLeft, ChevronRight  } from 'lucide-react'
import {Alert, AlertDescription  } from '@/components/ui/alert'
import {toast  } from 'sonner'
import {Button  } from '@/components/ui/button'

export default function AffiliateAccountPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [affiliateId, setAffiliateId] = useState('Loading...')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [latestReferralCode, setLatestReferralCode] = useState<string>('')
  const [latestCustomerId, setLatestCustomerId] = useState<string>('')
  const [referralStatus, setReferralStatus] = useState<{
    hasReferred: boolean
    referralCount: number
    pendingCount: number
    completedCount: number
    referredDetails: { name?: string; email?: string; phone?: string } | null
  }>({ hasReferred: false, referralCount: 0, pendingCount: 0, completedCount: 0, referredDetails: null })
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null)
  const [checkingApproval, setCheckingApproval] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [referralDetails, setReferralDetails] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [referralSummary, setReferralSummary] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [referredBy, setReferredBy] = useState<{
    name: string
    email: string
    affiliateId: string
    referralCode: string
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  const [formData, setFormData] = useState({
    contactEmail: '',
    contactPerson: '',
    productUrl: 'https://powerca.in/demo',
    websiteUrl: 'https://powerca.in'
  })

  const fetchReferralDetails = useCallback(async () => {
    setLoadingDetails(true)
    try {
      const response = await fetch('/api/affiliate/referral-details')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setReferralDetails(data.referrals || [])
          setReferralSummary(data.summary)
        }
      }
    } catch (error) {
      console.error('Failed to fetch referral details:', error)
    } finally {
      setLoadingDetails(false)
    }
  }, [])

  const fetchAffiliateDetails = useCallback(async () => {
    try {
      // First, check affiliate approval status
      const approvalResponse = await fetch('/api/affiliate/approval-status')
      if (approvalResponse.ok) {
        const approvalData = await approvalResponse.json()

        // Check if user has applied as affiliate
        if (!approvalData.hasApplied) {
          setApprovalStatus(null)
          setCheckingApproval(false)
          setError('You have not applied as an affiliate. Please apply first.')
          return
        }

        setApprovalStatus(approvalData.status)
        setCheckingApproval(false)

        // If approved, save referral code
        if (approvalData.status === 'approved' && approvalData.referralCode) {
          setLatestReferralCode(approvalData.referralCode)
        }

        // If not approved, stop here
        if (approvalData.status !== 'approved') {
          return
        }
      } else {
        setCheckingApproval(false)
        setError('Unable to check affiliate status. Please try again.')
      }

      // Use the new user-info API to get complete affiliate data
      const response = await fetch('/api/affiliate/user-info')
      if (response.ok) {
        const data = await response.json()

        // Fetch referral status
        try {
          const refResponse = await fetch('/api/affiliate/referral-status')
          if (refResponse.ok) {
            const refData = await refResponse.json()
            setReferralStatus({
              hasReferred: refData.hasReferred || false,
              referralCount: refData.referralCount || 0,
              pendingCount: refData.pendingCount || 0,
              completedCount: refData.completedCount || 0,
              referredDetails: refData.referredDetails || null
            })
          }
        } catch {
          // Could not fetch referral status, continue without it
        }

        if (data.success) {
          // ONLY use the admin-assigned affiliate ID from the database
          const adminAssignedId = data.affiliateId || data.user?.affiliate_id || data.profile?.affiliate_id

          if (adminAssignedId) {
            setAffiliateId(adminAssignedId)
          } else {
            // If no ID exists, show error - admin must assign one
            setError('No affiliate ID assigned. Please contact admin to assign an affiliate ID.')
            setAffiliateId('NOT ASSIGNED')
          }

          // Store referrer information if available
          if (data.referredBy) {
            setReferredBy(data.referredBy)
          }

          // If profile exists, save the latest referral code
          if (data.profile) {
            // Save the latest referral code
            if (data.profile.referral_code) {
              setLatestReferralCode(data.profile.referral_code)
            }
            // Keep form empty for new referrals
            setFormData({
              contactEmail: '',
              contactPerson: '',
              productUrl: 'https://powerca.in/demo',
              websiteUrl: 'https://powerca.in'
            })

            // Also ensure we use the profile's affiliate_id if available
            if (data.profile.affiliate_id && !adminAssignedId) {
              setAffiliateId(data.profile.affiliate_id)
            }
          }
        }
      } else {
        setError('Failed to load affiliate information. Please try again.')
      }
    } catch {
      setError('Failed to load affiliate information. Please try again.')
    }
  }, [])

  // Fetch referral details when affiliate is approved
  useEffect(() => {
    if (approvalStatus === 'approved') {
      fetchReferralDetails()
    }
  }, [approvalStatus, fetchReferralDetails])

  useEffect(() => {
    if (status === 'loading') return

    // Check if user is logged in
    if (!session?.user) {
      router.push('/affiliate-login')
      return
    }

    // Fetch affiliate details - this will check approval status
    fetchAffiliateDetails()
    fetchProfilePhoto()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router])

  const fetchProfilePhoto = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/user/profile-photo')
      if (response.ok) {
        await response.json()
        // TODO: Add profile photo state management
      }
    } catch (error) {
      console.error('Error fetching profile photo:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate required fields
    if (!formData.contactPerson) {
      setError('Please provide customer name')
      setLoading(false)
      return
    }

    if (!formData.contactEmail) {
      setError('Please provide customer email address')
      setLoading(false)
      return
    }

    // Check if affiliate ID is valid (admin-assigned)
    if (!affiliateId || affiliateId === 'Loading...' || affiliateId === 'NOT ASSIGNED') {
      setError('Invalid affiliate ID. Please contact admin to assign an affiliate ID.')
      setLoading(false)
      return
    }

    try {
      // Always use create-referral endpoint - it handles both first time and subsequent referrals
      const response = await fetch('/api/affiliate/create-referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          affiliateId,
          userId: session?.user?.id
        })
      })

      let data
      const contentType = response.headers.get('content-type')

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json()
        } catch {
          data = { error: 'Invalid JSON response from server' }
        }
      } else {
        // If not JSON, it might be HTML (redirect or error page)
        await response.text()
        data = { error: `Server returned ${contentType || 'unknown'} instead of JSON` }
      }

      if (!response.ok) {
        setError(data.error || `Failed to save affiliate details (${response.status})`)
      } else {
        // Extract the referral code and customer ID from the response
        const referralCode = data.affiliateDetails?.referral_code || data.profile?.referral_code
        const customerId = data.referralRecord?.customer_id

        if (referralCode) {
          // Save the latest referral code and customer ID
          setLatestReferralCode(referralCode)
          if (customerId) {
            setLatestCustomerId(customerId)
          }

          // Show success with referral link
          setSuccess(`✅ New referral created successfully!${customerId ? ` Customer ID: ${customerId}` : ''}`)

          // Show toast with referral details including customer ID
          const emailWasSent = data.emailSent && formData.contactEmail
          toast.success(
            <div>
              <p className="font-semibold">🎉 New Referral Created!</p>
              <p className="text-sm mt-1">Referral Code: {referralCode}</p>
              {customerId && <p className="text-sm font-bold text-blue-700">Customer ID: {customerId}</p>}
              {emailWasSent ? (
                <p className="text-sm text-green-600">✅ Email sent to {formData.contactEmail}</p>
              ) : (
                <p className="text-sm text-blue-600">📋 Copy link to share with customer</p>
              )}
            </div>,
            { duration: 5000 }
          )

          // Refresh data after successful referral creation
          // Wait a bit longer to ensure database triggers have completed
          setTimeout(async () => {
            // Refresh affiliate details to get updated referral count
            await fetchAffiliateDetails()
            // Refresh referral details table
            await fetchReferralDetails()
            // Clear the form
            setFormData({
              contactEmail: '',
              contactPerson: '',
              productUrl: 'https://powerca.in/demo',
              websiteUrl: 'https://powerca.in'
            })
            setSuccess('✅ Referral created! Form cleared for next customer.')
          }, 1500)
        } else {
          setSuccess('Referral profile saved successfully!')
          setTimeout(() => {
            router.push('/affiliate/referral-dashboard')
          }, 2000)
        }
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show error if user hasn't applied as affiliate
  if (!session?.user) {
    return null
  }

  if (error && !checkingApproval && approvalStatus === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md">
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button
              onClick={() => router.push('/affiliate-register')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply as Affiliate
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show pending/rejected status page
  if (checkingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking approval status...</p>
        </div>
      </div>
    )
  }

  if (approvalStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
        {/* Top Navigation Bar for Pending Status */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end h-16">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-yellow-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/affiliate-login' })}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Account Pending Approval</h1>
            <p className="text-lg text-gray-600 mb-6">
              Your affiliate application is currently under review by our admin team.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>What's next?</strong><br />
                    Our team will review your application and you'll receive an email notification once approved.
                    This typically takes 1-2 business days.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold text-blue-900 mb-2">After Approval:</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  You'll receive a unique referral code
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Access to your affiliate dashboard
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  Start referring clients and earning commissions
                </li>
              </ul>
            </div>
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>If you have any questions, contact us at <a href="mailto:contact@powerca.in" className="text-blue-600 hover:underline">contact@powerca.in</a></p>
            </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (approvalStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        {/* Top Navigation Bar for Rejected Status */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end h-16">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/affiliate-login' })}
                  className="text-gray-600 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Affiliate Application Not Approved</h1>
            <p className="text-lg text-gray-600 mb-6">
              Unfortunately, your affiliate application was not approved at this time.
            </p>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3 text-left">
                  <p className="text-sm text-red-700">
                    <strong>Why?</strong><br />
                    Our team reviews all applications carefully. Your application may not have met our current criteria.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h3 className="font-semibold text-blue-900 mb-2">What can you do?</h3>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Contact our team at <a href="mailto:contact@powerca.in" className="text-blue-600 hover:underline">contact@powerca.in</a> for feedback</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  You may reapply after addressing any concerns
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Explore other ways to partner with PowerCA
                </li>
              </ul>
            </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Custom styles for 1400x900 resolution */}
      <style jsx>{`
        @media (min-width: 1400px) and (max-width: 1400px) and (min-height: 900px) and (max-height: 900px) {
          .affiliate-container {
            max-width: 1300px !important;
          }
        }
        @media (width: 1400px) and (height: 900px) {
          .affiliate-container {
            max-width: 1300px !important;
          }
        }
      `}</style>
      {/* Main Content */}
      <div className="affiliate-container max-w-[1600px] mx-auto py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-8">
        {/* Header Section - Highlighted Background */}
        <div className="mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-1">Affiliate Referral</h1>
              <p className="text-purple-100 text-xs sm:text-sm">Manage your referrals and track your earnings</p>
            </div>
            <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
              <span className="text-xs text-purple-100 font-medium mr-2">Affiliate ID:</span>
              <span className="text-sm font-bold text-white tracking-wide">{affiliateId}</span>
            </div>
          </div>

          {/* Show referrer information if this affiliate was referred by another affiliate */}
          {referredBy && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-xs text-purple-100">
                <span className="font-medium text-white">Referred by:</span> {referredBy.name} ({referredBy.affiliateId})
              </p>
            </div>
          )}
        </div>

        {/* Two Row Layout */}
        <div className="space-y-4 sm:space-y-6">
          {/* First Row - Affiliate Dashboard Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-purple-100 p-3 sm:p-4 lg:p-6">
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
           {/* Customer Referral Information - Two Column Layout */}
            <div>
              <div className="mb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <div className="h-7 w-7 rounded-md bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-white" />
                  </div>
                  Customer Referral Details
                </h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Side - Customer Name & Email side by side, Create button below */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        placeholder="Enter Name"
                        required
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Customer Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                        placeholder="Enter Email ID"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Create Referral Button */}
                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 sm:px-8 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold text-sm shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Creating...' : 'Create Referral'}
                    </button>
                  </div>
                </div>

                {/* Right Side - Only Referral Link */}
                <div>
                  {latestReferralCode && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 h-full flex flex-col justify-center">
                      <h4 className="text-lg font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                        🔗 {latestCustomerId ? 'Latest Referral Link' : 'Your Referral Link'}
                      </h4>
                      <input
                        type="text"
                        value={latestCustomerId
                          ? `${window.location.origin}/pricing?ref=${latestReferralCode}&cus=${latestCustomerId}`
                          : `${window.location.origin}/pricing?ref=${latestReferralCode}`
                        }
                        readOnly
                        className="w-full px-2 py-1.5 text-[15px] border border-gray-300 rounded bg-white font-mono focus:outline-none"
                      />
                      <p className="text-[9px] text-gray-500 mt-1">
                        {latestCustomerId
                          ? `Customer: ${latestCustomerId}`
                          : 'Share with customers'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Referral Statistics */}
            {referralStatus.referralCount > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                  <h4 className="text-sm font-bold text-green-800 mb-2 flex items-center gap-1">
                    🎉 Referral Statistics
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-2 rounded-lg text-center border border-blue-200">
                      <p className="text-lg font-black text-blue-600">{referralStatus.referralCount}</p>
                      <p className="text-[10px] font-medium text-gray-600">Total</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg text-center border border-yellow-200">
                      <p className="text-lg font-black text-yellow-600">{referralStatus.pendingCount}</p>
                      <p className="text-[10px] font-medium text-gray-600">Pending</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg text-center border border-green-200">
                      <p className="text-lg font-black text-green-600">{referralStatus.completedCount}</p>
                      <p className="text-[10px] font-medium text-gray-600">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
          </div>

          {/* Second Row - Referral Details Table */}
          {referralDetails.length > 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-indigo-100 p-3 sm:p-4 lg:p-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <div className="mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">Referral Details</h2>
              </div>
            </div>

            {/* Summary Cards */}
            {referralSummary && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-2 sm:p-3 rounded-lg border border-blue-200">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">Total Referrals</p>
                  <p className="text-lg sm:text-2xl font-black text-blue-600">{referralSummary.total_referrals}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-2 sm:p-3 rounded-lg border border-green-200">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">Paid</p>
                  <p className="text-lg sm:text-2xl font-black text-green-600">{referralSummary.paid_referrals}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-2 sm:p-3 rounded-lg border border-purple-200">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">Total Commission</p>
                  <p className="text-base sm:text-xl font-black text-purple-600">₹{referralSummary.total_commission_earned}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-2 sm:p-3 rounded-lg border border-orange-200">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5">Pending</p>
                  <p className="text-base sm:text-xl font-black text-orange-600">₹{referralSummary.pending_commission}</p>
                </div>
              </div>
            )}

            {/* Referral Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 -mx-3 sm:mx-0">
              {loadingDetails ? (
                <div className="text-center py-6 bg-gray-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="mt-2 text-xs text-gray-600 font-medium">Loading...</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-100 to-blue-100 border-b-2 border-purple-200">
                      <th className="min-w-[120px] sm:min-w-[150px] px-3 sm:px-5 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-bold text-gray-800 whitespace-nowrap">Customer ID</th>
                      <th className="min-w-[200px] sm:min-w-[250px] px-3 sm:px-5 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-bold text-gray-800 whitespace-nowrap">Customer Details</th>
                      <th className="min-w-[120px] sm:min-w-[150px] px-3 sm:px-5 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-bold text-gray-800 whitespace-nowrap">Date</th>
                      <th className="min-w-[120px] sm:min-w-[150px] px-3 sm:px-5 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-bold text-gray-800 whitespace-nowrap">Payment Status</th>
                      <th className="min-w-[120px] sm:min-w-[150px] px-3 sm:px-5 py-3 sm:py-4 text-right text-[10px] sm:text-xs font-bold text-gray-800 whitespace-nowrap">Payment Amount</th>
                      <th className="min-w-[140px] sm:min-w-[180px] px-3 sm:px-5 py-3 sm:py-4 text-right text-[10px] sm:text-xs font-bold text-gray-800 whitespace-nowrap">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {(() => {
                      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
                      const endIndex = startIndex + ITEMS_PER_PAGE
                      const paginatedReferrals = referralDetails.slice(startIndex, endIndex)

                      return paginatedReferrals.map((referral) => (
                        <tr key={referral.id} className="hover:bg-purple-50/50 transition-colors">
                          <td className="min-w-[120px] sm:min-w-[150px] px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                            <span className="font-mono text-[11px] sm:text-[13px] font-bold text-blue-700 bg-blue-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                              {referral.customer_id || 'N/A'}
                            </span>
                          </td>
                          <td className="min-w-[200px] sm:min-w-[250px] px-3 sm:px-5 py-3 sm:py-4">
                            <div className="text-[11px] sm:text-[13px]">
                              <p className="font-bold text-gray-900 truncate max-w-[150px] sm:max-w-none">{referral.referred_name || 'N/A'}</p>
                              <p className="text-gray-600 font-medium truncate max-w-[150px] sm:max-w-none">{referral.referred_email}</p>
                              {referral.referred_phone && (
                                <p className="text-gray-500 text-[10px] sm:text-xs mt-1">{referral.referred_phone}</p>
                              )}
                            </div>
                          </td>
                          <td className="min-w-[120px] sm:min-w-[150px] px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-[11px] sm:text-[13px] font-semibold text-gray-700">
                              {new Date(referral.created_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="min-w-[120px] sm:min-w-[150px] px-3 sm:px-5 py-3 sm:py-4 whitespace-nowrap">
                            {referral.payment_info ? (
                              <span
                                className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-[13px] font-bold shadow-sm ${
                                  referral.payment_info.payment_status === 'completed'
                                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-300'
                                    : referral.payment_info.payment_status === 'pending'
                                    ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-300'
                                    : 'bg-gray-100 text-gray-800 border border-gray-300'
                                }`}
                              >
                                {referral.payment_info.payment_status === 'completed' ? '✓ Paid' : 'Pending'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-[13px] font-bold bg-gray-100 text-gray-800 border border-gray-300 shadow-sm">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="min-w-[120px] sm:min-w-[150px] px-3 sm:px-5 py-3 sm:py-4 text-right whitespace-nowrap">
                            <div className="text-[11px] sm:text-[13px] font-bold text-gray-900">
                              {referral.payment_info
                                ? `₹${parseFloat(referral.payment_info.payment_amount || '0').toFixed(2)}`
                                : '-'}
                            </div>
                          </td>
                          <td className="min-w-[140px] sm:min-w-[180px] px-3 sm:px-5 py-3 sm:py-4 text-right whitespace-nowrap">
                            <div className="text-[11px] sm:text-[13px]">
                              {referral.payment_info && referral.payment_info.payment_status === 'completed' ? (
                                <>
                                  <p className="font-black text-green-700 text-[13px] sm:text-sm mb-1">
                                    ₹{parseFloat(referral.payment_info.commission_amount || '0').toFixed(2)}
                                  </p>
                                  {referral.payment_info.commission_paid ? (
                                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-green-100 text-green-700 border border-green-300">✓ Paid</span>
                                  ) : (
                                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">Pending</span>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400 font-medium">-</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    })()}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {!loadingDetails && referralDetails.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-4 sm:px-0">
                {/* Results Info */}
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Showing <span className="font-semibold text-gray-900">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to{' '}
                  <span className="font-semibold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, referralDetails.length)}</span> of{' '}
                  <span className="font-semibold text-gray-900">{referralDetails.length}</span> referrals
                </div>

                {/* Pagination Buttons - Only show if more than one page */}
                {referralDetails.length > ITEMS_PER_PAGE && (
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-500'
                      }`}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalPages = Math.ceil(referralDetails.length / ITEMS_PER_PAGE)
                        const pages = []
                        const maxVisiblePages = 5

                        if (totalPages <= maxVisiblePages) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(i)
                          }
                        } else {
                          if (currentPage <= 3) {
                            for (let i = 1; i <= 4; i++) {
                              pages.push(i)
                            }
                            pages.push('...')
                            pages.push(totalPages)
                          } else if (currentPage >= totalPages - 2) {
                            pages.push(1)
                            pages.push('...')
                            for (let i = totalPages - 3; i <= totalPages; i++) {
                              pages.push(i)
                            }
                          } else {
                            pages.push(1)
                            pages.push('...')
                            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                              pages.push(i)
                            }
                            pages.push('...')
                            pages.push(totalPages)
                          }
                        }

                        return pages.map((page, index) => (
                          page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400">
                              ...
                            </span>
                          ) : (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page as number)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-sm font-bold transition-all ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                  : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-500'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        ))
                      })()}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(referralDetails.length / ITEMS_PER_PAGE)))}
                      disabled={currentPage === Math.ceil(referralDetails.length / ITEMS_PER_PAGE)}
                      className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                        currentPage === Math.ceil(referralDetails.length / ITEMS_PER_PAGE)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-500'
                      }`}
                      aria-label="Next page"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {referralDetails.length === 0 && !loadingDetails && (
              <div className="text-center py-8 text-gray-500">
                <p>No referrals yet. Create your first referral above!</p>
              </div>
            )}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-indigo-100 p-6 flex items-center justify-center min-h-[200px]">
              <div className="text-center">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">No Referrals Yet</h3>
                <p className="text-sm text-gray-600">Create your first referral to see details here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
