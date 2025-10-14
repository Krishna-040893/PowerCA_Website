'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useRouter  } from 'next/navigation'
import {useSession, signOut  } from 'next-auth/react'
import {Building2, Globe, Link, User, MapPin, Save, AlertCircle, Clock, XCircle, LogOut, ChevronDown  } from 'lucide-react'
import {Alert, AlertDescription  } from '@/components/ui/alert'
import {AffiliateApplication  } from '@/types/common'
import {toast  } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {Button  } from '@/components/ui/button'

export default function AffiliateAccountPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [affiliateId, setAffiliateId] = useState('Loading...')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [existingDetails, setExistingDetails] = useState<AffiliateApplication | null>(null)
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
  const [referralDetails, setReferralDetails] = useState<any[]>([])
  const [referralSummary, setReferralSummary] = useState<any>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [referredBy, setReferredBy] = useState<{
    name: string
    email: string
    affiliateId: string
    referralCode: string
  } | null>(null)

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
    console.log('🔍 [Client] Current session:', {
      userName: session?.user?.name,
      userEmail: session?.user?.email,
      userRole: session?.user?.role
    })

    try {
      // First, check affiliate approval status
      const approvalResponse = await fetch('/api/affiliate/approval-status')
      if (approvalResponse.ok) {
        const approvalData = await approvalResponse.json()

        console.log('🔍 [Client] Approval data received:', approvalData)

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

          // If profile exists, save it but don't populate the form
          if (data.profile) {
            setExistingDetails(data.profile)
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
  }, [session])

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
  }, [session, status, router, fetchAffiliateDetails])

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
              onClick={() => router.push('/affiliate-program/register')}
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
              <p>If you have any questions, contact us at <a href="mailto:affiliates@powerca.in" className="text-blue-600 hover:underline">affiliates@powerca.in</a></p>
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
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Contact our team at <a href="mailto:affiliates@powerca.in" className="text-blue-600 hover:underline">affiliates@powerca.in</a> for feedback
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end h-16">
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session?.user?.name}</p>
                    <p className="text-xs text-gray-500">{session?.user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/affiliate/account')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/affiliate/dashboard')}>
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/affiliate-login' })}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Affiliate Account</h1>
                <p className="text-gray-600">Complete your affiliate profile to get started</p>
              </div>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-600">Your Affiliate ID</p>
              <p className="text-lg font-bold text-blue-600">{affiliateId}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User Information (Read-only) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Affiliate Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{session.user.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium">{session.user.email}</span>
                </div>
              </div>

              {/* Show referrer information if this affiliate was referred by another affiliate */}
              {referredBy && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2">👥 Referred By</h4>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600">Affiliate Name:</span>
                        <span className="ml-2 font-semibold text-purple-700">{referredBy.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Affiliate ID:</span>
                        <span className="ml-2 font-mono font-semibold text-purple-700">{referredBy.affiliateId}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-medium text-purple-700">{referredBy.email}</span>
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 mt-2">
                      💡 You joined PowerCA Affiliate Program through {referredBy.name}'s referral
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Default URLs (Read-only) */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Link className="inline-block w-4 h-4 mr-1" />
                  Product URL (Demo)
                </label>
                <input
                  type="text"
                  value={formData.productUrl}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline-block w-4 h-4 mr-1" />
                  Website URL
                </label>
                <input
                  type="text"
                  value={formData.websiteUrl}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>

            {/* Customer Referral Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Customer Referral Details</h3>
              <p className="text-sm text-gray-600 mb-4">Enter the details of the customer you are referring to PowerCA</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Customer Full Name"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the full name of the customer you're referring
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="customer@example.com"
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Referral link will be sent automatically to this email address
                  </p>
                </div>
              </div>
            </div>

            {/* Referral Statistics */}
            <div className="border-t pt-6">
              {referralStatus.referralCount > 0 && (
                <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-green-800 mb-3">🎉 Referral Statistics</h4>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">{referralStatus.referralCount}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-yellow-600">{referralStatus.pendingCount}</p>
                      <p className="text-xs text-gray-600">Pending</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">{referralStatus.completedCount}</p>
                      <p className="text-xs text-gray-600">Completed</p>
                    </div>
                  </div>
                  <p className="text-xs text-green-700">
                    💡 Each referral gets a unique customer ID. Click "Create Referral" to generate a new referral link for your next customer.
                  </p>
                </div>
              )}

              {/* Always show referral link if we have a code */}
              {latestReferralCode && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                    🔗 {latestCustomerId ? 'Latest Customer Referral Link' : 'Your Referral Link'}
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={latestCustomerId
                        ? `${window.location.origin}/pricing?ref=${latestReferralCode}&cus=${latestCustomerId}`
                        : `${window.location.origin}/pricing?ref=${latestReferralCode}`
                      }
                      readOnly
                      className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded bg-white font-mono"
                    />
                    <button
                      onClick={async () => {
                        const { copyToClipboard } = await import('@/lib/browser-compat')
                        const referralLink = latestCustomerId
                          ? `${window.location.origin}/pricing?ref=${latestReferralCode}&cus=${latestCustomerId}`
                          : `${window.location.origin}/pricing?ref=${latestReferralCode}`
                        const success = await copyToClipboard(referralLink)
                        if (success) {
                          toast.success('Referral link copied to clipboard!')
                        } else {
                          toast.error('Failed to copy. Please manually copy the link.')
                        }
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="mt-2 text-xs space-y-1">
                    <p className="text-blue-700 font-medium">
                      Referral Code: <span className="font-bold">{latestReferralCode}</span>
                      {latestCustomerId && (
                        <span className="ml-2 text-green-700">
                          | Customer ID: <span className="font-bold">{latestCustomerId}</span>
                        </span>
                      )}
                    </p>
                  </div>
                  {latestCustomerId ? (
                    <p className="text-xs text-green-700 mt-2 font-medium">
                      ✅ This link is for your latest customer ({latestCustomerId}). Create a new referral above for the next customer.
                    </p>
                  ) : (
                    <p className="text-xs text-yellow-700 mt-2">
                      Share this link with your customers. Each referral will be tracked automatically.
                    </p>
                  )}
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Your referral code ({latestReferralCode}) stays the same for all customers. Each customer gets a unique ID.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading
                  ? 'Saving...'
                  : 'Create Referral'
                }
              </button>
            </div>
          </form>
        </div>

        {/* Referral Details Table */}
        {referralDetails.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Referral Details</h2>
              <p className="text-gray-600">Track all your referrals, payment status, and commission earnings</p>
            </div>

            {/* Summary Cards */}
            {referralSummary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                  <p className="text-2xl font-bold text-blue-600">{referralSummary.total_referrals}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Paid Customers</p>
                  <p className="text-2xl font-bold text-green-600">{referralSummary.paid_referrals}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Total Commission</p>
                  <p className="text-2xl font-bold text-purple-600">₹{referralSummary.total_commission_earned}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                  <p className="text-sm text-gray-600 mb-1">Pending Commission</p>
                  <p className="text-2xl font-bold text-orange-600">₹{referralSummary.pending_commission}</p>
                </div>
              </div>
            )}

            {/* Referral Table */}
            <div className="overflow-x-auto">
              {loadingDetails ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading referral details...</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer Details</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Payment Amount</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {referralDetails.map((referral) => (
                      <tr key={referral.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-semibold text-blue-600">
                            {referral.customer_id || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">{referral.referred_name || 'N/A'}</p>
                            <p className="text-gray-500">{referral.referred_email}</p>
                            {referral.referred_phone && (
                              <p className="text-gray-400 text-xs">{referral.referred_phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-600">
                            {new Date(referral.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {referral.payment_info ? (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                referral.payment_info.payment_status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : referral.payment_info.payment_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {referral.payment_info.payment_status === 'completed' ? '✓ Paid' : '⏳ Pending'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              ⏳ Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {referral.payment_info
                              ? `₹${parseFloat(referral.payment_info.payment_amount || '0').toFixed(2)}`
                              : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-sm">
                            {referral.payment_info && referral.payment_info.payment_status === 'completed' ? (
                              <>
                                <p className="font-semibold text-green-600">
                                  ₹{parseFloat(referral.payment_info.commission_amount || '0').toFixed(2)}
                                </p>
                                {referral.payment_info.commission_paid ? (
                                  <span className="text-xs text-green-500">✓ Paid</span>
                                ) : (
                                  <span className="text-xs text-orange-500">⏳ Pending</span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {referralDetails.length === 0 && !loadingDetails && (
              <div className="text-center py-8 text-gray-500">
                <p>No referrals yet. Create your first referral above!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}