'use client'

import {Button  } from '@/components/ui/button'
import {Bell, LogOut, LayoutDashboard, ArrowLeft  } from 'lucide-react'
import {useRouter, usePathname  } from 'next/navigation'

interface AdminHeaderProps {
  title: string
  adminUser: { username: string; email: string } | null
  onLogout: () => void
}

export function AdminHeader({ title, adminUser, onLogout }: AdminHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isMainDashboard = pathname === '/admin'

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            {!isMainDashboard && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
                <div className="border-l pl-4">
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <p className="text-sm text-gray-600">Welcome back, {adminUser?.username}</p>
                </div>
              </>
            )}
            {isMainDashboard && (
              <div className="flex items-center space-x-4">
                <LayoutDashboard className="h-8 w-8 text-primary-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                  <p className="text-sm text-gray-600">Welcome back, {adminUser?.username}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}