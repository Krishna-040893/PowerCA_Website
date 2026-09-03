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
import { Eye, EyeOff, ArrowLeft, Shield, GraduationCap } from 'lucide-react'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

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
        } else if (value.length < 10) {
          error = 'Please enter a valid phone number'
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
        if (formData.professionalType === 'Others') {
          // Membership number is optional for Others
          if (value.trim() && !/^\d{6}$/.test(value.trim())) {
            error = 'Membership number must be exactly 6 digits'
          }
        } else {
          if (!value.trim()) {
            error = 'Membership number is required'
          } else if (!/^\d{6}$/.test(value.trim())) {
            error = 'Membership number must be exactly 6 digits'
          }
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
    const membershipValid = formData.professionalType === 'Others'
      ? validateField('membershipNumber', formData.membershipNumber) // optional validation (allows empty)
      : validateField('membershipNumber', formData.membershipNumber)
    const passwordValid = validateField('password', formData.password)

    return nameValid && mobileValid && emailValid && membershipValid && passwordValid
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
    // Clear membership number when switching to Others (not accepted for Others)
    if (field === 'professionalType' && value === 'Others') {
      setFormData(prev => ({ ...prev, membershipNumber: '' }))
      setFieldErrors(prev => ({ ...prev, membershipNumber: '' }))
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
      // Default to account page with billing tab for new registrations
      const redirectUrl = callbackUrl || '/account?tab=billing'
      const loginUrl = `/login?registered=1&callbackUrl=${encodeURIComponent(redirectUrl)}`
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


      {/* Register Form */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 pt-20 sm:pt-6 relative z-10">
        <div className="w-full max-w-4xl">
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

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#001525] font-inter">
              Welcome to Power CA
            </h1>
            <p className="text-sm text-gray-500">
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
                  <Label htmlFor="name" className="text-[13px] font-medium text-[#001525]">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder="Enter Your Name"
                      className={`h-12 md:h-12 rounded-xl border-gray-200 bg-white px-4 text-sm text-[#001525] placeholder:text-gray-400 transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 ${
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
                  <Label htmlFor="mobile" className="text-[13px] font-medium text-[#001525]">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <div className={fieldErrors.mobile ? '[&_input]:!border-red-500 [&_.PhoneInputCountry]:!border-red-500' : ''}>
                    <PhoneInput
                      international
                      defaultCountry="IN"
                      value={formData.mobile}
                      onChange={(value) => handleInputChange('mobile', value || '')}
                      onBlur={() => handleBlur('mobile')}
                      className="flex gap-0 [&>input]:h-12 [&>input]:md:h-12 [&>input]:bg-white [&>input]:border [&>input]:border-gray-200 [&>input]:rounded-r-xl [&>input]:px-4 [&>input]:text-sm [&>input]:text-[#001525] [&>input]:placeholder:text-gray-400 [&>input]:transition-all [&>input]:focus:border-[#001525] [&>input]:focus:outline-none [&>.PhoneInputCountry]:h-12 [&>.PhoneInputCountry]:md:h-12 [&>.PhoneInputCountry]:bg-white [&>.PhoneInputCountry]:border [&>.PhoneInputCountry]:border-gray-200 [&>.PhoneInputCountry]:border-r-0 [&>.PhoneInputCountry]:rounded-l-xl [&>.PhoneInputCountry]:px-3 [&>.PhoneInputCountry]:flex [&>.PhoneInputCountry]:items-center [&>.PhoneInputCountry]:gap-2 [&_.PhoneInputCountryIcon]:w-5 [&_.PhoneInputCountryIcon]:h-5 [&_.PhoneInputCountryIcon]:shadow-none [&_.PhoneInputCountrySelectArrow]:opacity-50"
                      numberInputProps={{
                        className: "flex-1"
                      }}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {fieldErrors.mobile && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.mobile}</p>
                  )}
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[13px] font-medium text-[#001525]">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="Enter Your Email"
                      className={`pr-11 h-12 md:h-12 rounded-xl border-gray-200 bg-white px-4 text-sm text-[#001525] placeholder:text-gray-400 transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 ${
                        fieldErrors.email ? 'border-red-500 focus:border-red-500' : ''
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[13px] font-medium text-[#001525]">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      placeholder="Enter Your Password"
                      className={`pr-11 h-12 md:h-12 rounded-xl border-gray-200 bg-white px-4 text-sm text-[#001525] placeholder:text-gray-400 transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 ${
                        fieldErrors.password ? 'border-red-500 focus:border-red-500' : ''
                      }`}
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

            {/* Professional Type & Membership No - Same Row */}
            {userType === 'professional' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-3">
                  <Label className="text-[13px] font-medium text-[#001525]">Professional Type <span className="text-red-500">*</span></Label>
                  <RadioGroup
                    value={formData.professionalType}
                    onValueChange={(value) => handleInputChange('professionalType', value)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CA" id="ca" className="text-blue-600" />
                      <Label htmlFor="ca" className={`font-medium cursor-pointer ${formData.professionalType === 'CA' ? 'text-blue-600' : 'text-gray-600'}`}>CA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CMA" id="cma" className="text-blue-600" />
                      <Label htmlFor="cma" className={`font-medium cursor-pointer ${formData.professionalType === 'CMA' ? 'text-blue-600' : 'text-gray-600'}`}>CMA</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="CS" id="cs" className="text-blue-600" />
                      <Label htmlFor="cs" className={`font-medium cursor-pointer ${formData.professionalType === 'CS' ? 'text-blue-600' : 'text-gray-600'}`}>CS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Others" id="others" className="text-blue-600" />
                      <Label htmlFor="others" className={`font-medium cursor-pointer ${formData.professionalType === 'Others' ? 'text-blue-600' : 'text-gray-600'}`}>Others</Label>
                    </div>
                  </RadioGroup>
                </div>
                {formData.professionalType !== 'Others' && (
                  <div className="space-y-2">
                    <Label htmlFor="membershipNo" className="text-[13px] font-medium text-[#001525]">
                      Membership No <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="membershipNo"
                        type="text"
                        value={formData.membershipNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                          handleInputChange('membershipNumber', val)
                        }}
                        onBlur={() => handleBlur('membershipNumber')}
                        maxLength={6}
                        placeholder="Enter 6-digit number"
                        className={`h-12 md:h-12 rounded-xl border-gray-200 bg-white px-4 text-sm text-[#001525] placeholder:text-gray-400 transition-all focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 ${
                          fieldErrors.membershipNumber ? 'border-red-500 focus:border-red-500' : ''
                        }`}
                      />
                    </div>
                    {fieldErrors.membershipNumber && (
                      <p className="text-xs text-red-600 mt-1">{fieldErrors.membershipNumber}</p>
                    )}
                  </div>
                )}
              </div>
            )}

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
                <Link href="/terms" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
                  Terms and Conditions
                </Link>
                , and our{' '}
                <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
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
                className="h-12 md:h-12 rounded-full bg-[#001525] text-sm font-medium text-white transition-colors hover:bg-[#00223a] disabled:opacity-50"
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
