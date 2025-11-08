'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  Edit2,
  Save,
  X
} from 'lucide-react'
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

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditingBilling, setIsEditingBilling] = useState(false)
  const [editedBilling, setEditedBilling] = useState<BillingAddress | null>(null)
  const [isSavingBilling, setIsSavingBilling] = useState(false)
  const [currentProfilePhotoUrl, setCurrentProfilePhotoUrl] = useState<string | null>(null)
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)

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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email])

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

  const handleEditBilling = () => {
    setEditedBilling(userData?.billingAddress || null)
    setIsEditingBilling(true)
  }

  const handleCancelEdit = () => {
    setIsEditingBilling(false)
    setEditedBilling(null)
  }

  const handleSaveBilling = async () => {
    if (!editedBilling) return

    setIsSavingBilling(true)
    try {
      // Call API to update billing information
      const response = await fetch('/api/user/billing', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedBilling),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save billing information')
      }

      // Update local state with saved data
      if (userData) {
        setUserData({
          ...userData,
          billingAddress: editedBilling
        })
      }

      setIsEditingBilling(false)
      setEditedBilling(null)

      // Show success message
      alert('Billing information saved successfully!')
    } catch (error) {
      console.error('Error saving billing info:', error)
      alert(error instanceof Error ? error.message : 'Failed to save billing information. Please try again.')
    } finally {
      setIsSavingBilling(false)
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
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
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
            <TabsTrigger
              value="settings"
              className="flex-1 min-w-[140px] sm:flex-none lg:flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-sm transition-all duration-200 text-sm sm:text-base"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
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
          <TabsContent value="billing" className="space-y-6 mt-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-blue-600/15 border-b py-4 sm:py-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      Billing Address
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Your billing and company information</CardDescription>
                  </div>
                  {!isEditingBilling && userData?.billingAddress && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditBilling}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 w-full sm:w-auto text-sm"
                    >
                      <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Edit
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
                ) : userData?.billingAddress ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                          <Input
                            value={isEditingBilling ? editedBilling?.name || '' : userData.billingAddress.name || 'N/A'}
                            onChange={(e) => setEditedBilling(prev => prev ? { ...prev, name: e.target.value } : null)}
                            disabled={!isEditingBilling}
                            className={`pl-8 sm:pl-10 text-sm ${isEditingBilling ? 'bg-white border-purple-300' : 'bg-gray-50 border-gray-200'}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                          <Input
                            value={isEditingBilling ? editedBilling?.email || '' : userData.billingAddress.email || 'N/A'}
                            onChange={(e) => setEditedBilling(prev => prev ? { ...prev, email: e.target.value } : null)}
                            disabled={!isEditingBilling}
                            className={`pl-8 sm:pl-10 text-sm ${isEditingBilling ? 'bg-white border-purple-300' : 'bg-gray-50 border-gray-200'}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                          <Input
                            value={isEditingBilling ? editedBilling?.phone || '' : userData.billingAddress.phone || 'N/A'}
                            onChange={(e) => setEditedBilling(prev => prev ? { ...prev, phone: e.target.value } : null)}
                            disabled={!isEditingBilling}
                            className={`pl-8 sm:pl-10 text-sm ${isEditingBilling ? 'bg-white border-purple-300' : 'bg-gray-50 border-gray-200'}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs sm:text-sm font-medium text-gray-700">Firm/Company Name</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                          <Input
                            value={isEditingBilling ? editedBilling?.firmName || editedBilling?.company || '' : userData.billingAddress.firmName || userData.billingAddress.company || 'N/A'}
                            onChange={(e) => setEditedBilling(prev => prev ? { ...prev, firmName: e.target.value } : null)}
                            disabled={!isEditingBilling}
                            className={`pl-8 sm:pl-10 text-sm ${isEditingBilling ? 'bg-white border-purple-300' : 'bg-gray-50 border-gray-200'}`}
                          />
                        </div>
                      </div>

                      {(userData.billingAddress.gstNumber || isEditingBilling) && (
                        <div className="space-y-2">
                          <Label className="text-xs sm:text-sm font-medium text-gray-700">GST Number</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                            <Input
                              value={isEditingBilling ? editedBilling?.gstNumber || '' : userData.billingAddress.gstNumber || ''}
                              onChange={(e) => setEditedBilling(prev => prev ? { ...prev, gstNumber: e.target.value } : null)}
                              disabled={!isEditingBilling}
                              className={`pl-8 sm:pl-10 font-mono text-xs sm:text-sm ${isEditingBilling ? 'bg-white border-purple-300' : 'bg-gray-50 border-gray-200'}`}
                            />
                          </div>
                        </div>
                      )}

                      {(userData.billingAddress.address || isEditingBilling) && (
                        <div className="space-y-2 md:col-span-2">
                          <Label className="text-xs sm:text-sm font-medium text-gray-700">Address</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
                            <textarea
                              value={isEditingBilling ? editedBilling?.address || '' : userData.billingAddress.address || ''}
                              onChange={(e) => setEditedBilling(prev => prev ? { ...prev, address: e.target.value } : null)}
                              disabled={!isEditingBilling}
                              rows={3}
                              className={`w-full pl-8 sm:pl-10 pr-3 py-2 border rounded-md text-xs sm:text-sm ${
                                isEditingBilling ? 'bg-white border-purple-300' : 'bg-gray-50 border-gray-200'
                              }`}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {isEditingBilling && (
                      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={isSavingBilling}
                          className="w-full sm:w-auto text-sm"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveBilling}
                          disabled={isSavingBilling}
                          className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto text-sm"
                        >
                          {isSavingBilling ? (
                            <>
                              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <MapPin className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm sm:text-base text-gray-600 mb-2">No billing address available</p>
                    <p className="text-xs sm:text-sm text-gray-500">Your billing information will appear here after your first purchase</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                  <div className="space-y-3 sm:space-y-4">
                    {userData.orderHistory.map((order) => (
                      <div
                        key={order.invoiceNumber}
                        className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex flex-col gap-3 sm:gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">Invoice #{order.invoiceNumber}</p>
                                </div>
                                <p className="text-[10px] sm:text-xs text-gray-500 font-mono truncate">Order ID: {order.orderId}</p>
                              </div>
                              <Badge
                                className={`text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0 ${
                                  order.status === 'paid'
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                }`}
                              >
                                {order.status === 'paid' ? '✓ Paid' : order.status}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                              <div>
                                <p className="text-gray-500 text-[10px] sm:text-xs mb-1">Amount</p>
                                <p className="font-medium text-gray-900 flex items-center text-xs sm:text-sm">
                                  <IndianRupee className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  {formatCurrency(order.amount).replace('₹', '')}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-[10px] sm:text-xs mb-1">GST</p>
                                <p className="font-medium text-gray-900 flex items-center text-xs sm:text-sm">
                                  <IndianRupee className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  {formatCurrency(order.gst).replace('₹', '')}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-[10px] sm:text-xs mb-1">Total</p>
                                <p className="font-semibold text-green-700 flex items-center text-xs sm:text-sm">
                                  <IndianRupee className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  {formatCurrency(order.total).replace('₹', '')}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-[10px] sm:text-xs mb-1 flex items-center gap-1">
                                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  Date
                                </p>
                                <p className="font-medium text-gray-900 text-[10px] sm:text-xs">{formatDate(order.paidAt)}</p>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(order.invoiceNumber)}
                            className="w-full border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 text-xs sm:text-sm py-2"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Download Invoice
                          </Button>
                        </div>
                      </div>
                    ))}
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

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="shadow-lg border-2 border-red-200">
              <CardHeader className="bg-blue-600/15 border-b border-red-200 py-4 sm:py-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-red-700">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6">
                <div className="space-y-4 sm:space-y-6">
                  {/* Danger Zone - More Visible */}
                  <div className="bg-white border-2 border-red-300 rounded-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600 flex items-center justify-center">
                          <Trash2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 w-full">
                        <h3 className="text-base sm:text-lg font-bold text-red-900 mb-2 text-center sm:text-left">Delete Account</h3>
                        <p className="text-xs sm:text-sm text-red-800 mb-3 sm:mb-4 text-center sm:text-left">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <div className="bg-white border border-red-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                          <p className="text-xs sm:text-sm font-semibold text-red-900 mb-2">This will permanently delete:</p>
                          <ul className="text-xs sm:text-sm text-red-800 space-y-1 sm:space-y-1.5 ml-4 list-disc">
                            <li>Your personal information and profile</li>
                            <li>All order history and invoices</li>
                            <li>Billing and payment information</li>
                            <li>Any associated data with your account</li>
                          </ul>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="lg"
                              className="w-full bg-red-600 hover:bg-red-700 shadow-lg text-sm sm:text-base py-2 sm:py-3"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                              Delete My Account Permanently
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-md mx-4">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-lg sm:text-xl">
                                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                                Confirm Account Deletion
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-sm sm:text-base">
                                <div className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
                                  <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                                    Are you absolutely sure you want to delete your account?
                                  </p>
                                  <p className="text-gray-700 text-xs sm:text-sm">
                                    This action cannot be undone. All your data will be permanently removed:
                                  </p>
                                  <ul className="ml-3 sm:ml-4 space-y-1 sm:space-y-1.5 list-disc text-gray-700 text-xs sm:text-sm">
                                    <li>Personal information and profile</li>
                                    <li>Order history and invoices</li>
                                    <li>Billing information</li>
                                    <li>All account data</li>
                                  </ul>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-4 sm:mt-6 flex-col-reverse sm:flex-row gap-2">
                              <AlertDialogCancel className="w-full sm:w-auto sm:mr-2 text-sm">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteAccount}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto text-sm"
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  <>
                                    <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                    Yes, Delete Permanently
                                  </>
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
