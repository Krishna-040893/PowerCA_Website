'use client'

import {usePathname  } from 'next/navigation'
import {Header  } from './header'
import {Footer  } from './footer'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide header and footer on admin pages
  const hideLayout = pathname?.startsWith('/admin')

  return (
    <>
      {!hideLayout && <Header />}
      <main className={hideLayout ? 'min-h-screen' : 'min-h-screen pt-16 lg:pt-20'}>
        {children}
      </main>
      {!hideLayout && <Footer />}
    </>
  )
}