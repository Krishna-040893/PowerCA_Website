"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { navigationConfig } from "@/config/navigation"
import { Menu, X, User, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
<<<<<<< HEAD
import { useUser } from "@/context/user-context"
=======
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { data: session, status } = useSession()
<<<<<<< HEAD
  const { user: localUser, logout: localLogout } = useUser()

  // Use session if available, otherwise use localStorage user
  const currentUser = session?.user || localUser
=======
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/powerca-logo-horizontal.png"
              alt="PowerCA"
              width={180}
              height={52}
              className="h-12 w-auto"
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
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  {item.title}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
<<<<<<< HEAD
            ) : currentUser ? (
              <>
=======
            ) : session ? (
              <>
                <Button 
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                  asChild
                >
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
<<<<<<< HEAD
                      <span>{currentUser.username || currentUser.name || currentUser.email}</span>
=======
                      <span>{session.user?.name || session.user?.email}</span>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
<<<<<<< HEAD
                      <Link
                        href={
                          currentUser.role === 'admin' ? '/admin' :
                          currentUser.role === 'affiliate' ? '/affiliate/dashboard' :
                          '/dashboard'
                        }
                        className="flex items-center cursor-pointer"
                      >
=======
                      <Link href="/dashboard" className="flex items-center cursor-pointer">
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
<<<<<<< HEAD
                    {(currentUser.role === 'affiliate' || currentUser.role === 'Affiliate' || currentUser.is_affiliate) && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/affiliate/dashboard" className="flex items-center cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Affiliate Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/affiliate/account" className="flex items-center cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Create New Referral
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/affiliate/referral-dashboard" className="flex items-center cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            View My Referrals
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/checkout" className="flex items-center cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Checkout
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        if (session) {
                          signOut({ callbackUrl: '/' })
                        } else {
                          localLogout()
                        }
                      }}
=======
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center cursor-pointer">
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => signOut({ callbackUrl: '/' })}
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
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
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button 
                  size="sm"
                  className="bg-primary-600 hover:bg-primary-700 text-white animate-pulse-glow"
                  asChild
                >
<<<<<<< HEAD
                  <Link href="/book-demo">Book Demo</Link>
=======
                  <Link href="/demo">Book Demo</Link>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
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
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden py-4 border-t border-gray-100"
          >
            <nav className="flex flex-col space-y-4">
              {navigationConfig.mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-700 hover:text-primary-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              <div className="pt-4 space-y-2 border-t border-gray-100">
                {status === "loading" ? (
                  <div className="w-full h-10 bg-gray-200 animate-pulse rounded" />
<<<<<<< HEAD
                ) : currentUser ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Signed in as {currentUser.name || currentUser.email}
                    </div>
                    <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white" asChild>
                      <Link href="/checkout">Checkout</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-red-600"
                      onClick={() => {
                        if (session) {
                          signOut({ callbackUrl: '/' })
                        } else {
                          localLogout()
                        }
                      }}
=======
                ) : session ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-600">
                      Signed in as {session.user?.name || session.user?.email}
                    </div>
                    <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white" asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full text-red-600" 
                      onClick={() => signOut({ callbackUrl: '/' })}
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                    <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white" asChild>
<<<<<<< HEAD
                      <Link href="/book-demo">Book Demo</Link>
=======
                      <Link href="/demo">Book Demo</Link>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}