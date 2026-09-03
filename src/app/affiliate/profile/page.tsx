'use client'

import { useState, useEffect, Fragment } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-[#001525] mx-auto mb-4" />
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
    <div className="min-h-screen bg-white">
      {/* Profile hero - contained card with rounded cover, as on the client profile */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 max-w-6xl">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Cover image */}
          <div className="relative h-24 sm:h-32 w-full">
            <Image
              src="/images/hero-mosaic-bg.jpg"
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1152px) 100vw, 1152px"
            />
          </div>

          <div className="px-5 sm:px-7 pb-5">
            {/* Avatar overlapping the cover, name and email beside it */}
            <div className="-mt-12 sm:-mt-14 flex items-end gap-4">
              <div className="flex min-w-0 items-end gap-5 sm:gap-6">
                <ProfilePhotoUpload
                  currentPhotoUrl={currentProfilePhotoUrl}
                  onPhotoUpdate={handleProfilePhotoUpdate}
                  onPhotoDelete={handleProfilePhotoDelete}
                  size="md"
                  editable={true}
                  compact
                />

                <div className="min-w-0 translate-y-5 sm:translate-y-7">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 truncate">
                    {affiliateData.full_name}
                  </h1>
                  <p className="mt-1 truncate text-sm text-gray-400">{affiliateData.email}</p>
                </div>
              </div>
            </div>

            {/* Stat row - hairline separators, no boxes */}
            <div className="mt-9 sm:mt-11 grid grid-cols-2 sm:grid-cols-4 gap-y-3">
              <div className="pr-4 sm:border-r sm:border-gray-200">
                <p className="text-xs text-gray-400">Status</p>
                <div className="mt-1">{getStatusBadge(affiliateData.status)}</div>
              </div>
              <div className="pl-4 sm:pl-5 pr-4 sm:border-r sm:border-gray-200">
                <p className="text-xs text-gray-400">Referral code</p>
                <p className="mt-1 truncate font-mono text-lg font-medium text-gray-900">
                  {affiliateData.referral_code || '—'}
                </p>
              </div>
              <div className="pr-4 sm:pl-5 sm:border-r sm:border-gray-200">
                <p className="text-xs text-gray-400">City</p>
                <p className="mt-1 truncate text-lg font-medium text-gray-900">{affiliateData.city || '—'}</p>
              </div>
              <div className="pl-4 sm:pl-5">
                <p className="text-xs text-gray-400">Phone</p>
                <p className="mt-1 truncate text-lg font-medium text-gray-900">{affiliateData.phone || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          {/* Individual Spaced Tabs - responsive */}
          <TabsList className="flex w-full gap-1 h-auto overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm justify-start">
            <TabsTrigger
              value="profile"
              className="flex-1 sm:flex-none shrink-0 justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="agreement"
              className="flex-1 sm:flex-none shrink-0 justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Agreement</span>
              <span className="sm:hidden">Agreement</span>
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="flex-1 sm:flex-none shrink-0 justify-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Clients</span>
              <span className="sm:hidden">Clients</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Information Tab */}
          <TabsContent value="profile">
            <Card className="border-0 rounded-2xl shadow-none bg-transparent">
              <CardContent className="p-0">
                <Accordion type="single" collapsible defaultValue="profile-info" className="w-full space-y-5">

                  {/* Profile Information Accordion */}
                  <AccordionItem value="profile-info" className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 bg-white px-5 sm:px-7">
                      <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                        <div>
                          <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                            <User className="h-4 w-4 text-gray-400" />
                            Profile Information
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">Your personal and business details</p>
                        </div>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent className="px-5 sm:px-7 pt-5">
                      {!isEditingProfile && (
                        <div className="flex justify-end mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditProfile}
                            className="h-12 md:h-12 w-auto rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors border border-gray-300 bg-white text-[#001525] hover:bg-gray-50 hover:text-[#001525]"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="space-y-1">
                          <Label className="text-[13px] font-medium text-[#001525]">Full Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={isEditingProfile ? editedData?.full_name || '' : affiliateData.full_name}
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                              disabled={!isEditingProfile}
                              className={`${isEditingProfile ? 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus-visible:ring-2 focus-visible:ring-[#001525]/10' : 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500 focus-visible:ring-0'}`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[13px] font-medium text-[#001525]">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input value={affiliateData.email} disabled className="pl-10 bg-gray-50 border-gray-200" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[13px] font-medium text-[#001525]">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={isEditingProfile ? editedData?.phone || '' : affiliateData.phone}
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, phone: e.target.value } : null)}
                              disabled={!isEditingProfile}
                              className={`${isEditingProfile ? 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus-visible:ring-2 focus-visible:ring-[#001525]/10' : 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500 focus-visible:ring-0'}`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[13px] font-medium text-[#001525]">City</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={isEditingProfile ? editedData?.city || '' : affiliateData.city}
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, city: e.target.value } : null)}
                              disabled={!isEditingProfile}
                              className={`${isEditingProfile ? 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus-visible:ring-2 focus-visible:ring-[#001525]/10' : 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500 focus-visible:ring-0'}`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[13px] font-medium text-[#001525]">State</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={isEditingProfile ? editedData?.state || '' : affiliateData.state}
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, state: e.target.value } : null)}
                              disabled={!isEditingProfile}
                              className={`${isEditingProfile ? 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus-visible:ring-2 focus-visible:ring-[#001525]/10' : 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500 focus-visible:ring-0'}`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[13px] font-medium text-[#001525]">Business Type</Label>
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
                          <Label className="text-[13px] font-medium text-[#001525]">Company Name</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={isEditingProfile ? editedData?.company_name || '' : affiliateData.company_name || 'N/A'}
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, company_name: e.target.value } : null)}
                              disabled={!isEditingProfile}
                              className={`${isEditingProfile ? 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus-visible:ring-2 focus-visible:ring-[#001525]/10' : 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500 focus-visible:ring-0'}`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[13px] font-medium text-[#001525]">Designation</Label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={isEditingProfile ? editedData?.designation || '' : affiliateData.designation || 'N/A'}
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, designation: e.target.value } : null)}
                              disabled={!isEditingProfile}
                              className={`${isEditingProfile ? 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus-visible:ring-2 focus-visible:ring-[#001525]/10' : 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500 focus-visible:ring-0'}`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[13px] font-medium text-[#001525]">Experience</Label>
                          <div className="relative">
                            <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={isEditingProfile ? editedData?.experience || '' : affiliateData.experience || 'N/A'}
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, experience: e.target.value } : null)}
                              disabled={!isEditingProfile}
                              className={`${isEditingProfile ? 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus-visible:ring-2 focus-visible:ring-[#001525]/10' : 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500 focus-visible:ring-0'}`}
                            />
                          </div>
                        </div>
                      </div>

                      {isEditingProfile && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
                          <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving} className="h-12 md:h-12 w-auto rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors border border-gray-300 bg-white text-[#001525] hover:bg-gray-50 hover:text-[#001525]">
                            <X className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                          <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-12 md:h-12 w-auto rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors bg-[#001525] text-white hover:bg-[#00223a] disabled:bg-gray-200 disabled:text-gray-400">
                            {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Affiliate Details Accordion */}
                  <AccordionItem value="affiliate-details" className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 bg-white px-5 sm:px-7">
                      <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                        <div>
                          <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                            <Shield className="h-4 w-4 text-gray-400" />
                            Affiliate Details
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">Your affiliate marketing strategy and goals</p>
                        </div>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent className="px-5 sm:px-7 pt-5">
                      <div className="space-y-4 sm:space-y-6">
                        {/* Status and code share the row with the Edit button */}
                        <div className="flex flex-wrap items-start justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b">
                          <div className="grid flex-1 grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2">
                              <Label className="text-[13px] font-medium text-[#001525]">Affiliate Status</Label>
                              <div>{getStatusBadge(affiliateData.status)}</div>
                            </div>
                            {affiliateData.referral_code && (
                              <div className="space-y-2">
                                <Label className="text-[13px] font-medium text-[#001525]">Referral Code</Label>
                                <div className="text-lg text-[#001525] font-mono font-bold">{affiliateData.referral_code}</div>
                              </div>
                            )}
                          </div>
                          {!isEditingAffiliate && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleEditAffiliate}
                              className="h-12 md:h-12 w-auto shrink-0 rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors border border-gray-300 bg-white text-[#001525] hover:bg-gray-50 hover:text-[#001525]"
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                          <div className="space-y-2">
                            <Label className="text-[13px] font-medium text-[#001525]">Promotion Method</Label>
                            <div className="relative">
                              <Target className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
                              <textarea
                                value={isEditingAffiliate ? editedData?.promotion_method || '' : affiliateData.promotion_method}
                                onChange={(e) => setEditedData(prev => prev ? { ...prev, promotion_method: e.target.value } : null)}
                                disabled={!isEditingAffiliate}
                                rows={4}
                                className={`${isEditingAffiliate ? 'w-full resize-none pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10' : 'w-full resize-none pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500'}`}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[13px] font-medium text-[#001525]">Target Audience</Label>
                            <div className="relative">
                              <User className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
                              <textarea
                                value={isEditingAffiliate ? editedData?.target_audience || '' : affiliateData.target_audience}
                                onChange={(e) => setEditedData(prev => prev ? { ...prev, target_audience: e.target.value } : null)}
                                disabled={!isEditingAffiliate}
                                rows={4}
                                className={`${isEditingAffiliate ? 'w-full resize-none pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10' : 'w-full resize-none pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500'}`}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[13px] font-medium text-[#001525]">Expected Monthly Referrals</Label>
                            <div className="relative">
                              <TrendingUp className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
                              <textarea
                                value={isEditingAffiliate ? editedData?.monthly_leads || '' : affiliateData.monthly_leads || 'N/A'}
                                onChange={(e) => setEditedData(prev => prev ? { ...prev, monthly_leads: e.target.value } : null)}
                                disabled={!isEditingAffiliate}
                                rows={4}
                                className={`${isEditingAffiliate ? 'w-full resize-none pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus:ring-2 focus:ring-[#001525]/10' : 'w-full resize-none pl-10 pr-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500'}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {isEditingAffiliate && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
                          <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving} className="h-12 md:h-12 w-auto rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors border border-gray-300 bg-white text-[#001525] hover:bg-gray-50 hover:text-[#001525]">
                            <X className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                          <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-12 md:h-12 w-auto rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors bg-[#001525] text-white hover:bg-[#00223a] disabled:bg-gray-200 disabled:text-gray-400">
                            {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                          </Button>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Payment Information Accordion */}
                  <AccordionItem value="payment-info" className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 bg-white px-5 sm:px-7">
                      <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                        <div>
                          <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
                            <CreditCard className="h-4 w-4 text-gray-400" />
                            Payment Information
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">Your bank and tax details for commission payments</p>
                        </div>
                      </AccordionTrigger>
                    </div>
                    <AccordionContent className="px-5 sm:px-7 pt-5">
                      {!isEditingPayment && (
                        <div className="flex justify-end mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditPayment}
                            className="h-12 md:h-12 w-auto rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors border border-gray-300 bg-white text-[#001525] hover:bg-gray-50 hover:text-[#001525]"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <Label className="text-[13px] font-medium text-[#001525]">Bank Account Number</Label>
                          <div className="relative">
                            <Landmark className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={isEditingPayment ? editedData?.account_number || '' : affiliateData.account_number || 'N/A'}
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, account_number: e.target.value } : null)}
                              disabled={!isEditingPayment}
                              className={`font-mono ${isEditingPayment ? 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus-visible:ring-2 focus-visible:ring-[#001525]/10' : 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500 focus-visible:ring-0'}`}
                              placeholder="Enter account number"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[13px] font-medium text-[#001525]">IFSC Code</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={isEditingPayment ? editedData?.ifsc_code || '' : affiliateData.ifsc_code || 'N/A'}
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, ifsc_code: e.target.value.toUpperCase() } : null)}
                              disabled={!isEditingPayment}
                              className={`font-mono ${isEditingPayment ? 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus-visible:ring-2 focus-visible:ring-[#001525]/10' : 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500 focus-visible:ring-0'}`}
                              placeholder="Enter IFSC code"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[13px] font-medium text-[#001525]">PAN Number</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={isEditingPayment ? editedData?.pan_number || '' : affiliateData.pan_number || 'N/A'}
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, pan_number: e.target.value.toUpperCase() } : null)}
                              disabled={!isEditingPayment}
                              className={`font-mono ${isEditingPayment ? 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus-visible:ring-2 focus-visible:ring-[#001525]/10' : 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500 focus-visible:ring-0'}`}
                              placeholder="Enter PAN number"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[13px] font-medium text-[#001525]">GST Number (Optional)</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              value={isEditingPayment ? editedData?.gst_number || '' : affiliateData.gst_number || 'N/A'}
                              onChange={(e) => setEditedData(prev => prev ? { ...prev, gst_number: e.target.value.toUpperCase() } : null)}
                              disabled={!isEditingPayment}
                              className={`font-mono ${isEditingPayment ? 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-white text-sm text-[#001525] outline-none transition-colors focus:border-[#001525] focus-visible:ring-2 focus-visible:ring-[#001525]/10' : 'h-12 md:h-12 pl-10 rounded-xl border-gray-200 bg-gray-50 text-sm text-gray-500 focus-visible:ring-0'}`}
                              placeholder="Enter GST number"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-gray-600">
                            <strong>Note:</strong> Your bank account details will be used for monthly commission payouts. Please ensure all information is accurate.
                          </p>
                        </div>
                      </div>

                      {isEditingPayment && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
                          <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSaving} className="h-12 md:h-12 w-auto rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors border border-gray-300 bg-white text-[#001525] hover:bg-gray-50 hover:text-[#001525]">
                            <X className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                          <Button size="sm" onClick={handleSave} disabled={isSaving} className="h-12 md:h-12 w-auto rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors bg-[#001525] text-white hover:bg-[#00223a] disabled:bg-gray-200 disabled:text-gray-400">
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
            <Card className="border border-gray-200 bg-white shadow-sm rounded-2xl overflow-hidden p-0 py-0 gap-0">
              <CardHeader className="border-b border-gray-200 bg-white px-5 sm:px-7 py-4 sm:py-5">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                    Referred Clients
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-0.5">Clients referred through your referral code</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                {isLoadingClients ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-[#001525] mr-2" />
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
                            {planType === 'onetime' && '2 Year Pack'}
                            {!['annual', 'onetime'].includes(planType) && 'Annual'}
                          </span>
                        )
                      }

                      const renderRenewal = (order: AffiliateClient) => {
                        if (order.planType === 'onetime') return <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-medium">2 Years</span>
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
            <Card className="border border-gray-200 bg-white shadow-sm rounded-2xl overflow-hidden p-0 py-0 gap-0">
              <CardHeader className="border-b border-gray-200 bg-white px-5 sm:px-7 py-4 sm:py-5">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Affiliate Agreement
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500 mt-0.5">Download, Sign and Upload your Affiliate Agreement Document</CardDescription>
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
                    backgroundColor: done ? '#10b981' : active ? '#001525' : '#ffffff',
                    borderColor: done ? '#10b981' : active ? '#001525' : '#e5e7eb',
                    color: done ? '#ffffff' : active ? '#ffffff' : '#d1d5db',
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
                          <p className={`mt-2 text-xs sm:text-sm font-medium ${downloaded ? 'text-[#001525]' : 'text-[#001525]'}`}>
                            Download
                          </p>
                        </div>

                        {/* Line 1 */}
                        <div className={`h-0.5 w-8 sm:w-14 md:w-20 mx-1.5 sm:mx-2 transition-all duration-300 ${downloaded ? 'bg-emerald-500' : 'bg-gray-200'}`} style={{ marginBottom: '24px' }} />

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
                          <p className={`mt-2 text-xs sm:text-sm font-medium ${uploaded ? 'text-[#001525]' : downloaded ? 'text-[#001525]' : 'text-gray-400'}`}>
                            Upload
                          </p>
                        </div>

                        {/* Line 2 */}
                        <div className={`h-0.5 w-8 sm:w-14 md:w-20 mx-1.5 sm:mx-2 transition-all duration-300 ${uploaded ? 'bg-emerald-500' : 'bg-gray-200'}`} style={{ marginBottom: '24px' }} />

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
                          <p className={`mt-2 text-xs sm:text-sm font-medium ${approved ? 'text-[#001525]' : uploaded ? 'text-[#001525]' : 'text-gray-400'}`}>
                            {approved ? 'Approved' : 'Approval'}
                          </p>
                        </div>

                        {/* Line 3 */}
                        <div className={`h-0.5 w-8 sm:w-14 md:w-20 mx-1.5 sm:mx-2 transition-all duration-300 ${completed ? 'bg-emerald-500' : 'bg-gray-200'}`} style={{ marginBottom: '24px' }} />

                        {/* Step 4: Completed */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                            style={stepStyle(completed, false)}
                          >
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <p className={`mt-2 text-xs sm:text-sm font-medium ${completed ? 'text-[#001525]' : 'text-gray-400'}`}>
                            Completed
                          </p>
                        </div>
                      </div>

                      {/* Step Content */}
                      {!downloaded ? (
                        /* Step 1: Download */
                        <div className="text-center pb-6 sm:pb-8">
                          <p className="text-sm text-gray-600 mb-4">Click the link to download the agreement</p>
                          <Button
                            onClick={handleAgreementDownload}
                            disabled={isDownloading}
                            className="h-12 md:h-12 w-auto rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors bg-[#001525] text-white hover:bg-[#00223a] disabled:bg-gray-200 disabled:text-gray-400"
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
                              className="h-12 md:h-12 rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors bg-[#001525] text-white hover:bg-[#00223a] disabled:bg-gray-200 disabled:text-gray-400 w-full mt-3"
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
                          <div className="inline-flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-gray-50 mb-4">
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
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
                              className="h-12 md:h-12 w-auto rounded-full px-8 has-[>svg]:px-8 text-sm font-medium transition-colors bg-[#001525] text-white hover:bg-[#00223a] disabled:bg-gray-200 disabled:text-gray-400"
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
