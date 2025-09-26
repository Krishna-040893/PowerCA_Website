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
  User, Mail, Building,
  MessageSquare,
  Shield, CheckCircle,
  Eye,
  EyeOff
 } from 'lucide-react'
import {toast  } from 'sonner'

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
    website: '',

    // Affiliate Information
    promotionMethod: '',
    targetAudience: '',
    monthlyLeads: '',

    // Payment Information
    paymentEmail: '',
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
    if (!formData.paymentEmail) newErrors.paymentEmail = 'Payment email is required'

    // Business type specific validation
    if (formData.businessType === 'company' && !formData.companyName) {
      newErrors.companyName = 'Company name is required'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (formData.paymentEmail && !emailRegex.test(formData.paymentEmail)) {
      newErrors.paymentEmail = 'Please enter a valid payment email'
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
      // First register the user
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: 'user', // Basic user registration
          firmName: formData.companyName || null
        }),
      })

      const registerResult = await registerResponse.json()

      if (!registerResponse.ok) {
        throw new Error(registerResult.message || 'Registration failed')
      }

      // Then submit affiliate application
      const affiliateResponse = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: registerResult.user.id,
          name: formData.fullName,
          accountEmail: formData.email,
          paymentEmail: formData.paymentEmail,
          websiteUrl: formData.website,
          promotionMethod: `${formData.promotionMethod}\n\nTarget Audience: ${formData.targetAudience}\nBusiness Type: ${formData.businessType}\nExperience: ${formData.experience}\nExpected Monthly Leads: ${formData.monthlyLeads}`
        }),
      })

      const affiliateResult = await affiliateResponse.json()

      if (affiliateResponse.ok) {
        toast.success('🎉 Registration successful! Your affiliate application has been submitted and is under review. You will receive an email notification once approved.')
        router.push('/affiliate-program?success=true')
      } else {
        throw new Error(affiliateResult.error || 'Affiliate application failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section with Background */}
      <section className="relative py-16 overflow-hidden bg-white">
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
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Link
                href="/affiliate-program"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Affiliate Program
              </Link>

              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-sm font-medium">
                  <Star className="w-4 h-4 mr-2" />
                  Affiliate Registration
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Join PowerCA Affiliate Program
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                Complete the form below to register as an affiliate and start earning 10% commission on every successful referral.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-12 py-12">
        <div className="max-w-4xl mx-auto">

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

          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="mt-1"
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1"
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone">Mobile Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1"
                      placeholder="9876543210"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Minimum 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="mt-1"
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="mt-1"
                      placeholder="Your city"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="mt-1"
                      placeholder="Your state"
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  Business Information
                </h3>

                <div className="space-y-6">
                  <div>
                    <Label>Business Type</Label>
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

                  <div className="grid md:grid-cols-2 gap-6">
                    {formData.businessType === 'company' && (
                      <div>
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          id="companyName"
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => handleInputChange('companyName', e.target.value)}
                          className="mt-1"
                          placeholder="Your company name"
                        />
                        {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        type="text"
                        value={formData.designation}
                        onChange={(e) => handleInputChange('designation', e.target.value)}
                        className="mt-1"
                        placeholder="Your role/designation"
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="text"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="mt-1"
                        placeholder="e.g., 5 years in software sales"
                      />
                    </div>

                    <div>
                      <Label htmlFor="website">Website URL</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="mt-1"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Affiliate Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Affiliate Information
                </h3>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="promotionMethod">How will you promote PowerCA? *</Label>
                    <Textarea
                      id="promotionMethod"
                      value={formData.promotionMethod}
                      onChange={(e) => handleInputChange('promotionMethod', e.target.value)}
                      className="mt-1"
                      rows={4}
                      placeholder="Please describe your promotion strategy, marketing channels, and methods you'll use to promote PowerCA (minimum 50 characters)..."
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {formData.promotionMethod.length}/50 minimum characters
                    </p>
                    {errors.promotionMethod && <p className="text-red-500 text-sm mt-1">{errors.promotionMethod}</p>}
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Target Audience *</Label>
                    <Textarea
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                      className="mt-1"
                      rows={3}
                      placeholder="Describe your target audience (e.g., CAs, small businesses, accounting firms, etc.)"
                    />
                    {errors.targetAudience && <p className="text-red-500 text-sm mt-1">{errors.targetAudience}</p>}
                  </div>

                  <div>
                    <Label htmlFor="monthlyLeads">Expected Monthly Referrals</Label>
                    <Input
                      id="monthlyLeads"
                      type="text"
                      value={formData.monthlyLeads}
                      onChange={(e) => handleInputChange('monthlyLeads', e.target.value)}
                      className="mt-1"
                      placeholder="e.g., 10-15 referrals per month"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Payment Information
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="paymentEmail">Payment Email *</Label>
                    <Input
                      id="paymentEmail"
                      type="email"
                      value={formData.paymentEmail}
                      onChange={(e) => handleInputChange('paymentEmail', e.target.value)}
                      className="mt-1"
                      placeholder="Email for commission payments"
                    />
                    {errors.paymentEmail && <p className="text-red-500 text-sm mt-1">{errors.paymentEmail}</p>}
                  </div>

                  <div>
                    <Label htmlFor="panNumber">PAN Number</Label>
                    <Input
                      id="panNumber"
                      type="text"
                      value={formData.panNumber}
                      onChange={(e) => handleInputChange('panNumber', e.target.value.toUpperCase())}
                      className="mt-1"
                      placeholder="ABCDE1234F"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gstNumber">GST Number (if applicable)</Label>
                    <Input
                      id="gstNumber"
                      type="text"
                      value={formData.gstNumber}
                      onChange={(e) => handleInputChange('gstNumber', e.target.value.toUpperCase())}
                      className="mt-1"
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Terms & Conditions</h4>
                <ul className="text-sm text-gray-600 space-y-2 mb-4">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Commission rate: 10% on all successful referrals
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Monthly commission payments via bank transfer
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Application review within 3-5 business days
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Must comply with our marketing guidelines
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Affiliate status can be terminated for policy violations
                  </li>
                </ul>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer">
                    I agree to the PowerCA Affiliate Program Terms & Conditions and Privacy Policy
                  </Label>
                </div>
                {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/affiliate-program')}
                  className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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