'use client'

export const dynamic = 'force-dynamic'

import {useState  } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {motion  } from 'framer-motion'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Label  } from '@/components/ui/label'
import {RadioGroup, RadioGroupItem  } from '@/components/ui/radio-group'
import {Checkbox  } from '@/components/ui/checkbox'
import {useRouter  } from 'next/navigation'
import {Eye, EyeOff, User, Phone, Mail, Lock, ArrowLeft, Shield  } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    membershipNo: '',
    password: '',
    professional: 'CA'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userType, setUserType] = useState('professional')
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Add registration logic here
      // After successful registration, redirect to login
      router.push('/login')
    } catch {
      // Handle registration error
      setIsLoading(false)
      return
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

      {/* Register Form */}
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border-2 border-blue-100"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Power CA
            </h1>
            <p className="text-gray-600">
              Please enter your details to sign Up your new account
            </p>
          </div>

          {/* User Type Selection */}
          <div className="mb-8 flex justify-center">
            <div className="bg-blue-50 border border-blue-200 rounded-full p-2 inline-flex">
              <button
                onClick={() => setUserType('professional')}
                className={`px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                  userType === 'professional'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-600 hover:bg-blue-100'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Professional
              </button>
              <Link
                href="/register/student"
                className="px-6 py-2 rounded-full font-medium text-sm transition-all duration-200 text-gray-500 hover:bg-gray-100"
              >
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
                    Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter Your Name"
                      className="pl-10 h-12 md:h-11 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Mobile Field */}
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-gray-900 font-medium">
                    Mobile Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="Enter Your Mobile number"
                      className="pl-10 h-12 md:h-11 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Professional Type */}
                {userType === 'professional' && (
                  <div className="space-y-3">
                    <Label className="text-gray-900 font-medium">Professional</Label>
                    <RadioGroup
                      value={formData.professional}
                      onValueChange={(value) => handleInputChange('professional', value)}
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
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter Your Email"
                      className="pl-10 h-12 md:h-11 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {/* Membership Number Field */}
                {userType === 'professional' && (
                  <div className="space-y-2">
                    <Label htmlFor="membershipNo" className="text-gray-900 font-medium">
                      Membership No
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="membershipNo"
                        type="text"
                        value={formData.membershipNo}
                        onChange={(e) => handleInputChange('membershipNo', e.target.value)}
                        placeholder="Number"
                        className="pl-10 h-12 md:h-11 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl"
                      />
                    </div>
                  </div>
                )}

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
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter Your Password"
                      className="pl-10 pr-10 h-12 bg-blue-50 border-blue-200 focus:border-blue-400 rounded-xl"
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
              <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                By creating an Account Means you agree to the{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                  Terms and Conditions
                </Link>
                , and our{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

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
                  href="/login"
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