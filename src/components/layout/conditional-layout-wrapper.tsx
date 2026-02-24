'use client'

import {usePathname  } from 'next/navigation'
import {Header  } from '@/components/layout/header'
import {Footer  } from '@/components/layout/footer'

interface ConditionalLayoutWrapperProps {
  children: React.ReactNode
}

export function ConditionalLayoutWrapper({ children }: ConditionalLayoutWrapperProps) {
  const pathname = usePathname()

  // Routes that should exclude header and footer
  const excludeHeaderFooter = ['/login', '/register', '/register/student', '/forgot-password', '/reset-password', '/admin-login', '/admin', '/affiliate-login', '/affiliate-register']
  const shouldExcludeLayout = excludeHeaderFooter.includes(pathname) || pathname.startsWith('/admin/')

  if (shouldExcludeLayout) {
    return <div className="min-h-screen">{children}</div>
  }

  // Pages that should not have min-h-screen on main (to avoid extra space before footer)
  const noMinHeightPages = ['/affiliate/referral', '/download-error']
  const shouldSkipMinHeight = noMinHeightPages.some(page => pathname.startsWith(page))

  return (
    <>
      <Header />
      <main className={shouldSkipMinHeight ? '' : 'min-h-screen'}>
        {children}
      </main>
      <Footer />
    </>
  )
}