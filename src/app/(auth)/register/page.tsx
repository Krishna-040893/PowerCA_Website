'use client'

export const dynamic = 'force-dynamic'

import {useState, Suspense  } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {motion  } from 'framer-motion'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Label  } from '@/components/ui/label'
import {RadioGroup, RadioGroupItem  } from '@/components/ui/radio-group'
import {Checkbox  } from '@/components/ui/checkbox'
import {useRouter, useSearchParams  } from 'next/navigation'
import {Eye, EyeOff, User, Phone, Mail, Lock, ArrowLeft, Shield, GraduationCap  } from 'lucide-react'

function RegisterContent() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    membershipNumber: '',
    password: '',
    professionalType: 'CA'
  })
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    mobile: '',
    email: '',
    membershipNumber: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [userType, setUserType] = useState('professional')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  // Extract referral parameters from URL
  const getReferralParams = () => {
    // Check direct params first
    const ref = searchParams.get('ref')
    const cus = searchParams.get('cus')

    if (ref && cus) {
      return { ref, cus }
    }

    // Check callbackUrl params
    if (callbackUrl) {
      try {
        const url = new URL(callbackUrl, window.location.origin)
        const urlRef = url.searchParams.get('ref')
        const urlCus = url.searchParams.get('cus')
        if (urlRef && urlCus) {
          return { ref: urlRef, cus: urlCus }
        }
      } catch {
        // Invalid URL, ignore
      }
    }

    return { ref: null, cus: null }
  }

  const validateField = (field: string, value: string) => {
    let error = ''

    switch (field) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required'
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Name must contain only characters'
        } else if (value.trim().length < 2) {
          error = 'Name must be at least 2 characters'
        }
        break

      case 'mobile':
        if (!value.trim()) {
          error = 'Mobile number is required'
        } else if (!/^\d{10}$/.test(value.trim())) {
          error = 'Mobile number must be exactly 10 digits'
        }
        break

      case 'email':
        if (!value.trim()) {
          error = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = 'Enter a valid email with @ and .'
        }
        break

      case 'membershipNumber':
        if (!value.trim()) {
          error = 'Membership number is required'
        } else if (!/^\d{6}$/.test(value.trim())) {
          error = 'Membership number must be exactly 6 digits'
        }
        break

      case 'password':
        if (!value) {
          error = 'Password is required'
        } else if (value.length < 8) {
          error = 'Password must be at least 8 characters'
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = 'Password must contain at least one uppercase letter'
        } else if (!/(?=.*[0-9])/.test(value)) {
          error = 'Password must contain at least one number'
        } else if (!/(?=.*[!@#$%^&*])/.test(value)) {
          error = 'Password must contain at least one special character (!@#$%^&*)'
        }
        break
    }

    setFieldErrors(prev => ({ ...prev, [field]: error }))
    return error === ''
  }

  const validateForm = () => {
    const nameValid = validateField('name', formData.name)
    const mobileValid = validateField('mobile', formData.mobile)
    const emailValid = validateField('email', formData.email)
    const membershipValid = validateField('membershipNumber', formData.membershipNumber)
    const passwordValid = validateField('password', formData.password)

    return nameValid && mobileValid && emailValid && membershipValid && passwordValid
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleBlur = (field: string) => {
    validateField(field, formData[field as keyof typeof formData] as string)
  }

  const generateUsername = () => {
    const emailPart = formData.email.trim().split('@')[0] || ''
    const namePart = formData.name.trim().replace(/\s+/g, '') || ''
    const base = (emailPart || namePart || 'user').toLowerCase()
    const sanitized = base.replace(/[^a-z0-9]/g, '').slice(0, 16)
    const randomSuffix = Math.random().toString(36).slice(-6)
    return `${sanitized || 'user'}${randomSuffix}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreeToTerms) {
      setErrorMessage('Please agree to the terms and conditions to continue.')
      return
    }
    if (!validateForm()) {
      return
    }
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const membershipNumber = formData.membershipNumber.trim()
      const { ref, cus } = getReferralParams()

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        username: generateUsername(),
        phone: formData.mobile.trim(),
        password: formData.password,
        role: 'professional',
        professionalType: formData.professionalType,
        membershipNumber: membershipNumber.length > 0 ? membershipNumber : null,
        agreedToTerms: agreeToTerms,
        // Include referral params if available
        ...(ref && cus && { referralCode: ref, customerId: cus })
      }

      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        // Handle error response format from createErrorResponse
        const errorMsg = result?.error?.message || result?.error || result?.message || 'Registration failed. Please try again.'
        setErrorMessage(errorMsg)
        return
      }

      // Preserve callbackUrl when redirecting to login after successful registration
      const loginUrl = callbackUrl
        ? `/login?registered=1&callbackUrl=${encodeURIComponent(callbackUrl)}`
        : '/login?registered=1'
      router.push(loginUrl)
    } catch (error) {
      console.error('Registration error:', error)
      setErrorMessage('Unable to register right now. Please try again later.')
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
        className="absolute left-4 sm:left-6 top-4 sm:top-6 z-20"
      >
        <Link href="/" className="block">
          <Image
            src="/images/powerca-logo-main.png"
            alt="PowerCA"
            width={200}
            height={58}
            className="h-10 sm:h-12 w-auto filter brightness-0 invert"
            priority
          />
        </Link>
      </motion.div>

      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute right-4 sm:right-6 top-4 sm:top-6 z-20"
      >
        <Link
          href="/"
          className="group flex items-center gap-3 px-3 sm:px-6 py-3 backdrop-blur-md border border-white/20 rounded-full transition-all duration-300"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300">
            <ArrowLeft className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:inline text-white font-medium text-sm tracking-wide">
            Back to Home
          </span>
        </Link>
      </motion.div>

      {/* Register Form */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 pt-20 sm:pt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border-2 border-blue-100"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Welcome to Power CA
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Please enter your details to sign Up your new account
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-6 sm:mb-8 flex justify-center">
            <div className="bg-blue-50 border border-blue-200 rounded-full p-1 sm:p-2 inline-flex">
              <button
                onClick={() => setUserType('professional')}
                className={`px-3 sm:px-6 py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-200 flex items-center ${
                  userType === 'professional'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-600 hover:bg-blue-100'
                }`}
              >
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Professional
              </button>
              <Link
                href={callbackUrl ? `/register/student?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/register/student'}
                className="px-3 sm:px-6 py-2 rounded-full font-medium text-xs sm:text-sm transition-all duration-200 text-gray-500 hover:bg-gray-100 flex items-center"
              >
                <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Student
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900 font-medium">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder="Enter Your Name"
                      className={`pl-10 h-12 md:h-11 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl ${
                        fieldErrors.name ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Mobile Field */}
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-gray-900 font-medium">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      onBlur={() => handleBlur('mobile')}
                      placeholder="Enter Your Mobile number"
                      className={`pl-10 h-12 md:h-11 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl ${
                        fieldErrors.mobile ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.mobile && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.mobile}</p>
                  )}
                </div>

                {/* Professional Type */}
                {userType === 'professional' && (
                  <div className="space-y-3">
                    <Label className="text-gray-900 font-medium">Professional <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.professionalType}
                      onValueChange={(value) => handleInputChange('professionalType', value)}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CA" id="ca" className="text-blue-600" />
                        <Label htmlFor="ca" className="text-blue-600 font-medium">CA</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CMA" id="cma" />
                        <Label htmlFor="cma">CMA</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CS" id="cs" />
                        <Label htmlFor="cs">CS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NA" id="na" />
                        <Label htmlFor="na">NA</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="Enter Your Email"
                      className={`pl-10 pr-10 h-12 md:h-11 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl ${
                        fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Membership Number Field */}
                {userType === 'professional' && (
                  <div className="space-y-2">
                    <Label htmlFor="membershipNo" className="text-gray-900 font-medium">
                      Membership No <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="membershipNo"
                        type="text"
                        value={formData.membershipNumber}
                        onChange={(e) => handleInputChange('membershipNumber', e.target.value)}
                        onBlur={() => handleBlur('membershipNumber')}
                        placeholder="Number"
                        className={`pl-10 h-12 md:h-11 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl ${
                          fieldErrors.membershipNumber ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                    </div>
                    {fieldErrors.membershipNumber && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.membershipNumber}</p>
                    )}
                  </div>
                )}

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 font-medium">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="Enter Your Password"
                      className={`pl-10 pr-10 h-12 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl ${
                        fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''
                      }`}
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
                  {fieldErrors.password ? (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Password must contain at least 8 characters, one capital letter, one lowercase letter and numbers
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3 pt-4">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                By creating an Account Means you agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                  Terms and Conditions
                </Link>
                , and our{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {errorMessage && (
              <p className="text-center text-sm text-red-600">
                {errorMessage}
              </p>
            )}

            {/* Sign Up Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={isLoading || !agreeToTerms}
                className="h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                style={{
                  width: '465px',
                  maxWidth: '100%'
                }}
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </div>

            {/* Sign In Link */}
            <div className="text-center pt-4">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link
                  href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'}
                  className="text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  )
}
