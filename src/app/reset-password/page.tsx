'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')
  const [userType, setUserType] = useState('')

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    const typeParam = searchParams.get('type')

    if (!tokenParam) {
      setError('Invalid or missing reset token')
    } else {
      setToken(tokenParam)
      setUserType(typeParam || 'client')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          userType
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        toast.success('Password reset successful!')

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push(userType === 'affiliate' ? '/affiliate-login' : '/login')
        }, 3000)
      } else {
        // Extract error message from response object
        const errorMessage = result.error?.message || result.message || result.error || 'Failed to reset password. Please try again.'
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setError('An unexpected error occurred. Please try again.')
      toast.error('An unexpected error occurred.')
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


      {/* Back to Login Button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute right-6 top-6 z-20"
      >
        <Link
          href="/login"
          className="group flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300">
            <ArrowLeft className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-medium text-sm tracking-wide">
            Back to Login
          </span>
        </Link>
      </motion.div>

      {/* Reset Password Form */}
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
              alt="Power CA"
              width={200}
              height={58}
              className="h-10 w-auto"
              priority
            />
          </div>

          {success ? (
            // Success Message
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Password Reset Successful!
              </h1>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Redirecting you to login page...
              </p>
              <Button
                asChild
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium"
              >
                <Link href={userType === 'affiliate' ? '/affiliate-login' : '/login'}>
                  Go to Login
                </Link>
              </Button>
            </div>
          ) : (
            // Reset Password Form
            <>
              <div className="text-center mb-8">
                <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#001525] font-inter">
                  Reset Your Password
                </h1>
                <p className="text-gray-600">
                  Enter your new password below
                </p>
              </div>

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

                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[13px] font-medium text-[#001525]">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="h-12 md:h-12 rounded-xl border-gray-200 bg-white text-sm text-[#001525] placeholder:text-gray-400 transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10"
                      required
                      minLength={8}
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
                  <p className="text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[13px] font-medium text-[#001525]">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="h-12 md:h-12 rounded-xl border-gray-200 bg-white text-sm text-[#001525] placeholder:text-gray-400 transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[#001525]"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !token}
                  className="h-12 md:h-12 w-full rounded-full bg-[#001525] text-sm font-medium text-white transition-colors hover:bg-[#00223a]"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Button>

                {/* Back to Login Link */}
                <div className="text-center pt-4">
                  <p className="text-gray-600">
                    Remember your password?{' '}
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </>
          )}
        </motion.div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
