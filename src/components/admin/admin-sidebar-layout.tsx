'use client'

import {useState, useEffect, useMemo  } from 'react'
import {useRouter, usePathname  } from 'next/navigation'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import Link from 'next/link'
import Image from 'next/image'
import {cn  } from '@/lib/utils'
import { Users, LogOut, Menu, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronDown, LayoutDashboard, Calendar, FileText, UserCheck, UsersRound, CreditCard, ShoppingCart, Globe, Mail, Wallet, Handshake, FileSignature, Building2, Images } from 'lucide-react'
import {Avatar, AvatarFallback  } from '@/components/ui/avatar'
import {DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu'
import {Loader2  } from 'lucide-react'

interface AdminSidebarLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string | number
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  countKey?: 'bookings' | 'registrations' | 'affiliates' | 'pendingApprovals' | 'approvedAffiliates' | 'referrals' | 'pendingPayments' | 'affiliatePayments' | 'payments' | 'paymentOrders' | 'newsletterSubscribers' | 'blogPosts' | 'agreements' | 'enterpriseInquiries'
  subItems?: { title: string; href: string }[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

interface Counts {
  bookings: number
  registrations: number
  affiliates: number
  pendingApprovals: number
  approvedAffiliates: number
  referrals: number
  pendingPayments: number
  affiliatePayments: number
  payments: number
  paymentOrders: number
  newsletterSubscribers: number
  blogPosts: number
  agreements: number
  enterpriseInquiries: number
}

const getBaseNavigation = (): NavSection[] => [
  {
    title: 'Main',
    items: [
      { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Management',
    items: [
      { title: 'Bookings', href: '/admin/bookings', icon: Calendar, countKey: 'bookings', badgeVariant: 'default' },
      { title: 'Registrations', href: '/admin/registrations', icon: FileText, countKey: 'registrations', badgeVariant: 'default' },
      {
        title: 'Agreements',
        href: '/admin/agreements',
        icon: FileSignature,
        countKey: 'agreements',
        badgeVariant: 'default',
        subItems: [
          { title: 'Client Agreement', href: '/admin/agreements' },
          { title: 'Affiliate Agreement', href: '/admin/agreements/affiliate' }
        ]
      },
      { title: 'Newsletter Subscribers', href: '/admin/newsletter-subscribers', icon: Mail, countKey: 'newsletterSubscribers', badgeVariant: 'default' },
      { title: 'Enterprise Inquiries', href: '/admin/enterprise-inquiries', icon: Building2, countKey: 'enterpriseInquiries', badgeVariant: 'default' },
    ]
  },
  {
    title: 'Blogs',
    items: [
      { title: 'Blog Posts', href: '/admin/blog', icon: Globe, countKey: 'blogPosts', badgeVariant: 'default' },
    ]
  },
  {
    title: 'Website',
    items: [
      { title: 'Homepage Posters', href: '/admin/posters', icon: Images },
    ]
  },
  {
    title: 'Payment',
    items: [
      { title: 'Payments', href: '/admin/payments', icon: CreditCard, countKey: 'payments', badgeVariant: 'default' },
      { title: 'Payment Orders', href: '/admin/payment-orders', icon: ShoppingCart, countKey: 'paymentOrders', badgeVariant: 'default' },
    ]
  },
  {
    title: 'Affiliates',
    items: [
      { title: 'All Affiliates', href: '/admin/affiliates', icon: Handshake, countKey: 'affiliates', badgeVariant: 'default' },
      { title: 'Approved', href: '/admin/affiliates/approve', icon: UserCheck, countKey: 'approvedAffiliates', badgeVariant: 'default' },
      { title: 'Affiliate Referrals', href: '/admin/affiliate-referrals', icon: UsersRound, countKey: 'referrals', badgeVariant: 'default' },
      { title: 'Affiliate Payments', href: '/admin/affiliate-payments', icon: Wallet, countKey: 'affiliatePayments', badgeVariant: 'default' },
    ]
  },
]

/** Title for the breadcrumb: the nav label for this route, else the tidied path segment. */
function pageTitleFor(pathname: string): string {
  for (const section of getBaseNavigation()) {
    for (const item of section.items) {
      const sub = item.subItems?.find(s => s.href === pathname)
      if (sub) {
        return sub.title
      }
      if (item.href === pathname) {
        return item.title
      }
    }
  }
  const segment = pathname.split('/').filter(Boolean).pop() || 'dashboard'
  return segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export function AdminSidebarLayout({ children }: AdminSidebarLayoutProps) {
  const { isAuthenticated, isLoading, adminUser, handleLogout } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]) // No dropdown expanded by default

  // Initialize counts from localStorage if available
  const [counts, setCounts] = useState<Counts>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('adminCounts')
      if (cached) {
        try {
          return JSON.parse(cached)
        } catch (e) {
          console.error('Failed to parse cached counts:', e)
        }
      }
    }
    return {
      bookings: 0,
      registrations: 0,
      affiliates: 0,
      pendingApprovals: 0,
      approvedAffiliates: 0,
      referrals: 0,
      pendingPayments: 0,
      affiliatePayments: 0,
      payments: 0,
      paymentOrders: 0,
      newsletterSubscribers: 0,
      blogPosts: 0,
      agreements: 0,
      enterpriseInquiries: 0
    }
  })
  const pathname = usePathname()
  const router = useRouter()

  // Fetch counts from API
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/admin/counts')
        if (response.ok) {
          const data = await response.json()
          // Update counts state and cache in localStorage
          setCounts(prevCounts => {
            const newCounts = {
              ...prevCounts,
              ...data
            }
            // Cache in localStorage for persistence across navigation
            if (typeof window !== 'undefined') {
              localStorage.setItem('adminCounts', JSON.stringify(newCounts))
            }
            return newCounts
          })
        }
      } catch (error) {
        console.error('Failed to fetch counts:', error)
      }
    }

    if (!isAuthenticated) {
      return undefined
    }

    fetchCounts()
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Compute navigation with counts using useMemo to prevent unnecessary re-renders
  const navigation = useMemo(() => {
    const baseNav = getBaseNavigation()
    return baseNav.map(section => ({
      ...section,
      items: section.items.map(item => {
        if (item.countKey && counts[item.countKey] > 0) {
          return {
            ...item,
            badge: counts[item.countKey]
          }
        }
        return item
      })
    }))
  }, [counts])

  // Check if sidebar should be collapsed based on saved preference
  useEffect(() => {
    const savedState = localStorage.getItem('adminSidebarCollapsed')
    if (savedState === 'true') {
      setCollapsed(true)
    }
  }, [])

  // Auto-expand dropdown when navigating to a child page
  useEffect(() => {
    const baseNav = getBaseNavigation()

    // Find if current pathname matches any subItem
    for (const section of baseNav) {
      for (const item of section.items) {
        if (item.subItems) {
          const isOnSubPage = item.subItems.some(sub => pathname === sub.href)
          if (isOnSubPage) {
            // Expand this menu if not already expanded
            setExpandedMenus(prev => {
              if (!prev.includes(item.title)) {
                return [...prev, item.title]
              }
              return prev
            })
            break
          }
        }
      }
    }
  }, [pathname])

  // Save collapsed state
  const toggleCollapsed = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('adminSidebarCollapsed', newState.toString())
  }

  // Enhanced logout handler to clear cached counts
  const handleLogoutWithCleanup = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminCounts')
    }
    handleLogout()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!isAuthenticated || !adminUser) {
    return null
  }

  // Labels show when the sidebar is expanded, or always inside the mobile drawer
  const showLabels = !collapsed || sidebarOpen
  const initial = adminUser.username?.[0]?.toUpperCase() || 'A'

  return (
    <div className="flex h-screen bg-white font-inter">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-gray-200 bg-[#FAFAFB] transition-all duration-300',
          'w-72 lg:w-64',
          collapsed && 'lg:w-[72px]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand */}
        <div className={cn('flex h-14 items-center gap-2 px-4', !showLabels && 'lg:justify-center lg:px-0')}>
          <Image
            src="/images/powerca-logo.png"
            alt="Power CA Logo"
            width={28}
            height={28}
            className="h-7 w-7 shrink-0 object-contain"
          />
          {showLabels && (
            <div className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="text-[15px] font-semibold text-gray-900">Power CA</span>
              <span className="text-[11px] text-gray-500">Admin Panel</span>
            </div>
          )}
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'hidden h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700 lg:flex',
              !showLabels && 'lg:absolute lg:-right-3.5 lg:top-4 lg:h-7 lg:w-7 lg:rounded-full lg:border lg:border-gray-200 lg:bg-white lg:shadow-sm'
            )}
          >
            <ChevronsLeft className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')} />
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-200/70 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3 custom-scrollbar">
          {navigation.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {showLabels ? (
                <h3 className="mb-1.5 px-2.5 text-[11px] font-medium text-gray-400">
                  {section.title}
                </h3>
              ) : (
                sectionIdx > 0 && <div className="mx-auto mb-2 h-px w-6 bg-gray-200" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href))
                  const isExpanded = expandedMenus.includes(item.title)
                  const hasSubItems = item.subItems && item.subItems.length > 0

                  const rowClass = cn(
                    'group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors',
                    !showLabels && 'lg:justify-center lg:px-0',
                    isActive
                      ? 'bg-white font-semibold text-gray-900 shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-gray-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )
                  const iconClass = cn(
                    'h-4 w-4 flex-shrink-0',
                    isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-700'
                  )

                  // If item has sub-items, render as expandable menu
                  if (hasSubItems) {
                    return (
                      <div key={item.href}>
                        <button
                          onClick={() => {
                            setExpandedMenus(prev =>
                              prev.includes(item.title)
                                ? prev.filter(t => t !== item.title)
                                : [...prev, item.title]
                            )
                          }}
                          title={showLabels ? undefined : item.title}
                          className={rowClass}
                        >
                          <item.icon className={iconClass} />
                          {showLabels && (
                            <>
                              <span className="flex-1 text-left">{item.title}</span>
                              <ChevronDown className={cn(
                                'h-3.5 w-3.5 text-gray-400 transition-transform duration-200',
                                isExpanded && 'rotate-180'
                              )} />
                            </>
                          )}
                        </button>
                        {isExpanded && showLabels && item.subItems && (
                          <div className="ml-[18px] mt-0.5 space-y-0.5 border-l border-gray-200 pl-3">
                            {item.subItems.map((subItem) => {
                              const isSubActive = pathname === subItem.href
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={cn(
                                    'block rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                                    isSubActive
                                      ? 'bg-indigo-50 font-medium text-indigo-700'
                                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                  )}
                                >
                                  {subItem.title}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      title={showLabels ? undefined : item.title}
                      className={rowClass}
                    >
                      <item.icon className={iconClass} />
                      {showLabels && (
                        <>
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge !== undefined && (
                            <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-md border border-gray-200 bg-white px-1.5 text-[11px] font-medium text-gray-600">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {!showLabels && item.badge !== undefined && (
                        <span className="absolute right-3 top-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Account */}
        <div className="border-t border-gray-200 p-3">
          <div className={cn('flex items-center gap-2.5 rounded-lg px-1.5 py-1.5', !showLabels && 'lg:justify-center lg:px-0')}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
              {initial}
            </span>
            {showLabels && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-gray-900">{adminUser.username || 'Admin'}</div>
                {adminUser.email && <div className="truncate text-[11px] text-gray-500">{adminUser.email}</div>}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-gray-200 bg-white px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="-ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => router.forward()}
                aria-label="Go forward"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <nav aria-label="Breadcrumb" className="ml-1 flex min-w-0 items-center gap-1.5 text-sm">
              <Link href="/admin" className="text-gray-400 transition-colors hover:text-gray-700">Admin</Link>
              <span className="text-gray-300">/</span>
              <span className="truncate font-medium text-gray-900">{pageTitleFor(pathname)}</span>
            </nav>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-gray-100"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-indigo-50 text-xs font-semibold text-indigo-600">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-gray-900 md:block">{adminUser.username || 'Admin'}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-white shadow-lg">
              <DropdownMenuLabel className="text-sm">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <Users className="mr-2 h-4 w-4" />
                <span className="text-sm">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogoutWithCleanup} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="text-sm">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-[#F7F7F8] p-2 sm:p-3">
          {children}
        </main>
      </div>
    </div>
  )
}
