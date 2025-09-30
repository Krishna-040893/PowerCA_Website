'use client'

import {useState  } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {motion  } from 'framer-motion'
import {Button  } from '@/components/ui/button'
import {navigationConfig  } from '@/config/navigation'
import {Menu, X, User, LogOut, ChevronDown  } from 'lucide-react'
import {useSession, signOut  } from 'next-auth/react'
import {DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()

  return (
    <header
      className="fixed w-full z-[60] bg-white"
      style={{ top: 'var(--banner-height, 48px)' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
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
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationConfig.mainNav.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="text-gray-600 hover:text-[#2563eb] font-medium transition-colors text-[15px]"
                >
                  {item.title}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* CTA Buttons - Updated */}
          <div className="hidden lg:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session ? (
              <>
                <Button
                  size="sm"
                  className="text-white rounded-full hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#155dfc' }}
                  asChild
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{session?.user?.name || session?.user?.email || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {session?.user?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center cursor-pointer">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-800 hover:text-blue-600 font-medium flex items-center space-x-1 border border-gray-200 hover:border-blue-300 rounded-full px-4 py-2 bg-white hover:bg-blue-50 transition-all duration-200"
                    >
                      <span>Sign In</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuContent
                      align="center"
                      side="bottom"
                      sideOffset={8}
                      className="w-48 !bg-blue-600 border border-blue-700 shadow-lg !z-[9999] text-white"
                      style={{ zIndex: 9999, backgroundColor: '#2563eb' }}
                      avoidCollisions={false}
                    >
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="flex items-center cursor-pointer text-white hover:bg-blue-700 hover:text-white">
                        <User className="mr-2 h-4 w-4" />
                        Client Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/affiliate-login" className="flex items-center cursor-pointer text-white hover:bg-blue-700 hover:text-white">
                        <User className="mr-2 h-4 w-4" />
                        Affiliate Sign In
                      </Link>
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenu>
                <Button
                  size="sm"
                  className="text-white rounded-full hover:opacity-90 transition-opacity px-6 py-4 font-medium"
                  style={{ backgroundColor: '#155dfc' }}
                  asChild
                >
                  <Link href="/book-demo">Book Demo</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
              {navigationConfig.mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-[#2563eb] font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              <div className="pt-4 space-y-2 border-t border-gray-100">
                {status === 'loading' ? (
                  <div className="w-full h-10 bg-gray-200 animate-pulse rounded" />
                ) : session ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Signed in as {session?.user?.name || session?.user?.email || 'User'}
                    </div>
                    <Button className="w-full text-white rounded-full hover:opacity-90 transition-opacity" style={{ backgroundColor: '#155dfc' }} asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
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
                      <Link href="/book-demo">Book Demo</Link>
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