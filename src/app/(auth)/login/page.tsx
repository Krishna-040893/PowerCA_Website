'use client'

export const dynamic = 'force-dynamic'

import {useState, Suspense  } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {motion  } from 'framer-motion'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Label  } from '@/components/ui/label'
import {Checkbox  } from '@/components/ui/checkbox'
import { signIn, signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/account?tab=billing'

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

        // Block affiliates from client login
        if (session?.user && session?.user?.role?.toLowerCase() === 'affiliate') {
          // Sign out immediately to prevent login
          await signOut({ redirect: false })

          setError('You are an affiliate partner. Please use the Affiliate Login page.')
          hasError = true

          // Redirect to affiliate login after 2 seconds
          setTimeout(() => {
            window.location.href = '/affiliate-login'
          }, 2000)
          return
        }

        // Check if user has a pending affiliate referral
        try {
          const referralResponse = await fetch('/api/user/referral-info')
          const referralData = await referralResponse.json()

          if (referralData.hasReferral && referralData.referralInfo?.status === 'pending') {
            // Referral user - redirect to account page with billing tab
            window.location.href = '/account?tab=billing'
            return
          }
        } catch (referralError) {
          console.error('Error checking referral info:', referralError)
          // Continue with normal redirect if referral check fails
        }

        // Use window.location.href for full page reload to ensure session is established
        window.location.href = callbackUrl
      } else {
        setError(result?.error || 'Invalid email or password. Please try again.')
        hasError = true
      }
    } catch (error) {
      console.error('Login error:', error)
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
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
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
          <div className="text-center mb-8">
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#001525] font-inter">
              Welcome, PowerCA
            </h1>
            <p className="text-gray-600">
              Please enter your details to sign in your account
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
                  className={`h-12 md:h-12 rounded-xl border-gray-200 bg-white text-sm text-[#001525] placeholder:text-gray-400 transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 ${emailError ? 'border-red-500' : ''}`}
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
                  className="h-12 md:h-12 rounded-xl border-gray-200 bg-white text-sm text-[#001525] placeholder:text-gray-400 transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[#001525]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
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
                <Label htmlFor="remember" className="text-sm text-gray-700">
                  Remember me
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
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

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Don't have an Account?{' '}
                <Link
                  href={callbackUrl && callbackUrl !== '/account?tab=billing' ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/register'}
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Sign Up
                </Link>
              </p>
            </div>

            {/* Affiliate Login Link */}
            <div className="text-center pt-2">
              <p className="text-gray-600 text-sm">
                Are you an Affiliate Partner?{' '}
                <Link
                  href={callbackUrl && callbackUrl !== '/account?tab=billing' ? `/affiliate-login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/affiliate-login'}
                  className="text-purple-600 hover:text-purple-800 font-medium underline"
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}