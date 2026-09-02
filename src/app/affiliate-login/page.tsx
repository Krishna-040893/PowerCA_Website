'use client'

export const dynamic = 'force-dynamic'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { signIn, signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, AlertCircle, UserPlus } from 'lucide-react'

function AffiliateLoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/affiliate/referral'

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Validate email on blur
  const handleEmailBlur = () => {
    if (email && !isValidEmail(email)) {
      setEmailError('Enter valid email address')
    } else {
      setEmailError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    let hasError = false

    // Validate email format
    if (!isValidEmail(email)) {
      setError('Enter valid email address')
      setIsLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: callbackUrl, // Explicitly pass callbackUrl
      })

      if (result?.ok) {

        // Wait for session to be established (important for Vercel)
        // Increased delay for Vercel edge network
        await new Promise(resolve => setTimeout(resolve, 1200))

        // Check if user is an affiliate by fetching session
        // Try multiple times to ensure session is established on Vercel
        let session = null
        let retries = 0
        const maxRetries = 3

        while (retries < maxRetries) {
          const response = await fetch('/api/auth/session', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          })
          const data = await response.json()

          if (data?.user?.role) {
            session = data
            break
          }

          retries++
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }

        // Block non-affiliates from affiliate login
        if (!session?.user || session?.user?.role?.toLowerCase() !== 'affiliate') {
          // Sign out immediately to prevent login
          await signOut({ redirect: false })

          setError('You are not an affiliate partner. Please use the Client Login page.')
          hasError = true

          // Redirect to client login after 2 seconds
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
          return
        }

        // Use window.location.href for full page reload to ensure session is established
        // Critical for Vercel deployments
        window.location.href = callbackUrl
      } else {
        setError(result?.error || 'Invalid email or password. Please try again.')
        hasError = true
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
      hasError = true
    } finally {
      // Don't set loading to false if redirect is happening
      if (hasError) {
        setIsLoading(false)
      }
      // Keep loading state if successful to avoid flicker before redirect
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/login-bg.png')"
        }}
      />


      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 pt-20 sm:pt-6 relative z-10">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-white/60 bg-white/95 p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_32px_64px_-24px_rgba(16,24,40,0.35)] backdrop-blur-sm sm:p-8"
        >
          {/* Brand */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/images/powerca-logo-main.png"
              alt="PowerCA"
              width={200}
              height={58}
              className="h-10 w-auto"
              priority
            />
          </div>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#001525] font-inter">
              Welcome Back, Partner!
            </h1>
            <p className="text-sm text-gray-500">
              Sign in to access your affiliate dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-medium text-[#001525]">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (emailError) {
                      setEmailError('')
                    }
                    if (error) {
                      setError('')
                      setIsLoading(false)
                    }
                  }}
                  onBlur={handleEmailBlur}
                  placeholder="Enter Your Email"
                  className={`h-12 md:h-12 rounded-xl border-gray-200 bg-white px-4 text-sm text-[#001525] placeholder:text-gray-400 transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 ${emailError ? 'border-red-500' : ''}`}
                  required
                />
              </div>
              {emailError && (
                <p className="text-sm text-red-600 mt-1">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[13px] font-medium text-[#001525]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) {
                      setError('')
                      setIsLoading(false)
                    }
                  }}
                  placeholder="Enter Your Password"
                  className="h-12 md:h-12 rounded-xl border-gray-200 bg-white px-4 pr-11 text-sm text-[#001525] placeholder:text-gray-400 transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[#001525]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-purple-600 underline-offset-4 transition-colors hover:text-purple-800 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 md:h-12 w-full rounded-full bg-[#001525] text-sm font-medium text-white transition-colors hover:bg-[#00223a]"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Affiliate Registration CTA */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-xs uppercase tracking-wide text-gray-400">New to Affiliate Program?</span>
              </div>
            </div>

            {/* Register as Affiliate Button */}
            <Button
              type="button"
              variant="outline"
              className="h-12 md:h-12 w-full rounded-full border border-gray-200 bg-white text-sm font-medium text-[#001525] transition-colors hover:border-gray-300 hover:bg-gray-50"
              asChild
            >
              <Link href="/affiliate-register" className="flex items-center justify-center gap-2">
                <UserPlus className="h-4 w-4" />
                Register as Affiliate Partner
              </Link>
            </Button>

            {/* Client Login Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                Are you a regular client?{' '}
                <Link
                  href="/login"
                  className="font-medium text-purple-600 underline-offset-4 transition-colors hover:text-purple-800 hover:underline"
                >
                  Login Here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function AffiliateLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AffiliateLoginContent />
    </Suspense>
  )
}
