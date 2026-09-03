'use client'

import {useState, useEffect, Suspense  } from 'react'
import {useRouter, useSearchParams  } from 'next/navigation'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Label  } from '@/components/ui/label'
import {Checkbox  } from '@/components/ui/checkbox'
import {Loader2, AlertCircle, CheckCircle, MapPin, Trash2, Plus, Tag  } from 'lucide-react'
import {useSession  } from 'next-auth/react'
import {featuresConfig  } from '@/config/features'
import Script from 'next/script'
import Link from 'next/link'
import {RazorpayPaymentResponse  } from '@/types/common'
import Image from 'next/image'
import { PageErrorBoundary } from '@/components/error-boundary'

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
  paymentGateway?: string
  userCount?: string
}

interface ReferralInfo {
  ref?: string
  cus?: string
  validated?: boolean
  affiliateName?: string
  firmName?: string
}

interface SavedAddress {
  id: string
  full_name: string
  firm_name: string
  gst_no?: string
  address: string
  city: string
  state: string
  postcode: string
  country: string
  phone: string
  email: string
  is_default: boolean
  label?: string
  created_at: string
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

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: sessionStatus } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const userCountParam = searchParams.get('userCount')
  const [userCount, setUserCount] = useState<number | ''>(() => {
    const parsed = userCountParam ? parseInt(userCountParam, 10) : NaN
    return !isNaN(parsed) && parsed >= 5 ? parsed : 5
  })
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number; description?: string } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
  const [validatingReferral, setValidatingReferral] = useState(false)
  const [paymentGateway] = useState<'razorpay'>('razorpay')

  // Check if this is a final settlement payment
  const paymentType = searchParams.get('paymentType')
  const isFinalSettlement = paymentType === 'final_settlement'

  // Get plan details from URL params (from pricing page)
  const planType = searchParams.get('planType')
  const planPriceParam = searchParams.get('planPrice')

  // Redirect to pricing if no plan is selected
  useEffect(() => {
    if (!planType || !planPriceParam) {
      // No plan selected - redirect to pricing page to select a plan
      router.push('/pricing')
    }
  }, [planType, planPriceParam, router])

  const selectedPlanPrice = planPriceParam ? parseInt(planPriceParam, 10) : 0

  // Check if this plan supports user count (per-user pricing)
  const isPerUserPlan = planType === 'annual' || planType === 'onetime'

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
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [_savingAddress, setSavingAddress] = useState(false)
  const [_addressSaveSuccess, setAddressSaveSuccess] = useState(false)
  // Track purchased address IDs to determine if this is a renewal (no server installation charge)
  const [purchasedAddressIds, setPurchasedAddressIds] = useState<string[]>([])

  // Get states for selected country (available for future state dropdown feature)
  const _availableStates = countryStates[formData.country] || countryStates['default']
  const _hasStateDropdown = formData.country && countryStates[formData.country] !== undefined

  // Get product details from config
  const product = featuresConfig.pricingPlans[0]

  // Coupon-based discount logic
  // Discounts are now applied via coupon codes from the database
  // For final settlement, no discounts apply

  // Use the plan price from URL (selected on pricing page)
  const fullBasePrice = selectedPlanPrice

  // Calculate coupon discount
  const couponDiscountRate = isFinalSettlement ? 0 : (appliedCoupon ? appliedCoupon.discountPercentage / 100 : 0)
  const totalDiscountPercentage = appliedCoupon ? appliedCoupon.discountPercentage : 0
  const totalDiscountAmount = fullBasePrice * couponDiscountRate

  const basePrice = fullBasePrice - totalDiscountAmount
  // For per-user plans, multiply by user count
  const quantity = isPerUserPlan ? (userCount !== '' && userCount >= 5 ? userCount : 0) : 1
  const subtotal = basePrice * quantity
  // Total discount across all users (for display)
  const totalDiscountDisplay = totalDiscountAmount * quantity
  // Server Installation & Configuration charge - only for first purchase of an address
  // Renewals (same address purchased again) don't include this charge
  const isRenewal = selectedAddressId ? purchasedAddressIds.includes(selectedAddressId) : false
  const implementationCharge = !isRenewal && !isFinalSettlement ? 5000 : 0
  const subtotalWithImplementation = subtotal + implementationCharge
  const gstRate = 0.18 // 18% GST
  const gstAmount = Math.ceil(subtotalWithImplementation * gstRate)
  const total = subtotalWithImplementation + gstAmount

  // Plan display names
  const getPlanDisplayName = () => {
    switch (planType) {
      case 'annual': return 'Annual Subscription'
      case 'onetime': return '2 Year Pack'
      default: return 'Power CA Subscription'
    }
  }

  // Product name based on payment type and plan
  const productName = isFinalSettlement ? 'Power CA Final Settlement' : getPlanDisplayName()
  const productDescription = isFinalSettlement
    ? 'Final settlement payment for Power CA service'
    : planType === 'annual' ? 'Annual subscription with ongoing support'
    : planType === 'onetime' ? '2 Year Pack - Per user pricing'
    : 'Installation and Ongoing Support & Update'


  // Enforce authentication - redirect to login if not authenticated
  useEffect(() => {
    if (sessionStatus === 'loading') {
      setCheckingAuth(true)
      return
    }

    if (sessionStatus === 'unauthenticated' || !session) {
      // User is not logged in, redirect to login with return URL
      const currentPath = window.location.pathname + window.location.search
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    // User is authenticated
    setCheckingAuth(false)
  }, [session, sessionStatus, router])

  // Detect and validate referral parameters
  useEffect(() => {
    const ref = searchParams.get('ref')
    const cus = searchParams.get('cus')

    if (ref || cus) {
      setReferralInfo({ ref: ref || undefined, cus: cus || undefined })

      // Validate referral in background
      if (ref && cus) {
        setValidatingReferral(true)
        fetch(`/api/affiliate/validate-referral?ref=${ref}&cus=${cus}`)
          .then(res => {
            if (!res.ok) throw new Error('Referral validation failed')
            return res.json()
          })
          .then(data => {
            if (data.success && data.valid) {
              setReferralInfo(prev => ({
                ...prev,
                validated: true,
                affiliateName: data.affiliateName,
                firmName: data.firmName
              }))
            } else {
              setError('Invalid referral link. Please contact your affiliate partner.')
            }
          })
          .catch(err => {
            // Log referral validation failure for debugging
            if (process.env.NODE_ENV === 'development') {
              console.error('Referral validation failed:', err)
            }
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

          // Validate the stored referral before displaying
          if (parsed.ref && parsed.cus) {
            setValidatingReferral(true)
            fetch(`/api/affiliate/validate-referral?ref=${parsed.ref}&cus=${parsed.cus}`)
              .then(res => {
                if (!res.ok) throw new Error('Referral validation failed')
                return res.json()
              })
              .then(data => {
                if (data.success && data.valid) {
                  setReferralInfo({
                    ...parsed,
                    validated: true,
                    affiliateName: data.affiliateName,
                    firmName: data.firmName
                  })
                } else {
                  localStorage.removeItem('affiliate_referral')
                  setReferralInfo(null)
                }
              })
              .catch(err => {
                // Log error and clear invalid referral data
                if (process.env.NODE_ENV === 'development') {
                  console.error('Stored referral validation failed:', err)
                }
                localStorage.removeItem('affiliate_referral')
                setReferralInfo(null)
              })
              .finally(() => {
                setValidatingReferral(false)
              })
          } else {
            // Missing ref or cus, clear invalid data
            localStorage.removeItem('affiliate_referral')
          }
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error parsing affiliate referral from localStorage:', err)
          }
          localStorage.removeItem('affiliate_referral')
        }
      }
    }
  }, [searchParams])

  // Track if address was loaded from sessionStorage
  const [addressLoadedFromStorage, setAddressLoadedFromStorage] = useState(false)

  // Fetch saved addresses FIRST (before other useEffects)
  useEffect(() => {
    if (session?.user) {
      fetchSavedAddresses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (session?.user) {
      // Check if we have addressId in URL/storage - if so, skip auto-fill entirely
      const addressIdFromUrl = searchParams.get('addressId')
      const addressIdFromSession = sessionStorage.getItem('checkoutAddressId')
      const addressIdFromLocal = localStorage.getItem('checkoutAddressId')

      if (addressIdFromUrl || addressIdFromSession || addressIdFromLocal) {
        // Address will be loaded by fetchSavedAddresses, skip this auto-fill
        return
      }

      // Skip auto-fill if address was already loaded from storage
      if (addressLoadedFromStorage) {
        return
      }

      // First set basic user data from session
      setFormData(prev => ({
        ...prev,
        email: session.user?.email || '',
        firstName: session.user?.name || '',
        firmName: session.user?.firmName || '',
        phone: session.user?.phone || '',
      }))

      // Then fetch and auto-fill from last incomplete order
      const fetchLastOrder = async () => {
        try {
          const response = await fetch('/api/user/last-order')
          if (!response.ok) return
          const result = await response.json()

          if (result.hasOrder && result.orderData) {
            setFormData(prev => ({
              ...prev,
              // Only fill fields that are not already populated or are empty
              firstName: result.orderData.firstName || prev.firstName,
              firmName: result.orderData.firmName || prev.firmName,
              gstNo: result.orderData.gstNo || prev.gstNo,
              country: result.orderData.country || prev.country,
              address: result.orderData.address || prev.address,
              city: result.orderData.city || prev.city,
              state: result.orderData.state || prev.state,
              postcode: result.orderData.postcode || prev.postcode,
              email: result.orderData.email || prev.email,
              phone: result.orderData.phone || prev.phone,
              company: result.orderData.company || prev.company,
            }))
          }
        } catch (err) {
          // Continue without auto-fill if there's an error
          if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching last order for auto-fill:', err)
          }
        }
      }

      fetchLastOrder()
    }
  }, [session, addressLoadedFromStorage, searchParams])

  const fetchSavedAddresses = async () => {
    setLoadingAddresses(true)
    try {
      const response = await fetch('/api/user/addresses')
      if (!response.ok) throw new Error('Failed to fetch addresses')
      const result = await response.json()

      if (result.success && result.addresses) {
        setSavedAddresses(result.addresses)

        // Check multiple sources for addressId (in order of priority)
        const addressIdFromUrl = searchParams.get('addressId')
        const addressIdFromSession = sessionStorage.getItem('checkoutAddressId')
        const addressIdFromLocal = localStorage.getItem('checkoutAddressId')

        const addressIdFromStorage = addressIdFromUrl || addressIdFromSession || addressIdFromLocal

        if (addressIdFromStorage) {
          const storageAddress = result.addresses.find((addr: SavedAddress) => addr.id === addressIdFromStorage)
          if (storageAddress) {
            // Set the flag FIRST to prevent other useEffects from running
            setAddressLoadedFromStorage(true)

            // Then load the address data
            loadAddressToForm(storageAddress)
            setSelectedAddressId(storageAddress.id)

            // Clear all storage after using
            sessionStorage.removeItem('checkoutAddressId')
            localStorage.removeItem('checkoutAddressId')
          }
        } else {
          // Auto-select default address if exists and form is empty
          const defaultAddress = result.addresses.find((addr: SavedAddress) => addr.is_default)
          if (defaultAddress && !formData.address) {
            loadAddressToForm(defaultAddress)
            setSelectedAddressId(defaultAddress.id)
          }
        }
      }

      // Fetch purchased address IDs to detect renewals
      const purchasedResponse = await fetch('/api/user/purchased-addresses')
      if (purchasedResponse.ok) {
        const purchasedResult = await purchasedResponse.json()
        if (purchasedResult.success && purchasedResult.purchasedAddressIds) {
          setPurchasedAddressIds(purchasedResult.purchasedAddressIds)
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching addresses:', error)
      }
    } finally {
      setLoadingAddresses(false)
    }
  }

  const loadAddressToForm = (address: SavedAddress) => {
    const newData = {
      firstName: address.full_name,
      firmName: address.firm_name,
      gstNo: address.gst_no || '',
      address: address.address,
      city: address.city,
      state: address.state,
      postcode: address.postcode,
      country: address.country,
      phone: address.phone,
      email: address.email,
      company: '',
      orderNotes: '',
    }

    setFormData(newData)
  }

  // Address save handler - kept for future multi-address feature
  const _handleSaveAddress = async () => {
    // Validate required fields
    const isStudent = (session?.user?.role as string) === 'student'
    if (!formData.firstName || (!isStudent && !formData.firmName) || !formData.address ||
        !formData.city || !formData.state || !formData.postcode ||
        !formData.country || !formData.phone || !formData.email) {
      setError('Please fill all required fields before saving address')
      return
    }

    setSavingAddress(true)
    setError('')

    try {
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.firstName,
          firm_name: formData.firmName,
          gst_no: formData.gstNo,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          country: formData.country,
          phone: formData.phone,
          email: formData.email,
          is_default: savedAddresses.length === 0,
        })
      })

      const result = await response.json()

      if (result.success) {
        // Show success message
        setAddressSaveSuccess(true)
        setTimeout(() => setAddressSaveSuccess(false), 3000)

        // Refresh addresses list
        await fetchSavedAddresses()

        // Clear form for next address
        setFormData(prev => ({
          ...prev,
          firstName: session?.user?.name || '',
          firmName: session?.user?.firmName || '',
          gstNo: '',
          address: '',
          city: '',
          state: '',
          postcode: '',
          country: '',
          phone: session?.user?.phone || '',
          email: session?.user?.email || '',
        }))
        setSelectedAddressId(null)
      } else {
        setError(result.error || 'Failed to save address')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving address:', error)
      }
      setError('An error occurred while saving address')
    } finally {
      setSavingAddress(false)
    }
  }

  // Address delete handler - kept for future multi-address feature
  const _handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await fetchSavedAddresses()

        // Clear form if deleted address was selected
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null)
        }
      } else {
        setError(result.error || 'Failed to delete address')
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting address:', error)
      }
      setError('An error occurred while deleting address')
    }
  }

  // Generic input change handler - kept for future form enhancements
  const _handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    // Check if an address is selected
    if (!selectedAddressId) {
      setError('Please select a billing address to continue')
      return false
    }

    // Check user count for per-user plans
    if (isPerUserPlan && (userCount === '' || userCount < 5)) {
      newErrors.userCount = 'Minimum 5 users required'
    }

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
    // Razorpay payment flow
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
          planType: isFinalSettlement ? 'final_settlement' : planType, // Use selected plan type from pricing page
          planPrice: selectedPlanPrice, // Send selected plan price
          paymentType: isFinalSettlement ? 'final_settlement' : (isRenewal ? 'renewal' : 'initial_payment'),
          userCount: isPerUserPlan ? (userCount || 1) : 1, // Send user count for per-user plans
          ...formData,
          // Send address fields separately for storage
          country: formData.country,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.postcode,
          gstNo: formData.gstNo,
          addressId: selectedAddressId, // Track which address this purchase is for
          // Coupon-based discount information
          discountPercentage: totalDiscountPercentage,
          discountAmount: totalDiscountAmount,
          originalAmount: fullBasePrice,
          couponCode: appliedCoupon?.code || null,
          couponDiscountPercentage: appliedCoupon?.discountPercentage || 0,
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

      // Log response for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.info('Razorpay Order Response:', orderData)
      }

      if (!orderData.success && !orderData.orderId) {
        // Log full error details
        console.error('Razorpay Order Creation Failed:', {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          response: orderData
        })

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
        name: 'Power CA',
        description: productName,
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
              paymentType: isFinalSettlement ? 'final_settlement' : (isRenewal ? 'renewal' : 'initial_payment'),
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
                name: productName,
                amount: total,
                quantity: quantity,
                gstAmount: gstAmount,
              }
            })
          })

          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json()
            if (verifyData.success) {
              router.push(`/payment-success?orderId=${verifyData.data?.orderId}&invoiceId=${verifyData.data?.invoiceNumber}&planType=${verifyData.data?.planType || planType}&userCount=${verifyData.data?.userCount || quantity}`)
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
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code')
      return
    }

    setCouponLoading(true)
    setCouponError('')

    try {
      const response = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim() })
      })

      if (!response.ok) {
        setCouponError('Failed to validate coupon code')
        return
      }

      const result = await response.json()

      if (result.success && result.coupon) {
        setAppliedCoupon(result.coupon)
        setCouponCode('') // Clear input after successful application
        setCouponError('')
      } else {
        setCouponError(result.error || 'Invalid coupon code')
        setAppliedCoupon(null)
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error applying coupon:', error)
      }
      setCouponError('Failed to validate coupon code')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }

  const handleUserCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue === '') {
      setUserCount('')
    } else {
      const value = parseInt(inputValue, 10)
      if (!isNaN(value) && value >= 1) {
        setUserCount(value)
      }
    }
  }

  // Show loading screen while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
        <p className="text-gray-600 text-lg">Checking authentication...</p>
      </div>
    )
  }

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
        /* Hide number input arrows/spinners */
        .checkout-page input[type="number"]::-webkit-outer-spin-button,
        .checkout-page input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .checkout-page input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-[#F8FBFC] py-4 sm:py-8 lg:py-12 checkout-page">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-[1400px]">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column - Billing Details */}
            <div className="space-y-4 sm:space-y-6 h-full">
              {/* Billing Details Form - Read Only from Selected Address */}
              {loadingAddresses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
                  <span className="text-gray-600">Loading billing details...</span>
                </div>
              ) : savedAddresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No billing address found</p>
                  <Button
                    onClick={() => router.push('/account?tab=billing')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Billing Address
                  </Button>
                </div>
              ) : selectedAddressId ? (
                <div className="h-full">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Billing Details</h2>
                    {savedAddresses.find(a => a.id === selectedAddressId)?.label && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                        <MapPin className="w-3 h-3 mr-1" />
                        {savedAddresses.find(a => a.id === selectedAddressId)?.label}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {/* Full Name & Firm Name */}
                    <div className={`grid grid-cols-1 ${(session?.user?.role as string) !== 'student' ? 'sm:grid-cols-2' : ''} gap-2.5`}>
                      <div>
                        <Label className="text-[15px] font-medium text-gray-700">Full Name</Label>
                        <Input
                          value={formData.firstName}
                          disabled
                          className="mt-1 text-sm sm:text-base bg-gray-50 border-gray-200 !h-11"
                        />
                      </div>
                      {(session?.user?.role as string) !== 'student' && (
                        <div>
                          <Label className="text-[15px] font-medium text-gray-700">Firm Name</Label>
                          <Input
                            value={formData.firmName}
                            disabled
                            className="mt-1 text-sm sm:text-base bg-gray-50 border-gray-200 !h-11"
                          />
                        </div>
                      )}
                    </div>

                    {/* GST No */}
                    <div>
                      <Label className="text-[15px] font-medium text-gray-700">GST No</Label>
                      <Input
                        value={formData.gstNo || 'Not provided'}
                        disabled
                        className="mt-1 text-sm sm:text-base bg-gray-50 border-gray-200 !h-11"
                      />
                    </div>

                    {/* Street Address */}
                    <div>
                      <Label className="text-[15px] font-medium text-gray-700">Street Address</Label>
                      <Input
                        value={formData.address}
                        disabled
                        className="mt-1 text-sm sm:text-base bg-gray-50 border-gray-200 !h-11"
                      />
                    </div>

                    {/* Town / City */}
                    <div>
                      <Label className="text-[15px] font-medium text-gray-700">Town / City</Label>
                      <Input
                        value={formData.city}
                        disabled
                        className="mt-1 text-sm sm:text-base bg-gray-50 border-gray-200 !h-11"
                      />
                    </div>

                    {/* Postcode / ZIP */}
                    <div>
                      <Label className="text-[15px] font-medium text-gray-700">Postcode / ZIP</Label>
                      <Input
                        value={formData.postcode}
                        disabled
                        className="mt-1 text-sm sm:text-base bg-gray-50 border-gray-200 !h-11"
                      />
                    </div>

                    {/* Country */}
                    <div>
                      <Label className="text-[15px] font-medium text-gray-700">Country</Label>
                      <Input
                        value={formData.country}
                        disabled
                        className="mt-1 text-sm sm:text-base bg-gray-50 border-gray-200 !h-11"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <Label className="text-[15px] font-medium text-gray-700">State</Label>
                      <Input
                        value={formData.state}
                        disabled
                        className="mt-1 text-sm sm:text-base bg-gray-50 border-gray-200 !h-11"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label className="text-[15px] font-medium text-gray-700">Phone</Label>
                      <Input
                        value={formData.phone}
                        disabled
                        className="mt-1 text-sm sm:text-base bg-gray-50 border-gray-200 !h-11"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <Label className="text-[15px] font-medium text-gray-700">Email</Label>
                      <Input
                        value={formData.email}
                        disabled
                        className="mt-1 text-sm sm:text-base bg-gray-50 border-gray-200 !h-11"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Has addresses but none selected
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Please select a billing address to continue</p>
                  <Button
                    onClick={() => router.push('/account?tab=billing')}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Select Billing Address
                  </Button>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-4 sm:space-y-6">
              {/* Apply Coupon */}
              {!isFinalSettlement && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-purple-600" />
                    Apply Coupon
                  </h3>

                  {appliedCoupon ? (
                    // Show applied coupon
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-700">{appliedCoupon.code}</p>
                            <p className="text-xs text-green-600">{appliedCoupon.discountPercentage}% discount applied</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Show coupon input
                    <>
                      <div className="flex gap-2">
                        <Input
                          placeholder=""
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value)
                            setCouponError('')
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleApplyCoupon()
                            }
                          }}
                          className={`flex-1 ${couponError ? 'border-red-300' : ''}`}
                          disabled={couponLoading}
                        />
                        <Button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6"
                        >
                          {couponLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </Button>
                      </div>
                      {couponError && (
                        <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {couponError}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Have a coupon code? Enter it above to get a discount.
                      </p>
                    </>
                  )}
                </div>
              )}

              {/* Purchase Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Subscription Plan</h3>

                {/* Product Info */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600 shadow-md flex-shrink-0">
                    <Image
                      src="/images/power-ca-logo-footer.png"
                      alt="Power CA"
                      width={80}
                      height={80}
                      className="object-contain filter brightness-0 invert p-2"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900">
                      {isFinalSettlement ? 'Power CA Final Settlement' : 'Power CA Software'}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">{productDescription}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-lg font-bold text-purple-600">₹{fullBasePrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* User Count Input - Only for Monthly/Annual Plans */}
                {isPerUserPlan && (
                  <div className={`mb-4 p-3 rounded-lg border ${errors.userCount ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Label htmlFor="userCount" className={`text-sm font-medium ${errors.userCount ? 'text-red-700' : 'text-blue-900'}`}>
                          Number of Users <span className="text-red-500">*</span>
                        </Label>
                        <p className={`text-xs mt-0.5 ${errors.userCount ? 'text-red-500' : 'text-blue-700'}`}>Minimum 5 users</p>
                      </div>
                      <Input
                        id="userCount"
                        type="number"
                        min="1"
                        value={userCount}
                        onChange={handleUserCountChange}
                        onWheel={(e) => e.currentTarget.blur()}
                        className={`w-24 text-center text-lg font-bold border-2 bg-white ${errors.userCount ? 'border-red-400' : 'border-blue-300'}`}
                        required
                      />
                    </div>
                    {userCount !== '' && userCount >= 1 && userCount < 5 && (
                      <p className="text-amber-600 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Please add minimum 5 users
                      </p>
                    )}
                    {errors.userCount && (
                      <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.userCount}
                      </p>
                    )}
                  </div>
                )}

                <div className="border-t-2 border-gray-200 pt-3 sm:pt-4 space-y-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {/* Show final settlement info */}
                  {isFinalSettlement && (
                    <div className="flex justify-between items-center text-xs sm:text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
                      <span className="font-medium">Final Settlement Payment</span>
                      <span className="font-semibold text-right min-w-[100px]">2nd of 2 payments</span>
                    </div>
                  )}
                  {/* Show original total and coupon discount when coupon applied */}
                  {!isFinalSettlement && appliedCoupon ? (
                    <>
                      <div className="flex justify-between items-center text-xs sm:text-sm text-gray-700">
                        <span>License Amount</span>
                        <span className="font-semibold text-right min-w-[100px]">₹{(fullBasePrice * quantity).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                        <span className="font-medium flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          Coupon: {appliedCoupon.code} ({appliedCoupon.discountPercentage}%)
                        </span>
                        <span className="font-semibold text-right min-w-[100px]">-₹{totalDiscountDisplay.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm text-gray-700">
                        <span>Subtotal</span>
                        <span className="font-semibold text-right min-w-[100px]">₹{subtotal.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center text-xs sm:text-sm text-gray-700">
                      <span>Subtotal</span>
                      <span className="font-semibold text-right min-w-[100px]">₹{subtotal.toLocaleString()}</span>
                    </div>
                  )}
                  {implementationCharge > 0 && (
                    <>
                      <div className="flex justify-between items-center text-xs sm:text-sm text-gray-700">
                        <span>Server Installation & Configuration</span>
                        <span className="font-semibold text-right min-w-[100px]">₹{implementationCharge.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-gray-800 border-t border-gray-200 pt-2 mt-2">
                        <span>Total</span>
                        <span className="text-right min-w-[100px]">₹{subtotalWithImplementation.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                  <div className={`flex justify-between items-center text-xs sm:text-sm text-gray-700 ${implementationCharge > 0 ? '' : 'border-t border-gray-200 pt-2 mt-2'}`}>
                    <span>GST (18%)</span>
                    <span className="font-semibold text-right min-w-[100px]">₹{gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-base sm:text-lg font-bold border-t-2 border-gray-300 pt-2 mt-2 text-purple-700">
                    <span>Grand Total</span>
                    <span className="text-right min-w-[100px]">₹{total.toLocaleString()}</span>
                  </div>
                  {/* Show selected address info */}
                  {selectedAddressId && savedAddresses.length > 0 && (
                    <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-700 font-medium">
                        Subscription for: {savedAddresses.find(a => a.id === selectedAddressId)?.label || savedAddresses.find(a => a.id === selectedAddressId)?.city || 'Selected Address'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                  Payment Gateway
                </h3>

                {/* Payment Gateway */}
                <div className="max-w-md">
                  {/* Razorpay Option */}
                  <div className="border-2 rounded-lg p-4 border-purple-500 bg-purple-50">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="razorpay"
                        name="payment"
                        checked={true}
                        readOnly
                        className="w-4 h-4 text-purple-600 flex-shrink-0"
                      />
                      <Label htmlFor="razorpay" className="flex-1">
                        <div className="flex items-center justify-center h-8">
                          <Image
                            src="https://razorpay.com/assets/razorpay-logo.svg"
                            alt="Razorpay"
                            width={100}
                            height={32}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {errors.paymentGateway && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.paymentGateway}
                  </p>
                )}
              </div>

              {/* Terms and Conditions Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  className={`mt-0.5 flex-shrink-0 ${errors.terms ? 'border-red-500' : 'border-gray-300'}`}
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor="terms" className="text-xs sm:text-sm cursor-pointer leading-relaxed text-gray-700 block">
                    I have read and agree to the website{' '}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors">
                      terms and conditions
                    </Link> and <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors">
                      privacy policy
                    </Link>.
                    <span className="text-red-500 font-bold"> *</span>
                  </Label>
                  {errors.terms && (
                    <p className="text-red-600 text-[10px] sm:text-xs mt-2 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.terms}
                    </p>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-xl p-3 sm:p-4 flex items-start shadow-sm">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-red-800 text-xs sm:text-sm leading-relaxed">{error}</span>
                </div>
              )}

              {/* Place Order Button */}
              <Button
                onClick={handlePayment}
                disabled={loading || !agreeToTerms}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 sm:py-6 text-base sm:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-xs sm:text-sm text-gray-700 font-medium flex items-center justify-center gap-2">
                  <span className="text-green-600 text-base">🔒</span>
                  Secure payment powered by Razorpay
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CheckoutPage() {
  return (
    <PageErrorBoundary>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </PageErrorBoundary>
  )
}
