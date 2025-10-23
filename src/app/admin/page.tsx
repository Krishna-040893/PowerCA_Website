'use client'

import {useRouter  } from 'next/navigation'
import {useEffect, useState, useCallback  } from 'react'
import {Loader2, RefreshCw  } from 'lucide-react'
import Link from 'next/link'
import { TrendingUp, ArrowRight, Activity, Calendar, Star, Users, UserCheck, FileText, BarChart3, IndianRupee } from 'lucide-react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Button  } from '@/components/ui/button'
import {Badge  } from '@/components/ui/badge'
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

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  color: string
  badge?: string
}

export default function AdminPage() {
  const router = useRouter()
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

  // Clean up URL if coming from login
  useEffect(() => {
    const url = new URL(window.location.href)
    if (url.searchParams.has('from_login')) {
      url.searchParams.delete('from_login')
      router.replace(url.pathname, { scroll: false })
    }
  }, [router])

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

  const quickActions: QuickAction[] = [
    {
      title: 'View Bookings',
      description: 'Manage demo bookings and consultations',
      icon: Calendar,
      href: '/admin/bookings',
      color: 'from-blue-500 to-blue-600',
      badge: stats.pending > 0 ? `${stats.pending} pending` : undefined
    },
    {
      title: 'Manage Affiliates',
      description: 'View and manage affiliate partners',
      icon: Star,
      href: '/admin/affiliates',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'User Management',
      description: 'Manage users and permissions',
      icon: Users,
      href: '/admin/users/manage',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Affiliate Approvals',
      description: 'Review pending affiliate applications',
      icon: UserCheck,
      href: '/admin/affiliates/approve',
      color: 'from-orange-500 to-orange-600',
      badge: 'New'
    },
    {
      title: 'Registrations',
      description: 'View student and professional registrations',
      icon: FileText,
      href: '/admin/registrations',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Analytics',
      description: 'View detailed analytics and reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'from-pink-500 to-pink-600'
    }
  ]

  const recentActivities = [
    { type: 'booking', message: 'New demo booking received', time: '2 hours ago', icon: Calendar },
    { type: 'affiliate', message: 'New affiliate application', time: '4 hours ago', icon: UserCheck },
    { type: 'payment', message: 'Payment received from affiliate', time: '6 hours ago', icon: IndianRupee },
    { type: 'registration', message: 'New student registration', time: '1 day ago', icon: Users }
  ]

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

        {/* HubSpot Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HubSpotMetricsCard />
            <HubSpotBulkSync />
          </div>
        </motion.div>
    </AdminPageWrapper>
  )
}