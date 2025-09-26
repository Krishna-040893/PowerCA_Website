import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { PAYMENT_CONFIG } from '@/lib/payment-config'
import { loadScript } from '@/lib/utils'
import { RazorpayPaymentResponse, CustomerDetails } from '@/types/common'

export const usePricing = () => {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showTestConfirmDialog, setShowTestConfirmDialog] = useState(false)
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    company: '',
    gst: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  useEffect(() => {
    // Check for affiliate code in URL or session
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('ref') || urlParams.get('affiliate')
    if (code) {
      setAffiliateCode(code)
      sessionStorage.setItem('affiliateCode', code)
      checkAffiliateCanRefer(code)
    } else {
      // Check session storage
      const storedCode = sessionStorage.getItem('affiliateCode')
      if (storedCode) {
        setAffiliateCode(storedCode)
        checkAffiliateCanRefer(storedCode)
      }
    }
  }, [])

  const checkAffiliateCanRefer = async (code: string) => {
    try {
      const response = await fetch(`/api/affiliate/check-referral-limit?code=${code}`)
      if (response.ok) {
        const data = await response.json()
        if (!data.canRefer) {
          toast.warning('This affiliate has already completed their one allowed referral.')
          setAffiliateCode(null)
          sessionStorage.removeItem('affiliateCode')
        }
      }
    } catch {
      // Handle error silently, user can still proceed
    }
  }

  const handleBookNow = () => {
    setShowDetailsDialog(true)
    if (session?.user) {
      setCustomerDetails(prev => ({
        ...prev,
        name: session.user?.name || '',
        email: session.user?.email || ''
      }))
    }
  }

  const createOrder = async (amount: number) => {
    const orderResponse = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        customerDetails,
        affiliateCode
      })
    })

    if (!orderResponse.ok) {
      throw new Error('Failed to create order')
    }

    return await orderResponse.json()
  }

  const verifyPayment = async (paymentData: RazorpayPaymentResponse, orderId: string) => {
    const verifyResponse = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...paymentData,
        orderId,
        customerDetails,
        affiliateCode
      })
    })

    if (!verifyResponse.ok) {
      throw new Error('Payment verification failed')
    }

    return await verifyResponse.json()
  }

  const handlePayment = async () => {
    if (!customerDetails.email || !customerDetails.name || !customerDetails.phone) {
      toast.error('Please fill in all required details')
      return
    }

    setLoading(true)
    setShowDetailsDialog(false)

    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
      if (!res) {
        toast.error('Razorpay SDK failed to load')
        return
      }

      const orderData = await createOrder(PAYMENT_CONFIG.TEST_AMOUNT)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'PowerCA',
        description: 'PowerCA Annual Subscription',
        order_id: orderData.id,
        handler: async function (response: RazorpayPaymentResponse) {
          try {
            const verifyData = await verifyPayment(response, orderData.id)
            if (verifyData.success) {
              toast.success('Payment successful!')
              window.location.href = `/payment-success?payment_id=${response.razorpay_payment_id}`
            } else {
              toast.error('Payment verification failed')
            }
          } catch {
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone
        },
        theme: { color: '#4F46E5' }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

      razorpay.on('payment.failed', function (response: unknown) {
        toast.error('Payment failed. Please try again.')
        console.error('Payment failed:', response)
      })
    } catch (error) {
      toast.error('Failed to process payment')
      console.error('Payment error:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    affiliateCode,
    showDetailsDialog,
    showTestConfirmDialog,
    customerDetails,
    setShowDetailsDialog,
    setShowTestConfirmDialog,
    setCustomerDetails,
    handleBookNow,
    handlePayment,
    session
  }
}