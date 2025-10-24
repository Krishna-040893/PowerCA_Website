'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Target,
  TrendingUp,
  CreditCard,
  FileText,
  Loader2,
  Edit2,
  Save,
  X,
  LogOut,
  Shield,
  IndianRupee,
  Landmark,
} from 'lucide-react'
import ProfilePhotoUpload from '@/components/profile-photo-upload'
import { getProfilePhotoUrl } from '@/lib/image-upload'

interface AffiliateData {
  id: string
  full_name: string
  email: string
  phone: string
  city: string
  state: string
  business_type?: string
  company_name?: string
  designation?: string
  experience?: string
  website?: string
  promotion_method: string
  target_audience: string
  monthly_leads?: string
  account_number?: string
  ifsc_code?: string
  pan_number?: string
  gst_number?: string
  status: string
  referral_code?: string
  profile_photo_url?: string
}

export default function AffiliateProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingAffiliate, setIsEditingAffiliate] = useState(false)
  const [isEditingPayment, setIsEditingPayment] = useState(false)
  const [editedData, setEditedData] = useState<AffiliateData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [currentProfilePhotoUrl, setCurrentProfilePhotoUrl] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/affiliate-login')
    }

    // Check if user is an affiliate
    if (session?.user?.role && session.user.role !== 'affiliate' && session.user.role !== 'Affiliate') {
      router.push('/account')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.email) {
      fetchAffiliateData()
      fetchProfilePhoto()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email])

  const fetchProfilePhoto = async () => {
    if (!session?.user?.id) return

    try {
      const photoUrl = await getProfilePhotoUrl(session.user.id, 'affiliate')
      setCurrentProfilePhotoUrl(photoUrl)
    } catch (error) {
      console.error('Error fetching profile photo:', error)
    }
  }

  const fetchAffiliateData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/affiliate/profile')
      const result = await response.json()

      if (result.success && result.data) {
        setAffiliateData(result.data)
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditProfile = () => {
    setEditedData(affiliateData)
    setIsEditingProfile(true)
  }

  const handleEditAffiliate = () => {
    setEditedData(affiliateData)
    setIsEditingAffiliate(true)
  }

  const handleEditPayment = () => {
    setEditedData(affiliateData)
    setIsEditingPayment(true)
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    setIsEditingAffiliate(false)
    setIsEditingPayment(false)
    setEditedData(null)
  }

  const handleSave = async () => {
    if (!editedData) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/affiliate/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile')
      }

      setAffiliateData(editedData)
      setIsEditingProfile(false)
      setIsEditingAffiliate(false)
      setIsEditingPayment(false)
      setEditedData(null)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert(error instanceof Error ? error.message : 'Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleProfilePhotoUpdate = (newUrl: string) => {
    setCurrentProfilePhotoUrl(newUrl)
  }

  const handleProfilePhotoDelete = () => {
    setCurrentProfilePhotoUrl(null)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your affiliate account...</p>
        </div>
      </div>
    )
  }

  if (!session || !affiliateData) {
    return null
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pending Approval' },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Rejected' },
      suspended: { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Suspended' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Photo Upload Component */}
              <div className="flex-shrink-0">
                <ProfilePhotoUpload
                  currentPhotoUrl={currentProfilePhotoUrl}
                  onPhotoUpdate={handleProfilePhotoUpdate}
                  onPhotoDelete={handleProfilePhotoDelete}
                  size="md"
                  editable={true}
                />
              </div>

              <div className="flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {affiliateData.full_name}
                </h1>
                <p className="text-sm text-gray-500">{affiliateData.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(affiliateData.status)}
                  {affiliateData.referral_code && (
                    <span className="text-sm text-green-600 font-mono font-semibold">
                      Code: {affiliateData.referral_code}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-gray-600 hover:text-red-600 hover:border-red-300"
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
          <TabsList className="flex flex-wrap gap-3 justify-center lg:justify-start bg-transparent h-auto p-0 w-full">
            <TabsTrigger
              value="profile"
              className="px-6 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 data-[state=active]:border-green-600 data-[state=active]:bg-green-600 data-[state=active]:text-white shadow-sm transition-all duration-200"
            >
              <User className="h-4 w-4 mr-2" />
              Profile Information
            </TabsTrigger>
            <TabsTrigger
              value="affiliate"
              className="px-6 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 data-[state=active]:border-green-600 data-[state=active]:bg-green-600 data-[state=active]:text-white shadow-sm transition-all duration-200"
            >
              <Shield className="h-4 w-4 mr-2" />
              Affiliate Details
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="px-6 py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 data-[state=active]:border-green-600 data-[state=active]:bg-green-600 data-[state=active]:text-white shadow-sm transition-all duration-200"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Information
            </TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-green-600/15 border-b py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <User className="h-5 w-5 text-green-600" />
                      Profile Information
                    </CardTitle>
                    <CardDescription>Your personal and business details</CardDescription>
                  </div>
                  {!isEditingProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditProfile}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingProfile ? editedData?.full_name || '' : affiliateData.full_name}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                        disabled={!isEditingProfile}
                        className={`pl-10 ${isEditingProfile ? 'bg-white border-green-300' : 'bg-gray-50 border-gray-200'}`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={affiliateData.email}
                        disabled
                        className="pl-10 bg-gray-50 border-gray-200"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingProfile ? editedData?.phone || '' : affiliateData.phone}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        disabled={!isEditingProfile}
                        className={`pl-10 ${isEditingProfile ? 'bg-white border-green-300' : 'bg-gray-50 border-gray-200'}`}
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingProfile ? editedData?.city || '' : affiliateData.city}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, city: e.target.value } : null)}
                        disabled={!isEditingProfile}
                        className={`pl-10 ${isEditingProfile ? 'bg-white border-green-300' : 'bg-gray-50 border-gray-200'}`}
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">State</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingProfile ? editedData?.state || '' : affiliateData.state}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, state: e.target.value } : null)}
                        disabled={!isEditingProfile}
                        className={`pl-10 ${isEditingProfile ? 'bg-white border-green-300' : 'bg-gray-50 border-gray-200'}`}
                      />
                    </div>
                  </div>

                  {/* Business Type */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Business Type</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={affiliateData.business_type ? affiliateData.business_type.charAt(0).toUpperCase() + affiliateData.business_type.slice(1) : 'Individual'}
                        disabled
                        className="pl-10 bg-gray-50 border-gray-200 capitalize"
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Company Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingProfile ? editedData?.company_name || '' : affiliateData.company_name || 'N/A'}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                        disabled={!isEditingProfile}
                        className={`pl-10 ${isEditingProfile ? 'bg-white border-green-300' : 'bg-gray-50 border-gray-200'}`}
                      />
                    </div>
                  </div>

                  {/* Designation */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Designation</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingProfile ? editedData?.designation || '' : affiliateData.designation || 'N/A'}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, designation: e.target.value } : null)}
                        disabled={!isEditingProfile}
                        className={`pl-10 ${isEditingProfile ? 'bg-white border-green-300' : 'bg-gray-50 border-gray-200'}`}
                      />
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Experience</Label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingProfile ? editedData?.experience || '' : affiliateData.experience || 'N/A'}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, experience: e.target.value } : null)}
                        disabled={!isEditingProfile}
                        className={`pl-10 ${isEditingProfile ? 'bg-white border-green-300' : 'bg-gray-50 border-gray-200'}`}
                      />
                    </div>
                  </div>
                </div>

                {isEditingProfile && (
                  <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Affiliate Details Tab */}
          <TabsContent value="affiliate" className="space-y-6 mt-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-green-600/15 border-b py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Affiliate Details
                    </CardTitle>
                    <CardDescription>Your affiliate marketing strategy and goals</CardDescription>
                  </div>
                  {!isEditingAffiliate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditAffiliate}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Affiliate Status & Referral Code */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Affiliate Status</Label>
                      <div>
                        {getStatusBadge(affiliateData.status)}
                      </div>
                    </div>
                    {affiliateData.referral_code && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Referral Code</Label>
                        <div className="text-lg text-green-600 font-mono font-bold">{affiliateData.referral_code}</div>
                      </div>
                    )}
                  </div>

                  {/* Promotion Method */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Promotion Method</Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <textarea
                        value={isEditingAffiliate ? editedData?.promotion_method || '' : affiliateData.promotion_method}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, promotion_method: e.target.value } : null)}
                        disabled={!isEditingAffiliate}
                        rows={4}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm ${
                          isEditingAffiliate ? 'bg-white border-blue-300' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Target Audience</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                      <textarea
                        value={isEditingAffiliate ? editedData?.target_audience || '' : affiliateData.target_audience}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, target_audience: e.target.value } : null)}
                        disabled={!isEditingAffiliate}
                        rows={4}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm ${
                          isEditingAffiliate ? 'bg-white border-blue-300' : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Monthly Leads */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Expected Monthly Referrals</Label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingAffiliate ? editedData?.monthly_leads || '' : affiliateData.monthly_leads || 'N/A'}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, monthly_leads: e.target.value } : null)}
                        disabled={!isEditingAffiliate}
                        className={`pl-10 ${isEditingAffiliate ? 'bg-white border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                      />
                    </div>
                  </div>
                </div>

                {isEditingAffiliate && (
                  <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Information Tab */}
          <TabsContent value="payment" className="space-y-6 mt-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-green-600/15 border-b py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                      Payment Information
                    </CardTitle>
                    <CardDescription>Your bank and tax details for commission payments</CardDescription>
                  </div>
                  {!isEditingPayment && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditPayment}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Number */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Bank Account Number</Label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingPayment ? editedData?.account_number || '' : affiliateData.account_number || 'N/A'}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, account_number: e.target.value } : null)}
                        disabled={!isEditingPayment}
                        className={`pl-10 font-mono text-sm ${isEditingPayment ? 'bg-white border-purple-300' : 'bg-gray-50 border-gray-200'}`}
                        placeholder="Enter account number"
                      />
                    </div>
                  </div>

                  {/* IFSC Code */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">IFSC Code</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingPayment ? editedData?.ifsc_code || '' : affiliateData.ifsc_code || 'N/A'}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, ifsc_code: e.target.value.toUpperCase() } : null)}
                        disabled={!isEditingPayment}
                        className={`pl-10 font-mono text-sm ${isEditingPayment ? 'bg-white border-purple-300' : 'bg-gray-50 border-gray-200'}`}
                        placeholder="Enter IFSC code"
                      />
                    </div>
                  </div>

                  {/* PAN Number */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">PAN Number</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingPayment ? editedData?.pan_number || '' : affiliateData.pan_number || 'N/A'}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, pan_number: e.target.value.toUpperCase() } : null)}
                        disabled={!isEditingPayment}
                        className={`pl-10 font-mono text-sm ${isEditingPayment ? 'bg-white border-purple-300' : 'bg-gray-50 border-gray-200'}`}
                        placeholder="Enter PAN number"
                      />
                    </div>
                  </div>

                  {/* GST Number */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">GST Number (Optional)</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        value={isEditingPayment ? editedData?.gst_number || '' : affiliateData.gst_number || 'N/A'}
                        onChange={(e) => setEditedData(prev => prev ? { ...prev, gst_number: e.target.value.toUpperCase() } : null)}
                        disabled={!isEditingPayment}
                        className={`pl-10 font-mono text-sm ${isEditingPayment ? 'bg-white border-purple-300' : 'bg-gray-50 border-gray-200'}`}
                        placeholder="Enter GST number"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-purple-800">
                      <strong>Note:</strong> Your bank account details will be used for monthly commission payouts. Please ensure all information is accurate.
                    </p>
                  </div>
                </div>

                {isEditingPayment && (
                  <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
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
