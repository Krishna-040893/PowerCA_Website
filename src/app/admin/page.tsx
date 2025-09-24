"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { AdminLogin } from "@/components/admin/admin-login"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    // Check if user is authenticated and has admin role
    if (session?.user) {
      // Check if user has admin role or is specifically authorized
      const userEmail = session.user.email
      const isAdmin = userEmail === "admin@powerca.in" || 
                     session.user.role === "admin" ||
                     userEmail === "contact@powerca.in"
      
      setIsAdminAuthenticated(isAdmin)
      
      if (!isAdmin) {
        // Redirect non-admin users
        router.push("/dashboard")
        return
      }
    }
    
    setIsLoading(false)
  }, [session, status, router])

  const handleAdminLogin = (success: boolean) => {
    if (success) {
      setIsAdminAuthenticated(true)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // If no session, show admin login
  if (!session) {
    return <AdminLogin onLogin={handleAdminLogin} />
  }

  // If session but not admin, show access denied
  if (session && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Show admin dashboard
  return <AdminDashboard />
}

