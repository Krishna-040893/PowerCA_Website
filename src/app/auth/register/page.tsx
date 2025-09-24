'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2 } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
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
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
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
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      setIsLoading(false)
      return
    }

    // Validate character-based fields (only letters and spaces)
    const nameRegex = /^[a-zA-Z\s]+$/
    if (!nameRegex.test(formData.name)) {
      setError('Name should contain only letters')
      setIsLoading(false)
      return
    }

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
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
      } else {
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
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
        </div>
      </div>
    </div>
  )
}