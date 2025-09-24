'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
<<<<<<< HEAD
import { Building2 } from 'lucide-react'
=======
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Building2, Mail, Lock, User, Phone, Award, Briefcase, ArrowRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
<<<<<<< HEAD
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    password: '',
    role: '',
    professionalType: '',
    membershipNo: '',
    registrationNo: '',
    instituteName: ''
=======
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    firmName: '',
    membershipNumber: '',
    acceptTerms: false
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
<<<<<<< HEAD
    setSuccess('')

    // Validate required fields
    if (!formData.name || !formData.email || !formData.username || !formData.phone || !formData.password || !formData.role) {
      setError('Please fill in all required fields')
      setIsLoading(false)
      return
    }

    // Validate role-specific fields
    if (formData.role === 'Professional') {
      if (!formData.professionalType || !formData.membershipNo) {
        setError('Please select professional type and enter membership number')
        setIsLoading(false)
        return
      }
    } else if (formData.role === 'Student') {
      if (!formData.registrationNo || !formData.instituteName) {
        setError('Please enter registration number and institute name')
        setIsLoading(false)
        return
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit mobile number')
=======

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

<<<<<<< HEAD
    // Validate character-based fields (only letters and spaces)
    const nameRegex = /^[a-zA-Z\s]+$/
    if (!nameRegex.test(formData.name)) {
      setError('Name should contain only letters')
=======
    // Validate terms acceptance
    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions')
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
      setIsLoading(false)
      return
    }

<<<<<<< HEAD
    // Validate username (only letters)
    const usernameRegex = /^[a-zA-Z]+$/
    if (!usernameRegex.test(formData.username)) {
      setError('Username must contain only letters')
      setIsLoading(false)
      return
    }

    // Validate membership number (exactly 6 digits for professionals)
    if (formData.role === 'Professional' && formData.membershipNo) {
      const membershipRegex = /^\d{6}$/
      if (!membershipRegex.test(formData.membershipNo)) {
        setError('Membership number must be exactly 6 digits')
        setIsLoading(false)
        return
      }
    }

    // Validate registration number (alphanumeric for students)
    if (formData.role === 'Student' && formData.registrationNo) {
      const regNoRegex = /^[A-Z0-9]+$/
      if (!regNoRegex.test(formData.registrationNo)) {
        setError('Registration number should contain only capital letters and numbers')
        setIsLoading(false)
        return
      }
    }

    // Validate institute name (only letters, no spaces for students)
    if (formData.role === 'Student' && formData.instituteName) {
      const instituteRegex = /^[a-zA-Z]+$/
      if (!instituteRegex.test(formData.instituteName)) {
        setError('Institute name must contain only letters (no spaces)')
        setIsLoading(false)
        return
      }
    }

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
=======
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          firmName: formData.firmName,
          membershipNumber: formData.membershipNumber
        })
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
      } else {
<<<<<<< HEAD
        // Store user data in localStorage
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }
        setSuccess('Registration successful! Check your email for confirmation. Logging you in...')

        // Auto-login the user
        setTimeout(async () => {
          const result = await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            redirect: false
          })

          if (result?.ok) {
            router.push('/')
            router.refresh()
          } else {
            // If auto-login fails, still redirect to home
            router.push('/')
            router.refresh()
          }
        }, 1500)
=======
        // Auto sign in after successful registration
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })

        if (result?.ok) {
          router.push('/dashboard')
          router.refresh()
        } else {
          router.push('/auth/login')
        }
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

<<<<<<< HEAD
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Blue */}
      <div className="w-1/2 bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center p-8">
        <div className="text-white max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-10 w-10" />
            <span className="text-2xl font-bold">POWER CA</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
          <p className="text-lg opacity-90">
            Sign up to your account using the form on the right. 
            Please make sure you provide correct details as you have the option 
            of getting information via signing up.
          </p>
          <div className="mt-8">
            <p className="text-sm opacity-75">Our Trusted Customers</p>
            <div className="flex gap-4 mt-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                <span className="text-2xl font-bold">500+</span>
                <span className="text-sm">CA Firms</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2">
                <span className="text-2xl font-bold">GKAI</span>
                <span className="text-sm">Partner</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-1/2 bg-white flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Sign Up</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter name"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/[^a-zA-Z]/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter username"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter mobile"
                  maxLength={10}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter password"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, professionalType: '', membershipNo: '', registrationNo: '', instituteName: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                >
                  <option value="">Select role</option>
                  <option value="Professional">Professional</option>
                  <option value="Student">Student</option>
                </select>
              </div>
            </div>

            {/* Conditional Fields based on Role */}
            {formData.role === 'Professional' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {['CA', 'CMA', 'CS', 'NA'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="professionalType"
                          value={type}
                          checked={formData.professionalType === type}
                          onChange={(e) => setFormData({ ...formData, professionalType: e.target.value })}
                          className="mr-2"
                          disabled={isLoading}
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Membership No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.membershipNo}
                    onChange={(e) => setFormData({ ...formData, membershipNo: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter 6-digit membership number"
                    maxLength={6}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {formData.role === 'Student' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNo}
                    onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter registration number"
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institute Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.instituteName}
                    onChange={(e) => setFormData({ ...formData, instituteName: e.target.value.replace(/[^a-zA-Z]/g, '') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter institute name (letters only)"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 text-center">
              Password must contain 8 or more characters with small letters, capital letters, and special characters
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? 'Registering...' : 'Register!'}
            </button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-500 hover:text-blue-600 font-medium">
                Sign In
              </Link>
            </div>
          </form>
=======
  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      setError('Failed to sign up with Google')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1) {
      // Validate step 1 fields
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long')
        return
      }
      setError('')
      setStep(2)
    }
  }

  const prevStep = () => {
    setError('')
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* No background pattern on register page */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50" />
      </div>
      
      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
          
          <div className="flex items-center justify-center mb-6">
            <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Join PowerCA to streamline your practice</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">Sign up</CardTitle>
            <CardDescription className="text-center">
              {step === 1 ? 'Start with your basic information' : 'Complete your professional profile'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className={`h-1.5 w-24 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`h-1.5 w-24 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-9 bg-gray-50/50"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="ca@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-9 bg-gray-50/50"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="pl-9 bg-gray-50/50"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="pl-9 bg-gray-50/50"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button 
                    type="button"
                    onClick={nextStep}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    Next: Professional Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-9 bg-gray-50/50"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firmName">Firm Name</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="firmName"
                        type="text"
                        placeholder="ABC & Associates"
                        value={formData.firmName}
                        onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                        className="pl-9 bg-gray-50/50"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="membershipNumber">ICAI Membership Number</Label>
                    <div className="relative">
                      <Award className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="membershipNumber"
                        type="text"
                        placeholder="123456"
                        value={formData.membershipNumber}
                        onChange={(e) => setFormData({ ...formData, membershipNumber: e.target.value })}
                        className="pl-9 bg-gray-50/50"
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Optional: For verification purposes</p>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, acceptTerms: checked as boolean })
                      }
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed text-gray-600">
                      I agree to the{' '}
                      <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="w-full"
                      disabled={isLoading}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Icons.spinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Complete Registration
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            {step === 1 && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-2 pt-4">
            <div className="text-sm text-center text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-500">
          © 2024 PowerCA. All rights reserved.
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
        </div>
      </div>
    </div>
  )
}