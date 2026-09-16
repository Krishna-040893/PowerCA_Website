'use client'

import {useEffect, useState, useCallback, useMemo  } from 'react'
import Link from 'next/link'
import {Loader2, RefreshCw, Users, IndianRupee, UserCheck, FileText, HelpCircle, Sparkles, ArrowRight, Eye  } from 'lucide-react'
import {AdminPageWrapper  } from '@/components/admin/admin-page-wrapper'
import {AdminPagination  } from '@/components/admin/admin-pagination'
import {DataTableFilters, DataTablePanel, DataTableToolbar, FilterMenu, ToolbarButton, adminButtonClass, dataTableClass  } from '@/components/admin/data-table'
import {motion  } from 'framer-motion'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import {cn  } from '@/lib/utils'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
  RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts'

// One accent drives every chart and highlight on the page, so switching the
// dashboard to another brand colour is a change to these constants alone.
const ACCENT = '#4F46E5'
const ACCENT_SOFT = '#A5B4FC'
const TRACK = '#F1F1F5'
const GRID = '#EEF0F4'
const AXIS_TEXT = '#9CA3AF'

interface Registration {
  id: string
  name: string
  email: string
  role: string
  professional_type: string | null
  is_active: boolean
  created_at: string
}

type RegistrationTab = 'all' | 'professional' | 'student'

export default function AdminPage() {
  const { isAuthenticated, isLoading, adminUser, getAuthHeaders } = useAdminAuth()
  const [allStats, setAllStats] = useState({
    registrations: 0,
    professionals: 0,
    students: 0,
    payments: 0,
    totalRevenue: 0,
    newsletters: 0,
    affiliates: 0,
    approvedAffiliates: 0,
    pendingAffiliates: 0,
    blogPosts: 0,
    affiliateReferrals: 0
  })
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; registrations: number; payments: number }>>([])
  const [recentRegistrations, setRecentRegistrations] = useState<Registration[]>([])
  const [tab, setTab] = useState<RegistrationTab>('all')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [searchTerm, setSearchTerm] = useState('')

  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardStats = useCallback(async () => {
    try {
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

      const professionals = registrations.filter((r: { role: string }) => r.role === 'professional' || r.role === 'Professional').length
      const students = registrations.filter((r: { role: string }) => r.role === 'student' || r.role === 'Student').length

      // Calculate monthly data for the last 6 months
      const now = new Date()
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthlyStats: Array<{ month: string; registrations: number; payments: number }> = []

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

        monthlyStats.push({
          month: monthNames[targetDate.getMonth()],
          registrations: monthRegistrations,
          payments: monthPayments
        })
      }

      setMonthlyData(monthlyStats)

      // Keep only the fields the table renders; the registrations endpoint
      // returns whole rows, and nothing else from them belongs in page state.
      setRecentRegistrations(
        registrations.map((r: Registration) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          role: r.role,
          professional_type: r.professional_type,
          is_active: r.is_active,
          created_at: r.created_at,
        }))
      )

      setAllStats({
        registrations: registrations.length,
        professionals,
        students,
        payments: payments.length,
        totalRevenue: totalRevenue / 100, // Convert from paise to rupees
        newsletters: newsletterData.subscribers?.length || 0,
        affiliates: affiliatesData.length || 0,
        approvedAffiliates: affiliatesData.filter((a: { status: string }) => a.status === 'approved').length || 0,
        pendingAffiliates: affiliatesData.filter((a: { status: string }) => a.status === 'pending').length || 0,
        blogPosts: blogData.posts?.length || 0,
        affiliateReferrals: referralsData.data?.reduce((sum: number, d: { referrals: unknown[] }) => sum + (d.referrals?.length || 0), 0) || 0
      })
    } catch {
      // Error fetching stats - silent fail
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

  const tabRows = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return recentRegistrations.filter(r =>
      (tab === 'all' || r.role?.toLowerCase() === tab) &&
      (!search || [r.name, r.email].some(field => field?.toLowerCase().includes(search)))
    )
  }, [recentRegistrations, tab, searchTerm])
  const pageRows = tabRows.slice(page * pageSize, (page + 1) * pageSize)

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
    { name: 'Professionals', value: allStats.professionals, color: ACCENT },
    { name: 'Students', value: allStats.students, color: ACCENT_SOFT }
  ]

  const barChartData = [
    { name: 'Registrations', value: allStats.registrations },
    { name: 'Payments', value: allStats.payments },
    { name: 'Affiliates', value: allStats.affiliates },
    { name: 'Blog Posts', value: allStats.blogPosts },
    { name: 'Subscribers', value: allStats.newsletters }
  ]

  const lineChartData = monthlyData.length > 0 ? monthlyData : [
    { month: 'No Data', registrations: 0, payments: 0 }
  ]

  const approvalRate = allStats.affiliates > 0 ? (allStats.approvedAffiliates / allStats.affiliates) * 100 : 0
  const gaugeData = [{ name: 'Approved', value: approvalRate }]

  const sixMonthRegistrations = monthlyData.reduce((sum, m) => sum + m.registrations, 0)
  const sixMonthPayments = monthlyData.reduce((sum, m) => sum + m.payments, 0)
  const thisMonth = monthlyData[monthlyData.length - 1]

  const selectTab = (next: RegistrationTab) => {
    setTab(next)
    setPage(0)
  }

  return (
    <AdminPageWrapper>
      <div className="space-y-5">
        {/* Attention banner */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 px-5 py-5 sm:px-7 sm:py-6"
        >
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute right-24 -bottom-28 h-56 w-56 rounded-full bg-white/[0.07]" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-white/15 px-2.5 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20">
                <Sparkles className="h-3.5 w-3.5" />
                {allStats.pendingAffiliates > 0 ? 'Needs your attention' : 'All caught up'}
              </span>
              <p className="mt-2.5 text-base font-medium text-white sm:text-lg">
                {allStats.pendingAffiliates > 0
                  ? `${allStats.pendingAffiliates} affiliate ${allStats.pendingAffiliates === 1 ? 'application is' : 'applications are'} waiting for approval.`
                  : 'No affiliate applications are waiting for approval.'}
              </p>
            </div>
            <Link
              href="/admin/affiliates"
              className={adminButtonClass('outline', 'shrink-0 self-start sm:self-auto')}
            >
              {allStats.pendingAffiliates > 0 ? 'Review applications' : 'View affiliates'}
              <ArrowRight />
            </Link>
          </div>
        </motion.section>

        {/* Overview */}
        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">Overview</h1>
            <ToolbarButton onClick={refreshData} disabled={refreshing}>
              {refreshing
                ? <Loader2 className="animate-spin" />
                : <RefreshCw />}
              Refresh
            </ToolbarButton>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            <KpiCard
              icon={Users}
              tone="indigo"
              label="Registrations"
              help="All registered users, split by role"
              value={allStats.registrations}
              detail={[
                [allStats.professionals, 'professional', 'professionals'],
                [allStats.students, 'student', 'students'],
              ]}
            />
            <KpiCard
              icon={IndianRupee}
              tone="emerald"
              label="Payments"
              help="Captured payments and the revenue they brought in"
              value={allStats.payments}
              detail={[
                [`₹${allStats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'total revenue'],
              ]}
            />
            <KpiCard
              icon={UserCheck}
              tone="violet"
              label="Affiliates"
              help="Affiliate applications, approvals and the referrals they made"
              value={allStats.affiliates}
              detail={[
                [allStats.approvedAffiliates, 'approved'],
                [allStats.affiliateReferrals, 'referral', 'referrals'],
              ]}
            />
            <KpiCard
              icon={FileText}
              tone="amber"
              label="Content"
              help="Published blog posts and newsletter subscribers"
              value={allStats.blogPosts}
              detail={[
                [allStats.blogPosts, 'blog post', 'blog posts'],
                [allStats.newsletters, 'subscriber', 'subscribers'],
              ]}
            />
          </motion.div>
        </section>

        {/* Monthly trends */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 gap-3 lg:grid-cols-3"
        >
          <Panel className="lg:col-span-2">
            <PanelHeader
              label="Registrations"
              value={sixMonthRegistrations}
              change={thisMonth?.registrations}
            />
            <div className="h-[260px] px-2 pb-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lineChartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor={ACCENT} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: AXIS_TEXT }} dy={6} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: AXIS_TEXT }} />
                  <Tooltip cursor={false} content={<ChartTooltip />} />
                  <Bar
                    dataKey="registrations"
                    name="Registrations"
                    fill="url(#barFill)"
                    background={{ fill: TRACK, radius: 8 }}
                    radius={8}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              label="Payments"
              value={sixMonthPayments}
              change={thisMonth?.payments}
            />
            <div className="h-[260px] pb-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineChartData} margin={{ top: 8, right: 16, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={ACCENT} stopOpacity={0.22} />
                      <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: AXIS_TEXT }} dy={6} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: AXIS_TEXT }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="linear"
                    dataKey="payments"
                    name="Payments"
                    stroke={ACCENT}
                    strokeWidth={2}
                    fill="url(#areaFill)"
                    dot={{ r: 3.5, fill: '#fff', stroke: ACCENT, strokeWidth: 2 }}
                    activeDot={{ r: 5, fill: ACCENT, stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </motion.div>

        {/* Breakdowns */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
        >
          <Panel>
            <PanelTitle title="User Distribution" description="Registration breakdown" />
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={3}
                    cornerRadius={6}
                    stroke="none"
                    dataKey="value"
                  >
                    {pieChartData.filter(d => d.value > 0).map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-gray-900">{allStats.registrations}</span>
                <span className="text-xs text-gray-500">users</span>
              </div>
            </div>
            <div className="flex justify-center gap-5 px-5 pb-5 text-xs text-gray-600">
              {pieChartData.map(d => (
                <span key={d.name} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                  {d.name}
                  <span className="font-semibold text-gray-900">{d.value}</span>
                </span>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelTitle title="Approval Rate" description="Affiliate approval %" />
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="62%"
                  innerRadius="78%"
                  outerRadius="100%"
                  barSize={14}
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: TRACK }} dataKey="value" cornerRadius={8} fill={ACCENT} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-x-0 top-[48%] flex flex-col items-center">
                <span className="text-3xl font-semibold text-gray-900">{approvalRate.toFixed(0)}%</span>
                <span className="text-xs text-gray-500">Approved</span>
              </div>
            </div>
            <div className="flex justify-center gap-5 px-5 pb-5 text-xs text-gray-600">
              <span>Approved <span className="font-semibold text-gray-900">{allStats.approvedAffiliates}</span></span>
              <span>Total <span className="font-semibold text-gray-900">{allStats.affiliates}</span></span>
            </div>
          </Panel>

          <Panel className="md:col-span-2 lg:col-span-1">
            <PanelTitle title="Platform Metrics" description="All metrics comparison" />
            <div className="h-[252px] px-2 pb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="100%" stopColor={ACCENT} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 10, fill: AXIS_TEXT }} dy={6} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: AXIS_TEXT }} />
                  <Tooltip cursor={false} content={<ChartTooltip />} />
                  <Bar dataKey="value" name="Count" fill="url(#metricFill)" background={{ fill: TRACK, radius: 6 }} radius={6} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </motion.div>

        {/* Recent registrations */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <DataTablePanel>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">Recent registrations</h2>
            <DataTableToolbar
              searchValue={searchTerm}
              onSearchChange={(value) => {
                setSearchTerm(value)
                setPage(0)
              }}
              searchPlaceholder="Search by name or email..."
              actions={
                <Link
                  href="/admin/registrations"
                  className={adminButtonClass('outline')}
                >
                  <Eye />
                  View all
                </Link>
              }
            />

            <DataTableFilters>
              <FilterMenu
                label="Role"
                value={tab}
                onValueChange={(value) => selectTab(value as RegistrationTab)}
                options={[
                  { value: 'all', label: `All (${recentRegistrations.length})` },
                  { value: 'professional', label: `Professionals (${allStats.professionals})` },
                  { value: 'student', label: `Students (${allStats.students})` },
                ]}
              />
            </DataTableFilters>

            <div className="overflow-x-auto">
              <table className={cn('w-full min-w-[640px] text-left', dataTableClass)}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Registered</th>
                    <th>Role</th>
                    <th>Qualification</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-gray-500">
                        No registrations to show.
                      </td>
                    </tr>
                  ) : pageRows.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700">
                            {r.name?.[0]?.toUpperCase() || '?'}
                          </span>
                          <div className="min-w-0">
                            <div className="truncate">{r.name}</div>
                            <div className="truncate text-xs text-gray-500">{r.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="capitalize">{r.role}</td>
                      <td>
                        {r.professional_type && r.professional_type !== 'NA' ? r.professional_type : '—'}
                      </td>
                      <td>{r.is_active ? 'Active' : 'Inactive'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPagination
              currentPage={page + 1}
              totalItems={tabRows.length}
              itemsPerPage={pageSize}
              onPageChange={(p) => setPage(p - 1)}
              onItemsPerPageChange={(n) => { setPageSize(n); setPage(0) }}
              pageSizeOptions={[5, 10, 25, 50]}
            />
          </DataTablePanel>
        </motion.section>
      </div>
    </AdminPageWrapper>
  )
}

const KPI_TONES = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
} as const

function KpiCard({ icon: Icon, tone, label, help, value, detail }: {
  icon: React.ElementType
  tone: keyof typeof KPI_TONES
  label: string
  help: string
  value: number
  /** [amount, label, plural label] - the plural is used for any amount other than 1 */
  detail: Array<[number | string, string, string?]>
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-md', KPI_TONES[tone])}>
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-sm text-gray-600">{label}</span>
        </div>
        <span title={help} className="text-gray-400">
          <HelpCircle className="h-4 w-4" aria-label={help} />
        </span>
      </div>
      <div className="mt-4 text-[28px] font-semibold leading-none tracking-tight text-gray-900">{value}</div>
      <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
        {detail.map(([amount, singular, plural]) => (
          <span key={singular}>
            <span className="font-semibold text-gray-900">{amount}</span>{' '}
            {plural && amount !== 1 ? plural : singular}
          </span>
        ))}
      </div>
    </div>
  )
}

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]', className)}>
      {children}
    </div>
  )
}

function PanelTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-5 pt-5">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-0.5 text-xs text-gray-500">{description}</p>
    </div>
  )
}

function PanelHeader({ label, value, change }: {
  label: string
  value: number
  change?: number
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pb-2 pt-5">
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="mt-1.5 text-[28px] font-semibold leading-none tracking-tight text-gray-900">{value}</div>
        <div className="mt-2 text-xs text-gray-500">
          <span className={cn('font-semibold', change ? 'text-emerald-600' : 'text-gray-500')}>
            +{change ?? 0}
          </span>{' '}
          this month
        </div>
      </div>
      <span className="shrink-0 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600">
        Last 6 months
      </span>
    </div>
  )
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
  label?: string
}) {
  if (!active || !payload?.length) {
    return null
  }
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      {label && <div className="mb-1 font-medium text-gray-900">{label}</div>}
      {payload.map(p => (
        <div key={p.name} className="text-gray-600">
          {p.name}: <span className="font-semibold text-gray-900">{p.value}</span>
        </div>
      ))}
    </div>
  )
}
