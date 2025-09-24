'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  TrendingUp,
  User,
  Calendar,
  Mail
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AffiliateReferralDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [referralData, setReferralData] = useState<any>(null)
  const [affiliateProfile, setAffiliateProfile] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/login')
      return
    }

    if (session.user.role !== 'Affiliate' && session.user.role !== 'affiliate') {
      router.push('/')
      return
    }

    fetchReferralData()
  }, [session, status, router])

  const fetchReferralData = async () => {
    try {
      setLoading(true)

      // Fetch referral status
      const response = await fetch('/api/affiliate/referral-status')
      if (response.ok) {
        const data = await response.json()
        setReferralData(data)
        setAffiliateProfile(data.affiliateProfile)
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/pricing?ref=${affiliateProfile?.referral_code}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const canRefer = referralData?.canRefer
  const hasReferred = referralData?.hasReferred
  const referralLink = affiliateProfile?.referral_code
    ? `${window.location.origin}/pricing?ref=${affiliateProfile.referral_code}`
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Referral Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your referral status and performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Referral Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hasReferred ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    Completed
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Available
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {hasReferred ? 'You have made your referral' : 'You can make 1 referral'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralData?.referralCount || 0}/1</div>
              <p className="text-sm text-gray-600 mt-1">Maximum allowed: 1</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Profile Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize text-green-600">
                {affiliateProfile?.status || 'Active'}
              </div>
              <p className="text-sm text-gray-600 mt-1">Your account is active</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Section */}
        {!hasReferred && affiliateProfile?.referral_code && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>
                Share this link with the person you want to refer. You can only refer one person.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={referralLink || ''}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <Button onClick={copyReferralLink} variant="outline">
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => window.open(referralLink, '_blank')}
                  variant="outline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open
                </Button>
              </div>

              <Alert className="mt-4 bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Important:</strong> You can only refer one person. Once they complete their payment,
                  your referral will be marked as complete and you won't be able to refer anyone else.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Referral Details */}
        {hasReferred && referralData?.referredDetails && (
          <Card>
            <CardHeader>
              <CardTitle>Referral Details</CardTitle>
              <CardDescription>Information about your completed referral</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Referral Successfully Completed
                    </h3>
                    <p className="text-sm text-green-700">
                      You have successfully referred one person
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Referred:</span>
                    <span className="text-sm font-medium">
                      {referralData.referredDetails.referred_name || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium">
                      {referralData.referredDetails.referred_email || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(
                        referralData.referredDetails.converted_at ||
                        referralData.referredDetails.created_at
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className="text-sm font-medium text-green-600">Converted</span>
                  </div>
                </div>

                {referralData.referredDetails.payment && (
                  <div className="mt-4 pt-4 border-t border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Payment Information:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Payment ID:</span>
                        <span className="ml-2 font-mono text-xs">
                          {referralData.referredDetails.payment.payment_id}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Amount:</span>
                        <span className="ml-2 font-medium">
                          ₹{referralData.referredDetails.payment.payment_amount}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  You have completed your one allowed referral. As per our policy, each affiliate
                  can only refer one person. Thank you for your contribution!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* No Profile Message */}
        {!affiliateProfile && (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Complete Your Profile First</h3>
                <p className="text-gray-600 mb-4">
                  You need to complete your affiliate profile before you can start referring.
                </p>
                <Button onClick={() => router.push('/affiliate/account')}>
                  Complete Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}