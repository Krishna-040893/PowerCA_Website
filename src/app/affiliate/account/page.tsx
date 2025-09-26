'use client'

import {useState, useEffect  } from 'react'
import {useRouter  } from 'next/navigation'
import {useSession  } from 'next-auth/react'
import {Building2, Globe, Link, User, MapPin, Save, AlertCircle  } from 'lucide-react'
import {Alert, AlertDescription  } from '@/components/ui/alert'
import {AffiliateApplication  } from '@/types/common'
import {toast  } from 'sonner'

export default function AffiliateAccountPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [affiliateId, setAffiliateId] = useState('Loading...')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [existingDetails, setExistingDetails] = useState<AffiliateApplication | null>(null)
  const [latestReferralCode, setLatestReferralCode] = useState<string>('')
  const [referralStatus, setReferralStatus] = useState<{
    hasReferred: boolean
    referralCount: number
    referredDetails: { name?: string; email?: string; phone?: string } | null
  }>({ hasReferred: false, referralCount: 0, referredDetails: null })

  const [formData, setFormData] = useState({
    firmName: '',
    firmAddress: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    productUrl: 'https://powerca.in/demo',
    websiteUrl: 'https://powerca.in'
  })

  useEffect(() => {
    if (status === 'loading') return

    // Check if user is logged in and is an affiliate
    if (!session?.user) {
      router.push('/auth/login')
      return
    }

    // Check if user has affiliate role
    if (session.user.role !== 'Affiliate' && session.user.role !== 'affiliate') {
      setError('Access denied. This page is only for affiliate users.')
      return
    }

    // Fetch existing affiliate details
    fetchAffiliateDetails()
  }, [session, status, router])

  const fetchAffiliateDetails = async () => {
    try {
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

          // If profile exists, save it but don't populate the form
          if (data.profile) {
            setExistingDetails(data.profile)
            // Save the latest referral code
            if (data.profile.referral_code) {
              setLatestReferralCode(data.profile.referral_code)
            }
            // Keep form empty for new referrals
            setFormData({
              firmName: '',
              firmAddress: '',
              contactPerson: '',
              contactEmail: '',
              contactPhone: '',
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validate required fields
    if (!formData.firmName || !formData.firmAddress) {
      setError('Please fill in all required fields (Firm Name and Address)')
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
      // Use create-referral endpoint for multiple referral creation
      const endpoint = existingDetails
        ? '/api/affiliate/create-referral' // Create new referral even if one exists
        : '/api/affiliate/details' // First time creation

      const response = await fetch(endpoint, {
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
        const _text = await response.text()
        data = { error: `Server returned ${contentType || 'unknown'} instead of JSON` }
      }

      if (!response.ok) {
        setError(data.error || `Failed to save affiliate details (${response.status})`)
      } else {
        // Extract the referral code from the response
        const referralCode = data.affiliateDetails?.referral_code || data.profile?.referral_code

        if (referralCode) {
          // Save the latest referral code
          setLatestReferralCode(referralCode)

          // Generate the referral link
          const _referralLink = `${window.location.origin}/pricing?ref=${referralCode}`

          // Show success with referral link
          setSuccess(`✅ New referral created successfully!`)

          // Show toast with referral details
          toast.success(
            <div>
              <p className="font-semibold">🎉 New Referral Created!</p>
              <p className="text-sm mt-1">Referral Code: {referralCode}</p>
              <p className="text-sm">Share the link with your customer</p>
            </div>,
            { duration: 5000 }
          )

          // Refresh the page to clear all fields
          setTimeout(() => {
            window.location.reload()
          }, 1000)
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

  if (!session?.user || (session.user.role !== 'Affiliate' && session.user.role !== 'affiliate')) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'You need to be an affiliate to access this page.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
              <p className="text-sm text-gray-600 mb-4">Enter details of the customer you are referring to PowerCA</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 className="inline-block w-4 h-4 mr-1" />
                    Customer's Firm Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firmName}
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer's firm name"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline-block w-4 h-4 mr-1" />
                    Customer's Firm Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.firmAddress}
                    onChange={(e) => setFormData({ ...formData, firmAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer's firm address"
                    rows={3}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline-block w-4 h-4 mr-1" />
                    Customer Contact Person (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter customer's contact person name"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="customer@example.com"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Affiliate ID Display & Referral Status */}
            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Your Affiliate ID</p>
                  <p className="text-2xl font-bold text-blue-600">{affiliateId}</p>
                  <p className="text-xs text-gray-500 mt-2">Admin assigned ID</p>
                </div>

                <div className={`p-4 rounded-lg text-center ${
                  referralStatus.hasReferred
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-gray-50 border-2 border-gray-200'
                }`}>
                  <p className="text-sm text-gray-600 mb-1">Referral Status</p>
                  <p className="text-2xl font-bold">
                    {referralStatus.hasReferred ? (
                      <span className="text-green-600">✅ Completed</span>
                    ) : (
                      <span className="text-gray-600">Pending</span>
                    )}
                  </p>
                  <p className="text-xs mt-2">
                    {referralStatus.hasReferred
                      ? `You have made ${referralStatus.referralCount} referral(s)`
                      : 'Complete details to create referral link'
                    }
                  </p>
                </div>
              </div>

              {referralStatus.referralCount > 0 && (
                <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">🎉 Active Referrals</h4>
                  <div className="text-sm text-green-700">
                    <p>Total Referrals: {referralStatus.referralCount}</p>
                    <p className="mt-2">You can create multiple referral links for different customers.</p>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    Click "Create Referral" to generate a new referral link.
                  </p>
                </div>
              )}

              {/* Always show referral link if we have a code */}
              {latestReferralCode && (
                <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">🔗 Latest Referral Link</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/pricing?ref=${latestReferralCode}`}
                      readOnly
                      className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded bg-white"
                    />
                    <button
                      onClick={async () => {
                        const { copyToClipboard } = await import('@/lib/browser-compat')
                        const referralLink = `${window.location.origin}/pricing?ref=${latestReferralCode}`
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
                  <p className="text-xs text-yellow-700 mt-2">
                    Share this link with your customer. When they make a payment using this link, the referral will be marked as converted.
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    To test: Open this link in a new browser/incognito window and proceed with payment.
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
      </div>
    </div>
  )
}