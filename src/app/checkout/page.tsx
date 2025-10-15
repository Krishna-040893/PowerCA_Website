'use client'

import {useState, useEffect  } from 'react'
import {useRouter, useSearchParams  } from 'next/navigation'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Label  } from '@/components/ui/label'
import {Checkbox  } from '@/components/ui/checkbox'
import {Loader2, AlertCircle, Minus, Plus, CheckCircle  } from 'lucide-react'
import {useSession  } from 'next-auth/react'
import {featuresConfig  } from '@/config/features'
import Script from 'next/script'
import Link from 'next/link'
import {RazorpayPaymentResponse  } from '@/types/common'
import Image from 'next/image'

interface FormErrors {
  firstName?: string
  firmName?: string
  email?: string
  phone?: string
  city?: string
  postcode?: string
  terms?: string
}

interface ReferralInfo {
  ref?: string
  cus?: string
  validated?: boolean
  affiliateName?: string
  firmName?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [couponCode, setCouponCode] = useState('')
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
  const [validatingReferral, setValidatingReferral] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    firmName: '',
    gstNo: '',
    country: 'India',
    address: '',
    city: '',
    state: '',
    postcode: '',
    email: '',
    phone: '',
    company: '',
    orderNotes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Get product details from config
  const product = featuresConfig.pricingPlans[0]
  const basePrice = 11 // ₹11 - Testing amount for LIVE mode
  const subtotal = basePrice * quantity
  const gstRate = 0.18 // 18% GST
  const gstAmount = subtotal * gstRate
  const total = subtotal + gstAmount

  // Detect and validate referral parameters
  useEffect(() => {
    const ref = searchParams.get('ref')
    const cus = searchParams.get('cus')

    if (ref || cus) {
      console.log('🔗 Referral detected on checkout:', { ref, cus })
      setReferralInfo({ ref: ref || undefined, cus: cus || undefined })

      // Validate referral in background
      if (ref && cus) {
        setValidatingReferral(true)
        fetch(`/api/affiliate/validate-referral?ref=${ref}&cus=${cus}`)
          .then(res => res.json())
          .then(data => {
            if (data.success && data.valid) {
              setReferralInfo(prev => ({
                ...prev,
                validated: true,
                affiliateName: data.affiliateName,
                firmName: data.firmName
              }))
              console.log('✅ Referral validated:', data)
            } else {
              setError('Invalid referral link. Please contact your affiliate partner.')
            }
          })
          .catch(err => {
            console.error('Failed to validate referral:', err)
          })
          .finally(() => {
            setValidatingReferral(false)
          })
      }
    } else {
      // Check localStorage for stored referral
      const stored = localStorage.getItem('affiliate_referral')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          console.log('🔗 Referral loaded from storage:', parsed)

          // Validate the stored referral before displaying
          if (parsed.ref && parsed.cus) {
            setValidatingReferral(true)
            fetch(`/api/affiliate/validate-referral?ref=${parsed.ref}&cus=${parsed.cus}`)
              .then(res => res.json())
              .then(data => {
                if (data.success && data.valid) {
                  setReferralInfo({
                    ...parsed,
                    validated: true,
                    affiliateName: data.affiliateName,
                    firmName: data.firmName
                  })
                  console.log('✅ Stored referral validated:', data)
                } else {
                  console.log('⚠️ Stored referral is invalid, clearing...')
                  localStorage.removeItem('affiliate_referral')
                  setReferralInfo(null)
                }
              })
              .catch(err => {
                console.error('Failed to validate stored referral:', err)
                localStorage.removeItem('affiliate_referral')
                setReferralInfo(null)
              })
              .finally(() => {
                setValidatingReferral(false)
              })
          } else {
            // Missing ref or cus, clear invalid data
            console.log('⚠️ Incomplete referral data, clearing...')
            localStorage.removeItem('affiliate_referral')
          }
        } catch (e) {
          console.error('Failed to parse stored referral:', e)
          localStorage.removeItem('affiliate_referral')
        }
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        email: session.user?.email || '',
        firstName: session.user?.name?.split(' ')[0] || '',
        firmName: session.user?.firmName || '',
        phone: session.user?.phone || '',
      }))
    }
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.firmName.trim()) newErrors.firmName = 'Firm name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.city.trim()) newErrors.city = 'Town/City is required'
    if (!formData.postcode.trim()) newErrors.postcode = 'Postcode is required'
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
            name: formData.firstName,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            firmName: formData.firmName,
            gst: formData.gstNo,
          },
          // Include referral information
          referralInfo: referralInfo ? {
            referralCode: referralInfo.ref,
            customerId: referralInfo.cus,
            validated: referralInfo.validated
          } : undefined
        })
      })

      const orderData = await orderResponse.json()

      if (!orderData.success && !orderData.orderId) {
        // Handle error object properly
        const errorMessage = typeof orderData.error === 'object'
          ? orderData.error?.message || JSON.stringify(orderData.error)
          : orderData.error || 'Failed to create order'
        throw new Error(errorMessage)
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
          name: formData.firstName,
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
                name: formData.firstName,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                firmName: formData.firmName,
                gst: formData.gstNo,
              },
              productDetails: {
                name: product.name,
                amount: total,
                quantity: quantity,
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

  const handleApplyCoupon = () => {
    // TODO: Implement coupon validation
    console.log('Applying coupon:', couponCode)
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1))

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-white py-8 sm:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Affiliate Referral Banner */}
          {referralInfo?.ref && (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                {validatingReferral ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-0.5" />
                ) : referralInfo.validated ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-green-700 mb-1">
                    {validatingReferral ? 'Validating referral...' :
                     referralInfo.validated ? '🎁 Affiliate Purchase' :
                     '🔗 Referral Link Detected'}
                  </h3>
                  {referralInfo.validated ? (
                    <div className="text-sm text-gray-700 space-y-1">
                      <p>You're completing a purchase through <strong>{referralInfo.affiliateName || 'an affiliate partner'}</strong></p>
                      {referralInfo.firmName && <p className="text-xs text-gray-600">Firm: {referralInfo.firmName}</p>}
                      <p className="text-xs font-mono bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                        Referral: {referralInfo.ref} • Customer ID: {referralInfo.cus}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Referral Code: <span className="font-mono font-bold">{referralInfo.ref}</span>
                      {referralInfo.cus && <> • Customer ID: <span className="font-mono font-bold">{referralInfo.cus}</span></>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Billing Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing Details</h2>

                <div className="space-y-4">
                  {/* First Name & Firm Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`mt-1 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="firmName" className="text-sm font-medium text-gray-700">
                        Firm Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firmName"
                        name="firmName"
                        value={formData.firmName}
                        onChange={handleInputChange}
                        className={`mt-1 ${errors.firmName ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.firmName && <p className="text-red-500 text-xs mt-1">{errors.firmName}</p>}
                    </div>
                  </div>

                  {/* GST No */}
                  <div>
                    <Label htmlFor="gstNo" className="text-sm font-medium text-gray-700">
                      GST No (optional)
                    </Label>
                    <Input
                      id="gstNo"
                      name="gstNo"
                      value={formData.gstNo}
                      onChange={handleInputChange}
                      className="mt-1 border-gray-300"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="India">India</option>
                    </select>
                  </div>

                  {/* Street Address */}
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                      Street address (optional)
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="House number and street name"
                      className="mt-1 border-gray-300"
                    />
                  </div>

                  {/* Town/City */}
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                      Town / City <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`mt-1 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  {/* State/County */}
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                      State / County (optional)
                    </Label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select State</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                  </div>

                  {/* Postcode/ZIP */}
                  <div>
                    <Label htmlFor="postcode" className="text-sm font-medium text-gray-700">
                      Postcode / ZIP <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      value={formData.postcode}
                      onChange={handleInputChange}
                      className={`mt-1 ${errors.postcode ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.postcode && <p className="text-red-500 text-xs mt-1">{errors.postcode}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`mt-1 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`mt-1 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Additional information</h3>
                <div>
                  <Label htmlFor="orderNotes" className="text-sm font-medium text-gray-700">
                    Order notes (optional)
                  </Label>
                  <textarea
                    id="orderNotes"
                    name="orderNotes"
                    value={formData.orderNotes}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Notes about your order, e.g. special notes for delivery."
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Apply Coupon */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Apply Coupon</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                  >
                    Apply
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  If you have a coupon code, please apply it below.
                </p>
              </div>

              {/* Purchase Plan */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase Plan</h3>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src="/images/powerca-logo-main.png"
                      alt="PowerCA"
                      width={60}
                      height={60}
                      className="object-contain filter brightness-0 invert"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">Power CA - Installation Demo</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-gray-600">No. of Users</span>
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          type="button"
                          onClick={decrementQuantity}
                          className="p-1 hover:bg-gray-100"
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 text-sm">{quantity}</span>
                        <button
                          type="button"
                          onClick={incrementQuantity}
                          className="p-1 hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">₹{(basePrice * quantity).toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>SGST & CGST (18%)</span>
                    <span className="font-semibold">₹{gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="radio"
                    id="razorpay"
                    name="payment"
                    checked
                    readOnly
                    className="w-4 h-4"
                  />
                  <Label htmlFor="razorpay" className="flex items-center gap-2 cursor-pointer">
                    <span className="font-medium">Credit Card/Debit Card/NetBanking/UPI</span>
                    <span className="text-xs text-gray-500 ml-2">Powered by Razorpay</span>
                  </Label>
                </div>
                <p className="text-sm text-gray-600 pl-6">
                  Pay securely by Credit or Debit card or Internet Banking through Razorpay.
                </p>
              </div>

              {/* Privacy & Terms */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-3">
                  Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{' '}
                  <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                    privacy policy
                  </Link>.
                </p>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    className={errors.terms ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer leading-tight">
                    I have read and agree to the website{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      terms and conditions
                    </Link>
                    <span className="text-red-500"> *</span>
                  </Label>
                </div>
                {errors.terms && <p className="text-red-500 text-xs mt-1 pl-6">{errors.terms}</p>}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              )}

              {/* Place Order Button */}
              <Button
                onClick={handlePayment}
                disabled={loading || !agreeToTerms}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-semibold rounded-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place order'
                )}
              </Button>

              <p className="text-center text-xs text-gray-500">
                🔒 Secure payment powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
