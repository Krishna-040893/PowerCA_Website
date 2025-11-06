'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  User,
  Briefcase,
  CreditCard,
  Check,
  FileText,
  Download
} from 'lucide-react'
import { toast } from 'sonner'

// Required field label component
const RequiredLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <Label htmlFor={htmlFor} className="text-gray-900 text-sm sm:text-base font-medium">
    {children} <span className="text-red-500">*</span>
  </Label>
)

export default function AffiliateRegisterPage() {
  const _router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information (Step 1)
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',

    // Business Information (Step 2)
    businessType: 'individual',
    companyName: '',
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
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    const phoneRegex = /^[6-9]\d{9}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}

    if (formData.businessType === 'company' && !formData.companyName) {
      newErrors.companyName = 'Company name is required'
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

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    if (formData.ifscCode && !ifscRegex.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Please enter a valid IFSC code (e.g., SBIN0001234)'
    }

    if (formData.accountNumber && !/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 9-18 digits'
    }

    if (!agreeToTerms) {
      newErrors.terms = 'Please agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    let isValid = false
    if (currentStep === 1) isValid = validateStep1()
    else if (currentStep === 2) isValid = validateStep2()

    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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
          phone: formData.phone,
          password: formData.password,
          city: formData.city,
          state: formData.state,
          businessType: formData.businessType,
          companyName: formData.companyName,
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
            height={60}
            className="h-10 sm:h-12 w-auto filter brightness-0 invert"
            priority
          />
        </Link>
      </motion.div>

      {/* Back to Login Button */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute right-4 sm:right-6 top-4 sm:top-6 z-20"
      >
        <Link
          href="/affiliate-login"
          className="group flex items-center gap-3 px-3 sm:px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300">
            <ArrowLeft className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:inline text-white font-medium text-sm tracking-wide">
            Back to Login
          </span>
        </Link>
      </motion.div>

      {/* Registration Form */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 pt-24 sm:pt-6 pb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-purple-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
              Join PowerCA Affiliate Program
            </h1>
            <p className="text-center text-purple-100 text-sm sm:text-base">
              Complete the registration to start earning 10% commission on every referral
            </p>
          </div>

          {/* Progress Steps */}
          <div className="bg-white px-4 sm:px-8 py-6 border-b">
            <div className="flex items-center justify-between sm:justify-center max-w-3xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  {/* Step Circle and Label */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        currentStep > step.number
                          ? 'bg-green-500 border-green-500 text-white'
                          : currentStep === step.number
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="w-4 h-4 sm:w-6 sm:h-6" />
                      ) : (
                        <step.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                      )}
                    </div>
                    <div className="mt-1.5 sm:mt-2 text-center">
                      <p
                        className={`text-[10px] sm:text-sm font-medium ${
                          currentStep >= step.number ? 'text-gray-900' : 'text-gray-400'
                        }`}
                        style={{ maxWidth: '60px' }}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-8 sm:w-24 md:w-32 mx-1 sm:mx-4 transition-all duration-300 ${
                        currentStep > step.number ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ marginBottom: '20px' }}
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
                    className="space-y-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        Affiliate Details
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Please provide your personal information to create your affiliate account
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <RequiredLabel htmlFor="fullName">Full Name</RequiredLabel>
                        <Input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
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
                          className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                          placeholder="your@email.com"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <RequiredLabel htmlFor="phone">Mobile Number</RequiredLabel>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                          placeholder="9876543210"
                        />
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
                            className="h-12 pr-10 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
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
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                      </div>

                      <div>
                        <RequiredLabel htmlFor="confirmPassword">Confirm Password</RequiredLabel>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                          placeholder="Re-enter password"
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                      </div>

                      <div>
                        <RequiredLabel htmlFor="city">City</RequiredLabel>
                        <Input
                          id="city"
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                          placeholder="Your city"
                        />
                        {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                      </div>

                      <div>
                        <RequiredLabel htmlFor="state">State</RequiredLabel>
                        <Input
                          id="state"
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                          placeholder="Your state"
                        />
                        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
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
                    className="space-y-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        Business Information
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Tell us about your business and how you plan to promote PowerCA
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Business Type - Full Width */}
                      <div>
                        <Label className="text-gray-900 text-sm sm:text-base font-medium">
                          Business Type <span className="text-red-500">*</span>
                        </Label>
                        <RadioGroup
                          value={formData.businessType}
                          onValueChange={(value) => handleInputChange('businessType', value)}
                          className="mt-3 flex flex-col sm:flex-row gap-4 sm:gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="individual" id="individual" />
                            <Label htmlFor="individual" className="text-sm sm:text-base cursor-pointer">Individual</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="company" id="company" />
                            <Label htmlFor="company" className="text-sm sm:text-base cursor-pointer">Company</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="partnership" id="partnership" />
                            <Label htmlFor="partnership" className="text-sm sm:text-base cursor-pointer">Partnership</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* 2x2 Grid Layout for 4 fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Row 1, Col 1: Company Name (only for company) OR Designation */}
                        {formData.businessType === 'company' && (
                          <div>
                            <RequiredLabel htmlFor="companyName">Company Name</RequiredLabel>
                            <Input
                              id="companyName"
                              type="text"
                              value={formData.companyName}
                              onChange={(e) => handleInputChange('companyName', e.target.value)}
                              className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                              placeholder="Your company name"
                            />
                            {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                          </div>
                        )}

                        <div>
                          <Label htmlFor="designation" className="text-gray-900 text-sm sm:text-base font-medium">
                            Designation
                          </Label>
                          <Input
                            id="designation"
                            type="text"
                            value={formData.designation}
                            onChange={(e) => handleInputChange('designation', e.target.value)}
                            className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                            placeholder="Your role/designation"
                          />
                        </div>

                        {/* Row 1, Col 2: Years of Experience */}
                        <div>
                          <Label htmlFor="experience" className="text-gray-900 text-sm sm:text-base font-medium">
                            Years of Experience
                          </Label>
                          <Input
                            id="experience"
                            type="text"
                            value={formData.experience}
                            onChange={(e) => handleInputChange('experience', e.target.value)}
                            className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                            placeholder="e.g., 5 years"
                          />
                        </div>

                        {/* Row 2, Col 2: Expected Monthly Referrals */}
                        <div>
                          <Label htmlFor="monthlyLeads" className="text-gray-900 text-sm sm:text-base font-medium">
                            Expected Monthly Referrals
                          </Label>
                          <Input
                            id="monthlyLeads"
                            type="text"
                            value={formData.monthlyLeads}
                            onChange={(e) => handleInputChange('monthlyLeads', e.target.value)}
                            className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
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
                          className="mt-1.5 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
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
                          className="mt-1.5 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
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
                    className="space-y-6"
                  >
                    <div className="mb-6">
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        Payment Information
                      </h2>
                      <p className="text-gray-600 text-sm sm:text-base">
                        Provide your bank details to receive commission payments
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="accountNumber" className="text-gray-900 text-sm sm:text-base font-medium">
                          Bank Account Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="accountNumber"
                          type="text"
                          value={formData.accountNumber}
                          onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                          className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                          placeholder="Enter account number"
                          maxLength={18}
                        />
                        {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
                      </div>

                      <div>
                        <Label htmlFor="ifscCode" className="text-gray-900 text-sm sm:text-base font-medium">
                          IFSC Code <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="ifscCode"
                          type="text"
                          value={formData.ifscCode}
                          onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                          className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                          placeholder="Enter IFSC code"
                          maxLength={11}
                        />
                        {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>}
                      </div>

                      <div>
                        <Label htmlFor="panNumber" className="text-gray-900 text-sm sm:text-base font-medium">
                          PAN Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="panNumber"
                          type="text"
                          value={formData.panNumber}
                          onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                          className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                          placeholder="Enter PAN number"
                          maxLength={10}
                        />
                      </div>

                      <div>
                        <Label htmlFor="gstNumber" className="text-gray-900 text-sm sm:text-base font-medium">
                          GST Number (Optional)
                        </Label>
                        <Input
                          id="gstNumber"
                          type="text"
                          value={formData.gstNumber}
                          onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                          className="mt-1.5 h-12 bg-purple-50 border-purple-200 focus:border-purple-400 rounded-xl placeholder:text-gray-400"
                          placeholder="Enter GST number"
                          maxLength={15}
                        />
                      </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-3 sm:p-4 rounded-2xl border-2 border-purple-200 mt-8">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 flex-shrink-0" />
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Affiliate Program Terms & Conditions</h4>
                      </div>

                      <div className="bg-white p-3 sm:p-4 rounded-lg border border-purple-200 mb-3">
                        <p className="text-xs sm:text-sm text-gray-700 mb-3">
                          Please review our complete Affiliate Program Terms & Conditions before registering. This document outlines all program details, commission structure, payment terms, and your rights and responsibilities as an affiliate partner.
                        </p>

                        <a
                          href="/docs/Affiliate/Affiliate%20Terms%20%26%20Conditions.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          download="Affiliate-Terms-and-Conditions.pdf"
                          className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-medium text-xs sm:text-sm"
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>Download Terms & Conditions (PDF)</span>
                        </a>
                      </div>

                      <div className="flex items-start gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-lg border-2 border-purple-300">
                        <Checkbox
                          id="terms"
                          checked={agreeToTerms}
                          onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                          className="mt-0.5 flex-shrink-0"
                        />
                        <label htmlFor="terms" className="text-xs sm:text-sm cursor-pointer text-gray-700 leading-relaxed flex-1">
                          I have read, understood, and agree to the{' '}
                          <a href="/docs/Affiliate/Affiliate%20Terms%20%26%20Conditions.pdf" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 underline font-medium">PowerCA Affiliate Program Terms & Conditions</a>
                          {' '}and{' '}
                          <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 underline font-medium">Privacy Policy</a>
                          {' '}<span className="text-red-500">*</span>
                        </label>
                      </div>
                      {errors.terms && <p className="text-red-500 text-xs sm:text-sm mt-2 flex items-center gap-1"><span className="font-bold">!</span> {errors.terms}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex flex-row justify-between gap-2 sm:gap-4 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className={`inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all duration-200 text-sm sm:text-base ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border-2 border-purple-200 text-gray-700 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    <span className="hidden sm:inline">Next Step</span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-1 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                  >
                    {loading ? (
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                        <span className="hidden sm:inline">Registering...</span>
                        <span className="sm:hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
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
  )
}
