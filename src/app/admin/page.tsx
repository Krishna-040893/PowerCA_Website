'use client'

import {useEffect, useState, useCallback  } from 'react'
import {Loader2, RefreshCw  } from 'lucide-react'
import {Button  } from '@/components/ui/button'
import {AdminPageWrapper  } from '@/components/admin/admin-page-wrapper'
import {AdminStats  } from '@/components/admin/admin-stats'
import {motion  } from 'framer-motion'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import dynamic from 'next/dynamic'

// Dynamic imports for heavy HubSpot components
const HubSpotMetricsCard = dynamic(
  () => import('@/components/admin/HubSpotMetricsCard'),
  { loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-lg" /> }
)
const HubSpotBulkSync = dynamic(
  () => import('@/components/admin/HubSpotBulkSync'),
  { loading: () => <div className="animate-pulse h-32 bg-gray-100 rounded-lg" /> }
)

export default function AdminPage() {
  const { isAuthenticated, isLoading, adminUser, getAuthHeaders } = useAdminAuth()
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    today: 0,
    thisMonth: 0,
    affiliates: 0,
    revenue: 0
  })
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardStats = useCallback(async () => {
    try {
      // Fetch bookings stats
      const bookingsRes = await fetch('/api/admin/bookings', {
        headers: getAuthHeaders()
      })

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        const bookings = bookingsData.bookings || []

        // Calculate stats
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)

        interface Booking {
          status: string;
          created_at: string;
        }

        setStats({
          total: bookings.length,
          pending: bookings.filter((b: Booking) => b.status === 'PENDING').length,
          confirmed: bookings.filter((b: Booking) => b.status === 'CONFIRMED').length,
          completed: bookings.filter((b: Booking) => b.status === 'COMPLETED').length,
          today: bookings.filter((b: Booking) => new Date(b.created_at) >= today).length,
          thisMonth: bookings.filter((b: Booking) => new Date(b.created_at) >= thisMonthStart).length,
          affiliates: 0, // Will be updated when we fetch affiliate data
          revenue: 0 // Will be calculated from payments
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isAuthenticated && !refreshing) {
      fetchDashboardStats()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  const refreshData = async () => {
    setRefreshing(true)
    await fetchDashboardStats()
    setRefreshing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!isAuthenticated || !adminUser) {
    return null // Router will redirect
  }

  return (
    <AdminPageWrapper
      title="Dashboard"
      description="Overview of your platform's performance and activities"
      actions={
        <Button
          onClick={refreshData}
          variant="outline"
          disabled={refreshing}
        >
          {refreshing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      }
    >
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AdminStats stats={stats} isLoading={false} />
        </motion.div>

        {/* HubSpot Integration - Mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            <HubSpotMetricsCard />
            <HubSpotBulkSync />
          </div>
        </motion.div>
    </AdminPageWrapper>
  )
}