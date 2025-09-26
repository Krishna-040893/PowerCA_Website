'use client'

import { useEffect } from 'react'
import { initMonitoring, setMonitoringUserId } from '@/lib/monitoring'
import { useSession } from 'next-auth/react'

export function MonitoringProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  useEffect(() => {
    // Initialize monitoring only in production
    if (process.env.NODE_ENV === 'production') {
      initMonitoring()
    }
  }, [])

  useEffect(() => {
    // Set user ID when session changes
    if (session?.user?.email) {
      setMonitoringUserId(session.user.email)
    }
  }, [session])

  return <>{children}</>
}