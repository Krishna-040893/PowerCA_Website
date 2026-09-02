'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import PhoneInput, { type Country } from 'react-phone-number-input'
import labels from 'react-phone-number-input/locale/en.json'
import 'react-phone-number-input/style.css'
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  User,
  Briefcase,
  CreditCard,
  Check
} from 'lucide-react'
import { toast } from 'sonner'

// Country-State mapping
const countryStates: Record<string, string[]> = {
  'India': [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ],
  'United States': [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
    'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ],
  'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  'Canada': [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
    'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
    'Quebec', 'Saskatchewan', 'Yukon'
  ],
  'Australia': [
    'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
    'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
  ],
  'United Arab Emirates': ['Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain'],
}

// Map ISO country codes to countryStates keys where names differ from locale labels
const countryCodeOverrides: Record<string, string> = {
  'GB': 'United Kingdom',
  'AE': 'United Arab Emirates',
}

// Get country name from ISO code using locale labels
function getCountryName(code: Country | undefined): string {
  if (!code) return ''
  return countryCodeOverrides[code] || (labels as Record<string, string>)[code] || code
}

// Required field label component
const RequiredLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <Label htmlFor={htmlFor} className="text-gray-900 text-xs sm:text-sm font-medium">
    {children} <span className="text-red-500">*</span>
  </Label>
)

export default function AffiliateRegisterPage() {
  const _router = useRouter()

  const defaultFormData = {
    // Personal Information (Step 1)
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    country: 'India',
    state: '',
    city: '',

    // Business Information (Step 2)
    businessType: 'individual',
    firmName: '',
    designation: '',
    experience: '',
    promotionMethod: '',
    targetAudience: '',
    monthlyLeads: '',

    // Payment Information (Step 3)
    accountNumber: '',
    ifscCode: '',
    panNumber: '',
    gstNumber: ''
  }

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [phoneCountry, setPhoneCountry] = useState<Country>('IN')
  const [formData, setFormData] = useState<typeof defaultFormData>(defaultFormData)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Restore saved form data and step from sessionStorage after mount
  useEffect(() => {
    try {
      const savedForm = sessionStorage.getItem('affiliate-register-form')
      if (savedForm) {
        setFormData(JSON.parse(savedForm))
      }
      const savedStep = sessionStorage.getItem('affiliate-register-step')
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10))
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [])

  // Persist form data and step to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('affiliate-register-form', JSON.stringify(formData))
  }, [formData])

  useEffect(() => {
    sessionStorage.setItem('affiliate-register-step', String(currentStep))
  }, [currentStep])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName) newErrors.fullName = 'Full name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.city) newErrors.city = 'City is required'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must contain at least 8 characters, one uppercase, one lowercase and numbers'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Accept international phone numbers with country code
    const phoneRegex = /^\+[1-9]\d{1,14}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number with country code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if ((formData.businessType === 'company' || formData.businessType === 'partnership') && !formData.firmName) {
      newErrors.firmName = 'Firm name is required'
    }
    if (!formData.promotionMethod) newErrors.promotionMethod = 'Please describe your promotion method'
    if (!formData.targetAudience) newErrors.targetAudience = 'Please describe your target audience'

    if (formData.promotionMethod && formData.promotionMethod.length < 50) {
      newErrors.promotionMethod = 'Please provide at least 50 characters describing your promotion method'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}

    if (formData.accountNumber && !/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 9-18 digits'
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    if (formData.ifscCode && !ifscRegex.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Please enter a valid IFSC code'
    }

    setErrors(newErrors)

    const hasEmptyRequired = !formData.accountNumber || !formData.ifscCode || !formData.panNumber
    if (hasEmptyRequired) {
      return false
    }

    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    let isValid = false
    if (currentStep === 1) isValid = validateStep1()
    else if (currentStep === 2) isValid = validateStep2()

    if (isValid) {
      setErrors({})
      setCurrentStep(prev => Math.min(prev + 1, 3))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setErrors({})
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Only allow submission from Step 3
    if (currentStep !== 3) {
      handleNext()
      return
    }

    // Validate step 3 before final submission
    if (!validateStep3()) {
      return
    }

    setLoading(true)

    try {
      const affiliateResponse = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone, // PhoneInput already includes country code
          password: formData.password,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          businessType: formData.businessType,
          firmName: formData.firmName,
          designation: formData.designation,
          experience: formData.experience,
          promotionMethod: formData.promotionMethod,
          targetAudience: formData.targetAudience,
          monthlyLeads: formData.monthlyLeads,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          panNumber: formData.panNumber,
          gstNumber: formData.gstNumber
        }),
      })

      let affiliateResult
      try {
        const responseText = await affiliateResponse.text()
        affiliateResult = responseText ? JSON.parse(responseText) : {}
      } catch {
        affiliateResult = { error: 'Invalid server response' }
      }

      if (affiliateResponse.ok) {
        sessionStorage.removeItem('affiliate-register-form')
        sessionStorage.removeItem('affiliate-register-step')
        toast.success('🎉 Registration successful! Your affiliate application has been submitted and is under review. Please login to access your account.')
        setTimeout(() => {
          window.location.href = '/affiliate-login'
        }, 1500)
      } else {
        // Handle error response gracefully without throwing
        const errorMessage = affiliateResult.details
          ? `${affiliateResult.error}: ${affiliateResult.details}`
          : affiliateResult.error || 'Affiliate application failed'
        toast.error(errorMessage)
      }
    } catch (error) {
      // Only catch network/parsing errors
      console.error('Registration error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { number: 1, title: 'Affiliate Details', icon: User },
    { number: 2, title: 'Business Type', icon: Briefcase },
    { number: 3, title: 'Payment Information', icon: CreditCard }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image - Same as affiliate login */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/login-bg.png')"
        }}
      />


      {/* Registration Form */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 pt-24 sm:pt-6 pb-8 relative z-10">
        <div className="w-full max-w-5xl">
          <Link
            href="/affiliate-login"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_32px_64px_-24px_rgba(16,24,40,0.35)] backdrop-blur-sm"
        >
          {/* Header */}
          <div className="px-6 pb-6 pt-8 text-center sm:px-8">
            <h1 className="text-2xl font-semibold tracking-tight text-[#001525] font-inter">
              Join PowerCA Affiliate Program
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Three short steps and your partner account is ready
            </p>
          </div>

          {/* Progress Steps */}
          <div className="border-y border-gray-100 bg-gray-50/60 px-6 py-5 sm:px-8">
            <div className="mx-auto flex max-w-2xl items-start justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex flex-1 items-start last:flex-none">
                  {/* Step Circle and Label */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300 ${
                        currentStep > step.number
                          ? 'bg-emerald-500 text-white'
                          : currentStep === step.number
                          ? 'bg-[#001525] text-white'
                          : 'border border-gray-200 bg-white text-gray-300'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <step.icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="mt-2.5 text-center">
                      <p
                        className={`whitespace-nowrap text-[11px] sm:text-xs font-medium leading-tight ${
                          currentStep >= step.number ? 'text-[#001525]' : 'text-gray-400'
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-2 mt-5 h-px flex-1 transition-colors duration-300 sm:mx-4 ${
                        currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* Step 1: Affiliate Details */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl sm:text-1xl font-bold text-gray-900 mb-1">
                        Affiliate Details
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Please provide your personal information to create your affiliate account
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <RequiredLabel htmlFor="fullName">Full Name</RequiredLabel>
                        <Input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                      </div>

                      <div>
                        <RequiredLabel htmlFor="email">Email Address</RequiredLabel>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                          placeholder="your@email.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <RequiredLabel htmlFor="phone">Mobile Number</RequiredLabel>
                        <div className="mt-1.5">
                          <PhoneInput
                            international
                            countryCallingCodeEditable={false}
                            defaultCountry="IN"
                            value={formData.phone || undefined}
                            onChange={(value) => handleInputChange('phone', value || '')}
                            onCountryChange={(country) => {
                              if (country) {
                                setPhoneCountry(country)
                              }
                              const name = getCountryName(country || phoneCountry)
                              handleInputChange('country', name)
                              handleInputChange('state', '')
                            }}
                            className="flex gap-0 [&>input]:h-12 [&>input]:bg-white [&>input]:border [&>input]:border-gray-200 [&>input]:rounded-r-xl [&>input]:focus:border-[#001525] [&>input]:placeholder:text-gray-400 placeholder:text-sm [&>input]:caret-purple-600 [&>input]:selection:bg-purple-200 [&>input]:selection:text-purple-900 [&>.PhoneInputCountry]:h-12 [&>.PhoneInputCountry]:bg-transparent [&>.PhoneInputCountry]:border [&>.PhoneInputCountry]:border-gray-200 [&>.PhoneInputCountry]:border-r-0 [&>.PhoneInputCountry]:rounded-l-xl [&>.PhoneInputCountry]:px-3 [&>.PhoneInputCountry]:flex [&>.PhoneInputCountry]:items-center [&>.PhoneInputCountry]:gap-2 [&_.PhoneInputCountryIcon]:w-6 [&_.PhoneInputCountryIcon]:h-6 [&_.PhoneInputCountryIcon]:shadow-none [&_.PhoneInputCountrySelectArrow]:opacity-50"
                            numberInputProps={{
                              className: "flex-1"
                            }}
                            placeholder="Enter phone number"
                          />
                        </div>
                        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      </div>

                      <div>
                        <RequiredLabel htmlFor="password">Password</RequiredLabel>
                        <div className="relative mt-1.5">
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="h-12 md:h-12 pr-10 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                            placeholder="Minimum 8 characters"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">Password must contain at least 8 characters, one capital letter, one lowercase letter and numbers</p>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                      </div>

                      <div>
                        <RequiredLabel htmlFor="confirmPassword">Confirm Password</RequiredLabel>
                        <div className="relative mt-1.5">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="h-12 md:h-12 pr-10 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                            placeholder="Re-enter password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                      </div>

                      <div>
                        <RequiredLabel htmlFor="state">State</RequiredLabel>
                        {formData.country && countryStates[formData.country] ? (
                          <select
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="mt-1.5 h-12 md:h-12 w-full rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] px-3 text-sm outline-none appearance-none"
                          >
                            <option value="">Select state</option>
                            {countryStates[formData.country].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        ) : (
                          <Input
                            id="state"
                            type="text"
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm"
                            placeholder="Your state"
                          />
                        )}
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                      </div>

                      <div>
                        <RequiredLabel htmlFor="city">City</RequiredLabel>
                        <Input
                          id="city"
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                          placeholder="Your city"
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Business Type */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl sm:text-1xl font-bold text-gray-900 mb-1">
                        Business Information
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Tell us about your business and how you plan to promote PowerCA
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Business Type - Full Width */}
                      <div>
                        <Label className="text-gray-900 text-xs sm:text-sm font-medium">
                          Business Type <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                          value={formData.businessType}
                          onValueChange={(value) => handleInputChange('businessType', value)}
                          className="mt-2 flex flex-col sm:flex-row gap-3 sm:gap-5"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="individual" id="individual" />
                            <Label htmlFor="individual" className="text-xs sm:text-sm cursor-pointer">Individual</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="company" id="company" />
                            <Label htmlFor="company" className="text-xs sm:text-sm cursor-pointer">Company</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="partnership" id="partnership" />
                            <Label htmlFor="partnership" className="text-xs sm:text-sm cursor-pointer">Partnership</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* 2x2 Grid Layout for 4 fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Firm Name (for company or partnership) */}
                        {(formData.businessType === 'company' || formData.businessType === 'partnership') && (
                          <div>
                            <RequiredLabel htmlFor="firmName">{formData.businessType === 'company' ? 'Company Name' : 'Firm Name'}</RequiredLabel>
                            <Input
                              id="firmName"
                              type="text"
                              value={formData.firmName}
                              onChange={(e) => handleInputChange('firmName', e.target.value)}
                              className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                              placeholder={formData.businessType === 'company' ? 'Your company name' : 'Your firm name'}
                            />
                            {errors.firmName && <p className="text-red-500 text-sm mt-1">{errors.firmName}</p>}
                          </div>
                        )}

                        <div>
                          <Label htmlFor="designation" className="text-gray-900 text-xs sm:text-sm font-medium">
                            Designation
                          </Label>
                          <Input
                            id="designation"
                            type="text"
                            value={formData.designation}
                            onChange={(e) => handleInputChange('designation', e.target.value)}
                            className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                            placeholder="Your role/designation"
                          />
                        </div>

                        {/* Row 1, Col 2: Years of Experience */}
                        <div>
                          <Label htmlFor="experience" className="text-gray-900 text-xs sm:text-sm font-medium">
                            Years of Experience
                          </Label>
                          <Input
                            id="experience"
                            type="text"
                            value={formData.experience}
                            onChange={(e) => handleInputChange('experience', e.target.value)}
                            className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                            placeholder="e.g., 5 years"
                          />
                        </div>

                        {/* Row 2, Col 2: Expected Monthly Referrals */}
                        <div>
                          <Label htmlFor="monthlyLeads" className="text-gray-900 text-xs sm:text-sm font-medium">
                            Expected Monthly Referrals
                          </Label>
                          <Input
                            id="monthlyLeads"
                            type="text"
                            value={formData.monthlyLeads}
                            onChange={(e) => handleInputChange('monthlyLeads', e.target.value)}
                            className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                            placeholder="e.g., 10-15 referrals"
                          />
                        </div>
                      </div>

                      {/* Promotion Strategy - Full Width */}
                      <div>
                        <RequiredLabel htmlFor="promotionMethod">Promotion Strategy</RequiredLabel>
                        <Textarea
                          id="promotionMethod"
                          value={formData.promotionMethod}
                          onChange={(e) => handleInputChange('promotionMethod', e.target.value)}
                          className="mt-1.5 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                          rows={4}
                          placeholder="Describe your promotion strategy (min 50 characters)..."
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {formData.promotionMethod.length}/50 minimum characters
                        </p>
                        {errors.promotionMethod && <p className="text-red-500 text-sm mt-1">{errors.promotionMethod}</p>}
                      </div>

                      {/* Target Audience - Full Width */}
                      <div>
                        <RequiredLabel htmlFor="targetAudience">Target Audience</RequiredLabel>
                        <Textarea
                          id="targetAudience"
                          value={formData.targetAudience}
                          onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                          className="mt-1.5 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                          rows={4}
                          placeholder="Describe your target audience..."
                        />
                        {errors.targetAudience && <p className="text-red-500 text-sm mt-1">{errors.targetAudience}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment Information */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl sm:text-1xl font-bold text-gray-900 mb-1">
                        Payment Information
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Provide your bank details to receive commission payments
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="accountNumber" className="text-gray-900 text-xs sm:text-sm font-medium">
                          Bank Account Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="accountNumber"
                          type="text"
                          value={formData.accountNumber}
                          onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                          className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                          placeholder="Enter account number"
                          maxLength={18}
                        />
                        {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
                      </div>

                      <div>
                        <Label htmlFor="ifscCode" className="text-gray-900 text-xs sm:text-sm font-medium">
                          IFSC Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="ifscCode"
                          type="text"
                          value={formData.ifscCode}
                          onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                          className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                          placeholder="Enter IFSC code"
                          maxLength={11}
                        />
                        {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>}
                      </div>

                      <div>
                        <Label htmlFor="panNumber" className="text-gray-900 text-xs sm:text-sm font-medium">
                          PAN Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="panNumber"
                          type="text"
                          value={formData.panNumber}
                          onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                          className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                          placeholder="Enter PAN number"
                          maxLength={10}
                        />
                        {errors.panNumber && <p className="text-red-500 text-sm mt-1">{errors.panNumber}</p>}
                      </div>

                      <div>
                        <Label htmlFor="gstNumber" className="text-gray-900 text-xs sm:text-sm font-medium">
                          GST Number (Optional)
                        </Label>
                        <Input
                          id="gstNumber"
                          type="text"
                          value={formData.gstNumber}
                          onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                          className="mt-1.5 h-12 md:h-12 rounded-xl border border-gray-200 bg-white focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10 text-[#001525] placeholder:text-gray-400 placeholder:text-sm caret-[#001525]"
                          placeholder="Enter GST number"
                          maxLength={15}
                        />
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="mt-6 flex flex-row items-center justify-between gap-3 border-t border-gray-100 pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors ${
                    currentStep === 1
                      ? 'cursor-not-allowed border border-gray-100 bg-gray-50 text-gray-300'
                      : 'border border-gray-200 bg-white text-[#001525] hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#001525] px-7 text-sm font-medium text-white transition-colors hover:bg-[#00223a]"
                  >
                    <span className="hidden sm:inline">Next Step</span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#001525] px-7 text-sm font-medium text-white transition-colors hover:bg-[#00223a] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                        <span className="hidden sm:inline">Registering...</span>
                        <span className="sm:hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span className="hidden sm:inline">Complete Registration</span>
                        <span className="sm:hidden">Submit</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
        </div>
      </div>
    </div>
  )
}
