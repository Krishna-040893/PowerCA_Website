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
  const excludeHeaderFooter = ['/login', '/register', '/register/student', '/forgot-password', '/reset-password', '/admin-login', '/admin', '/affiliate-login', '/affiliate-register', '/book-demo']
  const shouldExcludeLayout = excludeHeaderFooter.includes(pathname) || pathname.startsWith('/admin/')

  if (shouldExcludeLayout) {
    return <div className="min-h-screen">{children}</div>
  }

  // Pages that should not have min-h-screen on main (to avoid extra space before footer)
  const noMinHeightPages = ['/affiliate/referral']
  const shouldSkipMinHeight = noMinHeightPages.some(page => pathname.startsWith(page))

  return (
    <>
      <PromotionalBanner />
      <Header />
      <main className={shouldSkipMinHeight ? '' : 'min-h-screen'} style={{ paddingTop: 'var(--content-padding-top, 128px)' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}