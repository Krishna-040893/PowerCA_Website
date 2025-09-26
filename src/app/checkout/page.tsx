'use client'

import {useState, useEffect  } from 'react'
import {useRouter  } from 'next/navigation'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Label  } from '@/components/ui/label'
import {Checkbox  } from '@/components/ui/checkbox'
import {Loader2, CheckCircle, AlertCircle  } from 'lucide-react'
import {useSession  } from 'next-auth/react'
import {featuresConfig  } from '@/config/features'
import Script from 'next/script'
import Link from 'next/link'
import {RazorpayPaymentResponse  } from '@/types/common'

// Import the already defined RazorpayConstructor type from payment types
// The window.Razorpay type is already defined in src/types/payment.ts

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  terms?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gstNo: '',
    email: '',
    phone: '',
    company: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Get product details from config
  const product = featuresConfig.pricingPlans[0]
  const basePrice = 22000 // ₹22,000 for production
  const subtotal = basePrice
  const gstRate = 0.18 // 18% GST
  const gstAmount = subtotal * gstRate
  const total = subtotal + gstAmount

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        email: session.user?.email || '',
        firstName: session.user?.name?.split(' ')[0] || '',
        lastName: session.user?.name?.split(' ').slice(1).join(' ') || '',
      }))
    }
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!agreeToTerms) newErrors.terms = 'You must agree to the terms and conditions'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      // Create order on backend
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to paise
          productId: product.productId,
          planType: 'implementation',
          ...formData,
          customerDetails: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            gst: formData.gstNo,
          }
        })
      })

      const orderData = await orderResponse.json()

      if (!orderData.success && !orderData.orderId) {
        throw new Error(orderData.error || 'Failed to create order')
      }

      // Load Razorpay script
      await loadRazorpayScript()

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId || orderData.id,
        name: 'PowerCA',
        description: product.name || 'PowerCA Implementation',
        image: '/logo.png',
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          gstNo: formData.gstNo,
          company: formData.company,
        },
        theme: {
          color: '#1D91EB',
        },
        handler: async function (response: RazorpayPaymentResponse) {
          // Verify payment on backend
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              customerDetails: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                gst: formData.gstNo,
              },
              productDetails: {
                name: product.name,
                amount: total,
                quantity: 1,
                gstAmount: gstAmount,
              }
            })
          })

          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json()
            if (verifyData.success) {
              router.push(`/payment-success?orderId=${verifyData.data?.orderId}&invoiceId=${verifyData.data?.invoiceNumber}`)
            } else {
              setError('Payment verification failed. Please contact support.')
              setLoading(false)
            }
          } else {
            setError('Payment verification failed. Please try again.')
            setLoading(false)
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err: unknown) {
      console.error('Payment error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

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
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>First Year Subscription</span>
                    <span className="font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>SGST & CGST (18%)</span>
                    <span>₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Amount</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Contact Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
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
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                      className={errors.phone ? 'border-red-500' : ''}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
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

                  <div>
                    <Label htmlFor="gstNo">GST No (optional)</Label>
                    <Input
                      id="gstNo"
                      name="gstNo"
                      value={formData.gstNo}
                      onChange={handleInputChange}
                      placeholder="Enter GST Number"
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

              {/* Terms Checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  className={errors.terms ? 'border-red-500' : ''}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I have read and agree to the website{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    terms and conditions
                  </Link>
                  <span className="text-red-500"> *</span>
                </Label>
              </div>
              {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}

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
                disabled={loading || !agreeToTerms}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-6 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ₹${total.toFixed(2)} Now`
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Secure payment powered by Razorpay. Your payment information is encrypted and secure.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  )
}