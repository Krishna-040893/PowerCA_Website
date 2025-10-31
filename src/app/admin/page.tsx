'use client'

import {useEffect, useState, useCallback  } from 'react'
import {Loader2, RefreshCw, Users, Mail, DollarSign, UserCheck, FileText, TrendingUp, BarChart3, PieChart as PieChartIcon, Activity  } from 'lucide-react'
import {Button  } from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle  } from '@/components/ui/card'
import {AdminPageWrapper  } from '@/components/admin/admin-page-wrapper'
import {motion  } from 'framer-motion'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
  RadialBarChart, RadialBar
} from 'recharts'

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
  const [allStats, setAllStats] = useState({
    registrations: 0,
    professionals: 0,
    students: 0,
    payments: 0,
    totalRevenue: 0,
    newsletters: 0,
    affiliates: 0,
    approvedAffiliates: 0,
    blogPosts: 0,
    affiliateReferrals: 0
  })
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; registrations: number; payments: number }>>([])

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
          affiliates: 0,
          revenue: 0
        })
      }

      // Fetch all other statistics
      const [registrationsRes, paymentsRes, newsletterRes, affiliatesRes, blogRes, referralsRes] = await Promise.all([
        fetch('/api/registrations', { headers: getAuthHeaders() }),
        fetch('/api/admin/payments', { headers: getAuthHeaders() }),
        fetch('/api/admin/newsletter-subscribers'),
        fetch('/api/admin/affiliates', { headers: getAuthHeaders() }),
        fetch('/api/admin/blog'),
        fetch('/api/admin/affiliate-referrals')
      ])

      const registrationsData = registrationsRes.ok ? await registrationsRes.json() : []
      const paymentsData = paymentsRes.ok ? await paymentsRes.json() : { payments: [] }
      const newsletterData = newsletterRes.ok ? await newsletterRes.json() : { subscribers: [] }
      const affiliatesData = affiliatesRes.ok ? await affiliatesRes.json() : []
      const blogData = blogRes.ok ? await blogRes.json() : { posts: [] }
      const referralsData = referralsRes.ok ? await referralsRes.json() : { data: [] }

      const registrations = registrationsData || []
      const payments = paymentsData.payments || []
      const totalRevenue = payments.reduce((sum: number, p: { amount: number }) => sum + (p.amount || 0), 0)

      // Debug logging for registrations
      console.log('📊 Dashboard Data Debug:')
      console.log('Total registrations:', registrations.length)
      console.log('Sample registration:', registrations[0])
      console.log('All roles:', registrations.map((r: { role: string }) => r.role))

      const professionals = registrations.filter((r: { role: string }) => r.role === 'professional' || r.role === 'Professional').length
      const students = registrations.filter((r: { role: string }) => r.role === 'student' || r.role === 'Student').length

      console.log('Professionals count:', professionals)
      console.log('Students count:', students)

      // Calculate monthly data for the last 6 months
      const now = new Date()
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthlyStats: Array<{ month: string; registrations: number; payments: number }> = []

      console.log('📅 Calculating monthly data...')
      console.log('Total registrations to process:', registrations.length)
      console.log('Total payments to process:', payments.length)

      for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
        const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59)

        const monthRegistrations = registrations.filter((r: { created_at: string }) => {
          const createdAt = new Date(r.created_at)
          return createdAt >= monthStart && createdAt <= monthEnd
        }).length

        const monthPayments = payments.filter((p: { created_at: string }) => {
          const createdAt = new Date(p.created_at)
          return createdAt >= monthStart && createdAt <= monthEnd
        }).length

        const monthData = {
          month: monthNames[targetDate.getMonth()],
          registrations: monthRegistrations,
          payments: monthPayments
        }

        console.log(`Month ${monthNames[targetDate.getMonth()]}:`, monthData)
        monthlyStats.push(monthData)
      }

      console.log('✅ Monthly stats calculated:', monthlyStats)
      setMonthlyData(monthlyStats)

      setAllStats({
        registrations: registrations.length,
        professionals,
        students,
        payments: payments.length,
        totalRevenue: totalRevenue / 100, // Convert from paise to rupees
        newsletters: newsletterData.subscribers?.length || 0,
        affiliates: affiliatesData.length || 0,
        approvedAffiliates: affiliatesData.filter((a: { status: string }) => a.status === 'approved').length || 0,
        blogPosts: blogData.posts?.length || 0,
        affiliateReferrals: referralsData.data?.reduce((sum: number, d: { referrals: unknown[] }) => sum + (d.referrals?.length || 0), 0) || 0
      })
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

  // Prepare chart data
  const pieChartData = [
    { name: 'Professionals', value: allStats.professionals, color: '#3b82f6' },
    { name: 'Students', value: allStats.students, color: '#8b5cf6' }
  ]

  // Debug logging for pie chart
  console.log('🥧 Pie Chart Data:', pieChartData)
  console.log('📊 All Stats:', allStats)

  const barChartData = [
    { name: 'Registrations', value: allStats.registrations, color: '#3b82f6' },
    { name: 'Payments', value: allStats.payments, color: '#10b981' },
    { name: 'Affiliates', value: allStats.affiliates, color: '#8b5cf6' },
    { name: 'Blog Posts', value: allStats.blogPosts, color: '#f59e0b' },
    { name: 'Subscribers', value: allStats.newsletters, color: '#ef4444' }
  ]

  // Use real monthly data instead of mock data
  const lineChartData = monthlyData.length > 0 ? monthlyData : [
    { month: 'No Data', registrations: 0, payments: 0 }
  ]

  const gaugeData = [
    { name: 'Completion', value: allStats.affiliates > 0 ? (allStats.approvedAffiliates / allStats.affiliates) * 100 : 0, fill: '#10b981' }
  ]

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

        {/* Comprehensive Platform Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Registrations Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{allStats.registrations}</div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">Professionals</span>
                    <span className="font-semibold text-blue-900">{allStats.professionals}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-700">Students</span>
                    <span className="font-semibold text-blue-900">{allStats.students}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payments Card */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">{allStats.payments}</div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-green-700">Total Revenue</span>
                    <span className="font-semibold text-green-900">₹{allStats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affiliates Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-purple-600" />
                  Affiliates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{allStats.affiliates}</div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-700">Approved</span>
                    <span className="font-semibold text-purple-900">{allStats.approvedAffiliates}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-700">Referrals</span>
                    <span className="font-semibold text-purple-900">{allStats.affiliateReferrals}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-600" />
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900">{allStats.blogPosts}</div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-700">Blog Posts</span>
                    <span className="font-semibold text-orange-900">{allStats.blogPosts}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-700">Subscribers</span>
                    <span className="font-semibold text-orange-900">{allStats.newsletters}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Advanced Chart Visualizations - 3 Column Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pie Chart - User Distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="h-4 w-4 text-blue-600" />
                  User Distribution
                </CardTitle>
                <CardDescription className="text-xs">Registration breakdown</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gauge Chart - Affiliate Approval Rate */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-600" />
                  Approval Rate
                </CardTitle>
                <CardDescription className="text-xs">Affiliate approval %</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[280px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="50%"
                      cy="60%"
                      innerRadius="70%"
                      outerRadius="100%"
                      barSize={15}
                      data={gaugeData}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar
                        minAngle={15}
                        background
                        clockWise
                        dataKey="value"
                      />
                      <text
                        x="50%"
                        y="50%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-3xl font-bold fill-green-600"
                      >
                        {gaugeData[0].value.toFixed(0)}%
                      </text>
                      <text
                        x="50%"
                        y="65%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-xs fill-gray-500"
                      >
                        Approved
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart - Platform Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-orange-600" />
                  Platform Metrics
                </CardTitle>
                <CardDescription className="text-xs">All metrics comparison</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Second Row - Line Chart (Full Width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-4"
        >
          {/* Line Chart - Growth Trends */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Growth Trends
              </CardTitle>
              <CardDescription className="text-xs">Last 6 months - Registrations vs Payments</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3b82f6' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="payments"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
    </AdminPageWrapper>
  )
}