'use client'

import {useState, useEffect  } from 'react'
import {useRouter, usePathname  } from 'next/navigation'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import Link from 'next/link'
import {cn  } from '@/lib/utils'
import { Users, Settings, LogOut, Menu, X, ChevronLeft, Shield, ChevronDown, Search, LayoutDashboard, Calendar, FileText, UserCheck, Star, UsersRound, CreditCard, ShoppingCart, Globe, Mail } from 'lucide-react'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
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
  countKey?: 'bookings' | 'registrations' | 'affiliates' | 'pendingApprovals' | 'referrals' | 'pendingPayments' | 'payments' | 'paymentOrders' | 'newsletterSubscribers' | 'blogPosts'
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
  referrals: number
  pendingPayments: number
  payments: number
  paymentOrders: number
  newsletterSubscribers: number
  blogPosts: number
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
      { title: 'Payments', href: '/admin/payments', icon: CreditCard, countKey: 'payments', badgeVariant: 'default' },
      { title: 'Payment Orders', href: '/admin/payment-orders', icon: ShoppingCart, countKey: 'paymentOrders', badgeVariant: 'default' },
      { title: 'Newsletter Subscribers', href: '/admin/newsletter-subscribers', icon: Mail, countKey: 'newsletterSubscribers', badgeVariant: 'default' },
      { title: 'Blog Posts', href: '/admin/blog', icon: Globe, countKey: 'blogPosts', badgeVariant: 'default' },
    ]
  },
  {
    title: 'Affiliates',
    items: [
      { title: 'All Affiliates', href: '/admin/affiliates', icon: Star, countKey: 'affiliates', badgeVariant: 'default' },
      { title: 'Approved', href: '/admin/affiliates/approve', icon: UserCheck, countKey: 'pendingApprovals', badgeVariant: 'destructive' },
      { title: 'Affiliate Referrals', href: '/admin/affiliate-referrals', icon: UsersRound, countKey: 'referrals', badgeVariant: 'default' },
      { title: 'Affiliate Payments', href: '/admin/affiliate-payments', icon: Star, countKey: 'pendingPayments', badgeVariant: 'default' },
    ]
  },
  {
    title: 'System',
    items: [
      { title: 'Settings', href: '/admin/settings', icon: Settings },
    ]
  }
]

export function AdminSidebarLayout({ children }: AdminSidebarLayoutProps) {
  const { isAuthenticated, isLoading, adminUser, handleLogout } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [navigation, setNavigation] = useState<NavSection[]>(getBaseNavigation())
  const [counts, setCounts] = useState<Counts>({
    bookings: 0,
    registrations: 0,
    affiliates: 0,
    pendingApprovals: 0,
    referrals: 0,
    pendingPayments: 0,
    payments: 0,
    paymentOrders: 0,
    newsletterSubscribers: 0,
    blogPosts: 0
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
          setCounts(data)
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

  // Update navigation with counts
  useEffect(() => {
    const baseNav = getBaseNavigation()
    const updatedNav = baseNav.map(section => ({
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
    setNavigation(updatedNav)
  }, [counts])

  // Check if sidebar should be collapsed based on saved preference
  useEffect(() => {
    const savedState = localStorage.getItem('adminSidebarCollapsed')
    if (savedState === 'true') {
      setCollapsed(true)
    }
  }, [])

  // Save collapsed state
  const toggleCollapsed = () => {
    const newState = !collapsed
    setCollapsed(newState)
    localStorage.setItem('adminSidebarCollapsed', newState.toString())
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
          'fixed lg:relative inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-200 transition-all duration-300 h-screen',
          'w-72 lg:w-64', // Full width on mobile, standard on desktop
          collapsed && 'lg:w-20', // Only collapse on desktop
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Section - Mobile optimized */}
        <div className="flex items-center justify-between h-[60px] sm:h-[65px] px-4 bg-white border-b border-gray-100">
          {(!collapsed || sidebarOpen) && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg text-gray-900">PowerCA</span>
                <span className="text-xs text-gray-500 -mt-1">Admin Panel</span>
              </div>
            </div>
          )}
          {collapsed && !sidebarOpen && (
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className="hidden lg:flex hover:bg-gray-100"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Removed User Info Section - Going directly to navigation */}

        {/* Navigation - Mobile optimized */}
        <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
          {navigation.map((section, sectionIdx) => (
            <div key={sectionIdx}>
              {(!collapsed || sidebarOpen) && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)} // Close mobile menu on click
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg transition-all duration-200 group relative',
                        isActive
                          ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                      )}
                    >
                      <item.icon className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isActive ? 'text-primary-700' : 'text-gray-400 group-hover:text-gray-600'
                      )} />
                      {(!collapsed || sidebarOpen) && (
                        <>
                          <span className="flex-1 text-sm font-medium">{item.title}</span>
                          {item.badge !== undefined && (
                            <Badge
                              variant={item.badgeVariant || 'default'}
                              className="ml-auto text-xs px-2 py-0.5"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                      {collapsed && !sidebarOpen && item.badge !== undefined && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full shadow-sm" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Button - Mobile optimized */}
        <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 py-2.5 sm:py-2 font-medium',
              collapsed && !sidebarOpen && 'justify-center'
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {(!collapsed || sidebarOpen) && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Mobile optimized */}
        <header className="bg-white border-b border-gray-200 px-3 sm:px-4 lg:px-6 h-[60px] sm:h-[65px] flex items-center shadow-sm">
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

              {/* Search Bar - Hidden on small mobile, visible on tablet+ */}
              <div className="relative w-48 sm:w-64 md:w-80 lg:w-96 hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-10 bg-gray-50 h-9 text-sm border-gray-200"
                />
              </div>

              {/* Mobile Search Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden hover:bg-gray-100"
              >
                <Search className="h-5 w-5 text-gray-600" />
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
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span className="text-sm">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="text-sm">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content - Mobile optimized */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}