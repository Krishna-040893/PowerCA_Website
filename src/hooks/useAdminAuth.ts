import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AdminUser {
  username?: string
  email: string
  role: string
  name: string
}

export function useAdminAuth() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Check if user is authenticated and has admin role
  const isAuthenticated = status === 'authenticated' && session?.user?.role === 'admin'
  const isLoading = status === 'loading'

  // Redirect to admin-login if not authenticated or not an admin
  useEffect(() => {
    if (status === 'loading') return // Don't redirect while loading

    if (!session || session.user?.role !== 'admin') {
      router.push('/admin-login')
    }
  }, [session, status, router])

  // Map session user to adminUser format
  const adminUser: AdminUser | null = session?.user
    ? {
        username: session.user.username || session.user.name,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name,
      }
    : null

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin-login', redirect: true })
  }

  // No longer needed with NextAuth (uses HTTP-only cookies)
  // Kept for backwards compatibility but returns empty headers
  const getAuthHeaders = () => {
    return {}
  }

  return {
    isAuthenticated,
    isLoading,
    adminUser,
    handleLogout,
    getAuthHeaders,
  }
}