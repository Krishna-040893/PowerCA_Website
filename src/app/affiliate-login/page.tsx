'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { signIn, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowLeft, AlertCircle, UserPlus } from 'lucide-react'

export default function AffiliateLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/affiliate/account'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.ok) {
        // Check if user is an affiliate by fetching session
        const response = await fetch('/api/auth/session')
        const session = await response.json()

        // Block non-affiliates from affiliate login
        if (session?.user?.role?.toLowerCase() !== 'affiliate') {
          // Sign out immediately to prevent login
          await signOut({ redirect: false })

          setError('You are not an affiliate partner. Please use the Client Login page.')
          setIsLoading(false)

          // Redirect to client login after 2 seconds
          setTimeout(() => {
            router.push('/login')
          }, 2000)
          return
        }

        router.refresh()
        router.push(callbackUrl)
      } else {
        setError(result?.error || 'Invalid email or password. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
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

      {/* PowerCA Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute left-6 top-6 z-20"
      >
        <Link href="/" className="block">
          <Image
            src="/images/powerca-logo-main.png"
            alt="PowerCA"
            width={200}
            height={60}
            className="h-12 w-auto filter brightness-0 invert"
            priority
          />
        </Link>
      </motion.div>

      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute right-6 top-6 z-20"
      >
        <Link
          href="/"
          className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300">
            <ArrowLeft className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-medium text-sm tracking-wide">
            Back to Home
          </span>
        </Link>
      </motion.div>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-purple-100"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <span className="inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-sm font-medium">
                Affiliate Partner Login
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome Back, Partner!
            </h1>
            <p className="text-gray-600">
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
              <Label htmlFor="email" className="text-gray-900 font-medium">
                Email / Phone
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email or Phone"
                  className="pl-10 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900 font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Your Password"
                  className="pl-10 pr-10 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Affiliate Registration CTA */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">New to Affiliate Program?</span>
              </div>
            </div>

            {/* Register as Affiliate Button */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-2 border-purple-200">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Not an Affiliate Partner yet?</h3>
                <p className="text-sm text-gray-600">
                  Join our affiliate program and earn 10% commission on every referral!
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white rounded-full font-medium transition-all duration-200"
                asChild
              >
                <Link href="/affiliate-program/register" className="flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Register as Affiliate Partner
                </Link>
              </Button>
            </div>

            {/* Client Login Link */}
            <div className="text-center pt-2">
              <p className="text-gray-600 text-sm">
                Are you a regular client?{' '}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Login Here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
