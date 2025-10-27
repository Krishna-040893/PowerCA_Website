'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useRouter  } from 'next/navigation'
import {useSession, signOut  } from 'next-auth/react'
import {Building2, Globe, Link, User, Save, AlertCircle, Clock, XCircle, LogOut, Copy  } from 'lucide-react'
import {Alert, AlertDescription  } from '@/components/ui/alert'
import {toast  } from 'sonner'
import {Button  } from '@/components/ui/button'
import ProfilePhotoUpload from '@/components/profile-photo-upload'

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
  const [currentProfilePhotoUrl, setCurrentProfilePhotoUrl] = useState<string | null>(null)

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
    fetchProfilePhoto()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router])

  const fetchProfilePhoto = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/user/profile-photo')
      if (response.ok) {
        const data = await response.json()
        setCurrentProfilePhotoUrl(data.photoUrl)
      }
    } catch (error) {
      console.error('Error fetching profile photo:', error)
    }
  }

  const handleProfilePhotoUpdate = (newUrl: string) => {
    setCurrentProfilePhotoUrl(newUrl)
  }

  const handleProfilePhotoDelete = () => {
    setCurrentProfilePhotoUrl(null)
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
              <p>If you have any questions, contact us at <a href="mailto:affiliates@powerca.in" className="text-blue-600 hover:underline">contact@powerca.in</a></p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section - Enhanced */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEyYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMTIgMTJjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
          <div className="relative px-6 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Profile Photo */}

                <div className="text-white">
                  <h1 className="text-3xl md:text-4xl font-bold mb-1">Affiliate Referral</h1>
                  <p className="text-blue-100 text-sm">Manage your referrals and track your earnings</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="bg-white/20 backdrop-blur-md border-2 border-white/30 px-8 py-6 rounded-2xl shadow-2xl">
                  <p className="text-sm text-blue-100 mb-1 font-medium">Your Affiliate ID</p>
                  <p className="text-2xl font-black text-white tracking-wider">{affiliateId}</p>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Two Row Layout */}
        <div className="space-y-8">
          {/* First Row - Affiliate Dashboard Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-purple-100 p-8">
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200 rounded-xl">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200 rounded-xl">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* User Information (Read-only) */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Affiliate Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg">
                  <span className="text-xs text-gray-500 font-medium">Name</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{session.user.name}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg">
                  <span className="text-xs text-gray-500 font-medium">Email</span>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{session.user.email}</p>
                </div>
              </div>

              {/* Show referrer information if this affiliate was referred by another affiliate */}
              {referredBy && (
                <div className="mt-6 pt-4 border-t-2 border-purple-200">
                  <h4 className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
                    👥 Referred By
                  </h4>
                  <div className="bg-gradient-to-br from-purple-100 to-indigo-100 p-4 rounded-xl border-2 border-purple-300 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white/80 p-2 rounded-lg">
                        <span className="text-xs text-gray-500">Affiliate Name</span>
                        <p className="font-bold text-purple-700">{referredBy.name}</p>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg">
                        <span className="text-xs text-gray-500">Affiliate ID</span>
                        <p className="font-mono font-bold text-purple-700">{referredBy.affiliateId}</p>
                      </div>
                      <div className="bg-white/80 p-2 rounded-lg md:col-span-2">
                        <span className="text-xs text-gray-500">Email</span>
                        <p className="font-semibold text-purple-700">{referredBy.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-purple-700 mt-3 bg-white/50 p-2 rounded-lg">
                      💡 You joined PowerCA Affiliate Program through {referredBy.name}'s referral
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Default URLs (Read-only) */}


            {/* Customer Referral Information */}
            <div className="border-t-2 border-gray-200 pt-8">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  Customer Referral Details
                </h3>
                {/* <p className="text-sm text-gray-600 ml-10">Enter the details of the customer you are referring to PowerCA</p> */}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Customer Full Name"
                    required
                    disabled={loading}
                  />
                  {/* <p className="text-xs text-gray-500 mt-2 ml-1">
                    Enter the full name of the customer you're referring
                  </p> */}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="customer@example.com"
                    required
                    disabled={loading}
                  />
                  {/* <p className="text-xs text-gray-500 mt-2 ml-1">
                    Referral link will be sent automatically to this email address
                  </p> */}
                </div>
              </div>
            </div>

            {/* Referral Statistics */}
            <div className="border-t-2 border-gray-200">
              {referralStatus.referralCount > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-sm">
                  <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                    🎉 Referral Statistics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-white p-5 rounded-xl text-center border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-3xl font-black text-blue-600 mb-1">{referralStatus.referralCount}</p>
                      <p className="text-sm font-semibold text-gray-600">Total Referrals</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl text-center border-2 border-yellow-200 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-3xl font-black text-yellow-600 mb-1">{referralStatus.pendingCount}</p>
                      <p className="text-sm font-semibold text-gray-600">Pending</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl text-center border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
                      <p className="text-3xl font-black text-green-600 mb-1">{referralStatus.completedCount}</p>
                      <p className="text-sm font-semibold text-gray-600">Completed</p>
                    </div>
                  </div>
                  <div className="bg-green-100/70 p-3 rounded-xl">
                    <p className="text-sm text-green-800 font-medium">
                      💡 Each referral gets a unique customer ID. Click "Create Referral" to generate a new referral link for your next customer.
                    </p>
                  </div>
                </div>
              )}

              {/* Always show referral link if we have a code */}
              {latestReferralCode && (
                <div className="mt-6 bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-md">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🔗 {latestCustomerId ? 'Latest Customer Referral Link' : 'Your Referral Link'}
                  </h4>
                  <input
                    type="text"
                    value={latestCustomerId
                      ? `${window.location.origin}/pricing?ref=${latestReferralCode}&cus=${latestCustomerId}`
                      : `${window.location.origin}/pricing?ref=${latestReferralCode}`
                    }
                    readOnly
                    className="w-full px-4 py-3 text-sm border-2 border-gray-300 rounded-xl bg-gray-50 font-mono focus:outline-none shadow-sm"
                  />
                  {latestCustomerId ? (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>This link is for your latest customer ({latestCustomerId}). Create a new referral above for the next customer.</span>
                      </p>
                      <p className="text-sm text-gray-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>Your referral code stays the same for all customers. Each customer gets a unique ID.</span>
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-gray-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>Share this link with your customers. Each referral will be tracked automatically.</span>
                      </p>
                      <p className="text-sm text-gray-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>Your referral code stays the same for all customers. Each customer gets a unique ID.</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                <Save className="w-5 h-5" />
                {loading
                  ? 'Creating Referral...'
                  : 'Create Referral'
                }
              </button>
            </div>
          </form>
          </div>

          {/* Right Column - Referral Details Table */}
          {referralDetails.length > 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-indigo-100 p-8 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Referral Details</h2>
              </div>
              {/* <p className="text-gray-600 ml-13">Track all your referrals, payment status, and commission earnings</p> */}
            </div>

            {/* Summary Cards */}
            {referralSummary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Total Referrals</p>
                  <p className="text-4xl font-black text-blue-600">{referralSummary.total_referrals}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Paid Customers</p>
                  <p className="text-4xl font-black text-green-600">{referralSummary.paid_referrals}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Total Commission</p>
                  <p className="text-3xl font-black text-purple-600">₹{referralSummary.total_commission_earned}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200 shadow-md hover:shadow-lg transition-shadow">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Pending Commission</p>
                  <p className="text-3xl font-black text-orange-600">₹{referralSummary.pending_commission}</p>
                </div>
              </div>
            )}

            {/* Referral Table */}
            <div className="overflow-x-auto rounded-2xl border-2 border-gray-200 shadow-inner">
              {loadingDetails ? (
                <div className="text-center py-12 bg-gray-50">
                  <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-purple-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-semibold">Loading referral details...</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-100 to-blue-100 border-b-2 border-purple-200">
                      <th className="min-w-[150px] px-5 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap">Customer ID</th>
                      <th className="min-w-[250px] px-5 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap">Customer Details</th>
                      <th className="min-w-[150px] px-5 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap">Date</th>
                      <th className="min-w-[150px] px-5 py-4 text-left text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap">Payment Status</th>
                      <th className="min-w-[150px] px-5 py-4 text-right text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap">Payment Amount</th>
                      <th className="min-w-[180px] px-5 py-4 text-right text-xs font-bold text-gray-800 uppercase tracking-wider whitespace-nowrap">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {referralDetails.map((referral) => (
                      <tr key={referral.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="min-w-[150px] px-5 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                            {referral.customer_id || 'N/A'}
                          </span>
                        </td>
                        <td className="min-w-[250px] px-5 py-4">
                          <div className="text-sm">
                            <p className="font-bold text-gray-900">{referral.referred_name || 'N/A'}</p>
                            <p className="text-gray-600 font-medium">{referral.referred_email}</p>
                            {referral.referred_phone && (
                              <p className="text-gray-500 text-xs mt-1">{referral.referred_phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="min-w-[150px] px-5 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-700">
                            {new Date(referral.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="min-w-[150px] px-5 py-4 whitespace-nowrap">
                          {referral.payment_info ? (
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
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
                            <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300 shadow-sm">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="min-w-[150px] px-5 py-4 text-right whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {referral.payment_info
                              ? `₹${parseFloat(referral.payment_info.payment_amount || '0').toFixed(2)}`
                              : '-'}
                          </div>
                        </td>
                        <td className="min-w-[180px] px-5 py-4 text-right whitespace-nowrap">
                          <div className="text-sm">
                            {referral.payment_info && referral.payment_info.payment_status === 'completed' ? (
                              <>
                                <p className="font-black text-green-700 text-base mb-1">
                                  ₹{parseFloat(referral.payment_info.commission_amount || '0').toFixed(2)}
                                </p>
                                {referral.payment_info.commission_paid ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-300">✓ Paid</span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">Pending</span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 font-medium">-</span>
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
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-indigo-100 p-8 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-10 w-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Referrals Yet</h3>
                <p className="text-gray-600">Create your first referral using the form to see your referral details here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}