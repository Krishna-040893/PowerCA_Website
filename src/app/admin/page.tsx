'use client'

import {useRouter  } from 'next/navigation'
import {useEffect, useState, useCallback  } from 'react'
import {Loader2, RefreshCw  } from 'lucide-react'
import Link from 'next/link'
import { TrendingUp, ArrowRight, Activity, Calendar, Star, Users, UserCheck, FileText, BarChart3, DollarSign } from 'lucide-react'
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
  const _router = useRouter()
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
  }, [getAuthHeaders])

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardStats()
    }
  }, [isAuthenticated, fetchDashboardStats])

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
    { type: 'payment', message: 'Payment received from affiliate', time: '6 hours ago', icon: DollarSign },
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

        {/* Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={action.href}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer border-0 overflow-hidden group">
                    <div className={`h-2 bg-gradient-to-r ${action.color}`} />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} text-white`}>
                            <action.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{action.title}</CardTitle>
                            {action.badge && (
                              <Badge variant="secondary" className="mt-1">
                                {action.badge}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
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

        {/* Recent Activity and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription>Latest actions in your admin panel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="p-2 rounded-full bg-gray-100">
                        <activity.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Performance Metrics</span>
                </CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">24%</span>
                      <Badge variant="secondary" className="text-green-600">+5%</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Affiliates</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">12</span>
                      <Badge variant="secondary" className="text-green-600">+2</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monthly Revenue</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">₹45,000</span>
                      <Badge variant="secondary" className="text-green-600">+12%</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending Approvals</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">3</span>
                      <Badge variant="secondary" className="text-orange-600">Action Required</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Navigation Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">All Admin Sections</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/bookings" className="text-sm text-primary-700 hover:text-primary-900 font-medium">
                  → Bookings Management
                </Link>
                <Link href="/admin/affiliates" className="text-sm text-primary-700 hover:text-primary-900 font-medium">
                  → Affiliate Network
                </Link>
                <Link href="/admin/users/manage" className="text-sm text-primary-700 hover:text-primary-900 font-medium">
                  → User Management
                </Link>
                <Link href="/admin/registrations" className="text-sm text-primary-700 hover:text-primary-900 font-medium">
                  → Registrations
                </Link>
                <Link href="/admin/affiliates/approve" className="text-sm text-primary-700 hover:text-primary-900 font-medium">
                  → Affiliate Approvals
                </Link>
                <Link href="/admin/analytics" className="text-sm text-primary-700 hover:text-primary-900 font-medium">
                  → Analytics & Reports
                </Link>
                <Link href="/admin/test-dashboard" className="text-sm text-primary-700 hover:text-primary-900 font-medium">
                  → Test Dashboard
                </Link>
                <Link href="/admin/affiliates-view" className="text-sm text-primary-700 hover:text-primary-900 font-medium">
                  → Affiliates View
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
    </AdminPageWrapper>
  )
}