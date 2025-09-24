"use client"

import { useState, useEffect } from "react"
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  Calendar,
  UserCheck,
  Settings,
  BarChart3,
  Home,
  FileText,
  UserPlus,
  Shield,
  Menu,
  X,
  LogOut
} from "lucide-react"

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [bookings, setBookings] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [users, setUsers] = useState([])
  const [affiliates, setAffiliates] = useState([])
  const [referralDetails, setReferralDetails] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [debugInfo, setDebugInfo] = useState(null)

  const supabase = createClient()

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "registrations", label: "Registrations", icon: FileText },
    { id: "affiliates", label: "Affiliates", icon: UserCheck },
    { id: "referrals", label: "Referral Details", icon: Users },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  // Check if already logged in
  useEffect(() => {
    const adminSession = localStorage.getItem("admin_logged_in")
    if (adminSession === "true") {
      setIsLoggedIn(true)
      fetchData()
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "admin" && password === "admin123") {
      setIsLoggedIn(true)
      localStorage.setItem("admin_logged_in", "true")
      setError("")
      fetchData()
    } else {
      setError("Invalid username or password")
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem("admin_logged_in")
    setBookings([])
    setRegistrations([])
  }

  const testConnection = async () => {
    try {
      console.log("🔍 Testing connection via debug API...")
      const response = await fetch('/api/debug/supabase')
      const debugData = await response.json()
      setDebugInfo(debugData)
      console.log("🔍 Debug API response:", debugData)
    } catch (error) {
      console.error("Debug API error:", error)
      setDebugInfo({ error: "Failed to test connection" })
    }
  }

  const fetchData = async () => {
    setLoading(true)
    setError("")
    console.log("🔄 Starting data fetch from Supabase...")

    // Debug environment variables
    console.log("🔧 Environment check:", {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set',
      supabaseKeyExists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      isClient: typeof window !== 'undefined'
    })

    try {
      // Test Supabase connection first
      console.log("🔗 Testing Supabase connection...")
      const { data: connectionTest, error: connectionError } = await supabase
        .from('bookings')
        .select('count', { count: 'exact', head: true })

      if (connectionError) {
        console.error("❌ Supabase connection failed:", connectionError)
        setError(`Supabase connection failed: ${connectionError.message}`)
        return
      }

      console.log("✅ Supabase connection successful")

      // Fetch bookings from Supabase
      console.log("📅 Fetching bookings...")
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })

      if (bookingError) {
        console.error("❌ Bookings fetch error:", bookingError)
        console.error("Error details:", {
          code: bookingError.code,
          message: bookingError.message,
          details: bookingError.details,
          hint: bookingError.hint
        })
        setBookings([])
      } else {
        console.log("✅ Bookings fetched successfully:", bookingData?.length || 0, "records")
        console.log("📊 Bookings data sample:", bookingData?.slice(0, 2))
        setBookings(bookingData || [])
      }

      // Try multiple approaches to get user data - prioritizing working tables
      console.log("👤 Fetching user data...")

      // First try the registrations API endpoint (uses admin access)
      console.log("🔍 Fetching registrations from API...")
      let regData = null
      let regError = null

      try {
        const response = await fetch('/api/registrations')
        if (response.ok) {
          regData = await response.json()
          console.log("✅ Registrations fetched from API:", regData?.length || 0, "records")
        } else {
          regError = { message: 'Failed to fetch from API' }
        }
      } catch (err) {
        regError = err
      }

      let userData = null
      let userSource = ""

      if (regError) {
        console.error("❌ Registrations table error:", regError)
        console.error("Registrations error details:", {
          code: regError.code,
          message: regError.message,
          details: regError.details,
          hint: regError.hint
        })

        // Try 'users' table as fallback
        console.log("🔍 Trying 'users' table as fallback...")
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (usersError) {
          console.error("❌ Users table error:", usersError)
          console.error("Users error details:", {
            code: usersError.code,
            message: usersError.message,
            details: usersError.details,
            hint: usersError.hint
          })

          // Try 'profiles' table as another fallback
          console.log("🔍 Trying 'profiles' table as another fallback...")
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

          if (profilesError) {
            console.error("❌ Profiles table error:", profilesError)
            console.error("Profiles error details:", {
              code: profilesError.code,
              message: profilesError.message,
              details: profilesError.details,
              hint: profilesError.hint
            })

            // Use demo data as final fallback
            console.log("🎭 Using demo data as final fallback")
            const demoUsers = [
              { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "subscriber", created_at: "2024-01-15" },
              { id: 2, name: "Bob Wilson", email: "bob@example.com", role: "subscriber", created_at: "2024-01-14" },
              { id: 3, name: "Carol Davis", email: "carol@example.com", role: "affiliate", created_at: "2024-01-13" },
              { id: 4, name: "David Lee", email: "david@example.com", role: "subscriber", created_at: "2024-01-12" }
            ]
            userData = demoUsers
            userSource = "demo"
          } else {
            console.log("✅ Profiles data fetched:", profilesData?.length || 0, "records")
            userData = profilesData
            userSource = "profiles"
          }
        } else {
          console.log("✅ Users data fetched:", usersData?.length || 0, "records")
          console.log("📊 Users data sample:", usersData?.slice(0, 2))
          userData = usersData
          userSource = "users"
        }
      } else {
        console.log("✅ Registrations data fetched:", regData?.length || 0, "records")
        console.log("📊 Registrations data sample:", regData?.slice(0, 2))

        // Use actual registration data from Supabase
        userData = regData || []
        userSource = "registrations"

        if (!regData || regData.length === 0) {
          console.log("📋 Registrations table is empty in Supabase")
        }
      }

      console.log(`📈 Using data from '${userSource}' table/source`)
      console.log("👥 Total users found:", userData?.length || 0)

      // Set the data
      setUsers(userData || [])
      setRegistrations(userData || [])

      // Fetch affiliates from the database (affiliate_profiles/affiliate_details table)
      console.log('📊 Fetching affiliates from database...')
      try {
        const affiliateResponse = await fetch('/api/admin/affiliates/list')
        if (affiliateResponse.ok) {
          const affiliateData = await affiliateResponse.json()
          console.log('✅ Affiliates fetched from database:', affiliateData.affiliates?.length || 0, 'from', affiliateData.source)
          setAffiliates(affiliateData.affiliates || [])
        } else {
          // Fallback to filtering from userData
          const affiliatesData = userData?.filter((user: any) => {
            const role = user.role
            return role === 'Affiliate' || role === 'affiliate' || user.is_affiliate === true
          }) || []
          setAffiliates(affiliatesData)
        }
      } catch (error) {
        console.error('Error fetching affiliates:', error)
        // Fallback to filtering from userData
        const affiliatesData = userData?.filter((user: any) => {
          const role = user.role
          return role === 'Affiliate' || role === 'affiliate' || user.is_affiliate === true
        }) || []
        setAffiliates(affiliatesData)
      }

      // Log affiliate status for debugging
      console.log('👥 Total affiliates loaded:', affiliates.length)

      // Fetch referral details
      console.log('📊 Fetching referral details...')
      try {
        const referralResponse = await fetch('/api/admin/referrals/list')
        if (referralResponse.ok) {
          const referralData = await referralResponse.json()
          console.log('✅ Referrals fetched:', referralData.referrals?.length || 0, 'records')
          setReferralDetails(referralData.referrals || [])
        }
      } catch (error) {
        console.error('Error fetching referral details:', error)
        setReferralDetails([])
      }

      console.log("✅ Data fetch completed successfully")
      console.log("📊 Final counts:", {
        bookings: bookingData?.length || 0,
        users: userData?.length || 0,
        affiliates: affiliates?.length || 0,
        referrals: referralDetails?.length || 0
      })

    } catch (error) {
      console.error("💥 Critical error during data fetch:", error)
      setError(`Critical error loading data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      console.log("🏁 Data fetch process completed")
    }
  }

  // Login Form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Function to promote user to affiliate
  const promoteToAffiliate = async (userId: number | string, userEmail: string) => {
    try {
      console.log('🔄 Promoting user to affiliate:', userId, userEmail)

      // Since we're using demo data, we need to handle this differently
      // First, check if this is demo data or real Supabase data
      const isDemoData = typeof userId === 'number'

      if (isDemoData) {
        // For demo data, just update local state
        const updatedUsers = users.map(user =>
          user.id === userId ? { ...user, role: 'affiliate' } : user
        )
        setUsers(updatedUsers)
        setRegistrations(updatedUsers)

        // Update affiliates list
        const promotedUser = users.find(user => user.id === userId)
        if (promotedUser && !affiliates.find(a => a.id === userId)) {
          setAffiliates([...affiliates, { ...promotedUser, role: 'affiliate' }])
        }

        console.log('✅ Demo user promoted to affiliate (local state only)')
        alert('User promoted to affiliate successfully! (Demo mode - not saved to database)')
      } else {
        // For real Supabase data, use API endpoint to promote user
        try {
          const response = await fetch('/api/admin/promote-affiliate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: userId,
              userEmail: userEmail
            })
          })

          const data = await response.json()

          if (!response.ok) {
            console.error('❌ Error from API:', data)
            const errorMessage = data.details ? `${data.error}: ${data.details}` : data.error || 'Error promoting user to affiliate. Please try again.'
            alert(errorMessage)
            return
          }

          console.log('✅ User successfully promoted to affiliate:', data)
          await fetchData() // Refresh data
          alert('User successfully promoted to affiliate!')
        } catch (error) {
          console.error('❌ API call failed:', error)
          alert('An error occurred while promoting the user. Please try again.')
        }
      }
    } catch (error) {
      console.error('💥 Critical error:', error)
      alert('An error occurred while promoting the user.')
    }
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Total Bookings</h3>
                    <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
                    <p className="text-3xl font-bold text-green-600">{users.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <UserCheck className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Affiliates</h3>
                    <p className="text-3xl font-bold text-purple-600">{affiliates.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-indigo-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Referrals</h3>
                    <p className="text-3xl font-bold text-indigo-600">{referralDetails.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Registrations</h3>
                    <p className="text-3xl font-bold text-orange-600">{registrations.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
                </div>
                <div className="p-6">
                  {bookings.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">{booking.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{booking.type || booking.service || 'Demo'}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.status || 'pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                </div>
                <div className="p-6">
                  {users.slice(0, 5).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'affiliate' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'bookings':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Bookings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Firm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking: any) => (
                    <tr key={booking.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {booking.name || 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {booking.email || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.phone || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.firm_name || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.date || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {booking.time || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-2">View</button>
                        <button className="text-green-600 hover:text-green-900 mr-2">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No bookings found
                </div>
              )}
            </div>
          </div>
        )

      case 'users':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'affiliate' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        {user.role === 'subscriber' && (
                          <button
                            onClick={() => promoteToAffiliate(user.id, user.email)}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Make Affiliate
                          </button>
                        )}
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'affiliates':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Affiliate Users</h3>
              <p className="text-sm text-gray-600 mt-1">View all affiliates and their referral counts</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referrals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {affiliates.map((affiliate: any) => (
                    <tr key={affiliate.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-purple-600">
                          {affiliate.affiliate_id || `AFF-${affiliate.id.toString().padStart(6, '0')}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {affiliate.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {affiliate.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-semibold text-lg">{affiliate.total_referrals || 0}</span>
                          <span className="text-xs text-gray-500 ml-1">/1</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {affiliate.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(affiliate.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View Profile</button>
                        <button className="text-red-600 hover:text-red-900">Deactivate</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'registrations':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">User Registrations</h3>
              <p className="text-sm text-gray-600 mt-1">
                {registrations.length === 0 ? "No registrations in database - showing demo data" : `Total: ${registrations.length} registrations`}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Professional Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Membership No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Institute Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center py-8 text-gray-500">
                        <div>
                          <p className="text-lg font-medium mb-2">No registrations found in database</p>
                          <p className="text-sm">When users register on your website, they will appear here</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    registrations.map((registration: any) => (
                      <tr key={registration.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {registration.name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {registration.email || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.username || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.phone || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.professional_type || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.membership_no || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.registration_no || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {registration.institute_name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            registration.role === 'affiliate' ? 'bg-purple-100 text-purple-800' :
                            registration.role === 'subscriber' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {registration.role || 'subscriber'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          {(registration.role === 'Student' || registration.role === 'Professional' || registration.role === 'subscriber') && (
                            <button
                              onClick={() => promoteToAffiliate(registration.id, registration.email)}
                              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs"
                            >
                              Affiliate
                            </button>
                          )}
                          {registration.role === 'Affiliate' && (
                            <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded">
                              Already Affiliate
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'referrals':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Affiliate Referral Details</h3>
              <p className="text-sm text-gray-600 mt-1">Complete list of all referrals made by affiliates</p>
            </div>
            <div className="overflow-x-auto">
              {referralDetails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-medium mb-2">No referrals yet</p>
                  <p className="text-sm">When affiliates refer customers, they will appear here</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Affiliate Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referred Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Converted Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referralDetails.map((referral: any) => (
                      <tr key={referral.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-purple-600">
                            {referral.affiliate_id || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {referral.affiliate_name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {referral.referred_name || 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {referral.referred_email || 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            referral.status === 'converted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {referral.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {referral.converted_at
                            ? new Date(referral.converted_at).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{referral.payment_amount || '0'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
              <p className="text-gray-600">Analytics features coming soon...</p>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </div>
        )

      default:
        return <div>Select a menu item</div>
    }
  }

  // Admin Dashboard with Sidebar
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h2 className="text-xl font-bold">Admin Panel</h2>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-700"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <IconComponent className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Welcome, Admin
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2">Loading data...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div className="font-semibold">Error:</div>
              <div>{error}</div>
              <button
                onClick={testConnection}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Test Supabase Connection
              </button>
            </div>
          )}

          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
              <div className="font-semibold mb-2">Debug Information:</div>
              <pre className="text-xs overflow-auto max-h-40 bg-white p-2 rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
              <button
                onClick={() => setDebugInfo(null)}
                className="mt-2 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                Hide Debug Info
              </button>
            </div>
          )}

          {!loading && renderContent()}
        </div>
      </div>
    </div>
  )
}