import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Loading component for lazy loaded components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
)

// Lazy load heavy components with loading states
export const LazyPricingSection = dynamic(
  () => import('@/components/sections/pricing').then(mod => mod.PricingSection || mod.default),
  {
    loading: () => <LoadingSpinner />,
    ssr: true, // Enable server-side rendering
  }
)

export const LazyDashboardPreview = dynamic(
  () => import('@/components/sections/dashboard-preview'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false, // Disable SSR for client-only components
  }
)

export const LazyTestimonials = dynamic(
  () => import('@/components/sections/testimonials'),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  }
)

export const LazyFAQSection = dynamic(
  () => import('@/components/sections/faq-section').then(mod => mod.FAQSection || mod.default),
  {
    loading: () => <LoadingSpinner />,
    ssr: true,
  }
)

// Charts and data visualization (usually heavy)
export const LazyChartComponent = dynamic(
  () => import('@/components/ui/chart').then(mod => mod.Chart || mod.default),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// Admin components (only loaded when needed)
export const LazyAdminDashboard = dynamic(
  () => import('@/components/admin/admin-dashboard'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

export const LazyBookingTable = dynamic(
  () => import('@/components/admin/booking-table'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// Modal components (loaded on demand)
export const LazyPaymentModal = dynamic(
  () => import('@/components/modals/payment-modal').then(mod => mod.PaymentModal || mod.default),
  {
    loading: () => null, // No loading spinner for modals
    ssr: false,
  }
)

// Editor components (very heavy, load on demand)
export const LazyRichTextEditor = dynamic(
  () => import('@/components/editors/rich-text-editor').then(mod => mod.RichTextEditor || mod.default),
  {
    loading: () => <LoadingSpinner />,
    ssr: false,
  }
)

// Utility function to create lazy loaded component with custom loading
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T } | { [key: string]: T }>,
  options?: {
    loading?: ComponentType
    ssr?: boolean
    fallback?: ComponentType
  }
) {
  return dynamic(importFunc, {
    loading: options?.loading || (() => <LoadingSpinner />),
    ssr: options?.ssr !== false,
  })
}

// Example usage:
// const MyLazyComponent = createLazyComponent(
//   () => import('./MyHeavyComponent'),
//   { ssr: false }
// )