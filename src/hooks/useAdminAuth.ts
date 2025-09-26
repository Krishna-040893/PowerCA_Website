import {useState, useEffect  } from 'react'
import {useRouter  } from 'next/navigation'

interface AdminUser {
  username: string
  email: string
  role: string
}

export function useAdminAuth() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    const checkAdminAuth = () => {
      const token = localStorage.getItem('adminToken')
      const user = localStorage.getItem('adminUser')

      if (!token || !user) {
        router.push('/admin-login')
        return
      }

      try {
        const userData = JSON.parse(user) as AdminUser

        // Don't verify JWT client-side, let server-side verification handle it
        // Just check if token exists and is properly formatted
        if (token.split('.').length === 3) {
          setAdminUser(userData)
          setIsAuthenticated(true)
        } else {
          // Invalid token format
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          router.push('/admin-login')
          return
        }
      } catch (error) {
        console.error('Invalid admin session:', error)
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        router.push('/admin-login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin-login')
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    }
  }

  return {
    isAuthenticated,
    isLoading,
    adminUser,
    handleLogout,
    getAuthHeaders
  }
}