'use client'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Trash2,
  LogOut,
  AlertCircle,
  Download,
  Package,
  Loader2,
  Calendar,
  IndianRupee,
  Save,
  Plus,
  Pencil,
  ChevronDown,
  FileText,
  Upload,
  CheckCircle2,
  CreditCard,
  ArrowUpCircle,
  Clock,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
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
  discountPercentage: number
  discountAmount: number
  originalAmount: number | null
  paymentType: 'initial_payment' | 'final_settlement'
  planType: string
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

interface AgreementStatus {
  hasDownloaded: boolean
  downloadedAt: string | null
  hasUploaded: boolean
  uploadedAt: string | null
  filePath: string | null
  signingMethod: 'digital' | 'manual' | null
}

interface AppDownload {
  id: string
  orderId: string
  paymentId: string
  productName: string
  amount: number
  downloadCount: number
  maxDownloads: number
  isDownloaded: boolean
  downloadedAt: string | null
  purchasedAt: string
  status: string
  downloadToken: string | null
  downloadLinkExpiry: string | null
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

interface AddressPaymentStatus {
  addressId: string
  initialPaymentDate: string | null
  initialPaymentId: string | null
  finalSettlementDate: string | null
  finalSettlementPaymentId: string | null
  isFinalSettlementEnabled: boolean
  daysUntilFinalSettlement: number | null
}

// Common spelling corrections for Indian cities
const citySpellingCorrections: Record<string, string> = {
  // Bangalore variations
  'bangalroe': 'Bangalore',
  'banglore': 'Bangalore',
  'banglaore': 'Bangalore',
  'bengluru': 'Bangalore',
  'bengaluru': 'Bangalore',
  'bangaluru': 'Bangalore',
  'banagalore': 'Bangalore',
  'bangalore': 'Bangalore',
  // Mumbai variations
  'mumbai': 'Mumbai',
  'mubai': 'Mumbai',
  'mumbaii': 'Mumbai',
  'bombay': 'Mumbai',
  // Delhi variations
  'delhi': 'Delhi',
  'dehli': 'Delhi',
  'delli': 'Delhi',
  'newdelhi': 'New Delhi',
  'new delhi': 'New Delhi',
  // Chennai variations
  'chennai': 'Chennai',
  'chenai': 'Chennai',
  'channai': 'Chennai',
  'madras': 'Chennai',
  // Hyderabad variations
  'hyderabad': 'Hyderabad',
  'hydrabad': 'Hyderabad',
  'hiderabad': 'Hyderabad',
  'hyderabd': 'Hyderabad',
  // Kolkata variations
  'kolkata': 'Kolkata',
  'kolkatta': 'Kolkata',
  'calcutta': 'Kolkata',
  'kolkota': 'Kolkata',
  // Pune variations
  'pune': 'Pune',
  'poona': 'Pune',
  'puna': 'Pune',
  // Ahmedabad variations
  'ahmedabad': 'Ahmedabad',
  'ahemdabad': 'Ahmedabad',
  'ahmedabd': 'Ahmedabad',
  'ahmadabad': 'Ahmedabad',
  // Jaipur variations
  'jaipur': 'Jaipur',
  'jaiur': 'Jaipur',
  'jaipure': 'Jaipur',
  // Lucknow variations
  'lucknow': 'Lucknow',
  'luknow': 'Lucknow',
  'luckow': 'Lucknow',
  // Chandigarh variations
  'chandigarh': 'Chandigarh',
  'chandigrah': 'Chandigarh',
  'chandighar': 'Chandigarh',
  // Gurgaon/Gurugram variations
  'gurgaon': 'Gurugram',
  'gurugram': 'Gurugram',
  'gurgoan': 'Gurugram',
  // Noida variations
  'noida': 'Noida',
  'nodia': 'Noida',
  // Coimbatore variations
  'coimbatore': 'Coimbatore',
  'coimbatur': 'Coimbatore',
  'coimbtore': 'Coimbatore',
  // Indore variations
  'indore': 'Indore',
  'indor': 'Indore',
  // Kochi variations
  'kochi': 'Kochi',
  'cochin': 'Kochi',
  'kochin': 'Kochi',
  // Nagpur variations
  'nagpur': 'Nagpur',
  'nagpure': 'Nagpur',
  // Surat variations
  'surat': 'Surat',
  'suart': 'Surat',
  // Vadodara variations
  'vadodara': 'Vadodara',
  'baroda': 'Vadodara',
  'vadodra': 'Vadodara',
  // Visakhapatnam variations
  'visakhapatnam': 'Visakhapatnam',
  'vizag': 'Visakhapatnam',
  'vishakhapatnam': 'Visakhapatnam',
  // Bhopal variations
  'bhopal': 'Bhopal',
  'bhoapl': 'Bhopal',
  // Patna variations
  'patna': 'Patna',
  'panta': 'Patna',
  // Ranchi variations
  'ranchi': 'Ranchi',
  'rachi': 'Ranchi',
  // Thiruvananthapuram variations
  'thiruvananthapuram': 'Thiruvananthapuram',
  'trivandrum': 'Thiruvananthapuram',
  'trivendrum': 'Thiruvananthapuram',
}

// Helper function to normalize location name (Title Case + Spelling Correction)
const normalizeLocation = (location: string): string => {
  if (!location) return ''

  const trimmed = location.trim().toLowerCase()

  // Check if there's a spelling correction available
  if (citySpellingCorrections[trimmed]) {
    return citySpellingCorrections[trimmed]
  }

  // If no correction found, just apply title case
  return trimmed
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// States/Provinces by country
const statesByCountry: Record<string, string[]> = {
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
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming', 'District of Columbia'
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
    'Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse',
    'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate',
    'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'
  ],
  'United Arab Emirates': [
    'Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain'
  ],
  'France': [
    'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire',
    'Corsica', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandy', 'Nouvelle-Aquitaine',
    'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'
  ],
  'China': [
    'Anhui', 'Beijing', 'Chongqing', 'Fujian', 'Gansu', 'Guangdong', 'Guangxi', 'Guizhou',
    'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hong Kong', 'Hubei', 'Hunan', 'Inner Mongolia',
    'Jiangsu', 'Jiangxi', 'Jilin', 'Liaoning', 'Macau', 'Ningxia', 'Qinghai', 'Shaanxi',
    'Shandong', 'Shanghai', 'Shanxi', 'Sichuan', 'Taiwan', 'Tianjin', 'Tibet', 'Xinjiang',
    'Yunnan', 'Zhejiang'
  ],
  'Japan': [
    'Aichi', 'Akita', 'Aomori', 'Chiba', 'Ehime', 'Fukui', 'Fukuoka', 'Fukushima', 'Gifu',
    'Gunma', 'Hiroshima', 'Hokkaido', 'Hyogo', 'Ibaraki', 'Ishikawa', 'Iwate', 'Kagawa',
    'Kagoshima', 'Kanagawa', 'Kochi', 'Kumamoto', 'Kyoto', 'Mie', 'Miyagi', 'Miyazaki',
    'Nagano', 'Nagasaki', 'Nara', 'Niigata', 'Oita', 'Okayama', 'Okinawa', 'Osaka', 'Saga',
    'Saitama', 'Shiga', 'Shimane', 'Shizuoka', 'Tochigi', 'Tokushima', 'Tokyo', 'Tottori',
    'Toyama', 'Wakayama', 'Yamagata', 'Yamaguchi', 'Yamanashi'
  ],
  'Brazil': [
    'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
    'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais',
    'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte',
    'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
  ],
  'Mexico': [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua',
    'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México',
    'Mexico City', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro',
    'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala',
    'Veracruz', 'Yucatán', 'Zacatecas'
  ],
  'Spain': [
    'Andalusia', 'Aragon', 'Asturias', 'Balearic Islands', 'Basque Country', 'Canary Islands',
    'Cantabria', 'Castile and León', 'Castile-La Mancha', 'Catalonia', 'Ceuta', 'Extremadura',
    'Galicia', 'La Rioja', 'Madrid', 'Melilla', 'Murcia', 'Navarre', 'Valencia'
  ],
  'Italy': [
    'Abruzzo', 'Aosta Valley', 'Apulia', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
    'Friuli Venezia Giulia', 'Lazio', 'Liguria', 'Lombardy', 'Marche', 'Molise', 'Piedmont',
    'Sardinia', 'Sicily', 'Trentino-South Tyrol', 'Tuscany', 'Umbria', 'Veneto'
  ]
}

function AccountPageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, setIsDeleting] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [activeTab, setActiveTab] = useState(() => {
    // Check URL param for initial tab
    const tabParam = searchParams.get('tab')
    return tabParam && ['profile', 'billing', 'orders', 'downloads'].includes(tabParam)
      ? tabParam
      : 'profile'
  })

  // Check if coming from pricing page with a plan selected
  const paymentType = searchParams.get('paymentType')
  const planPrice = searchParams.get('planPrice')

  // Subscription state
  interface SubscriptionData {
    id: string
    plan_type: string
    status: string
    created_at: string
    current_period_start?: string
    current_period_end?: string
    next_due_date?: string
    address_id?: string
    user_addresses?: {
      id: string
      firm_name: string
      city: string
      label?: string
    }
  }
  const [subscriptions, setSubscriptions] = useState<SubscriptionData[]>([])
  const [loadingSubscription, setLoadingSubscription] = useState(false)

  const [appDownloads, setAppDownloads] = useState<AppDownload[]>([])
  const [isLoadingDownloads, setIsLoadingDownloads] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [currentProfilePhotoUrl, setCurrentProfilePhotoUrl] = useState<string | null>(null)
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null)
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [purchasedAddressIds, setPurchasedAddressIds] = useState<string[]>([])
  const [addressPaymentStatus, setAddressPaymentStatus] = useState<AddressPaymentStatus[]>([])
  const [selectedLocationTab, setSelectedLocationTab] = useState<string>('')
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])
  const [expandedAddresses, setExpandedAddresses] = useState<string[]>([])
  const [expandedLocations, setExpandedLocations] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 5

  // Agreement document state
  const [agreementStatus, setAgreementStatus] = useState<AgreementStatus | null>(null)
  const [isLoadingAgreement, setIsLoadingAgreement] = useState(false)
  const [isUploadingAgreement, setIsUploadingAgreement] = useState(false)
  const [signingMethod, setSigningMethod] = useState<'digital' | 'manual' | null>(null)
  const agreementFileInputRef = useRef<HTMLInputElement>(null)

  // Handle tab change - update both state and URL
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Reset pagination when switching to orders tab
    if (value === 'orders') {
      setCurrentPage(1)
    }
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
    postcode: ''
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
      fetchAgreementStatus()
      fetchAppDownloads()
      fetchSubscription()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.email])

  // Fetch subscription data
  const fetchSubscription = async () => {
    setLoadingSubscription(true)
    try {
      const response = await fetch('/api/subscriptions/status')
      const data = await response.json()

      if (data.subscriptions && data.subscriptions.length > 0) {
        setSubscriptions(data.subscriptions)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoadingSubscription(false)
    }
  }

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

      // Fetch address payment status (for two-stage payment tracking)
      const paymentStatusResponse = await fetch('/api/user/address-payment-status')
      const paymentStatusResult = await paymentStatusResponse.json()
      if (paymentStatusResult.success && paymentStatusResult.addressPaymentStatus) {
        setAddressPaymentStatus(paymentStatusResult.addressPaymentStatus)
      }
    } catch (error) {
      console.error('Error fetching addresses:', error)
    } finally {
      setLoadingAddresses(false)
    }
  }

  // Helper function to get payment status for an address
  const getAddressPaymentStatus = (addressId: string): AddressPaymentStatus | undefined => {
    return addressPaymentStatus.find(status => status.addressId === addressId)
  }

  // Helper function to get subscription for an address
  const getAddressSubscription = (addressId: string): SubscriptionData | undefined => {
    return subscriptions.find(sub => sub.address_id === addressId)
  }

  // Helper function to format next due date
  const formatNextDueDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'N/A'
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Helper function to check if due date is past
  const isDueDatePast = (dateStr: string | undefined): boolean => {
    if (!dateStr) return false
    const dueDate = new Date(dateStr)
    return dueDate < new Date()
  }

  // Helper function to group orders by location
  const groupOrdersByLocation = (orders: OrderHistory[]): Record<string, OrderHistory[]> => {
    return orders.reduce((groups, order) => {
      const location = order.location || 'Unknown Location'
      if (!groups[location]) {
        groups[location] = []
      }
      groups[location].push(order)
      return groups
    }, {} as Record<string, OrderHistory[]>)
  }

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
    // Load address data into form - use label as city if available for consistency
    setBillingForm({
      firmName: address.firm_name,
      gstNo: address.gst_no || '',
      address: address.address,
      city: address.label || address.city,
      country: address.country,
      state: address.state,
      postcode: address.postcode
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

  const fetchAgreementStatus = async () => {
    setIsLoadingAgreement(true)
    try {
      const response = await fetch('/api/user/agreement')
      const result = await response.json()

      if (result.success) {
        setAgreementStatus(result.data)
        // Restore the signing method if user has already downloaded
        if (result.data.signingMethod) {
          setSigningMethod(result.data.signingMethod)
        }
      }
    } catch (error) {
      console.error('Error fetching agreement status:', error)
    } finally {
      setIsLoadingAgreement(false)
    }
  }

  const fetchAppDownloads = async () => {
    setIsLoadingDownloads(true)
    try {
      const response = await fetch('/api/user/app-downloads')
      const result = await response.json()

      if (result.success) {
        setAppDownloads(result.downloads || [])
      }
    } catch (error) {
      console.error('Error fetching app downloads:', error)
    } finally {
      setIsLoadingDownloads(false)
    }
  }

  const handleAppDownload = async (download: AppDownload) => {
    if (!download.downloadToken) {
      toast.error('Download link not available. Please contact support.')
      return
    }

    // Check if link is expired
    if (download.downloadLinkExpiry && new Date(download.downloadLinkExpiry) < new Date()) {
      toast.error('Download link has expired. Please contact support.')
      return
    }

    setDownloadingId(download.id)
    try {
      // Open download in new tab/trigger download
      window.location.href = `/api/download/app?token=${download.downloadToken}`

      // Wait a moment then refresh the list to show updated status
      setTimeout(() => {
        fetchAppDownloads()
        setDownloadingId(null)
      }, 2000)
    } catch (error) {
      console.error('Error downloading app:', error)
      toast.error('Failed to start download. Please try again.')
      setDownloadingId(null)
    }
  }

  const handleAgreementDownload = async () => {
    if (!signingMethod) {
      toast.error('Please select a signing method first')
      return
    }

    try {
      // Record the download action with signing method
      await fetch('/api/user/agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download', signingMethod })
      })

      // Determine which document to download based on signing method
      const documentPath = signingMethod === 'digital'
        ? '/docs/PowerCA_Pricing_Agreement_DSC.pdf'
        : '/docs/PowerCA_Pricing_Agreement.pdf'

      const documentName = signingMethod === 'digital'
        ? 'PowerCA_Pricing_Agreement_DSC.pdf'
        : 'PowerCA_Pricing_Agreement.pdf'

      // Trigger the actual download
      const link = document.createElement('a')
      link.href = documentPath
      link.download = documentName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Refresh agreement status
      await fetchAgreementStatus()
      toast.success('Agreement downloaded successfully!')
    } catch (error) {
      console.error('Error downloading agreement:', error)
      toast.error('Failed to download agreement. Please try again.')
    }
  }

  const handleAgreementUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setIsUploadingAgreement(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signingMethod', signingMethod || 'manual')

      const response = await fetch('/api/user/agreement', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        await fetchAgreementStatus()
        toast.success('Signed agreement uploaded successfully!')
      } else {
        if (result.code === 'DOWNLOAD_REQUIRED') {
          toast.error('Please download the agreement first before uploading')
        } else {
          toast.error(result.error || 'Failed to upload agreement')
        }
      }
    } catch (error) {
      console.error('Error uploading agreement:', error)
      toast.error('Failed to upload agreement. Please try again.')
    } finally {
      setIsUploadingAgreement(false)
      // Reset the input
      if (agreementFileInputRef.current) {
        agreementFileInputRef.current.value = ''
      }
    }
  }

  const handleProfilePhotoUpdate = (newUrl: string) => {
    setCurrentProfilePhotoUrl(newUrl)
  }

  const handleProfilePhotoDelete = () => {
    setCurrentProfilePhotoUrl(null)
  }

  const _handleDeleteAccount = async () => {
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
    // Reset state when country changes
    if (field === 'country') {
      setBillingForm(prev => ({ ...prev, [field]: value, state: '' }))
    } else {
      setBillingForm(prev => ({ ...prev, [field]: value }))
    }
  }

  // Normalize city/location when user leaves the field
  const handleLocationBlur = () => {
    const normalized = normalizeLocation(billingForm.city)
    if (normalized !== billingForm.city) {
      setBillingForm(prev => ({ ...prev, city: normalized }))
    }
  }

  const handleSaveBillingAddress = async () => {
    // Normalize city/location before validation and saving
    const normalizedCity = normalizeLocation(billingForm.city)

    // Validate required fields
    if (!billingForm.firmName || !billingForm.address || !normalizedCity || !billingForm.country || !billingForm.state || !billingForm.postcode) {
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
          city: normalizedCity,
          state: billingForm.state,
          postcode: billingForm.postcode,
          country: billingForm.country,
          phone: session?.user?.phone || '',
          email: session?.user?.email || '',
          is_default: false,
          label: normalizedCity
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success(isEditing ? 'Address updated successfully!' : 'Billing address saved successfully!')

        // For new addresses, redirect to pricing page so user can select a subscription plan
        // Only redirect to checkout if a specific plan is already selected (paymentType exists)
        if (!isEditing && result.address?.id) {
          if (paymentType && planPrice) {
            // If coming from pricing page with a plan already selected, go to checkout
            const checkoutUrl = `/checkout?addressId=${result.address.id}&planType=${paymentType}&planPrice=${planPrice}`
            router.push(checkoutUrl)
            return
          } else {
            // First time user - redirect to pricing page to select a plan
            // Store the new address ID so pricing page can pass it to checkout
            sessionStorage.setItem('pendingAddressId', result.address.id)
            localStorage.setItem('pendingAddressId', result.address.id)
            toast.success('Now select your subscription plan!')
            router.push('/pricing')
            return
          }
        }

        // Stay on the page for both new addresses and edits
        // Store the address ID and location before resetting
        const addressId = isEditing ? editingAddressId : result.address?.id
        const addressLocation = normalizedCity

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
          postcode: ''
        })

        // Hide form
        setShowAddressForm(false)
        setEditingAddressId(null)

        // Set the current location tab to the address's location
        if (addressLocation) {
          setSelectedLocationTab(addressLocation)
        }

        // Expand the address accordion to show it's been created/updated
        if (addressId) {
          setExpandedAddresses(prev =>
            prev.includes(addressId) ? prev : [...prev, addressId]
          )
        }
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex flex-col sm:flex-row items-center sm:space-x-3 w-full sm:w-auto">
              {/* Profile Photo Display with Edit Button */}
              <div className="flex-shrink-0">
                <ProfilePhotoUpload
                  currentPhotoUrl={currentProfilePhotoUrl}
                  onPhotoUpdate={handleProfilePhotoUpdate}
                  onPhotoDelete={handleProfilePhotoDelete}
                  size="sm"
                  editable={true}
                />
              </div>

              <div className="flex flex-col justify-center text-center sm:text-left mt-1.5 sm:mt-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5">
                  {session.user?.name || 'Welcome'}
                </h1>
                <p className="text-xs text-gray-600 flex items-center justify-center sm:justify-start gap-1.5">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{session.user?.email}</span>
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
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
      <main className={`container mx-auto px-4 sm:px-6 lg:px-8 py-8 ${showAddressForm ? 'max-w-6xl' : 'max-w-5xl'}`}>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-2">
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
              value="downloads"
              className="flex-1 min-w-[140px] sm:flex-none lg:flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50 data-[state=active]:border-blue-600 data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-sm transition-all duration-200 text-sm sm:text-base"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Demo Version</span>
              <span className="sm:hidden">Demo</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            {/* Affiliate Referral Info - Only show if pending */}
            {referralInfo && referralInfo.status === 'pending' && (
              <div className="py-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Package className="h-4 w-4" />
                  Affiliate Referral Information
                </h3>
                <p className="text-xs text-gray-500 mb-2">
                  You were referred by an affiliate partner. Complete your payment to activate your account!
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
                  <div className="flex items-center gap-4 text-xs text-gray-700 mb-1.5">
                    <div>
                      <span className="text-gray-600">Customer ID:</span>{' '}
                      <span className="font-semibold text-gray-900">{referralInfo.customerId}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Referral Code:</span>{' '}
                      <span className="font-semibold text-gray-900">{referralInfo.referralCode}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>This information will be hidden once your payment is completed</span>
                  </p>
                </div>
              </div>
            )}

            <Card className="shadow-lg border-0">
              <CardHeader className="bg-blue-600/15 border-b py-2 sm:py-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <User className="h-4 w-4 text-blue-600" />
                      Account Information
                    </CardTitle>
                    <CardDescription className="text-xs">Your personal details and account information</CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs w-fit">
                    {session.user?.role ? session.user.role.charAt(0).toUpperCase() + session.user.role.slice(1) : 'User'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Account Status - At the top */}
                <div className="mb-3 pb-3 border-b border-gray-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700">Account Status</p>
                      <p className="text-xs sm:text-sm text-gray-500">Your account is active and in good standing</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm">Active</Badge>
                  </div>
                </div>

                {/* Full Name, Email, Phone - Same row with equal width */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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
                </div>

                {/* Service Agreement Section - Inside same card */}
                <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">Pricing Agreement</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6">
                    Download, Sign and Upload your Pricing Agreement Document
                  </p>

                  {isLoadingAgreement ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600 mr-2" />
                      <span className="text-gray-600">Loading agreement status...</span>
                    </div>
                  ) : (
                    <div>
                      {/* Horizontal Progress Steps - 3 Steps */}
                      <div className="flex items-center justify-center mb-8">
                        {/* Step 1: Download */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                            style={{
                              backgroundColor: agreementStatus?.hasDownloaded ? '#22c55e' : 'rgb(219, 230, 252)',
                              borderColor: agreementStatus?.hasDownloaded ? '#22c55e' : '#3b82f6',
                              color: agreementStatus?.hasDownloaded ? 'white' : '#3b82f6'
                            }}
                          >
                            {agreementStatus?.hasDownloaded ? (
                              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                          </div>
                          <p className={`mt-2 text-xs sm:text-sm font-medium ${
                            agreementStatus?.hasDownloaded ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            Download
                          </p>
                        </div>

                        {/* Connecting Line 1 */}
                        <div
                          className={`h-0.5 w-12 sm:w-20 md:w-28 mx-2 sm:mx-3 transition-all duration-300 ${
                            agreementStatus?.hasDownloaded ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          style={{ marginBottom: '24px' }}
                        />

                        {/* Step 2: Upload */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                            style={{
                              backgroundColor: agreementStatus?.hasUploaded
                                ? '#22c55e'
                                : agreementStatus?.hasDownloaded
                                  ? 'rgb(219, 230, 252)'
                                  : '#f3f4f6',
                              borderColor: agreementStatus?.hasUploaded
                                ? '#22c55e'
                                : agreementStatus?.hasDownloaded
                                  ? '#3b82f6'
                                  : '#d1d5db',
                              color: agreementStatus?.hasUploaded
                                ? 'white'
                                : agreementStatus?.hasDownloaded
                                  ? '#3b82f6'
                                  : '#9ca3af'
                            }}
                          >
                            {agreementStatus?.hasUploaded ? (
                              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                          </div>
                          <p className={`mt-2 text-xs sm:text-sm font-medium ${
                            agreementStatus?.hasUploaded
                              ? 'text-green-600'
                              : agreementStatus?.hasDownloaded
                                ? 'text-gray-900'
                                : 'text-gray-400'
                          }`}>
                            Upload
                          </p>
                        </div>

                        {/* Connecting Line 2 */}
                        <div
                          className={`h-0.5 w-12 sm:w-20 md:w-28 mx-2 sm:mx-3 transition-all duration-300 ${
                            agreementStatus?.hasUploaded ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                          style={{ marginBottom: '24px' }}
                        />

                        {/* Step 3: Completed */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                            style={{
                              backgroundColor: agreementStatus?.hasUploaded ? '#22c55e' : '#f3f4f6',
                              borderColor: agreementStatus?.hasUploaded ? '#22c55e' : '#d1d5db',
                              color: agreementStatus?.hasUploaded ? 'white' : '#9ca3af'
                            }}
                          >
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <p className={`mt-2 text-xs sm:text-sm font-medium ${
                            agreementStatus?.hasUploaded ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            Completed
                          </p>
                        </div>
                      </div>

                      {/* Step Content */}
                      {!agreementStatus?.hasDownloaded ? (
                        /* Step 1 Content: Choose & Download */
                        <div className="text-center">
                          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-4">
                            {/* Option 1: Digital Signature */}
                            <div
                              onClick={() => setSigningMethod('digital')}
                              className="flex-1 rounded-lg p-3 border-2 cursor-pointer transition-all"
                              style={{
                                backgroundColor: signingMethod === 'digital' ? 'rgb(219, 230, 252)' : '#f9fafb',
                                borderColor: signingMethod === 'digital' ? '#3b82f6' : '#e5e7eb'
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                  style={{
                                    borderColor: signingMethod === 'digital' ? '#3b82f6' : '#9ca3af',
                                    backgroundColor: signingMethod === 'digital' ? '#3b82f6' : 'transparent'
                                  }}
                                >
                                  {signingMethod === 'digital' && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </div>
                                <span className={`text-sm font-medium ${signingMethod === 'digital' ? 'text-blue-700' : 'text-gray-700'}`}>
                                  Digital Signature
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 text-left ml-6">Use DSC token to sign digitally</p>
                            </div>

                            {/* Option 2: Manual Signature */}
                            <div
                              onClick={() => setSigningMethod('manual')}
                              className="flex-1 rounded-lg p-3 border-2 cursor-pointer transition-all"
                              style={{
                                backgroundColor: signingMethod === 'manual' ? 'rgb(219, 230, 252)' : '#f9fafb',
                                borderColor: signingMethod === 'manual' ? '#3b82f6' : '#e5e7eb'
                              }}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                  style={{
                                    borderColor: signingMethod === 'manual' ? '#3b82f6' : '#9ca3af',
                                    backgroundColor: signingMethod === 'manual' ? '#3b82f6' : 'transparent'
                                  }}
                                >
                                  {signingMethod === 'manual' && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                  )}
                                </div>
                                <span className={`text-sm font-medium ${signingMethod === 'manual' ? 'text-blue-700' : 'text-gray-700'}`}>
                                  Manual Signature
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 text-left ml-6">Print, sign & scan as PDF</p>
                            </div>
                          </div>

                          {/* Download Button */}
                          <Button
                            onClick={handleAgreementDownload}
                            disabled={!signingMethod}
                            className={`px-8 ${
                              signingMethod
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-gray-400'
                            } text-white`}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Agreement
                          </Button>
                        </div>
                      ) : !agreementStatus?.hasUploaded ? (
                        /* Step 2 Content: Upload signed document */
                        <div>
                          {/* File Upload Option */}
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-w-md mx-auto">
                            <div
                              className="flex flex-col items-center justify-center h-[100px] border-2 border-dashed border-gray-300 rounded-lg bg-white hover:border-purple-400 transition-colors cursor-pointer"
                              onClick={() => agreementFileInputRef.current?.click()}
                            >
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="text-xs text-gray-600">Click to upload signed document</p>
                              <p className="text-[10px] text-gray-400">PDF only, max 5MB</p>
                            </div>
                            <input
                              ref={agreementFileInputRef}
                              type="file"
                              accept="application/pdf"
                              onChange={handleAgreementUpload}
                              className="hidden"
                              id="agreement-upload"
                            />
                            <Button
                              onClick={() => agreementFileInputRef.current?.click()}
                              disabled={isUploadingAgreement}
                              className={`w-full mt-3 ${
                                signingMethod === 'digital'
                                  ? 'bg-purple-600 hover:bg-purple-700'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              } text-white`}
                              size="sm"
                            >
                              {isUploadingAgreement ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Select PDF File
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* Step 3 Content: Completed */
                        <div className="text-center">
                          <div className="inline-flex items-center gap-3 p-4 rounded-lg bg-green-100 border border-green-300">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <div className="text-left">
                              <p className="font-semibold text-green-800">Agreement Completed</p>
                              <p className="text-sm text-green-700">
                                Signed on {formatDate(agreementStatus.uploadedAt || '')}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Address Tab */}
          <TabsContent value="billing">
            <style jsx global>{`
              .billing-form input::placeholder,
              .billing-form textarea::placeholder {
                color: #9CA3AF !important;
                opacity: 1;
                font-size: 0.9rem !important;
              }
              .billing-form input {
                background-color: #F9FAFB !important;
                border-color: #D1D5DB !important;
                padding: 20px !important;
              }
              .billing-form select {
                background-color: #F9FAFB !important;
                border-color: #D1D5DB !important;
              }
              .billing-form input:focus,
              .billing-form select:focus {
                background-color: #FFFFFF !important;
                border-color: #3B82F6 !important;
              }
              .billing-form select {
                font-size: 0.875rem !important;
              }
            `}</style>

            {/* Show selected plan banner when coming from pricing page */}
            {paymentType && planPrice && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">
                      Selected Plan: {paymentType === 'monthly' ? 'Monthly License' : paymentType === 'annual' ? 'Annual License' : paymentType === 'onetime' ? 'One Time Payment' : 'Installment Plan'}
                    </p>
                    <p className="text-sm text-blue-700">
                      ₹{parseInt(planPrice).toLocaleString()} {paymentType === 'monthly' ? '/month' : paymentType === 'annual' ? '/year' : paymentType === 'installment' ? '× 10 months' : '(Lifetime)'}
                      {paymentType === 'onetime' && ' • 10% Discount Applied'}
                    </p>
                  </div>
                  <div className="text-sm text-blue-600">
                    Select an address below to continue
                  </div>
                </div>
              </div>
            )}

            <div className={`grid gap-6 ${savedAddresses.length === 0 ? 'grid-cols-1' : showAddressForm ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Left Column - Saved Addresses (only show if user has addresses) */}
              {savedAddresses.length > 0 && (
              <Card className="shadow-lg border-0 h-fit">
                <CardHeader className="bg-blue-600/15 border-b py-2 sm:py-3">
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
                          postcode: ''
                        })
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Billing Address
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 sm:pt-3">
                  {loadingAddresses ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                      <span className="text-gray-600">Loading addresses...</span>
                    </div>
                  ) : savedAddresses.length > 0 ? (
                    <div className="space-y-2">
                      {/* Location Tabs - One tab per unique location */}
                      {(() => {
                        // Get unique locations
                        const uniqueLocations = [...new Set(savedAddresses.map(addr => addr.label || addr.city))]

                        // Find the first location with "Not Ordered" addresses
                        const firstNotOrderedLocation = uniqueLocations.find(location => {
                          return savedAddresses.some(
                            a => (a.label || a.city) === location && !purchasedAddressIds.includes(a.id)
                          )
                        })

                        // Default to first location with "Not Ordered", or first location if all are ordered
                        const currentLocation = selectedLocationTab || firstNotOrderedLocation || uniqueLocations[0]

                        return (
                          <>
                            <div className="flex gap-2 pb-2 border-b border-gray-200 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                              {uniqueLocations.map((location) => {
                                const isSelected = currentLocation === location
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
                                  </button>
                                )
                              })}
                            </div>

                            {/* Show Addresses for Selected Location - Flat card view */}
                            <div className="space-y-3 mt-3">
                              {(() => {
                                const locationAddresses = savedAddresses.filter(
                                  address => (address.label || address.city) === currentLocation
                                )

                                return locationAddresses.map((address) => {
                                  const isBeingEdited = editingAddressId === address.id
                                  const addrPaymentStatus = getAddressPaymentStatus(address.id)
                                  const hasInitialPayment = !!addrPaymentStatus?.initialPaymentDate

                                  // Get plan type from order history for this address location
                                  const addressLocation = address.label || address.city
                                  const addressOrders = userData?.orderHistory?.filter(
                                    order => order.location === addressLocation
                                  ) || []
                                  const addressPlanType = addressOrders.length > 0 ? addressOrders[0].planType : null

                                  // Get subscription for this address
                                  const addressSubscription = getAddressSubscription(address.id)
                                  const nextDueDate = addressSubscription?.next_due_date
                                  const isMonthlyPlan = addressPlanType === 'monthly'
                                  const isOverdue = isDueDatePast(nextDueDate)

                                  // Check if this address qualifies for 10% discount (2nd or later address)
                                  const addressIndex = savedAddresses.findIndex(a => a.id === address.id)
                                  const isSecondOrMoreAddress = addressIndex >= 1

                                  return (
                                    <div
                                      key={address.id}
                                      className={`rounded-xl border transition-all p-4 ${
                                        isBeingEdited
                                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                          : hasInitialPayment
                                            ? 'border-green-300 bg-white'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                      }`}
                                    >
                                      {/* Main Row - All info in single line on desktop */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        {/* Left - Firm Name & Status */}
                                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                          <h3 className="font-bold text-gray-900 text-lg truncate">{address.firm_name}</h3>
                                          {hasInitialPayment ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200 shrink-0">
                                              <CheckCircle className="w-3 h-3" />
                                              Paid
                                            </span>
                                          ) : (
                                            <>
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 shrink-0">
                                                Not Ordered
                                              </span>
                                              {isSecondOrMoreAddress && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 border border-green-200 shrink-0">
                                                  10% Discount
                                                </span>
                                              )}
                                            </>
                                          )}
                                        </div>

                                        {/* Right - Status/Actions */}
                                        <div className="flex items-center gap-2 shrink-0">
                                          {hasInitialPayment ? (
                                            <div className="flex items-center gap-1.5 text-green-600">
                                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                              <span className="font-medium text-sm">Active</span>
                                            </div>
                                          ) : (
                                            <>
                                              <button
                                                type="button"
                                                onClick={() => handleEditAddress(address)}
                                                className="text-gray-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit"
                                              >
                                                <Pencil className="w-4 h-4" />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  if (paymentType && planPrice) {
                                                    sessionStorage.setItem('checkoutAddressId', address.id)
                                                    localStorage.setItem('checkoutAddressId', address.id)
                                                    router.push(`/checkout?addressId=${address.id}&planType=${paymentType}&planPrice=${planPrice}`)
                                                  } else {
                                                    sessionStorage.setItem('pendingAddressId', address.id)
                                                    localStorage.setItem('pendingAddressId', address.id)
                                                    router.push('/pricing')
                                                  }
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-lg transition-colors text-sm"
                                              >
                                                {paymentType ? 'Go to Checkout' : 'Order Now'}
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      {/* Details Row */}
                                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                                        {address.gst_no && (
                                          <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">GST: {address.gst_no}</span>
                                        )}
                                        <span className="truncate">{address.address}, {address.city}, {address.state} - {address.postcode}</span>
                                      </div>

                                      {/* Subscription Info - Compact inline for paid */}
                                      {hasInitialPayment && addressPlanType && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                          <div className="flex items-center justify-between gap-4">
                                            {/* Left - Plan details */}
                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                                              {/* Plan */}
                                              <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm">
                                                  <span className="font-medium text-gray-900">
                                                    {addressPlanType === 'monthly' && 'Monthly'}
                                                    {addressPlanType === 'annual' && 'Annual'}
                                                    {addressPlanType === 'onetime' && 'Lifetime'}
                                                    {addressPlanType === 'installment' && 'Installment'}
                                                    {!['monthly', 'annual', 'onetime', 'installment'].includes(addressPlanType) && 'Monthly'}
                                                  </span>
                                                  <span className="text-gray-500 ml-1">
                                                    {addressPlanType === 'monthly' && '₹100/mo'}
                                                    {addressPlanType === 'annual' && '₹1,000/yr'}
                                                    {addressPlanType === 'onetime' && '₹1,00,000'}
                                                    {addressPlanType === 'installment' && '₹10,000×10'}
                                                    {!['monthly', 'annual', 'onetime', 'installment'].includes(addressPlanType) && '₹100/mo'}
                                                  </span>
                                                </span>
                                              </div>

                                              {/* Due Date */}
                                              {addressPlanType !== 'onetime' && nextDueDate && (
                                                <div className="flex items-center gap-2">
                                                  <Clock className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                                                  <span className="text-sm">
                                                    <span className={isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                                      {isOverdue ? 'Overdue: ' : 'Due: '}
                                                      {formatNextDueDate(nextDueDate)}
                                                    </span>
                                                  </span>
                                                  {isOverdue && (
                                                    <button
                                                      onClick={() => {
                                                        sessionStorage.setItem('checkoutAddressId', address.id)
                                                        localStorage.setItem('checkoutAddressId', address.id)
                                                        router.push(`/checkout?addressId=${address.id}&planType=${addressPlanType}&planPrice=${addressPlanType === 'monthly' ? 100 : addressPlanType === 'annual' ? 1000 : 10000}`)
                                                      }}
                                                      className="text-xs font-medium text-white bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded transition-colors"
                                                    >
                                                      Pay
                                                    </button>
                                                  )}
                                                </div>
                                              )}

                                              {/* Payments count */}
                                              <span className="text-sm text-gray-500">
                                                {addressOrders.length} payment{addressOrders.length !== 1 ? 's' : ''}
                                              </span>
                                            </div>

                                            {/* Right - Upgrade button (Monthly only) */}
                                            {isMonthlyPlan && (
                                              <button
                                                onClick={() => {
                                                  sessionStorage.setItem('checkoutAddressId', address.id)
                                                  localStorage.setItem('checkoutAddressId', address.id)
                                                  router.push(`/checkout?addressId=${address.id}&planType=annual&planPrice=1000&upgrade=true`)
                                                }}
                                                className="flex items-center gap-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                                              >
                                                <ArrowUpCircle className="w-4 h-4" />
                                                Upgrade to Annual
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })
                              })()}
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
              )}

              {/* Right Column - Add/Edit Form */}
              {(showAddressForm || savedAddresses.length === 0) && (
              <Card className="shadow-lg border-0 billing-form h-fit">
                <CardHeader className="bg-blue-600/15 border-b py-2 sm:py-3">
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
                          postcode: ''
                        })
                      }}
                      className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 p-0 rounded-full border border-gray-300 hover:border-gray-400 transition-all font-bold text-lg"
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
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {/* Firm Name */}
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">
                          Firm Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={billingForm.firmName}
                            onChange={(e) => handleBillingFormChange('firmName', e.target.value)}
                            placeholder="Enter your firm"
                            className="text-sm sm:text-base"
                          />
                      </div>

                      {/* GST No */}
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">
                          GST No <span className="text-red-400 text-xs">*</span>
                        </Label>
                        <Input
                            value={billingForm.gstNo}
                            onChange={(e) => handleBillingFormChange('gstNo', e.target.value)}
                            placeholder="GST No"
                            className="text-sm sm:text-base"
                            maxLength={20}
                          />
                      </div>

                      {/* Street Address */}
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">
                          Street Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={billingForm.address}
                            onChange={(e) => handleBillingFormChange('address', e.target.value)}
                            placeholder="Enter your street address"
                            className="text-sm sm:text-base"
                          />
                      </div>

                      {/* City/Location */}
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">
                          City/Location <span className="text-red-500">*</span>
                          <span className="text-gray-400 text-xs ml-1">(Branch location)</span>
                        </Label>
                        <Input
                          value={billingForm.city}
                          onChange={(e) => handleBillingFormChange('city', e.target.value)}
                          onBlur={handleLocationBlur}
                          placeholder="Enter city/location"
                          className="text-sm sm:text-base"
                        />
                      </div>

                      {/* Postcode/Zip */}
                      <div className="space-y-1">
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
                      <div className="space-y-1">
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
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700">
                          State/Province <span className="text-red-500">*</span>
                        </Label>
                        <select
                          value={billingForm.state}
                          onChange={(e) => handleBillingFormChange('state', e.target.value)}
                          className="w-full h-10 px-3 py-2 border rounded-md text-sm sm:text-base border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                        >
                          <option value="">Select State</option>
                          {(statesByCountry[billingForm.country] || []).map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      {/* Only show Clear button when adding new address, not when editing */}
                      {!editingAddressId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setBillingForm({
                              firmName: '',
                              gstNo: '',
                              address: '',
                              city: '',
                              country: 'India',
                              state: '',
                              postcode: ''
                            })
                          }}
                          className="border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-800 px-6"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear
                        </Button>
                      )}
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
          <TabsContent value="orders" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-blue-600/15 border-b py-2 sm:py-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <ShoppingBag className="h-4 w-4 text-green-600" />
                      Order History
                    </CardTitle>
                    <CardDescription className="text-xs">View and download your invoices</CardDescription>
                  </div>
                  {userData && userData.totalOrders > 0 && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
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
                  <div className="space-y-3">
                    {(() => {
                      const groupedOrders = groupOrdersByLocation(userData.orderHistory)
                      const locationKeys = Object.keys(groupedOrders)

                      return locationKeys.map((location) => {
                        const orders = groupedOrders[location]
                        const locationTotal = orders.reduce((sum, order) => sum + order.total, 0)

                        return (
                          <div key={location} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                            {/* Location Header - Compact */}
                            <div className="bg-blue-50 px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-blue-600" />
                                <span className="font-semibold text-blue-800">{location}</span>
                                <span className="text-xs text-gray-500">({orders.length})</span>
                              </div>
                              <span className="text-green-700 font-semibold text-sm">₹{formatCurrency(locationTotal).replace('₹', '')}</span>
                            </div>

                            {/* Orders Table - Compact */}
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 text-xs text-gray-600">
                                <tr>
                                  <th className="text-left px-3 py-1.5 font-medium">Invoice</th>
                                  <th className="text-left px-3 py-1.5 font-medium">Plan</th>
                                  <th className="text-left px-3 py-1.5 font-medium hidden sm:table-cell">Date</th>
                                  <th className="text-right px-3 py-1.5 font-medium">Amount</th>
                                  <th className="text-center px-3 py-1.5 font-medium w-20"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                  <tr key={order.invoiceNumber} className="hover:bg-gray-50/50">
                                    <td className="px-3 py-2">
                                      <span className="font-medium text-gray-900">#{order.invoiceNumber}</span>
                                      <span className="sm:hidden block text-xs text-gray-500 mt-0.5">{formatDate(order.paidAt)}</span>
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                                        {order.planType === 'monthly' && 'Monthly'}
                                        {order.planType === 'annual' && 'Annual'}
                                        {order.planType === 'onetime' && 'One Time'}
                                        {order.planType === 'installment' && 'Installment'}
                                        {!['monthly', 'annual', 'onetime', 'installment'].includes(order.planType) && 'Monthly'}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 text-gray-600 hidden sm:table-cell">{formatDate(order.paidAt)}</td>
                                    <td className="px-3 py-2 text-right">
                                      <span className="font-semibold text-green-700">₹{formatCurrency(order.total).replace('₹', '')}</span>
                                      {order.discountAmount > 0 && (
                                        <span className="text-xs text-green-600 ml-1">(-{order.discountPercentage}%)</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <button
                                        onClick={() => handleDownloadInvoice(order.invoiceNumber)}
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1.5 rounded"
                                        title="Download Invoice"
                                      >
                                        <Download className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      })
                    })()}
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

          {/* Downloads Tab - Demo Version */}
          <TabsContent value="downloads" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-blue-600\15 border-b py-2 sm:py-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Download className="h-4 w-4 text-green-600" />
                    Demo Version Downloads
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Manage your Demo Version purchases and downloads
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {isLoadingDownloads ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : appDownloads.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold">Order ID</TableHead>
                          <TableHead className="font-semibold">Amount Paid</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appDownloads.map((download) => (
                          <TableRow key={download.id}>
                            <TableCell className="font-mono text-sm">{download.orderId}</TableCell>
                            <TableCell className="font-semibold">₹{download.amount.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(download.purchasedAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell>
                              {download.isDownloaded ? (
                                <div className="flex flex-col gap-1">
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 w-fit">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Downloaded
                                  </Badge>
                                  {download.downloadedAt && (
                                    <p className="text-xs text-gray-500">
                                      {new Date(download.downloadedAt).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 w-fit">
                                  <Download className="h-3 w-3 mr-1" />
                                  Ready to Download
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {download.isDownloaded ? (
                                <span className="text-xs text-gray-400">-</span>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleAppDownload(download)}
                                  disabled={downloadingId === download.id}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-8"
                                >
                                  {downloadingId === download.id ? (
                                    <>
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                      Downloading...
                                    </>
                                  ) : (
                                    <>
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </>
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Download className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm sm:text-base text-gray-600 mb-2">No Demo Version Purchased</p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-4">
                      Purchase the Demo Version to get access to PowerCA training content for one month.
                    </p>
                    <Button asChild variant="outline" className="border-green-200 text-green-600 hover:bg-green-50 text-sm">
                      <Link href="/app-download">
                        Get Demo Version
                      </Link>
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
