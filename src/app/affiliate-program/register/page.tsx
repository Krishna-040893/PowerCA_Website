'use client'

import {useState  } from 'react'
import Link from 'next/link'
import {useRouter  } from 'next/navigation'
import {Input  } from '@/components/ui/input'
import {Label  } from '@/components/ui/label'
import {Textarea  } from '@/components/ui/textarea'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Checkbox  } from '@/components/ui/checkbox'
import {RadioGroup, RadioGroupItem  } from '@/components/ui/radio-group'
import {Star,
  ArrowLeft,
  Mail,
  Shield,
  Eye,
  EyeOff,
  FileText,
  Download
 } from 'lucide-react'
import {toast  } from 'sonner'

// Required field label component
const RequiredLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <Label htmlFor={htmlFor} className="text-gray-900 text-base font-medium">
    {children} <span className="text-red-500">*</span>
  </Label>
)

export default function AffiliateRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Business Information
    businessType: 'individual', // individual, company, partnership
    companyName: '',
    designation: '',
    experience: '',

    // Contact Information
    city: '',
    state: '',

    // Affiliate Information
    promotionMethod: '',
    targetAudience: '',
    monthlyLeads: '',

    // Payment Information
    accountNumber: '',
    ifscCode: '',
    panNumber: '',
    gstNumber: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.fullName) newErrors.fullName = 'Full name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.phone) newErrors.phone = 'Phone number is required'
    if (!formData.password) newErrors.password = 'Password is required'
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.promotionMethod) newErrors.promotionMethod = 'Please describe your promotion method'
    if (!formData.targetAudience) newErrors.targetAudience = 'Please describe your target audience'

    // Business type specific validation
    if (formData.businessType === 'company' && !formData.companyName) {
      newErrors.companyName = 'Company name is required'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // IFSC Code validation
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    if (formData.ifscCode && !ifscRegex.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Please enter a valid IFSC code (e.g., SBIN0001234)'
    }

    // Account Number validation
    if (formData.accountNumber && !/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Account number must be 9-18 digits'
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number'
    }

    // Promotion method minimum length
    if (formData.promotionMethod && formData.promotionMethod.length < 50) {
      newErrors.promotionMethod = 'Please provide at least 50 characters describing your promotion method'
    }

    // Terms acceptance
    if (!agreeToTerms) {
      newErrors.terms = 'Please agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Submit affiliate application directly (no registration_forms table)
      const affiliateResponse = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password, // Store password in affiliate_registrations
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

      // Try to parse JSON, but handle errors
      let affiliateResult
      try {
        const responseText = await affiliateResponse.text()
        console.log('Raw API Response:', responseText)
        affiliateResult = responseText ? JSON.parse(responseText) : {}
      } catch (parseError) {
        console.error('Failed to parse API response:', parseError)
        affiliateResult = { error: 'Invalid server response' }
      }

      if (affiliateResponse.ok) {
        toast.success('🎉 Registration successful! Your affiliate application has been submitted and is under review. Please login to access your account.')
        // Use setTimeout to allow toast to show before redirect
        setTimeout(() => {
          window.location.href = '/affiliate-login'
        }, 1500)
      } else {
        // Show detailed error information
        console.error('API Error Response:', affiliateResult)
        console.error('Response status:', affiliateResponse.status)

        const errorMessage = affiliateResult.details
          ? `${affiliateResult.error}: ${affiliateResult.details}`
          : affiliateResult.error || 'Affiliate application failed'
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Registration error:', error)
      const errorMsg = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section with Background */}
      <section className="relative py-12 overflow-hidden bg-white">
        <div className="absolute inset-0 px-12">
          <div
            className="w-full h-full rounded-2xl"
            style={{
              backgroundImage: 'url(/images/hero-bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="absolute inset-0 bg-white/10 rounded-2xl"></div>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-6">
              <Link
                href="/affiliate-program"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Affiliate Program
              </Link>

              <div className="mb-4">
                <span className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 mr-2" />
                  Affiliate Registration
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                Join PowerCA Affiliate Program
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Complete the form below to register as an affiliate and start earning 10% commission on every successful referral.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-12 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Registration Form */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 p-8">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Affiliate Registration Form
                </CardTitle>
                <CardDescription>
                  All information is secure and will be used only for affiliate program management
                </CardDescription>
              </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6 text-base">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <RequiredLabel htmlFor="fullName">Full Name</RequiredLabel>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="mt-1.5 placeholder:text-gray-400"
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
                    className="mt-1.5 placeholder:text-gray-400"
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
                    className="mt-1.5 placeholder:text-gray-400"
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
                      className="placeholder:text-gray-400"
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    className="mt-1.5 placeholder:text-gray-400"
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
                    className="mt-1.5 placeholder:text-gray-400"
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
                    className="mt-1.5 placeholder:text-gray-400"
                    placeholder="Your state"
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-900 text-base font-medium">Business Type</Label>
                  <RadioGroup
                    value={formData.businessType}
                    onValueChange={(value) => handleInputChange('businessType', value)}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="individual" id="individual" />
                      <Label htmlFor="individual">Individual</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="company" id="company" />
                      <Label htmlFor="company">Company</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partnership" id="partnership" />
                      <Label htmlFor="partnership">Partnership</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.businessType === 'company' && (
                  <div>
                    <RequiredLabel htmlFor="companyName">Company Name</RequiredLabel>
                    <Input
                      id="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="mt-1.5 placeholder:text-gray-400"
                      placeholder="Your company name"
                    />
                    {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                  </div>
                )}

                <div>
                  <RequiredLabel htmlFor="designation">Designation</RequiredLabel>
                  <Input
                    id="designation"
                    type="text"
                    value={formData.designation}
                    onChange={(e) => handleInputChange('designation', e.target.value)}
                    className="mt-1.5 placeholder:text-gray-400"
                    placeholder="Your role/designation"
                  />
                </div>

                <div>
                  <RequiredLabel htmlFor="experience">Years of Experience</RequiredLabel>
                  <Input
                    id="experience"
                    type="text"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="mt-1.5 placeholder:text-gray-400"
                    placeholder="e.g., 5 years"
                  />
                </div>

                <div>
                  <RequiredLabel htmlFor="promotionMethod">Promotion Strategy</RequiredLabel>
                  <Textarea
                    id="promotionMethod"
                    value={formData.promotionMethod}
                    onChange={(e) => handleInputChange('promotionMethod', e.target.value)}
                    className="mt-1.5 placeholder:text-gray-400"
                    rows={3}
                    placeholder="Describe your promotion strategy (min 50 characters)..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.promotionMethod.length}/50 minimum characters
                  </p>
                  {errors.promotionMethod && <p className="text-red-500 text-sm mt-1">{errors.promotionMethod}</p>}
                </div>

                <div>
                  <RequiredLabel htmlFor="targetAudience">Target Audience</RequiredLabel>
                  <Textarea
                    id="targetAudience"
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                    className="mt-1.5 placeholder:text-gray-400"
                    rows={3}
                    placeholder="Describe your target audience..."
                  />
                  {errors.targetAudience && <p className="text-red-500 text-sm mt-1">{errors.targetAudience}</p>}
                </div>

                <div>
                  <Label htmlFor="monthlyLeads" className="text-gray-900 text-base font-medium">Expected Monthly Referrals</Label>
                  <Input
                    id="monthlyLeads"
                    type="text"
                    value={formData.monthlyLeads}
                    onChange={(e) => handleInputChange('monthlyLeads', e.target.value)}
                    className="mt-1.5 placeholder:text-gray-400"
                    placeholder="e.g., 10-15 referrals"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                Payment Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <RequiredLabel htmlFor="accountNumber">Bank Account Number</RequiredLabel>
                  <Input
                    id="accountNumber"
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    className="mt-1.5 placeholder:text-gray-400"
                    placeholder="Enter account number"
                    maxLength={18}
                  />
                  {errors.accountNumber && <p className="text-red-500 text-sm mt-1">{errors.accountNumber}</p>}
                </div>

                <div>
                  <RequiredLabel htmlFor="ifscCode">IFSC Code</RequiredLabel>
                  <Input
                    id="ifscCode"
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                    className="mt-1.5 placeholder:text-gray-400"
                    placeholder="Enter IFSC code"
                    maxLength={11}
                  />
                  {errors.ifscCode && <p className="text-red-500 text-sm mt-1">{errors.ifscCode}</p>}
                </div>

                <div>
                  <RequiredLabel htmlFor="panNumber">PAN Number</RequiredLabel>
                  <Input
                    id="panNumber"
                    type="text"
                    value={formData.panNumber}
                    onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                    className="mt-1.5 placeholder:text-gray-400"
                    placeholder="Enter PAN number"
                    maxLength={10}
                  />
                </div>

                <div>
                  <RequiredLabel htmlFor="gstNumber">GST Number</RequiredLabel>
                  <Input
                    id="gstNumber"
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                    className="mt-1.5 placeholder:text-gray-400"
                    placeholder="Enter GST number"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold text-gray-900 text-base">Affiliate Program Terms & Conditions</h4>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4">
                <p className="text-sm text-gray-700 mb-4">
                  Please review our complete Affiliate Program Terms & Conditions before registering. This document outlines all program details, commission structure, payment terms, and your rights and responsibilities as an affiliate partner.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="/docs/Affiliate/Affiliate%20Terms%20%26%20Conditions.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    download="Affiliate-Terms-and-Conditions.pdf"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                  >
                    <Download className="h-4 w-4" />
                    Download Terms &amp; Conditions (PDF)
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-2 bg-white p-3 rounded-lg border-2 border-blue-300">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer text-gray-900">
                  I have read, understood, and agree to the <a href="/docs/Affiliate/Affiliate%20Terms%20%26%20Conditions.pdf" target="_blank" className="text-blue-600 hover:text-blue-800 underline font-medium">PowerCA Affiliate Program Terms & Conditions</a> and <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-800 underline font-medium">Privacy Policy</a> <span className="text-red-500">*</span>
                </Label>
              </div>
              {errors.terms && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span className="font-bold">!</span> {errors.terms}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/affiliate-program')}
                className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Registering...
                  </div>
                ) : (
                  'Register as Affiliate'
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
        </div>
      </div>
        </div>
    </div>
  )
}
