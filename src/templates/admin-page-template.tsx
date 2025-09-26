'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import {AdminHeader  } from '@/components/admin/admin-header'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Loader2  } from 'lucide-react'

// Template for admin pages using Supabase authentication
// Replace "YourAdminPage" with your actual page name

export default function YourAdminPage() {
  const { isAuthenticated, isLoading, adminUser, handleLogout, getAuthHeaders } = useAdminAuth()
  const [_data, setData] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/your-endpoint', {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const _data = await response.json()
        setData(_data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, fetchData])

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
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Your Page Title"
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Content Title</CardTitle>
            <CardDescription>Your content description</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : (
              <div>
                {/* Your content here */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}