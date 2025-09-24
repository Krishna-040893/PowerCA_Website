"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  Shield,
  BarChart3,
  FileText,
  Mail,
  UserCheck,
  Star,
  Command,
  Activity,
  TrendingUp,
  Eye,
  Globe,
  Lock,
  Zap,
  Crown,
  MonitorSpeaker,
  ArrowRight,
  Key
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AdminLayoutProps {
  children: React.ReactNode
}

// Embedded login component for direct admin access
function AdminLoginComponent() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: formData.username,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid username or password')
      } else if (result?.ok) {
        // Page will automatically re-render with authenticated state
        window.location.reload()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fillDefaultCredentials = () => {
    setFormData({
      username: 'admin',
      password: 'admin123'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-40 w-80 h-80 bg-indigo-500 rounded-full opacity-10 blur-3xl animate-pulse animation-delay-2000" />
      </div>

      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3">
              <Shield className="h-10 w-10 text-white transform -rotate-3" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-gray-300">Enter admin credentials to continue</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Administrator Login
            </CardTitle>
            <CardDescription className="text-center">
              Access the admin control panel
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Default Credentials Notice */}
            <Alert className="bg-blue-50 border-blue-200">
              <Key className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Default Admin Access:</strong>
                <div className="mt-1 font-mono text-sm">
                  Username: <span className="bg-blue-100 px-1 rounded">admin</span> |
                  Password: <span className="bg-blue-100 px-1 ml-1 rounded">admin123</span>
                </div>
                <button
                  type="button"
                  onClick={fillDefaultCredentials}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Click to autofill credentials
                </button>
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-9 bg-gray-50/50"
                    required
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-9 bg-gray-50/50"
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Access Admin Panel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-4 text-center text-xs text-gray-400">
          © 2024 PowerCA Admin. All rights reserved.
        </div>
      </div>
    </div>
  )
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<any>(null)
  const [isClient, setIsClient] = useState(false)

  const { data: session, status } = useSession()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || status === "loading") return

    if (session?.user && session.user.role === 'admin') {
      setAdminUser(session.user)
    }
    // Removed redirect - we'll show login form inline instead
  }, [session, status, router, isClient])

  const handleLogout = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  const menuSections = [
    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          active: pathname === "/admin",
          badge: null
        },
        {
          name: "Analytics",
          href: "/admin/analytics",
          icon: TrendingUp,
          active: pathname === "/admin/analytics",
          badge: "Pro"
        }
      ]
    },
    {
      title: "Management",
      items: [
        {
          name: "Bookings",
          href: "/admin/bookings",
          icon: Calendar,
          active: pathname === "/admin/bookings",
          badge: null
        },
        {
          name: "Registrations",
          href: "/admin/registrations",
          icon: FileText,
          active: pathname === "/admin/registrations",
          badge: null
        },
        {
          name: "User Management",
          href: "/admin/users/manage",
          icon: Users,
          active: pathname === "/admin/users/manage",
          badge: null
        },
        {
          name: "Affiliate Approvals",
          href: "/admin/affiliates/approve",
          icon: UserCheck,
          active: pathname === "/admin/affiliates/approve",
          badge: "New"
        },
        {
          name: "Affiliates",
          href: "/admin/affiliates",
          icon: Star,
          active: pathname === "/admin/affiliates",
          badge: null
        }
      ]
    },
    {
      title: "Communication",
      items: [
        {
          name: "Messages",
          href: "/admin/messages",
          icon: Mail,
          active: pathname === "/admin/messages",
          badge: "3"
        },
        {
          name: "Reports",
          href: "/admin/reports",
          icon: BarChart3,
          active: pathname === "/admin/reports",
          badge: null
        }
      ]
    },
    {
      title: "System",
      items: [
        {
          name: "Settings",
          href: "/admin/settings",
          icon: Settings,
          active: pathname === "/admin/settings",
          badge: null
        },
        {
          name: "Security",
          href: "/admin/security",
          icon: Lock,
          active: pathname === "/admin/security",
          badge: null
        }
      ]
    }
  ]

  if (!isClient || status === "loading") {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading Admin Panel...</p>
        </div>
      </div>
    )
  }

  // Show inline login form if not authenticated as admin
  if (!session?.user || session.user.role !== 'admin') {
    return <AdminLoginComponent />
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full w-72 bg-slate-800 border-r border-slate-700 shadow-2xl transform transition-all duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Crown className="w-10 h-10 text-emerald-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-xl font-bold text-white">PowerCA</span>
              <div className="text-xs text-emerald-400 font-medium tracking-wider">ADMIN CONTROL</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Admin Info Card */}
        <div className="m-4 p-4 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-xl border border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
              <Command className="w-6 h-6 text-slate-900 font-bold" />
            </div>
            <div>
              <div className="text-white font-semibold">{adminUser?.name || 'Admin'}</div>
              <div className="text-emerald-300 text-sm font-medium">System Administrator</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 pb-20 overflow-y-auto">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? 'mt-8' : 'mt-4'}>
              <div className="flex items-center gap-2 px-3 mb-3">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <h3 className="text-emerald-300 text-xs font-bold tracking-wider uppercase">{section.title}</h3>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                      item.active
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 transition-colors ${
                      item.active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'
                    }`} />
                    <span className="font-medium flex-1">{item.name}</span>
                    {item.badge && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        item.badge === 'Pro' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                        item.badge === 'New' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-300 hover:bg-red-900/20 hover:text-red-200 rounded-xl transition-all duration-200 border border-red-800/30 hover:border-red-600/50"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Navigation Bar */}
        <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
          <div className="flex items-center justify-between h-20 px-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search admin panel..."
                    className="pl-12 pr-6 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent w-80 text-white placeholder-slate-400 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <kbd className="px-2 py-1 text-xs text-slate-400 bg-slate-600 rounded border border-slate-500">⌘K</kbd>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <div className="hidden lg:flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors">
                  <Globe className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors">
                  <MonitorSpeaker className="w-5 h-5" />
                </button>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <Bell className="w-6 h-6" />
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                </div>
              </button>

              {/* Status Indicator */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-emerald-900/30 border border-emerald-700/50 rounded-lg">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300 text-sm font-medium">System Online</span>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                    <span className="text-slate-900 font-bold">{adminUser?.name?.[0] || 'A'}</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-white">{adminUser?.name || 'Admin'}</div>
                    <div className="text-xs text-emerald-400">Administrator</div>
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-slate-700">
                      <div className="text-white font-semibold">{adminUser?.name || 'Admin'}</div>
                      <div className="text-emerald-400 text-sm">{adminUser?.email || 'admin@powerca.in'}</div>
                    </div>
                    <Link
                      href="/admin/profile"
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <Users className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    <Link
                      href="/admin/security"
                      className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      Security
                    </Link>
                    <div className="border-t border-slate-700 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 admin-grid-pattern pointer-events-none"></div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}