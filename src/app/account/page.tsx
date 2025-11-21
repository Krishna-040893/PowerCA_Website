'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  ShoppingBag,
  Trash2,
  LogOut,
  AlertCircle,
  Download,
  Package,
  Settings,
  Loader2,
  FileText,
  Calendar,
  IndianRupee,
  Save,
  Plus,
  Pencil,
  ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import ProfilePhotoUpload from '@/components/profile-photo-upload'

interface BillingAddress {
  name: string
  email: string
  phone?: string
  firmName?: string
  company?: string
  address?: string
  gstNumber?: string
}

interface OrderHistory {
  invoiceNumber: string
  orderId: string
  paymentId: string
  amount: number
  gst: number
  total: number
  status: string
  issuedAt: string
  paidAt: string
  location: string
}

interface UserData {
  billingAddress: BillingAddress | null
  orderHistory: OrderHistory[]
  totalOrders: number
}

interface ReferralInfo {
  customerId: string
  referralCode: string
  affiliateId: string
  status: string
  createdAt: string
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

// Indian states list
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
]

function AccountPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isDeleting, setIsDeleting] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL param for initial tab
    const tabParam = searchParams.get('tab')
    return tabParam && ['profile', 'billing', 'orders'].includes(tabParam)
      ? tabParam
      : 'profile'
  })
  const [currentProfilePhotoUrl, setCurrentProfilePhotoUrl] = useState<string | null>(null)
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [purchasedAddressIds, setPurchasedAddressIds] = useState<string[]>([])
  const [selectedLocationTab, setSelectedLocationTab] = useState<string>('')
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])

  // Handle tab change - update both state and URL
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Update URL without full page reload
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', value)
    router.replace(`/account?${params.toString()}`, { scroll: false })
  }

  // Billing form state
  const [isSavingBilling, setIsSavingBilling] = useState(false)
  const [billingForm, setBillingForm] = useState({
    firmName: '',
    gstNo: '',
    address: '',
    city: '',
    country: 'India',
    state: '',
    postcode: '',
    location: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserData()
      fetchProfilePhoto()
      fetchReferralInfo()
      fetchSavedAddresses()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email])

  const fetchSavedAddresses = async () => {
    setLoadingAddresses(true)
    try {
      const response = await fetch('/api/user/addresses')
      const result = await response.json()

      if (result.success && result.addresses) {
        setSavedAddresses(result.addresses)
        // Show form automatically if no addresses exist
        if (result.addresses.length === 0) {
          setShowAddressForm(true)
        }
      }

      // Fetch purchased address IDs
      const purchasedResponse = await fetch('/api/user/purchased-addresses')
      const purchasedResult = await purchasedResponse.json()
      if (purchasedResult.success && purchasedResult.purchasedAddressIds) {
        setPurchasedAddressIds(purchasedResult.purchasedAddressIds)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setLoadingAddresses(false)
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      const response = await fetch(`/api/user/addresses/${addressId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Address deleted successfully')
        await fetchSavedAddresses()
      } else {
        toast.error(result.error || 'Failed to delete address')
      }
    } catch (error) {
      console.error('Error deleting address:', error)
      toast.error('An error occurred while deleting address')
    }
  }

  const handleEditAddress = (address: SavedAddress) => {
    // Load address data into form
    setBillingForm({
      firmName: address.firm_name,
      gstNo: address.gst_no || '',
      address: address.address,
      city: address.city,
      country: address.country,
      state: address.state,
      postcode: address.postcode,
      location: address.label || ''
    })
    setEditingAddressId(address.id)
    setShowAddressForm(true)
  }

  const fetchProfilePhoto = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch('/api/user/profile-photo')
      if (response.ok) {
        const data = await response.json()
        setCurrentProfilePhotoUrl(data.photoUrl)
      }
    } catch (error) {
      console.error('Error fetching profile photo:', error)
    }
  }

  const fetchUserData = async () => {
    try {
      setIsLoadingData(true)
      const response = await fetch('/api/user/data')
      const result = await response.json()

      if (result.success) {
        setUserData(result.data)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const fetchReferralInfo = async () => {
    try {
      const response = await fetch('/api/user/referral-info')
      const result = await response.json()

      if (result.hasReferral) {
        setReferralInfo(result.referralInfo)
      }
    } catch (error) {
      console.error('Error fetching referral info:', error)
    }
  }

  const handleProfilePhotoUpdate = (newUrl: string) => {
    setCurrentProfilePhotoUrl(newUrl)
  }

  const handleProfilePhotoDelete = () => {
    setCurrentProfilePhotoUrl(null)
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        await signOut({ callbackUrl: '/' })
      } else {
        throw new Error(result.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Failed to delete account. Please try again or contact support.')
      setIsDeleting(false)
    }
  }

  const handleBillingFormChange = (field: string, value: string) => {
    setBillingForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveBillingAddress = async () => {
    // Validate required fields
    if (!billingForm.firmName || !billingForm.address || !billingForm.city || !billingForm.country || !billingForm.state || !billingForm.postcode || !billingForm.location) {
      toast.error('Please fill all required fields')
      return
    }

    setIsSavingBilling(true)
    try {
      const isEditing = !!editingAddressId
      const url = isEditing
        ? `/api/user/addresses/${editingAddressId}`
        : '/api/user/addresses'

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: session?.user?.name || '',
          firm_name: billingForm.firmName,
          gst_no: billingForm.gstNo || null,
          address: billingForm.address,
          city: billingForm.city,
          state: billingForm.state,
          postcode: billingForm.postcode,
          country: billingForm.country,
          phone: session?.user?.phone || '',
          email: session?.user?.email || '',
          is_default: false,
          label: billingForm.location
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(isEditing ? 'Address updated successfully!' : 'Billing address saved successfully!')

        // For new addresses, redirect to checkout with the new address ID
        if (!isEditing && result.address?.id) {
          router.push(`/checkout?addressId=${result.address.id}`)
          return
        }

        // For edits, stay on the page
        // Fetch updated addresses list
        await fetchSavedAddresses()

        // Reset form
        setBillingForm({
          firmName: '',
          gstNo: '',
          address: '',
          city: '',
          country: 'India',
          state: '',
          postcode: '',
          location: ''
        })

        // Hide form and select the address tab
        setShowAddressForm(false)
        setEditingAddressId(null)
        setSelectedLocationTab(result.address?.id || editingAddressId || '')
      } else {
        toast.error(result.error || 'Failed to save billing address')
      }
    } catch (error) {
      console.error('Error saving billing address:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSavingBilling(false)
    }
  }

  const handleDownloadInvoice = async (invoiceNumber: string) => {
    try {
      const response = await fetch(`/api/invoice/download/${invoiceNumber}`)

      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PowerCA-Invoice-${invoiceNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download invoice:', error)
      alert('Failed to download invoice. Please try again or contact support.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 lg:space-x-6 w-full sm:w-auto">
              {/* Profile Photo Display with Edit Button */}
              <div className="flex-shrink-0 mb-3 sm:mb-0">
                <ProfilePhotoUpload
                  currentPhotoUrl={currentProfilePhotoUrl}
                  onPhotoUpdate={handleProfilePhotoUpdate}
                  onPhotoDelete={handleProfilePhotoDelete}
                  size="md"
                  editable={true}
                />
              </div>

              <div className="flex flex-col justify-center text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  {session.user?.name || 'Welcome'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{session.user?.email}</span>
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="default"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className={`container mx-auto px-4 sm:px-6 lg:px-8 py-8 ${showAddressForm ? 'max-w-[1400px]' : 'max-w-6xl'}`}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          {/* Individual Spaced Tabs */}
          <TabsList className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start bg-transparent h-auto p-0 w-full">
            <TabsTrigger
              value="profile"
              className="flex-1 min-w-[140px] sm:flex-none lg:flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-sm transition-all duration-200 text-sm sm:text-base"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="flex-1 min-w-[140px] sm:flex-none lg:flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-sm transition-all duration-200 text-sm sm:text-base"
            >
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Billing Address</span>
              <span className="sm:hidden">Billing</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex-1 min-w-[140px] sm:flex-none lg:flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-sm transition-all duration-200 text-sm sm:text-base"
            >
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Order History</span>
              <span className="sm:hidden">Orders</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Affiliate Referral Info Banner - Only show if pending */}
            {referralInfo && referralInfo.status === 'pending' && (
              <Card className="shadow-lg border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-blue-700">
                    <Package className="h-5 w-5" />
                    Affiliate Referral Information
                  </CardTitle>
                  <CardDescription className="text-sm">
                    You were referred by an affiliate partner. Complete your payment to activate your account!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 mb-1">Customer ID</p>
                      <p className="text-lg font-bold text-blue-700">{referralInfo.customerId}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-xs text-gray-500 mb-1">Referral Code</p>
                      <p className="text-lg font-bold text-blue-700">{referralInfo.referralCode}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>This information will be hidden once your payment is completed</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-blue-600/15 border-b py-4 sm:py-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Account Information
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your personal details and account information</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-gray-700">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                      <Input
                        id="name"
                        value={session.user?.name || 'Not provided'}
                        disabled
                        className="pl-8 sm:pl-10 bg-gray-50 border-gray-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                      <Input
                        id="email"
                        value={session.user?.email || 'Not provided'}
                        disabled
                        className="pl-8 sm:pl-10 bg-gray-50 border-gray-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs sm:text-sm font-medium text-gray-700">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                      <Input
                        id="phone"
                        value={session.user?.phone || userData?.billingAddress?.phone || 'Not provided'}
                        disabled
                        className="pl-8 sm:pl-10 bg-gray-50 border-gray-200 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-xs sm:text-sm font-medium text-gray-700">Account Type</Label>
                    <div className="relative">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs sm:text-sm">
                        {session.user?.role ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1) : 'User'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Account Status</p>
                      <p className="text-xs sm:text-sm text-gray-500">Your account is active and in good standing</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Address Tab */}
          <TabsContent value="billing" className="mt-6">
            <style jsx global>{`
              .billing-form input::placeholder,
              .billing-form textarea::placeholder {
                color: #666D80 !important;
                opacity: 1;
              }
            `}</style>

            <div className={`grid gap-6 ${showAddressForm ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Left Column - Saved Addresses */}
              <Card className="shadow-lg border-0 h-fit">
                <CardHeader className="bg-blue-600/15 border-b py-4 sm:py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        Saved Billing Addresses
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Your saved billing addresses for purchases</CardDescription>
                    </div>
                    <Button
                      onClick={() => {
                        setShowAddressForm(true)
                        setEditingAddressId(null)
                        setBillingForm({
                          firmName: '',
                          gstNo: '',
                          address: '',
                          city: '',
                          country: 'India',
                          state: '',
                          postcode: '',
                          location: ''
                        })
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add new billing address
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                  {loadingAddresses ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-600">Loading addresses...</span>
                    </div>
                  ) : savedAddresses.length > 0 ? (
                    <div className="space-y-4">
                      {/* Location Tabs - One tab per unique location */}
                      {(() => {
                        // Get unique locations
                        const uniqueLocations = [...new Set(savedAddresses.map(addr => addr.label || addr.city))]
                        const currentLocation = selectedLocationTab || uniqueLocations[0]

                        return (
                          <>
                            <div className="flex gap-2 pb-4 border-b border-gray-200 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                              {uniqueLocations.map((location) => {
                                const isSelected = currentLocation === location
                                const addressCount = savedAddresses.filter(a => (a.label || a.city) === location).length
                                return (
                                  <button
                                    key={location}
                                    onClick={() => setSelectedLocationTab(location)}
                                    className={`px-4 py-2 rounded-lg text-base font-medium transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
                                      isSelected
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    <MapPin className="w-4 h-4" />
                                    {location}
                                    {addressCount > 1 && (
                                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                        {addressCount}
                                      </span>
                                    )}
                                  </button>
                                )
                              })}
                            </div>

                            {/* Show Addresses for Selected Location */}
                            <div className="space-y-3">
                              {savedAddresses
                                .filter(address => (address.label || address.city) === currentLocation)
                                .map((address) => {
                                  const originalIndex = savedAddresses.findIndex(a => a.id === address.id)
                                  return (
                                    <div
                                      key={address.id}
                                      className="p-4 rounded-lg border border-gray-200 bg-white"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="flex-1">
                                              <p className="font-bold text-gray-900 text-base">{address.firm_name}</p>
                                              {address.gst_no && (
                                                <p className="font-bold text-sm text-gray-700">GST: {address.gst_no}</p>
                                              )}
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-blue-500 text-white">
                                              <MapPin className="w-3 h-3 mr-1" />
                                              {address.label || address.city}
                                            </span>
                                          </div>
                                          <div className="text-sm text-gray-600 space-y-1">
                                            <p>{address.address}</p>
                                            <p>{address.city}, {address.state}, {address.country} - {address.postcode}</p>
                                            <p className="text-gray-500">{address.phone} • {address.email}</p>
                                          </div>
                                          {/* Purchase status */}
                                          {purchasedAddressIds.includes(address.id) ? (
                                            <div className="mt-3 p-3 rounded bg-green-100 border border-green-300">
                                              <p className="text-sm font-bold text-green-800 flex items-center gap-1">
                                                <span>✓</span> Ordered
                                              </p>
                                            </div>
                                          ) : (
                                            <div className="mt-3 p-3 rounded bg-blue-50 border border-blue-200">
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-red-500 flex items-center gap-1">
                                                  <span>○</span> Not Ordered
                                                </span>
                                                {originalIndex > 0 && (
                                                  <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
                                                    {originalIndex}% Off
                                                  </span>
                                                )}
                                              </div>
                                              <button
                                                onClick={() => router.push(`/checkout?addressId=${address.id}`)}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
                                              >
                                                Proceed to Order
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                        {!purchasedAddressIds.includes(address.id) && (
                                          <button
                                            type="button"
                                            onClick={() => handleEditAddress(address)}
                                            className="text-blue-500 hover:text-blue-700 p-1.5"
                                            title="Edit address"
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-base text-gray-500 mb-3">No addresses saved yet</p>
                      <p className="text-sm text-gray-400">Add your first billing address to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right Column - Add/Edit Form */}
              {(showAddressForm || savedAddresses.length === 0) && (
              <Card className="shadow-lg border-0 billing-form h-fit">
                <CardHeader className="bg-blue-600/15 border-b py-3 sm:py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      {editingAddressId ? (
                        <Pencil className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Plus className="h-4 w-4 text-blue-600" />
                      )}
                      {editingAddressId ? 'Edit Address' : 'New Address'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {editingAddressId
                        ? 'Update address details'
                        : 'Enter billing information'
                      }
                    </CardDescription>
                  </div>
                  {savedAddresses.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddressForm(false)
                        setEditingAddressId(null)
                        setBillingForm({
                          firmName: '',
                          gstNo: '',
                          address: '',
                          city: '',
                          country: 'India',
                          state: '',
                          postcode: '',
                          location: ''
                        })
                      }}
                      className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-purple-600" />
                    <span className="ml-3 text-sm sm:text-base text-gray-600">Loading billing information...</span>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      {/* Firm Name */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Firm Name <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                          <Input
                            value={billingForm.firmName}
                            onChange={(e) => handleBillingFormChange('firmName', e.target.value)}
                            placeholder="Enter your firm"
                            className="pl-8 sm:pl-10 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      {/* GST No */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          GST No <span className="text-gray-400 text-xs">(Optional)</span>
                        </Label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                          <Input
                            value={billingForm.gstNo}
                            onChange={(e) => handleBillingFormChange('gstNo', e.target.value)}
                            placeholder="GST No"
                            className="pl-8 sm:pl-10 text-sm sm:text-base font-mono uppercase"
                            maxLength={15}
                          />
                        </div>
                      </div>

                        {/* Location (Purchase Place) */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Location <span className="text-red-500">*</span>
                          <span className="text-gray-400 text-xs ml-1">(Place of purchase)</span>
                        </Label>
                        <Input
                          value={billingForm.location}
                          onChange={(e) => handleBillingFormChange('location', e.target.value)}
                          placeholder="Enter Location"
                          className="text-sm sm:text-base"
                        />
                      </div>

                      {/* Street Address */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Street Address <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                          <Input
                            value={billingForm.address}
                            onChange={(e) => handleBillingFormChange('address', e.target.value)}
                            placeholder="Enter your street address"
                            className="pl-8 sm:pl-10 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      {/* Town/City */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Town/City <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={billingForm.city}
                          onChange={(e) => handleBillingFormChange('city', e.target.value)}
                          placeholder="Enter your town/city"
                          className="text-sm sm:text-base"
                        />
                      </div>

                      {/* Postcode/Zip */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Postcode/Zip <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={billingForm.postcode}
                          onChange={(e) => handleBillingFormChange('postcode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="Enter postcode"
                          className="text-sm sm:text-base"
                          maxLength={6}
                        />
                      </div>

                      {/* Country */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Country <span className="text-red-500">*</span>
                        </Label>
                        <select
                          value={billingForm.country}
                          onChange={(e) => handleBillingFormChange('country', e.target.value)}
                          className="w-full h-10 px-3 py-2 border rounded-md text-sm sm:text-base border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          <option value="India">India</option>
                          <option value="United States">United States</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="United Arab Emirates">United Arab Emirates</option>
                          <option value="France">France</option>
                          <option value="China">China</option>
                          <option value="Japan">Japan</option>
                          <option value="Brazil">Brazil</option>
                          <option value="Mexico">Mexico</option>
                          <option value="Spain">Spain</option>
                          <option value="Italy">Italy</option>
                        </select>
                      </div>

                      {/* State */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          State <span className="text-red-500">*</span>
                        </Label>
                        <select
                          value={billingForm.state}
                          onChange={(e) => handleBillingFormChange('state', e.target.value)}
                          className="w-full h-10 px-3 py-2 border rounded-md text-sm sm:text-base border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select State</option>
                          {indianStates.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end pt-4 border-t">
                      <Button
                        onClick={handleSaveBillingAddress}
                        disabled={isSavingBilling}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                      >
                        {isSavingBilling ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {editingAddressId ? 'Update' : 'Save'}
                          </>
                        )}
                      </Button>
                    </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              )}
            </div>
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="orders" className="space-y-6 mt-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-blue-600/15 border-b py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      Order History
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">View and download your invoices</CardDescription>
                  </div>
                  {userData && userData.totalOrders > 0 && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm">
                      {userData.totalOrders} {userData.totalOrders === 1 ? 'Order' : 'Orders'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                {isLoadingData ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-green-600" />
                    <span className="ml-3 text-sm sm:text-base text-gray-600">Loading order history...</span>
                  </div>
                ) : userData && userData.orderHistory.length > 0 ? (
                  <div className="space-y-2">
                    {userData.orderHistory.map((order) => {
                      const isExpanded = expandedOrders.includes(order.invoiceNumber)
                      return (
                        <div
                          key={order.invoiceNumber}
                          className="border border-gray-200 rounded-lg hover:shadow-sm transition-shadow bg-white overflow-hidden"
                        >
                          {/* Clickable header row */}
                          <div
                            className="flex items-center justify-between gap-3 p-4 cursor-pointer"
                            onClick={() => {
                              setExpandedOrders(prev =>
                                prev.includes(order.invoiceNumber)
                                  ? prev.filter(id => id !== order.invoiceNumber)
                                  : [...prev, order.invoiceNumber]
                              )
                            }}
                          >
                            {/* Left: Invoice info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-gray-900 text-base">Invoice: #{order.invoiceNumber}</p>
                                {order.location && (
                                  <span className="text-sm text-blue-600 flex items-center gap-0.5">
                                    <MapPin className="h-4 w-4" />
                                    {order.location}
                                  </span>
                                )}
                                <Badge
                                  className={`text-xs px-2 py-0.5 ${
                                    order.status === 'paid'
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  }`}
                                >
                                  {order.status === 'paid' ? '✓' : order.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <IndianRupee className="h-4 w-4" />
                                  <span className="font-semibold text-green-700">{formatCurrency(order.total).replace('₹', '')}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(order.paidAt)}
                                </span>
                              </div>
                            </div>

                            {/* Right: Expand icon */}
                            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>

                          {/* Expandable details */}
                          {isExpanded && (
                            <div className="px-4 pb-4 pt-0 border-t border-gray-100 bg-gray-50">
                              <div className="grid grid-cols-3 gap-4 py-3 text-sm">
                                <div>
                                  <p className="text-gray-500 mb-1">Amount</p>
                                  <p className="font-medium text-gray-900 flex items-center">
                                    <IndianRupee className="h-4 w-4" />
                                    {formatCurrency(order.amount).replace('₹', '')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">GST</p>
                                  <p className="font-medium text-gray-900 flex items-center">
                                    <IndianRupee className="h-4 w-4" />
                                    {formatCurrency(order.gst).replace('₹', '')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500 mb-1">Total</p>
                                  <p className="font-semibold text-green-700 flex items-center">
                                    <IndianRupee className="h-4 w-4" />
                                    {formatCurrency(order.total).replace('₹', '')}
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-gray-400 font-mono mb-3">Order ID: {order.orderId}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownloadInvoice(order.invoiceNumber)
                                }}
                                className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 text-sm py-2"
                              >
                                <Download className="h-4 w-4 mr-1.5" />
                                Download Invoice
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <ShoppingBag className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm sm:text-base text-gray-600 mb-2">No orders yet</p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-4">Your purchase history will appear here</p>
                    <Button asChild variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 text-sm">
                      <Link href="/pricing">Browse Pricing</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading account...</p>
        </div>
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  )
}
