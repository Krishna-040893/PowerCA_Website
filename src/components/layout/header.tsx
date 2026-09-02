'use client'

import {useState, useEffect  } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {motion  } from 'framer-motion'
import {Button  } from '@/components/ui/button'
import {navigationConfig  } from '@/config/navigation'
import {Menu, X, User, LogOut, ChevronDown  } from 'lucide-react'
import {useSession, signOut  } from 'next-auth/react'
import {usePathname  } from 'next/navigation'
import {DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu'
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Transparent over the hero, solid white once the page moves under it, so the
  // nav stays readable against whatever scrolls past.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 w-full z-[60] transition-colors duration-200 ${
        isScrolled ? 'bg-white' : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-6 xl:px-12">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/powerca-logo-horizontal.png"
              alt="PowerCA"
              width={200}
              height={60}
              className="h-10 sm:h-12 w-auto"
              sizes="(max-width: 640px) 150px, 200px"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center lg:space-x-3 xl:space-x-6 absolute left-1/2 -translate-x-1/2">
            {navigationConfig.mainNav.map((item, index) => {
              const isActive = pathname === item.href
              const isHighlighted = 'highlighted' in item && item.highlighted
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={isHighlighted ? 'relative' : ''}
                >
                  {isHighlighted ? (
                    <Link
                      href={item.href}
                      className="relative group"
                    >
                      <motion.div
                        className="relative px-4 py-2 rounded-full text-[13px] font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg transition-all"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        {item.title}
                      </motion.div>
                    </Link>
                  ) : (
                    <Link
                      href={item.href}
                      className={`relative inline-block text-[15px] transition-colors px-2 pb-1 ${
                        isActive
                          ? 'text-[#2563eb] font-semibold after:absolute after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-[#2563eb]'
                          : 'text-gray-600 hover:text-[#2563eb] font-medium'
                      }`}
                    >
                      {item.title}
                    </Link>
                  )}
                </motion.div>
              )
            })}
          </nav>

          {/* CTA Buttons - Updated */}
          <div className="hidden lg:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#155dfc] hover:bg-[#155dfc] px-6 py-5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-10px_rgba(21,93,252,0.55)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.08),0_16px_32px_-10px_rgba(21,93,252,0.65)] hover:text-white">
                    <User className="w-4 h-4" />
                    <span>{session?.user?.name || session?.user?.email || 'User'}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent
                    align="end"
                    side="bottom"
                    sideOffset={12}
                    className="w-56 !z-[9999] shadow-xl rounded-2xl border border-gray-200 bg-white"
                    style={{ zIndex: 9999 }}
                    avoidCollisions={true}
                  >

                    <DropdownMenuSeparator />

                    {/* Affiliate Menu */}
                    {(session?.user?.role === 'affiliate' || session?.user?.role === 'Affiliate') ? (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/affiliate/profile" className="flex items-center cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            My Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/affiliate/referral" className="flex items-center cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            My Referrals
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : session?.user?.role === 'admin' ? (
                      /* Admin Menu */
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Admin Panel
                          </Link>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      /* Regular User Menu */
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="flex items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          My Account
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white hover:bg-blue-50 px-6 py-5 text-sm font-medium text-gray-800 shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-10px_rgba(16,24,40,0.35)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.08),0_16px_32px_-10px_rgba(16,24,40,0.45)] hover:text-blue-600"
                    >
                      <span>Sign In</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuContent
                      align="end"
                      side="bottom"
                      sideOffset={12}
                      className="w-56 !bg-blue-600 border border-blue-700 shadow-xl !z-[9999] text-white rounded-2xl"
                      style={{ zIndex: 9999, backgroundColor: '#2563eb' }}
                      avoidCollisions={true}
                    >
                    <DropdownMenuItem asChild className="focus:bg-blue-700 focus:text-white">
                      <Link href="/login" className="flex items-center cursor-pointer text-white hover:bg-blue-700 hover:text-white px-3 py-2.5 rounded-md transition-colors">
                        <User className="mr-2 h-4 w-4" />
                        <span className="font-medium">Client Sign In</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-blue-700 focus:text-white">
                      <Link href="/affiliate-login" className="flex items-center cursor-pointer text-white hover:bg-blue-700 hover:text-white px-3 py-2.5 rounded-md transition-colors">
                        <User className="mr-2 h-4 w-4" />
                        <span className="font-medium">Affiliate Sign In</span>
                      </Link>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenu>
                <Button
                  size="sm"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#155dfc] hover:bg-[#155dfc] px-6 py-5 text-sm font-medium text-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_10px_24px_-10px_rgba(21,93,252,0.55)] transition-shadow duration-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.08),0_16px_32px_-10px_rgba(21,93,252,0.65)] hover:text-white"
                  asChild
                >
                  <Link href="/book-demo">Book Demo</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden py-4 border-t border-gray-100"
          >
            <nav className="flex flex-col space-y-4">
              {navigationConfig.mainNav.map((item) => {
                const isActive = pathname === item.href
                const isHighlighted = 'highlighted' in item && item.highlighted
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`font-medium transition-colors ${
                      isHighlighted
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full text-[15px] text-center inline-block shadow-md'
                        : isActive
                        ? 'text-[#2563eb] font-semibold text-[17px]'
                        : 'text-gray-700 hover:text-[#2563eb] text-[15px]'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                )
              })}
              <div className="pt-4 space-y-2 border-t border-gray-100">
                {status === 'loading' ? (
                  <div className="w-full h-10 bg-gray-200 animate-pulse rounded" />
                ) : session ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Signed in as {session?.user?.name || session?.user?.email || 'User'}
                    </div>

                    {/* Affiliate Mobile Menu */}
                    {(session?.user?.role === 'affiliate' || session?.user?.role === 'Affiliate') ? (
                      <>
                        <Button variant="outline" className="w-full rounded-full" asChild>
                          <Link href="/affiliate/profile" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                        </Button>
                        <Button variant="outline" className="w-full rounded-full" asChild>
                          <Link href="/affiliate/referral" onClick={() => setIsMobileMenuOpen(false)}>My Referrals</Link>
                        </Button>
                      </>
                    ) : session?.user?.role === 'admin' ? (
                      /* Admin Mobile Menu */
                      <>
                        <Button variant="outline" className="w-full rounded-full" asChild>
                          <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
                        </Button>
                      </>
                    ) : (
                      /* Regular User Mobile Menu */
                      <Button variant="outline" className="w-full rounded-full" asChild>
                        <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full text-red-600 rounded-full"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-medium" asChild>
                        <Link href="/login">Client Sign In</Link>
                      </Button>
                      <Button variant="outline" className="w-full rounded-full border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 font-medium" asChild>
                        <Link href="/affiliate-login">Affiliate Sign In</Link>
                      </Button>
                    </div>
                    <Button className="w-full text-white rounded-full hover:opacity-90 transition-opacity px-[1.25rem] py-4" style={{ backgroundColor: '#155dfc' }} asChild>
                      <Link href="/book-demo" onClick={() => setIsMobileMenuOpen(false)}>Book Demo</Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}
