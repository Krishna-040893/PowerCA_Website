"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"
import { Footer } from "./footer"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Hide header and footer on admin pages and book-demo page
  const hideLayout = pathname?.startsWith('/admin') || pathname === "/book-demo"
  
  return (
    <>
      {!hideLayout && <Header />}
      <main className={hideLayout ? "min-h-screen" : "min-h-screen pt-16 lg:pt-20"}>
        {children}
      </main>
      {!hideLayout && <Footer />}
    </>
  )
}