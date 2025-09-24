"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RefreshCw, Download, Users, UserCheck, Clock, TrendingUp, Search, Eye, Edit, Trash2, Mail, Phone, User, Building, GraduationCap } from "lucide-react"
import { format } from "date-fns"

interface Registration {
  id: string
  name: string
  email: string
  username: string
  phone: string
  role: string
  professional_type?: string
  membership_no?: string
  registration_no?: string
  institute_name?: string
  created_at: string
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    professionals: 0,
    students: 0,
    today: 0
  })

  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchRegistrations = async () => {
    if (!isClient) {
      console.log('Not fetching - client not ready')
      return
    }

    console.log('Fetching registrations...')
    setLoading(true)
    setError(null)
    try {
      // Fetch registrations from the API that uses admin access
      const response = await fetch('/api/registrations')
      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`Failed to fetch registrations: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Fetched registrations from API:', data)
      console.log('Number of registrations:', Array.isArray(data) ? data.length : 0)

      // Transform the data to match our interface - handle missing fields with empty strings
      const transformedRegistrations: Registration[] = (data || []).map((reg: any) => ({
        id: reg.id || '',
        name: reg.name || '',
        email: reg.email || '',
        username: reg.username || '',
        phone: reg.phone || '',
        role: reg.role || reg.user_type || 'subscriber',
        professional_type: reg.professional_type || '',
        membership_no: reg.membership_no || reg.membership_number || '',
        registration_no: reg.registration_no || reg.registration_number || '',
        institute_name: reg.institute_name || '',
        created_at: reg.created_at || new Date().toISOString()
      }))

      setRegistrations(transformedRegistrations)

      // Calculate stats
      const today = new Date().toISOString().split('T')[0]
      setStats({
        total: transformedRegistrations.length,
        professionals: transformedRegistrations.filter(r => r.role === 'Professional' || r.professional_type).length,
        students: transformedRegistrations.filter(r => r.role === 'Student').length,
        today: transformedRegistrations.filter(r => r.created_at?.startsWith(today)).length
      })
      setLoading(false)
    } catch (err) {
      console.error('Error fetching registrations:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isClient) {
      fetchRegistrations()
    }
  }, [isClient])

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Username', 'Phone', 'Role', 'Professional Type', 'Membership No', 'Registration No', 'Institute', 'Created At']
    const csvContent = [
      headers.join(','),
      ...registrations.map(reg => [
        reg.name,
        reg.email,
        reg.username,
        reg.phone || '',
        reg.role,
        reg.professional_type || '',
        reg.membership_no || '',
        reg.registration_no || '',
        reg.institute_name || '',
        format(new Date(reg.created_at), 'yyyy-MM-dd HH:mm:ss')
      ].map(field => `"${field}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `registrations_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || reg.role === roleFilter

    return matchesSearch && matchesRole
  })

  if (!isClient || loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-slate-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-700 rounded"></div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Registrations</h1>
            <p className="text-slate-400">Manage and view all user registrations from your website</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700" onClick={fetchRegistrations}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Registrations</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Professionals</p>
                  <p className="text-2xl font-bold">{stats.professionals}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-bold">{stats.students}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Today's Registrations</p>
                  <p className="text-2xl font-bold">{stats.today}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Registration Details</CardTitle>
                <CardDescription>
                  View detailed information about all registered users
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRegistrations}
                  disabled={loading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  disabled={loading || registrations.length === 0}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, username or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">Loading registrations...</p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No registrations found
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No registrations match your search criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NAME</TableHead>
                    <TableHead>EMAIL</TableHead>
                    <TableHead>USERNAME</TableHead>
                    <TableHead>PHONE</TableHead>
                    <TableHead>PROFESSIONAL TYPE</TableHead>
                    <TableHead>MEMBERSHIP NO</TableHead>
                    <TableHead>ROLE</TableHead>
                    <TableHead>DATE</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">{registration.name || '-'}</TableCell>
                      <TableCell>{registration.email || '-'}</TableCell>
                      <TableCell>{registration.username || '-'}</TableCell>
                      <TableCell>{registration.phone || '-'}</TableCell>
                      <TableCell>{registration.professional_type || '-'}</TableCell>
                      <TableCell>{registration.membership_no || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={registration.role === 'Professional' ? 'default' : registration.role === 'Student' ? 'secondary' : 'outline'}>
                          {registration.role || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {registration.created_at ? format(new Date(registration.created_at), 'dd MMM yyyy') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {registrations.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredRegistrations.length} of {registrations.length} total registrations
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  )
}