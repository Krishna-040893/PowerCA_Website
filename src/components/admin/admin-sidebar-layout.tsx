'use client'

import {useState, useEffect, useMemo  } from 'react'
import {useRouter, usePathname  } from 'next/navigation'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import Link from 'next/link'
import Image from 'next/image'
import {cn  } from '@/lib/utils'
import { Users, LogOut, Menu, X, ChevronLeft, ChevronDown, LayoutDashboard, Calendar, FileText, UserCheck, UsersRound, CreditCard, ShoppingCart, Globe, Mail, Wallet, Handshake, FileSignature, Download } from 'lucide-react'
import {Button  } from '@/components/ui/button'
import {Avatar, AvatarFallback  } from '@/components/ui/avatar'
import {DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu'
import {Badge  } from '@/components/ui/badge'
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
  countKey?: 'bookings' | 'registrations' | 'affiliates' | 'pendingApprovals' | 'approvedAffiliates' | 'referrals' | 'pendingPayments' | 'affiliatePayments' | 'payments' | 'paymentOrders' | 'newsletterSubscribers' | 'blogPosts' | 'agreements' | 'appDownloads' | 'appDownloadOrders'
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
  appDownloads: number
  appDownloadOrders: number
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
    ]
  },
  {
    title: 'Blogs',
    items: [
      { title: 'Blog Posts', href: '/admin/blog', icon: Globe, countKey: 'blogPosts', badgeVariant: 'default' },
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
    title: 'App Downloads',
    items: [
      { title: 'Demo Downloads', href: '/admin/app-downloads', icon: Download, countKey: 'appDownloads', badgeVariant: 'default' },
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
      appDownloads: 0,
      appDownloadOrders: 0
    }
  })
  const pathname = usePathname()
  const _router = useRouter()

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

    if (isAuthenticated) {
      fetchCounts()
      // Refresh counts every 30 seconds
      const interval = setInterval(fetchCounts, 30000)
      return () => clearInterval(interval)
    }
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Full width on mobile */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 transition-all duration-300 h-screen shadow-2xl',
          'w-72 lg:w-64', // Full width on mobile, standard on desktop
          collapsed && 'lg:w-20', // Only collapse on desktop
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section - Mobile optimized */}
        <div className="flex items-center justify-between h-[60px] sm:h-[65px] px-4 bg-slate-900/50 border-b border-slate-700/50 backdrop-blur-sm">
          {(!collapsed || sidebarOpen) && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center">
                <Image
                  src="/images/powerca-logo.png"
                  alt="PowerCA Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg text-white">PowerCA</span>
                <span className="text-xs text-slate-400 -mt-1">Admin Panel</span>
              </div>
            </div>
          )}
          {collapsed && !sidebarOpen && (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto">
              <Image
                src="/images/powerca-logo.png"
                alt="PowerCA Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="hidden lg:flex hover:bg-slate-800/60 text-slate-300 hover:text-white rounded-lg transition-all duration-300"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden hover:bg-slate-800/60 text-slate-300 hover:text-white rounded-lg transition-all duration-300"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Removed User Info Section - Going directly to navigation */}

        {/* Navigation - Mobile optimized */}
        <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6 custom-scrollbar">
          {navigation.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {(!collapsed || sidebarOpen) && (
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.subItems && item.subItems.some(sub => pathname === sub.href))
                  const isExpanded = expandedMenus.includes(item.title)
                  const hasSubItems = item.subItems && item.subItems.length > 0

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
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 sm:py-2.5 rounded-xl transition-all duration-300 group relative',
                            isActive
                              ? 'bg-slate-800/80 text-white'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          )}
                        >
                          <item.icon className={cn(
                            'h-5 w-5 flex-shrink-0 transition-transform duration-300',
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                          )} />
                          {(!collapsed || sidebarOpen) && (
                            <>
                              <span className="flex-1 text-sm font-medium text-left">{item.title}</span>
                              <ChevronDown className={cn(
                                'h-4 w-4 transition-transform duration-300',
                                isExpanded && 'rotate-180'
                              )} />
                            </>
                          )}
                        </button>
                        {/* Sub-items */}
                        {isExpanded && (!collapsed || sidebarOpen) && item.subItems && (
                          <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
                            {item.subItems.map((subItem) => {
                              const isSubActive = pathname === subItem.href
                              return (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  onClick={() => setSidebarOpen(false)}
                                  className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                                    isSubActive
                                      ? 'bg-blue-600 text-white'
                                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                                  )}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  {subItem.title}
                                </Link>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  }

                  // Regular menu item without sub-items
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)} // Close mobile menu on click
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 sm:py-2.5 rounded-xl transition-all duration-300 group relative',
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white hover:scale-[1.01] active:scale-[0.98]'
                      )}
                    >
                      <item.icon className={cn(
                        'h-5 w-5 flex-shrink-0 transition-transform duration-300',
                        isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-white group-hover:scale-105'
                      )} />
                      {(!collapsed || sidebarOpen) && (
                        <>
                          <span className="flex-1 text-sm font-medium">{item.title}</span>
                          {item.badge !== undefined && (
                            <Badge
                              variant={item.badgeVariant || 'default'}
                              className={cn(
                                "ml-auto text-xs px-2 py-0.5 font-semibold",
                                isActive ? 'bg-white/20 text-white border-white/30' : 'bg-slate-700 text-slate-200 border-slate-600'
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      {collapsed && !sidebarOpen && item.badge !== undefined && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full shadow-sm animate-pulse" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Button - Mobile optimized */}
        <div className="p-3 sm:p-4 border-t border-slate-700/50 bg-slate-900/50">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start text-red-400 hover:text-white hover:bg-red-600/90 py-2.5 sm:py-2.5 font-medium rounded-xl transition-all duration-300 hover:scale-[1.02]',
              collapsed && !sidebarOpen && 'justify-center'
            )}
            onClick={handleLogoutWithCleanup}
          >
            <LogOut className="h-5 w-5" />
            {(!collapsed || sidebarOpen) && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Mobile optimized */}
        <header className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 h-[60px] sm:h-[65px] flex items-center shadow-md">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden hover:bg-gray-100 -ml-2"
              >
                <Menu className="h-5 w-5" />
              </Button>

            </div>

            {/* Right Section - Mobile optimized */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-1 sm:space-x-2 hover:bg-gray-100 -mr-2 sm:mr-0">
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                      <AvatarFallback className="bg-primary-100 text-primary-700 text-xs sm:text-sm font-medium">
                        {adminUser.username?.[0]?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:block text-sm font-medium">{adminUser.username || 'Admin'}</span>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                  </Button>
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
            </div>
          </div>
        </header>

        {/* Page Content - Mobile optimized */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-2 sm:p-3">
          {children}
        </main>
      </div>
    </div>
  )
}