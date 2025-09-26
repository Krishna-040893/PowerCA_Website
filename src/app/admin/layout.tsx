import {Metadata  } from 'next'
import { PageErrorBoundary } from '@/components/error-boundary'

export const metadata: Metadata = {
  title: 'Admin Panel - PowerCA',
  description: 'PowerCA Admin Panel for managing bookings and users',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PageErrorBoundary>
      {children}
    </PageErrorBoundary>
  )
}