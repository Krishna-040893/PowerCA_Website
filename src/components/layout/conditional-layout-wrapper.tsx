'use client'

import {usePathname  } from 'next/navigation'
import {Header  } from '@/components/layout/header'
import {Footer  } from '@/components/layout/footer'
import PromotionalBanner from '@/components/promotional-banner'

interface ConditionalLayoutWrapperProps {
  children: React.ReactNode
}

export function ConditionalLayoutWrapper({ children }: ConditionalLayoutWrapperProps) {
  const pathname = usePathname()

  // Routes that should exclude header and footer
  const excludeHeaderFooter = ['/login', '/register', '/register/student', '/forgot-password', '/admin-login', '/admin']
  const shouldExcludeLayout = excludeHeaderFooter.includes(pathname) || pathname.startsWith('/admin/')

  if (shouldExcludeLayout) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <>
      <PromotionalBanner />
      <Header />
      <main className="min-h-screen" style={{ paddingTop: 'var(--content-padding-top, 128px)' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}