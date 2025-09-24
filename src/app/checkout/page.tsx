<<<<<<< HEAD
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CreditCard, Minus, Plus } from "lucide-react"
import { featuresConfig } from "@/config/features"
import Script from "next/script"
import Image from "next/image"
import Link from "next/link"
=======
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Script from 'next/script'
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
<<<<<<< HEAD
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gstNo: "",
    country: "India",
    streetAddress: "",
    townCity: "",
    state: "",
    postcode: "",
    email: "",
  })
  const [errors, setErrors] = useState<any>({})

  // Get product details from config
  const product = featuresConfig.pricingPlans[0]
  const basePrice = 1 // â‚¹1 for testing
  const subtotal = basePrice * quantity
  const gstRate = 0.18 // 18% GST
  const gstAmount = subtotal * gstRate
  const sgst = gstAmount / 2 // 9% SGST
  const cgst = gstAmount / 2 // 9% CGST
  const total = subtotal + gstAmount

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.townCity.trim()) newErrors.townCity = "City is required"
    if (!formData.state.trim()) newErrors.state = "State is required"
    if (!formData.postcode.trim()) newErrors.postcode = "Postcode is required"
    else if (!/^[0-9]{6}$/.test(formData.postcode)) newErrors.postcode = "Postcode must be 6 digits"
    if (!agreeToTerms) newErrors.terms = "You must agree to the terms and conditions"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validateForm()) return

    setLoading(true)

    try {
      // Create order on backend
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to paise
          productId: product.productId,
          customerDetails: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.postcode, // Using postcode as phone for now
            company: formData.gstNo ? `GST: ${formData.gstNo}` : "",
            address: formData.streetAddress,
            city: formData.townCity,
            state: formData.state,
            pincode: formData.postcode,
            gst: formData.gstNo,
          }
        })
      })

      const orderData = await orderResponse.json()

      if (!orderData.success) {
        throw new Error(orderData.error || "Failed to create order")
      }
=======
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  })

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || '',
      }))
    }
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = resolve
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError('')

      // Validate form
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Create order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          planType: 'implementation',
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const orderData = await orderResponse.json()

      // Load Razorpay script
      await loadRazorpayScript()
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
<<<<<<< HEAD
        name: "PowerCA",
        description: product.name,
        image: "/logo.png",
        handler: async function (response: any) {
          // Verify payment on backend
          const verifyResponse = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              customerDetails: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.postcode,
                company: formData.gstNo ? `GST: ${formData.gstNo}` : "",
                address: formData.streetAddress,
                city: formData.townCity,
                state: formData.state,
                pincode: formData.postcode,
                gst: formData.gstNo,
              },
              productDetails: {
                name: product.name,
                amount: total,
                quantity: quantity,
                gstAmount: gstAmount,
                sgst: sgst,
                cgst: cgst,
              }
            })
          })

          const verifyData = await verifyResponse.json()

          if (verifyData.success) {
            // Payment successful, redirect to success page
            router.push(`/payment-success?orderId=${verifyData.orderId}&invoiceId=${verifyData.invoiceId}`)
          } else {
            alert("Payment verification failed. Please contact support.")
            setLoading(false)
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.postcode
        },
        notes: {
          gstNo: formData.gstNo,
          address: formData.streetAddress,
          city: formData.townCity,
          state: formData.state,
        },
        theme: {
          color: "#1D91EB"
=======
        name: 'PowerCA',
        description: 'One-time Implementation Fee',
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#1D91EB',
        },
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })

          if (verifyResponse.ok) {
            router.push('/payment-success')
          } else {
            router.push('/payment-failed')
          }
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
<<<<<<< HEAD
    } catch (error: any) {
      console.error("Payment error:", error)
      alert(error.message || "Payment failed. Please try again.")
=======
    } catch (err) {
      console.error('Payment error:', err)
      setError('Something went wrong. Please try again.')
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
      setLoading(false)
    }
  }

  return (
<<<<<<< HEAD
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Billing Details */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Billing Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="mb-2 block">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        placeholder="Krishna"
                        className={errors.firstName ? "border-red-500" : ""}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="mb-2 block">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        placeholder="CM"
                        className={errors.lastName ? "border-red-500" : ""}
                      />
                      {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gstNo" className="mb-2 block">GST No (optional)</Label>
                    <Input
                      id="gstNo"
                      value={formData.gstNo}
                      onChange={(e) => setFormData({...formData, gstNo: e.target.value.toUpperCase()})}
                      placeholder="Enter GST Number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="country" className="mb-2 block">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData({...formData, country: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="India">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="streetAddress" className="mb-2 block">Street address (optional)</Label>
                    <Input
                      id="streetAddress"
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({...formData, streetAddress: e.target.value})}
                      placeholder="No. 55, Thasami Park Residency,, Vasanth Nagar"
                    />
                  </div>

                  <div>
                    <Label htmlFor="townCity" className="mb-2 block">
                      Town / City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="townCity"
                      value={formData.townCity}
                      onChange={(e) => setFormData({...formData, townCity: e.target.value})}
                      placeholder="Singanallur"
                      className={errors.townCity ? "border-red-500" : ""}
                    />
                    {errors.townCity && <p className="text-red-500 text-sm mt-1">{errors.townCity}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state" className="mb-2 block">
                      State / County (optional) <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) => setFormData({...formData, state: value})}
                    >
                      <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                        <SelectItem value="Karnataka">Karnataka</SelectItem>
                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                        <SelectItem value="Delhi">Delhi</SelectItem>
                        <SelectItem value="Gujarat">Gujarat</SelectItem>
                        <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                        <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                        <SelectItem value="West Bengal">West Bengal</SelectItem>
                        <SelectItem value="Kerala">Kerala</SelectItem>
                        <SelectItem value="Telangana">Telangana</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <Label htmlFor="postcode" className="mb-2 block">
                      Postcode / ZIP <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="postcode"
                      value={formData.postcode}
                      onChange={(e) => setFormData({...formData, postcode: e.target.value.replace(/\D/g, "").slice(0, 6)})}
                      placeholder="641005"
                      className={errors.postcode ? "border-red-500" : ""}
                    />
                    {errors.postcode && <p className="text-red-500 text-sm mt-1">{errors.postcode}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email" className="mb-2 block">
                      Email address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="krishnaprasadm93@gmail.com"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Purchase Plan */}
            <div>
              {/* Purchase Plan Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Purchase Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product Item */}
                  <div className="flex gap-4 items-start pb-4 border-b">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm text-center">PowerCA</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Power CA - Installation Demo</h3>
                      <p className="text-sm text-gray-600 mt-1">No. of Users</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">â‚¹{subtotal.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold">â‚¹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>SGST & CGST (18%)</span>
                      <span>â‚¹{gstAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>â‚¹{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="border-t pt-4">
                    <RadioGroup defaultValue="razorpay" className="space-y-3">
                      <div className="flex items-center space-x-2 p-3 border rounded-lg bg-blue-50 border-blue-200">
                        <RadioGroupItem value="razorpay" id="razorpay" />
                        <Label htmlFor="razorpay" className="flex items-center gap-2 cursor-pointer flex-1">
                          <span>Credit Card/Debit Card/NetBanking</span>
                          <Image
                            src="/razorpay-logo.png"
                            alt="Pay by Razorpay"
                            width={80}
                            height={20}
                            className="ml-auto"
                          />
                        </Label>
                      </div>
                    </RadioGroup>
                    <p className="text-sm text-gray-600 mt-3">
                      Pay securely by Credit or Debit card or Internet Banking through Razorpay.
                    </p>
                  </div>

                  {/* Personal Data Notice */}
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    Your personal data will be used to process your order, support your experience
                    throughout this website, and for other purposes described in our{" "}
                    <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                      privacy policy
                    </Link>.
                  </div>

                  {/* Terms Checkbox */}
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                      className={errors.terms ? "border-red-500" : ""}
                    />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I have read and agree to the website{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        terms and conditions
                      </Link>
                      <span className="text-red-500"> *</span>
                    </Label>
                  </div>
                  {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

                  {/* Place Order Button */}
                  <Button
                    onClick={handlePayment}
                    disabled={loading || !agreeToTerms}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Place order"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
=======
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <CardTitle className="text-2xl">Complete Your Purchase</CardTitle>
            <CardDescription className="text-gray-100">
              PowerCA Implementation - One-time fee with first year FREE
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-6 space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>PowerCA Implementation</span>
                  <span className="font-semibold">¹22,000</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>First Year Subscription</span>
                  <span className="font-semibold">FREE</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>¹22,000</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Your firm/company name"
                  />
                </div>
              </div>
            </div>

            {/* Features Included */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                What's Included
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Full software implementation and setup
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  First year subscription absolutely FREE
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Complete data migration from existing system
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Personalized training sessions for your team
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  24/7 dedicated support throughout
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
                <span className="text-red-800">{error}</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay ¹22,000 Now'
              )}
            </Button>
            
            <p className="text-center text-sm text-gray-600">
              Secure payment powered by Razorpay. Your payment information is encrypted and secure.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
>>>>>>> a0ca34adb227776b18a3475234c2ee4188ffbe00
  )
}