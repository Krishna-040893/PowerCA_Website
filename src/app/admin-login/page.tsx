'use client'

import {useState  } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {motion  } from 'framer-motion'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Label  } from '@/components/ui/label'
import {Checkbox  } from '@/components/ui/checkbox'
import {signIn, useSession  } from 'next-auth/react'
import {useRouter  } from 'next/navigation'
import {Eye, EyeOff, User, Lock, ArrowLeft, Shield, Loader2  } from 'lucide-react'
import {toast  } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()
  const { data: session, update: updateSession } = useSession()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // eslint-disable-next-line no-console
  console.log('🔐 Admin Login Page loaded', { currentSession: session })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('🔐 Admin login attempt:', {
      username,
      usernameValue: username,
      usernameType: typeof username,
      hasPassword: !!password,
      passwordLength: password?.length || 0,
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL || window.location.origin
    })

    try {
      // IMPORTANT: Admin uses username field (not email)
      // Build credentials object without email field for admin login
      const credentials: Record<string, string> = {
        username: username.trim(), // Admin uses username (trim whitespace)
        password: password,
      }

      console.log('📤 Sending credentials to NextAuth:', {
        hasUsername: !!credentials.username,
        usernameValue: credentials.username,
        hasEmail: 'email' in credentials
      })

      // Show loading toast
      toast.loading('Authenticating...', { id: 'auth-toast' })

      // Use redirect: false to handle everything manually
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false, // Don't auto-redirect, handle manually
        callbackUrl: '/admin', // Specify callback URL for proper redirect
      })

      console.log('📦 NextAuth signIn result:', {
        ok: result?.ok,
        status: result?.status,
        error: result?.error,
        url: result?.url
      })

      // Dismiss loading toast
      toast.dismiss('auth-toast')

      if (result?.error) {
        console.error('❌ Login failed:', result.error)
        const errorMessage = result.error || 'Invalid credentials'
        setError(errorMessage)
        toast.error(errorMessage, {
          description: 'Please check your username and password',
          duration: 4000,
        })
        return
      }

      if (result?.ok) {
        console.log('✅ Admin login successful - Updating session...')

        toast.success('Login successful!', { id: 'auth-success' })

        // Force session update to get fresh session data
        await updateSession()

        console.log('🔄 Session updated, navigating to /admin...')

        // Use router.push for client-side navigation
        router.push('/admin')

        // Also set a backup redirect in case router.push fails
        setTimeout(() => {
          console.log('⚠️ Backup redirect triggered')
          window.location.href = '/admin'
        }, 3000)
      } else {
        const errorMsg = 'Login failed. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setError(errorMsg)
      toast.error('Login Error', {
        description: errorMsg,
        duration: 5000,
      })
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
          backgroundImage: "url('/images/login-bg.png')",
          filter: 'hue-rotate(15deg) brightness(0.9)' // Slightly different tint for admin
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
            height={58}
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
          className="w-full max-w-lg bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-blue-100"
        >
          {/* Admin Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Portal Access
            </h1>
            <p className="text-gray-600">
              Please enter your admin credentials to continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-900 font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter Admin Username"
                  className="pl-10 h-12 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl"
                  required
                  disabled={isLoading}
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
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Admin Password"
                  className="pl-10 pr-10 h-12 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl"
                  required
                  disabled={isLoading}
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

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Remember Me */}
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
                href="/contact"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Need Help?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Sign In
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-gray-600">
                  <p className="font-semibold text-gray-900 mb-1">Security Notice</p>
                  <p className="leading-relaxed">
                    This is a secure admin portal. All login attempts are monitored and logged.
                    Unauthorized access attempts will be reported.
                  </p>
                </div>
              </div>
            </div>

            {/* User Login Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-gray-600">
                Not an admin?{' '}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Go to User Login
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}