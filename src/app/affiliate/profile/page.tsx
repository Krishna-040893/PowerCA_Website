'use client'

import { useState, useEffect, Fragment } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
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
  Shield,
  IndianRupee,
  Landmark,
  Download,
  Upload,
  CheckCircle2,
  Users,
  Clock,
  ChevronDown,
} from 'lucide-react'
import ProfilePhotoUpload from '@/components/profile-photo-upload'
import { getProfilePhotoUrl } from '@/lib/image-upload'
import { useRef } from 'react'

interface AgreementStatus {
  hasDownloaded: boolean
  hasUploaded: boolean
  hasCompanySigned: boolean
  downloadedAt?: string
  uploadedAt?: string
  filePath?: string
  companySignedAt?: string
  companyFilePath?: string
}

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

interface AffiliateClient {
  customerName: string
  customerEmail: string
  firmName: string
  planType: string | null
  purchaseDate: string | null
  renewalDate: string | null
  status: 'paid' | 'pending'
  commissionStatus: 'paid' | 'processing' | 'pending'
  totalPayments: number
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
  const [agreementStatus, setAgreementStatus] = useState<AgreementStatus | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [clients, setClients] = useState<AffiliateClient[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())
  const agreementFileInputRef = useRef<HTMLInputElement>(null)

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

  const fetchClients = async () => {
    try {
      setIsLoadingClients(true)
      const response = await fetch('/api/affiliate/clients')
      const result = await response.json()
      if (result.success) {
        setClients(result.clients)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setIsLoadingClients(false)
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

  // Fetch agreement status
  const fetchAgreementStatus = async () => {
    try {
      const response = await fetch('/api/affiliate/agreement')
      if (response.ok) {
        const data = await response.json()
        setAgreementStatus(data)
      }
    } catch (error) {
      console.error('Error fetching agreement status:', error)
    }
  }

  // Fetch agreement status on mount
  useEffect(() => {
    if (session?.user?.email) {
      fetchAgreementStatus()
    }
  }, [session?.user?.email])

  // Fetch clients when switching to clients tab
  useEffect(() => {
    if (activeTab === 'clients' && clients.length === 0 && !isLoadingClients) {
      fetchClients()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // Handle agreement download
  const handleAgreementDownload = async () => {
    setIsDownloading(true)
    try {
      // Record download in database
      const response = await fetch('/api/affiliate/agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download' })
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('API Error:', result)
        alert(result.error || 'Failed to record download. Please try again.')
        return
      }

      // Download the PDF
      const link = document.createElement('a')
      link.href = '/docs/Affiliate/PowerCA_Affiliate_Agreement.pdf'
      link.download = 'PowerCA_Affiliate_Agreement.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Refresh status to move to upload step
      await fetchAgreementStatus()
    } catch (error) {
      console.error('Error downloading agreement:', error)
      alert('Failed to download agreement. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  // Handle agreement upload
  const handleAgreementUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/affiliate/agreement', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      await fetchAgreementStatus()
      alert('Agreement uploaded successfully!')
    } catch (error) {
      console.error('Error uploading agreement:', error)
      alert('Failed to upload agreement. Please try again.')
    } finally {
      setIsUploading(false)
      if (agreementFileInputRef.current) {
        agreementFileInputRef.current.value = ''
      }
    }
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
    <div className="bg-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              {/* Profile Photo Upload Component */}
              <div className="flex-shrink-0">
                <ProfilePhotoUpload
                  currentPhotoUrl={currentProfilePhotoUrl}
                  onPhotoUpdate={handleProfilePhotoUpdate}
                  onPhotoDelete={handleProfilePhotoDelete}
                  size="sm"
                  editable={true}
                />
              </div>

              <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left w-full sm:w-auto mt-1.5 sm:mt-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-900">
                  {affiliateData.full_name}
                </h1>
                <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-none">{affiliateData.email}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-0.5">
                  {getStatusBadge(affiliateData.status)}
                  {affiliateData.referral_code && (
                    <span className="text-xs text-green-600 font-mono font-semibold">
                      Code: {affiliateData.referral_code}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-8 pt-4 sm:pt-8 pb-2 sm:pb-4 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
          {/* Individual Spaced Tabs - responsive */}
          <TabsList className="flex flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start bg-transparent h-auto p-0 w-full">
            <TabsTrigger
              value="profile"
              className="px-3 py-2 sm:px-6 sm:py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 data-[state=active]:border-green-600 data-[state=active]:bg-green-600 data-[state=active]:text-white shadow-sm transition-all duration-200 text-xs sm:text-sm"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="agreement"
              className="px-3 py-2 sm:px-6 sm:py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 data-[state=active]:border-green-600 data-[state=active]:bg-green-600 data-[state=active]:text-white shadow-sm transition-all duration-200 text-xs sm:text-sm"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Agreement</span>
              <span className="sm:hidden">Agreement</span>
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="px-3 py-2 sm:px-6 sm:py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 data-[state=active]:border-green-600 data-[state=active]:bg-green-600 data-[state=active]:text-white shadow-sm transition-all duration-200 text-xs sm:text-sm"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Clients</span>
              <span className="sm:hidden">Clients</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card className="border-0 rounded-xl shadow-none">
              <CardContent className="p-0">
                <Accordion type="single" collapsible defaultValue="profile-info" className="w-full space-y-5">

                  {/* Profile Information Accordion */}
                  <AccordionItem value="profile-info" className="border rounded-xl overflow-hidden">
                    <div className="bg-green-600/15 px-4 sm:px-6">
                      <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                        <div>
                          <div className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                            <User className="h-4 w-4 text-green-600" />
                            Profile Information
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Your personal and business details</p>
                        </div>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent className="px-4 sm:px-6 pt-4">
                      {!isEditingProfile && (
                        <div className="flex justify-end mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditProfile}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-1">
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
                        <div className="space-y-1">
                          <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input value={affiliateData.email} disabled className="pl-10 bg-gray-50 border-gray-200" />
                          </div>
                        </div>
                        <div className="space-y-1">
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
                        <div className="space-y-1">
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
                        <div className="space-y-1">
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
                        <div className="space-y-1">
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
                        <div className="space-y-1">
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
                        <div className="space-y-1">
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
                        <div className="space-y-1">
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
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
                          <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving} className="w-full sm:w-auto">
                            <X className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                          <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                            {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Affiliate Details Accordion */}
                  <AccordionItem value="affiliate-details" className="border rounded-xl overflow-hidden">
                    <div className="bg-blue-600/10 px-4 sm:px-6">
                      <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                        <div>
                          <div className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                            <Shield className="h-4 w-4 text-blue-600" />
                            Affiliate Details
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Your affiliate marketing strategy and goals</p>
                        </div>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent className="px-4 sm:px-6 pt-4">
                      {!isEditingAffiliate && (
                        <div className="flex justify-end mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditAffiliate}
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      )}
                      <div className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-6 border-b">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Affiliate Status</Label>
                            <div>{getStatusBadge(affiliateData.status)}</div>
                          </div>
                          {affiliateData.referral_code && (
                            <div className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700">Referral Code</Label>
                              <div className="text-lg text-green-600 font-mono font-bold">{affiliateData.referral_code}</div>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Promotion Method</Label>
                            <div className="relative">
                              <Target className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                              <textarea
                                value={isEditingAffiliate ? editedData?.promotion_method || '' : affiliateData.promotion_method}
                                onChange={(e) => setEditedData(prev => prev ? { ...prev, promotion_method: e.target.value } : null)}
                                disabled={!isEditingAffiliate}
                                rows={4}
                                className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm ${isEditingAffiliate ? 'bg-white border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Target Audience</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                              <textarea
                                value={isEditingAffiliate ? editedData?.target_audience || '' : affiliateData.target_audience}
                                onChange={(e) => setEditedData(prev => prev ? { ...prev, target_audience: e.target.value } : null)}
                                disabled={!isEditingAffiliate}
                                rows={4}
                                className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm ${isEditingAffiliate ? 'bg-white border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Expected Monthly Referrals</Label>
                            <div className="relative">
                              <TrendingUp className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                              <textarea
                                value={isEditingAffiliate ? editedData?.monthly_leads || '' : affiliateData.monthly_leads || 'N/A'}
                                onChange={(e) => setEditedData(prev => prev ? { ...prev, monthly_leads: e.target.value } : null)}
                                disabled={!isEditingAffiliate}
                                rows={4}
                                className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm ${isEditingAffiliate ? 'bg-white border-blue-300' : 'bg-gray-50 border-gray-200'}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {isEditingAffiliate && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
                          <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving} className="w-full sm:w-auto">
                            <X className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                          <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                            {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Payment Information Accordion */}
                  <AccordionItem value="payment-info" className="border rounded-xl overflow-hidden">
                    <div className="bg-purple-600/10 px-4 sm:px-6">
                      <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                        <div>
                          <div className="flex items-center gap-2 text-base sm:text-lg font-semibold">
                            <CreditCard className="h-4 w-4 text-purple-600" />
                            Payment Information
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Your bank and tax details for commission payments</p>
                        </div>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent className="px-4 sm:px-6 pt-4">
                      {!isEditingPayment && (
                        <div className="flex justify-end mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditPayment}
                            className="border-purple-300 text-purple-700 hover:bg-purple-50"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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

                      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-purple-800">
                            <strong>Note:</strong> Your bank account details will be used for monthly commission payouts. Please ensure all information is accurate.
                          </p>
                        </div>
                      </div>

                      {isEditingPayment && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
                          <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving} className="w-full sm:w-auto">
                            <X className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                          <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto">
                            {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg border-0 rounded-xl">
              <CardHeader className="bg-green-600/15 border-b py-3 sm:py-4 px-4 sm:px-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                    Referred Clients
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">Clients referred through your referral code</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                {isLoadingClients ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-2" />
                    <span className="text-gray-600">Loading clients...</span>
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm">No referred clients yet</p>
                    <p className="text-xs text-gray-400 mt-1">Share your referral code to start earning commissions</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    {(() => {
                      // Group clients by customerEmail
                      const grouped = new Map<string, AffiliateClient[]>()
                      clients.forEach(client => {
                        const key = client.customerEmail
                        if (!grouped.has(key)) grouped.set(key, [])
                        grouped.get(key)!.push(client)
                      })

                      const renderPlanBadge = (planType: string | null) => {
                        if (!planType) return <span className="text-gray-400">-</span>
                        return (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            {planType === 'annual' && 'Annual'}
                            {planType === 'onetime' && '5 Year Pack'}
                            {!['annual', 'onetime'].includes(planType) && 'Annual'}
                          </span>
                        )
                      }

                      const renderRenewal = (order: AffiliateClient) => {
                        if (order.planType === 'onetime') return <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">Lifetime</span>
                        if (order.renewalDate) return <span className="text-xs text-gray-600">{new Date(order.renewalDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        return <span className="text-gray-400">-</span>
                      }

                      const renderCommissionStatus = (cs: string) => {
                        if (cs === 'paid') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>
                        if (cs === 'processing') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Processing</span>
                        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                      }

                      return (
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-xs text-gray-600 border-b">
                            <tr>
                              <th className="text-left px-3 py-2 font-medium">Customer Name</th>
                              <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">Firm Name</th>
                              <th className="text-left px-3 py-2 font-medium">Plan Type</th>
                              <th className="text-left px-3 py-2 font-medium hidden sm:table-cell">Subscription Date</th>
                              <th className="text-left px-3 py-2 font-medium">Renewal Date</th>
                              <th className="text-center px-3 py-2 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {Array.from(grouped.entries()).map(([email, orders]) => {
                              const first = orders[0]
                              const paidOrders = orders.filter(o => o.status === 'paid')

                              // Single order — flat row
                              if (paidOrders.length <= 1) {
                                const order = paidOrders[0] || first
                                return (
                                  <tr key={email} className="hover:bg-gray-50/50">
                                    <td className="px-3 py-2.5">
                                      <p className="font-medium text-gray-900">{first.customerName}</p>
                                      <p className="text-xs text-gray-400">{email}</p>
                                    </td>
                                    <td className="px-3 py-2.5 text-gray-600 hidden sm:table-cell">{order.firmName || '-'}</td>
                                    <td className="px-3 py-2.5">{renderPlanBadge(order.planType)}</td>
                                    <td className="px-3 py-2.5 text-gray-600 hidden sm:table-cell">
                                      {order.purchaseDate ? new Date(order.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                    </td>
                                    <td className="px-3 py-2.5">{renderRenewal(order)}</td>
                                    <td className="px-3 py-2.5 text-center">{renderCommissionStatus(order.commissionStatus)}</td>
                                  </tr>
                                )
                              }

                              // Multiple orders — collapsible group with summary status
                              const isExpanded = expandedClients.has(email)
                              const paidCount = paidOrders.filter(o => o.commissionStatus === 'paid').length
                              const processingCount = paidOrders.filter(o => o.commissionStatus === 'processing').length
                              const pendingCount = paidOrders.filter(o => o.commissionStatus === 'pending').length

                              return (
                                <Fragment key={email}>
                                  <tr
                                    className="hover:bg-gray-50/50 cursor-pointer"
                                    onClick={() => setExpandedClients(prev => {
                                      const next = new Set(prev)
                                      next.has(email) ? next.delete(email) : next.add(email)
                                      return next
                                    })}
                                  >
                                    <td className="px-3 py-2.5">
                                      <div className="flex items-center gap-1.5">
                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
                                        <div>
                                          <p className="font-medium text-gray-900">{first.customerName}</p>
                                          <p className="text-xs text-gray-400">{email}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-3 py-2.5 text-gray-500 text-xs hidden sm:table-cell">{paidOrders.length} firms</td>
                                    <td className="px-3 py-2.5">
                                      <span className="text-xs text-gray-500">{paidOrders.length} orders</span>
                                    </td>
                                    <td className="px-3 py-2.5 hidden sm:table-cell" />
                                    <td className="px-3 py-2.5" />
                                    <td className="px-3 py-2.5 text-center">
                                      <div className="flex flex-wrap justify-center gap-1">
                                        {paidCount > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">{paidCount} Paid</span>}
                                        {processingCount > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">{processingCount} Processing</span>}
                                        {pendingCount > 0 && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800">{pendingCount} Pending</span>}
                                      </div>
                                    </td>
                                  </tr>
                                  {isExpanded && paidOrders.map((order, idx) => (
                                    <tr key={`${email}-${idx}`} className="bg-gray-50/60">
                                      <td className="pl-10 pr-3 py-2 text-xs text-gray-500">{idx + 1}.</td>
                                      <td className="px-3 py-2 text-gray-700 text-xs hidden sm:table-cell">{order.firmName || '-'}</td>
                                      <td className="px-3 py-2">{renderPlanBadge(order.planType)}</td>
                                      <td className="px-3 py-2 text-gray-600 text-xs hidden sm:table-cell">
                                        {order.purchaseDate ? new Date(order.purchaseDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                      </td>
                                      <td className="px-3 py-2">{renderRenewal(order)}</td>
                                      <td className="px-3 py-2 text-center">{renderCommissionStatus(order.commissionStatus)}</td>
                                    </tr>
                                  ))}
                                </Fragment>
                              )
                            })}
                          </tbody>
                        </table>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agreement Tab */}
          <TabsContent value="agreement" className="space-y-4 sm:space-y-6">
            <Card className="shadow-lg border-0 rounded-xl">
              <CardHeader className="bg-green-600/15 border-b py-3 sm:py-4 px-4 sm:px-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Affiliate Agreement
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">Download, Sign and Upload your Affiliate Agreement Document</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                {(() => {
                  const downloaded = !!agreementStatus?.hasDownloaded
                  const uploaded = !!agreementStatus?.hasUploaded
                  const approved = !!agreementStatus?.hasCompanySigned
                  const completed = approved // Completed when company approves

                  // Helper for step circle styles
                  const stepStyle = (done: boolean, active: boolean) => ({
                    backgroundColor: done ? '#22c55e' : active ? 'rgb(219, 230, 252)' : '#f3f4f6',
                    borderColor: done ? '#22c55e' : active ? '#3b82f6' : '#d1d5db',
                    color: done ? 'white' : active ? '#3b82f6' : '#9ca3af',
                  })

                  return (
                    <div>
                      {/* Horizontal Progress Steps - 4 steps */}
                      <div className="flex items-center justify-center mb-8">
                        {/* Step 1: Download */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                            style={stepStyle(downloaded, !downloaded)}
                          >
                            {downloaded ? (
                              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                          </div>
                          <p className={`mt-2 text-xs sm:text-sm font-medium ${downloaded ? 'text-green-600' : 'text-gray-900'}`}>
                            Download
                          </p>
                        </div>

                        {/* Line 1 */}
                        <div className={`h-0.5 w-8 sm:w-14 md:w-20 mx-1.5 sm:mx-2 transition-all duration-300 ${downloaded ? 'bg-green-500' : 'bg-gray-300'}`} style={{ marginBottom: '24px' }} />

                        {/* Step 2: Upload */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                            style={stepStyle(uploaded, downloaded && !uploaded)}
                          >
                            {uploaded ? (
                              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                          </div>
                          <p className={`mt-2 text-xs sm:text-sm font-medium ${uploaded ? 'text-green-600' : downloaded ? 'text-gray-900' : 'text-gray-400'}`}>
                            Upload
                          </p>
                        </div>

                        {/* Line 2 */}
                        <div className={`h-0.5 w-8 sm:w-14 md:w-20 mx-1.5 sm:mx-2 transition-all duration-300 ${uploaded ? 'bg-green-500' : 'bg-gray-300'}`} style={{ marginBottom: '24px' }} />

                        {/* Step 3: Approval */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                            style={stepStyle(approved, uploaded && !approved)}
                          >
                            {approved ? (
                              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                          </div>
                          <p className={`mt-2 text-xs sm:text-sm font-medium ${approved ? 'text-green-600' : uploaded ? 'text-gray-900' : 'text-gray-400'}`}>
                            {approved ? 'Approved' : 'Approval'}
                          </p>
                        </div>

                        {/* Line 3 */}
                        <div className={`h-0.5 w-8 sm:w-14 md:w-20 mx-1.5 sm:mx-2 transition-all duration-300 ${completed ? 'bg-green-500' : 'bg-gray-300'}`} style={{ marginBottom: '24px' }} />

                        {/* Step 4: Completed */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                            style={stepStyle(completed, false)}
                          >
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <p className={`mt-2 text-xs sm:text-sm font-medium ${completed ? 'text-green-600' : 'text-gray-400'}`}>
                            Completed
                          </p>
                        </div>
                      </div>

                      {/* Step Content */}
                      {!downloaded ? (
                        /* Step 1: Download */
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-4">Click the link to download the agreement</p>
                          <Button
                            onClick={handleAgreementDownload}
                            disabled={isDownloading}
                            className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {isDownloading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4 mr-2" />
                            )}
                            Download Agreement
                          </Button>
                        </div>
                      ) : !uploaded ? (
                        /* Step 2: Upload */
                        <div>
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-w-md mx-auto">
                            <div
                              className="flex flex-col items-center justify-center h-[100px] border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-blue-400 transition-colors cursor-pointer"
                              onClick={() => agreementFileInputRef.current?.click()}
                            >
                              {isUploading ? (
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                  <p className="text-xs text-gray-600">Click to upload signed document</p>
                                  <p className="text-[10px] text-gray-400">PDF only, max 5MB</p>
                                </>
                              )}
                            </div>
                            <input
                              ref={agreementFileInputRef}
                              type="file"
                              accept="application/pdf"
                              onChange={handleAgreementUpload}
                              className="hidden"
                            />
                            <Button
                              onClick={() => agreementFileInputRef.current?.click()}
                              disabled={isUploading}
                              className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {isUploading ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Upload Signed Agreement
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : !approved ? (
                        /* Step 3: Waiting for approval */
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 text-center">
                          <Clock className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                          <h4 className="font-semibold text-blue-800 text-base mb-1">Waiting for Company Approval</h4>
                          <p className="text-sm text-blue-600">
                            Your signed agreement has been submitted. We will review and approve it shortly.
                          </p>
                        </div>
                      ) : (
                        /* Step 4: Completed — download the final document (both signatures) */
                        <div className="text-center">
                          <div className="inline-flex items-center gap-3 p-4 rounded-lg bg-green-100 border border-green-300 mb-4">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <div className="text-left">
                              <p className="font-semibold text-green-800">Agreement Completed</p>
                              <p className="text-sm text-green-700">
                                Approved on {agreementStatus?.companySignedAt ? new Date(agreementStatus.companySignedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <Button
                              onClick={async () => {
                                try {
                                  const response = await fetch('/api/affiliate/agreement/download-company-signed')
                                  if (response.ok) {
                                    const blob = await response.blob()
                                    const url = window.URL.createObjectURL(blob)
                                    const link = document.createElement('a')
                                    link.href = url
                                    link.download = 'PowerCA_Affiliate_Agreement_Signed.pdf'
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                    window.URL.revokeObjectURL(url)
                                  } else {
                                    alert('Failed to download agreement.')
                                  }
                                } catch {
                                  alert('Failed to download agreement. Please try again.')
                                }
                              }}
                              className="px-8 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Agreement
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
