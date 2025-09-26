'use client'

import {useEffect, useState, useCallback  } from 'react'
import {useSession  } from 'next-auth/react'
import {useRouter  } from 'next/navigation'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Button  } from '@/components/ui/button'
import {Badge  } from '@/components/ui/badge'
import {AffiliateReferral  } from '@/types/common'
import { Users, DollarSign, TrendingUp,
  Copy, CheckCircle, Clock,
  Building2
 } from 'lucide-react'
import {Alert, AlertDescription  } from '@/components/ui/alert'

export default function AffiliateDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [affiliateData, setAffiliateData] = useState<{
    code?: string;
    status?: string;
    commissionRate?: number;
    totalEarned?: number;
    referrals?: AffiliateReferral[];
    affiliateDetails?: {
      referral_code?: string;
      total_referrals?: number;
      successful_referrals?: number;
      pending_referrals?: number;
      total_commission?: number;
      pending_commission?: number;
      paid_commission?: number;
      firm_name?: string;
      commission_rate?: number;
    };
    affiliateId?: string;
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const fetchAffiliateData = useCallback(async () => {
    try {
      // Use the user-info API to get complete affiliate data
      const response = await fetch('/api/affiliate/user-info')
      if (response.ok) {
        const data = await response.json()

        if (data.success) {
          // Store complete affiliate data including the ID
          const completeData = {
            ...data,
            affiliateId: data.affiliateId || data.user?.affiliate_id || data.profile?.affiliate_id,
            affiliateDetails: data.profile
          }
          setAffiliateData(completeData)

          // If affiliate needs setup, redirect to account page
          if (data.needsSetup) {
            router.push('/affiliate/account')
            return
          }
        }
      }

      // Also fetch referrals data
      const referralsResponse = await fetch('/api/affiliate/referrals')
      if (referralsResponse.ok) {
        const referralsData = await referralsResponse.json()
        if (referralsData.success) {
          setAffiliateData((prev) => ({
            ...prev,
            referrals: referralsData.referrals || []
          }))
        }
      }
    } catch {
      // Error logging removed
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/login')
      return
    }

    // Check if user is an affiliate
    if (session.user.role !== 'Affiliate' && session.user.role !== 'affiliate') {
      router.push('/dashboard')
      return
    }

    fetchAffiliateData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, fetchAffiliateData])

  const copyReferralLink = async () => {
    const referralLink = `https://powerca.in?ref=${affiliateData?.affiliateDetails?.referral_code || affiliateData?.affiliateId}`
    const { copyToClipboard } = await import('@/lib/browser-compat')
    const success = await copyToClipboard(referralLink)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } else {
      // Show fallback message if copy failed
      alert('Please manually copy the link: ' + referralLink)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const stats = {
    totalReferrals: affiliateData?.affiliateDetails?.total_referrals || 0,
    successfulReferrals: affiliateData?.affiliateDetails?.successful_referrals || 0,
    pendingReferrals: affiliateData?.affiliateDetails?.pending_referrals || 0,
    totalCommission: affiliateData?.affiliateDetails?.total_commission || 0,
    pendingCommission: affiliateData?.affiliateDetails?.pending_commission || 0,
    paidCommission: affiliateData?.affiliateDetails?.paid_commission || 0
  }

  const referralLink = `https://powerca.in?ref=${affiliateData?.affiliateDetails?.referral_code || affiliateData?.affiliateId}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
          </div>
          <p className="text-gray-600">
            Welcome back, {affiliateData?.affiliateDetails?.firm_name || session?.user?.name}
          </p>
        </div>

        {/* Affiliate ID and Referral Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Referral Information</CardTitle>
            <CardDescription>Share your unique referral link to earn commissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Affiliate ID</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {affiliateData?.affiliateId || 'Loading...'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Referral Link</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-sm">
                    {referralLink}
                  </div>
                  <Button
                    onClick={copyReferralLink}
                    variant="outline"
                    size="sm"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReferrals}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingReferrals} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful Conversions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successfulReferrals}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalReferrals > 0
                  ? `${Math.round((stats.successfulReferrals / stats.totalReferrals) * 100)}% conversion rate`
                  : 'No referrals yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalCommission.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                ₹{stats.pendingCommission.toFixed(2)} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Commission</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{stats.paidCommission.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Successfully withdrawn
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commission</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">₹{stats.pendingCommission.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting clearance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {affiliateData?.affiliateDetails?.commission_rate || 10}%
              </div>
              <p className="text-xs text-muted-foreground">
                Per successful referral
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your affiliate account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push('/affiliate/account')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Update Profile
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push('/affiliate/referrals')}
              >
                <Users className="h-4 w-4 mr-2" />
                View Referrals
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => router.push('/affiliate/withdraw')}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Withdraw Funds
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Marketing Materials */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Marketing Resources</CardTitle>
            <CardDescription>Download materials to help promote PowerCA</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Marketing materials and promotional content will be available here soon.
                Check back later for banners, email templates, and more resources to help you succeed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}