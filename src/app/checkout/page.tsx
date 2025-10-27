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
  country?: string
  address?: string
  city?: string
  state?: string
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

// Country-State mapping
const countryStates: Record<string, string[]> = {
  'India': [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ],
  'United States': [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
    'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
    'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ],
  'United Kingdom': [
    'England', 'Scotland', 'Wales', 'Northern Ireland'
  ],
  'Canada': [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
    'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
    'Quebec', 'Saskatchewan', 'Yukon'
  ],
  'Australia': [
    'Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland',
    'South Australia', 'Tasmania', 'Victoria', 'Western Australia'
  ],
  'Germany': [
    'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
    'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia',
    'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt',
    'Schleswig-Holstein', 'Thuringia'
  ],
  'United Arab Emirates': [
    'Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain'
  ],
  'France': [
    'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire',
    'Corsica', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandy',
    'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'
  ],
  'China': [
    'Anhui', 'Beijing', 'Chongqing', 'Fujian', 'Gansu', 'Guangdong', 'Guangxi',
    'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hong Kong', 'Hubei',
    'Hunan', 'Inner Mongolia', 'Jiangsu', 'Jiangxi', 'Jilin', 'Liaoning', 'Macau',
    'Ningxia', 'Qinghai', 'Shaanxi', 'Shandong', 'Shanghai', 'Shanxi', 'Sichuan',
    'Tianjin', 'Tibet', 'Xinjiang', 'Yunnan', 'Zhejiang'
  ],
  'Japan': [
    'Aichi', 'Akita', 'Aomori', 'Chiba', 'Ehime', 'Fukui', 'Fukuoka', 'Fukushima',
    'Gifu', 'Gunma', 'Hiroshima', 'Hokkaido', 'Hyogo', 'Ibaraki', 'Ishikawa',
    'Iwate', 'Kagawa', 'Kagoshima', 'Kanagawa', 'Kochi', 'Kumamoto', 'Kyoto',
    'Mie', 'Miyagi', 'Miyazaki', 'Nagano', 'Nagasaki', 'Nara', 'Niigata',
    'Oita', 'Okayama', 'Okinawa', 'Osaka', 'Saga', 'Saitama', 'Shiga',
    'Shimane', 'Shizuoka', 'Tochigi', 'Tokushima', 'Tokyo', 'Tottori',
    'Toyama', 'Wakayama', 'Yamagata', 'Yamaguchi', 'Yamanashi'
  ],
  'Brazil': [
    'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
    'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
    'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí',
    'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
    'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
  ],
  'Mexico': [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
    'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero',
    'Hidalgo', 'Jalisco', 'Mexico City', 'México', 'Michoacán', 'Morelos',
    'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo',
    'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala',
    'Veracruz', 'Yucatán', 'Zacatecas'
  ],
  'Spain': [
    'Andalusia', 'Aragon', 'Asturias', 'Balearic Islands', 'Basque Country',
    'Canary Islands', 'Cantabria', 'Castile and León', 'Castile-La Mancha',
    'Catalonia', 'Ceuta', 'Extremadura', 'Galicia', 'La Rioja', 'Madrid',
    'Melilla', 'Murcia', 'Navarre', 'Valencia'
  ],
  'Italy': [
    'Abruzzo', 'Aosta Valley', 'Apulia', 'Basilicata', 'Calabria', 'Campania',
    'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardy',
    'Marche', 'Molise', 'Piedmont', 'Sardinia', 'Sicily', 'Trentino-South Tyrol',
    'Tuscany', 'Umbria', 'Veneto'
  ]
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
    country: '',
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

  // Get states for selected country
  const availableStates = countryStates[formData.country] || countryStates['default']
  const hasStateDropdown = formData.country && countryStates[formData.country] !== undefined

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
        firstName: session.user?.name || '',
        firmName: session.user?.firmName || '',
        phone: session.user?.phone || '',
      }))
    }
  }, [session])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // If country changes, reset the state field
    if (name === 'country') {
      setFormData(prev => ({
        ...prev,
        country: value,
        state: '', // Reset state when country changes
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'Full name is required'
    if (!formData.firmName.trim()) newErrors.firmName = 'Firm name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'
    if (!formData.address.trim()) newErrors.address = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'Town/City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
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
            address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.postcode}`,
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
                address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.postcode}`,
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
      <style jsx global>{`
        .checkout-page input::placeholder,
        .checkout-page textarea::placeholder {
          color: #666D80 !important;
          opacity: 1;
        }
        .checkout-page input::-webkit-input-placeholder,
        .checkout-page textarea::-webkit-input-placeholder {
          color: #666D80 !important;
        }
        .checkout-page input::-moz-placeholder,
        .checkout-page textarea::-moz-placeholder {
          color: #666D80 !important;
        }
        .checkout-page input:-ms-input-placeholder,
        .checkout-page textarea:-ms-input-placeholder {
          color: #666D80 !important;
        }
      `}</style>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-white py-8 sm:py-12 checkout-page">
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
                  {/* Full Name & Firm Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
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
                      GST No <span className="text-gray-400 text-xs">(Optional)</span>
                    </Label>
                    <Input
                      id="gstNo"
                      name="gstNo"
                      value={formData.gstNo}
                      onChange={handleInputChange}
                      placeholder="Enter your GST number if applicable"
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
                      className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.country ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Select Country</option>
                      <option value="India">India</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                      <option value="Afghanistan">Afghanistan</option>
                      <option value="Albania">Albania</option>
                      <option value="Algeria">Algeria</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Austria">Austria</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Brazil">Brazil</option>
                      <option value="China">China</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Egypt">Egypt</option>
                      <option value="Finland">Finland</option>
                      <option value="France">France</option>
                      <option value="Germany">Germany</option>
                      <option value="Greece">Greece</option>
                      <option value="Hong Kong">Hong Kong</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Italy">Italy</option>
                      <option value="Japan">Japan</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Mexico">Mexico</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Norway">Norway</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Poland">Poland</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Russia">Russia</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Singapore">Singapore</option>
                      <option value="South Africa">South Africa</option>
                      <option value="South Korea">South Korea</option>
                      <option value="Spain">Spain</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Turkey">Turkey</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="Vietnam">Vietnam</option>
                    </select>
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                  </div>

                  {/* Street Address */}
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                      Street address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Street address"
                      className={`mt-1 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
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

                  {/* State */}
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                      State<span className="text-red-500">*</span>
                    </Label>
                    {hasStateDropdown ? (
                      <select
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                      >
                        <option value="">Select State</option>
                        {availableStates.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder={formData.country ? "Enter your state or county" : "Please select a country first"}
                        disabled={!formData.country}
                        className={`mt-1 ${errors.state ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    )}
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
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

              {/* Additional Information
              /*<div>
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
              </div>*/}
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              {/* Apply Coupon
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
              </div>*/}

              {/* Purchase Plan */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Purchase Plan</h3>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 shadow-md">
                    <Image
                      src="/images/power-ca-logo-footer.png"
                      alt="PowerCA"
                      width={80}
                      height={80}
                      className="object-contain filter brightness-0 invert p-2"
                      unoptimized
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
