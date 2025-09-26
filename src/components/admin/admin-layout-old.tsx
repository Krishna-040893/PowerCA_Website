'use client'

import {useState, useEffect  } from 'react'
import {useRouter, usePathname  } from 'next/navigation'
import {useSession, signOut  } from 'next-auth/react'
import type { AdminUser } from '@/types/admin'
import Link from 'next/link'
import { LogOut, Menu, X, ChevronDown, Bell, Search, Shield, LayoutDashboard, Calendar, FileText, Users, UserCheck, Star, BarChart3, Mail, Settings } from 'lucide-react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user || session.user.role !== 'admin') {
      router.push('/admin/login')
    } else {
      setAdminUser(session.user as unknown as AdminUser)
    }
  }, [session, status, router])

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admin/dashboard'
    },
    {
      name: 'Manage Bookings',
      href: '/admin/bookings',
      icon: Calendar,
      active: pathname === '/admin/bookings'
    },
    {
      name: 'Registrations',
      href: '/admin/registrations',
      icon: FileText,
      active: pathname === '/admin/registrations'
    },
    {
      name: 'Customers',
      href: '/admin/customers',
      icon: Users,
      active: pathname === '/admin/customers'
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: UserCheck,
      active: pathname === '/admin/users'
    },
    {
      name: 'Affiliates',
      href: '/admin/affiliates',
      icon: Star,
      active: pathname === '/admin/affiliates'
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: BarChart3,
      active: pathname === '/admin/reports'
    },
    {
      name: 'Messages',
      href: '/admin/messages',
      icon: Mail,
      active: pathname === '/admin/messages'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      active: pathname === '/admin/settings'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">PowerCA Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative text-gray-500 hover:text-gray-700">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">A</span>
                  </div>
                  <span className="hidden md:block font-medium">
                    {adminUser?.username || 'Admin'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link
                      href="/admin/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}