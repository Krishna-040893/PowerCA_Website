'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import {useSession  } from 'next-auth/react'
import {useRouter  } from 'next/navigation'
import { Users,
  Eye,
  ChevronDown,
  ChevronUp,
  Search,
  Download, UserCheck, Mail } from 'lucide-react'

interface AffiliateData {
  id: string
  user_id: string
  affiliate_id: string
  referral_code: string
  firm_name: string
  contact_email: string
  contact_phone: string
  total_referrals: number
  status: string
  created_at: string
  user?: {
    name: string
    email: string
  }
  referrals?: ReferralData[]
}

interface ReferralData {
  id: string
  referred_email: string
  referred_name: string
  status: string
  created_at: string
  converted_at: string
}

export default function AdminAffiliatesViewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [affiliates, setAffiliates] = useState<AffiliateData[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedAffiliate, setExpandedAffiliate] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    totalAffiliates: 0,
    activeAffiliates: 0,
    totalReferrals: 0
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user?.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    fetchAffiliates()
  }, [session, status, router])

  const fetchAffiliates = async () => {
    try {
      const response = await fetch('/api/admin/affiliates')
      if (response.ok) {
        const data = await response.json()
        setAffiliates(data.affiliates || [])

        // Calculate stats
        const totalAffiliates = data.affiliates?.length || 0
        const activeAffiliates = data.affiliates?.filter((a: AffiliateData) => a.status === 'active').length || 0
        const totalReferrals = data.affiliates?.reduce((sum: number, a: AffiliateData) =>
          sum + (a.referrals?.length || 0), 0) || 0

        setStats({
          totalAffiliates,
          activeAffiliates,
          totalReferrals
        })
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReferrals = async (affiliateId: string) => {
    try {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}/referrals`)
      if (response.ok) {
        const data = await response.json()
        setAffiliates(prev => prev.map(a =>
          a.id === affiliateId ? { ...a, referrals: data.referrals } : a
        ))
      }
    } catch (error) {
      console.error('Error fetching referrals:', error)
    }
  }

  const toggleExpand = (affiliateId: string) => {
    if (expandedAffiliate === affiliateId) {
      setExpandedAffiliate(null)
    } else {
      setExpandedAffiliate(affiliateId)
      // Fetch referrals if not already loaded
      const affiliate = affiliates.find(a => a.id === affiliateId)
      if (affiliate && !affiliate.referrals) {
        fetchReferrals(affiliateId)
      }
    }
  }

  const filteredAffiliates = affiliates.filter(affiliate =>
    affiliate.firm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.affiliate_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const exportToCSV = () => {
    const csvContent = [
      ['Affiliate ID', 'Firm Name', 'Email', 'Phone', 'Total Referrals', 'Status', 'Joined Date'],
      ...filteredAffiliates.map(a => [
        a.affiliate_id,
        a.firm_name,
        a.contact_email || a.user?.email || '',
        a.contact_phone || '',
        a.total_referrals || a.referrals?.length || 0,
        a.status,
        new Date(a.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `affiliates_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading affiliates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Affiliate Management</h1>
          <p className="mt-2 text-gray-600">View and manage affiliate partners and their referrals</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Affiliates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAffiliates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserCheck className="h-10 w-10 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Affiliates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAffiliates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-10 w-10 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Referrals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Export */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by firm name, affiliate ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Affiliates List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Affiliate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAffiliates.map((affiliate) => (
                  <React.Fragment key={affiliate.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{affiliate.firm_name}</div>
                          <div className="text-sm text-gray-500">ID: {affiliate.affiliate_id}</div>
                          <div className="text-xs text-gray-400">Code: {affiliate.referral_code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-900 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {affiliate.contact_email || affiliate.user?.email}
                          </div>
                          {affiliate.contact_phone && (
                            <div className="text-gray-500">{affiliate.contact_phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {affiliate.total_referrals || affiliate.referrals?.length || 0} referrals
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          affiliate.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {affiliate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleExpand(affiliate.id)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="text-sm">View Referrals</span>
                          {expandedAffiliate === affiliate.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedAffiliate === affiliate.id && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Referrals ({affiliate.referrals?.length || 0})
                            </h4>
                            {affiliate.referrals && affiliate.referrals.length > 0 ? (
                              <div className="bg-white rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Customer
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Email
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Status
                                      </th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Date
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {affiliate.referrals.map((referral) => (
                                      <tr key={referral.id}>
                                        <td className="px-4 py-2 text-sm text-gray-900">
                                          {referral.referred_name}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                          {referral.referred_email}
                                        </td>
                                        <td className="px-4 py-2">
                                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            referral.status === 'converted'
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {referral.status}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                          {new Date(referral.converted_at || referral.created_at).toLocaleDateString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">No referrals yet</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}