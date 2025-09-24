"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    mobile: "",
    password: "",
    role: "",
    // Professional fields
    professionalType: "",
    membershipNo: "",
    // Student fields
    registrationNo: "",
    instituteName: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors: any = {}

    // Name validation - only letters and spaces
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = "Name must contain only letters"
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // Username validation - only letters
    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (!/^[a-zA-Z]+$/.test(formData.username)) {
      newErrors.username = "Username must contain only letters"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    // Mobile validation - only 10 digits
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required"
    } else if (!/^[0-9]{10}$/.test(formData.mobile.replace(/\D/g, ""))) {
      newErrors.mobile = "Mobile number must be 10 digits"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter"
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter"
    } else if (!/(?=.*[0-9])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number"
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select a role"
    }

    // Professional-specific validations
    if (formData.role === "professional") {
      if (!formData.professionalType) {
        newErrors.professionalType = "Please select professional type"
      }
      if (!formData.membershipNo.trim()) {
        newErrors.membershipNo = "Membership number is required"
      } else if (!/^\d{6}$/.test(formData.membershipNo)) {
        newErrors.membershipNo = "Membership number must be exactly 6 digits"
      }
    }

    // Student-specific validations
    if (formData.role === "student") {
      if (!formData.registrationNo.trim()) {
        newErrors.registrationNo = "Registration number is required"
      } else if (!/^[A-Z0-9]+$/.test(formData.registrationNo)) {
        newErrors.registrationNo = "Registration number must contain only uppercase letters and numbers"
      }
      if (!formData.instituteName.trim()) {
        newErrors.instituteName = "Institute name is required"
      } else if (!/^[a-zA-Z]+$/.test(formData.instituteName)) {
        newErrors.instituteName = "Institute name must contain only letters (no spaces)"
      }
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
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          phone: formData.mobile,
          password: formData.password,
          role: formData.role === "professional" ? "Professional" : formData.role === "student" ? "Student" : formData.role,
          professionalType: formData.professionalType || null,
          membershipNo: formData.membershipNo || null,
          registrationNo: formData.registrationNo || null,
          instituteName: formData.instituteName || null
        })
      })

      const data = await response.json()

      if (data.success || response.ok) {
        alert("Registration successful! Please sign in.")
        router.push("/signin")
      } else {
        setErrors({ general: data.error || data.message || "Registration failed" })
      }
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ general: "An error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Handle different input restrictions
    if (name === "mobile") {
      // Only allow digits, max 10
      const cleanedValue = value.replace(/\D/g, "").slice(0, 10)
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }))
    } else if (name === "username") {
      // Only allow letters
      const cleanedValue = value.replace(/[^a-zA-Z]/g, "")
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }))
    } else if (name === "membershipNo") {
      // Only allow 6 digits
      const cleanedValue = value.replace(/\D/g, "").slice(0, 6)
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }))
    } else if (name === "instituteName") {
      // Only allow letters (no spaces)
      const cleanedValue = value.replace(/[^a-zA-Z]/g, "")
      setFormData(prev => ({
        ...prev,
        [name]: cleanedValue
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ""
      }))
    }

    // Reset conditional fields when role changes
    if (name === "role") {
      setFormData(prev => ({
        ...prev,
        professionalType: "",
        membershipNo: "",
        registrationNo: "",
        instituteName: ""
      }))
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Blue Panel */}
      <div className="w-full lg:w-2/5 bg-gradient-to-br from-blue-400 to-blue-600 text-white p-12 flex flex-col justify-between">
        <div>
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-bold">CA</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">POWER CA</h1>
                <p className="text-sm opacity-90">PRACTICE MANAGEMENT</p>
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <div>
            <h2 className="text-4xl font-bold mb-8">Welcome!</h2>
            <p className="text-lg opacity-90 mb-4">
              Sign up to your account using the form on the right.
            </p>
            <p className="text-lg opacity-90">
              Please feel free to reach us anytime if you have any issues logging in or signing up!
            </p>
          </div>
        </div>

        {/* Trusted Companies */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Our Trusted Companies:</h3>
          <div className="flex items-center gap-6">
            <div className="bg-white/20 px-4 py-2 rounded">GKM</div>
            <div className="bg-white/20 px-4 py-2 rounded">CA Karthikeyan & Jayaram</div>
            <div className="bg-white/20 px-4 py-2 rounded">VS MANIAM & ASSOCIATES</div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 bg-white p-12 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="E-mail ID"
                  className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Username and Mobile Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className={`w-full px-4 py-3 border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.username && (
                  <p className="mt-1 text-xs text-red-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Mobile No"
                  maxLength={10}
                  className={`w-full px-4 py-3 border ${errors.mobile ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {errors.mobile && (
                  <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>
                )}
              </div>
            </div>

            {/* Password and Role Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className={`w-full px-4 py-3 pr-10 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-red-500">
                  (Password must contain at least 8 characters, one capital letter, one lowercase letter and one number)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.role ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white`}
                >
                  <option value="">Select Role</option>
                  <option value="professional">Professional</option>
                  <option value="student">Student</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-xs text-red-600">{errors.role}</p>
                )}
              </div>
            </div>

            {/* Professional Fields */}
            {formData.role === "professional" && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-gray-700">Professional Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professional Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {["CA", "CMA", "CS", "NA"].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="professionalType"
                          value={type}
                          checked={formData.professionalType === type}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>{type}</span>
                      </label>
                    ))}
                  </div>
                  {errors.professionalType && (
                    <p className="mt-1 text-xs text-red-600">{errors.professionalType}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Membership No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="membershipNo"
                    value={formData.membershipNo}
                    onChange={handleChange}
                    placeholder="Enter 6-digit Membership Number"
                    maxLength={6}
                    className={`w-full px-4 py-3 border ${errors.membershipNo ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.membershipNo && (
                    <p className="mt-1 text-xs text-red-600">{errors.membershipNo}</p>
                  )}
                </div>
              </div>
            )}

            {/* Student Fields */}
            {formData.role === "student" && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-gray-700">Student Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="registrationNo"
                    value={formData.registrationNo}
                    onChange={handleChange}
                    placeholder="Enter Registration Number"
                    className={`w-full px-4 py-3 border ${errors.registrationNo ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.registrationNo && (
                    <p className="mt-1 text-xs text-red-600">{errors.registrationNo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institute Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="instituteName"
                    value={formData.instituteName}
                    onChange={handleChange}
                    placeholder="Enter Institute Name"
                    className={`w-full px-4 py-3 border ${errors.instituteName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {errors.instituteName && (
                    <p className="mt-1 text-xs text-red-600">{errors.instituteName}</p>
                  )}
                </div>
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="bg-red-50 text-red-800 rounded-lg p-3 text-sm">
                {errors.general}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link href="/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign In Here!
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}