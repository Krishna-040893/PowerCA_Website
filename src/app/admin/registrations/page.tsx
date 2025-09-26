'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import {AdminPageWrapper  } from '@/components/admin/admin-page-wrapper'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow  } from '@/components/ui/table'
import {Badge  } from '@/components/ui/badge'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui/select'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger  } from '@/components/ui/dialog'
import {Loader2, RefreshCw, Download, Users, UserCheck, TrendingUp, Search, Eye, GraduationCap  } from 'lucide-react'
import { format } from 'date-fns'
import dynamic from 'next/dynamic'

// Dynamic import for heavy component
const EnhancedLeadInsights = dynamic(
  () => import('@/components/admin/EnhancedLeadInsights'),
  { loading: () => <div className="animate-pulse h-64 bg-gray-100 rounded-lg" />, ssr: false }
)

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

interface RawRegistrationData {
  id?: string
  name?: string
  email?: string
  username?: string
  phone?: string
  role?: string
  user_type?: string
  professional_type?: string
  membership_no?: string
  membership_number?: string
  registration_no?: string
  registration_number?: string
  institute_name?: string
  created_at?: string
}

export default function AdminRegistrationsPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser, getAuthHeaders } = useAdminAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    professionals: 0,
    students: 0,
    today: 0
  })

  const fetchRegistrations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/registrations', {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch registrations: ${response.statusText}`)
      }

      const data = await response.json()

      const transformedRegistrations: Registration[] = (data || []).map((reg: RawRegistrationData) => ({
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
    } catch (err) {
      console.error('Error fetching registrations:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations()
    }
  }, [isAuthenticated, fetchRegistrations])

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

    const blob = new Blob([csvContent], { type: 'text/csv; // Unused variable commented outcharset=utf-8;' })
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

    const matchesRole = roleFilter === 'all' || reg.role === roleFilter

    return matchesSearch && matchesRole
  })

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!isAuthenticated || !adminUser) {
    return null
  }

  return (
    <AdminPageWrapper
      title="User Registrations"
      description="View detailed information about all registered users"
      actions={
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
      }
    >
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Professionals</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.professionals}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.students}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Registrations</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
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
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, username or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
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
                      <TableHead>ACTIONS</TableHead>
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
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedRegistration(registration)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Registration Details</DialogTitle>
                                <DialogDescription>
                                  Complete information for {selectedRegistration?.name}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedRegistration && (
                                <div className="space-y-6">
                                  {/* HubSpot Lead Insights */}
                                  {selectedRegistration.email && (
                                    <div className="border-b pb-4">
                                      <EnhancedLeadInsights userEmail={selectedRegistration.email} />
                                    </div>
                                  )}

                                  {/* Registration Details */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Name</label>
                                      <p className="text-sm">{selectedRegistration.name || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Email</label>
                                      <p className="text-sm">{selectedRegistration.email || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Username</label>
                                      <p className="text-sm">{selectedRegistration.username || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Phone</label>
                                      <p className="text-sm">{selectedRegistration.phone || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Role</label>
                                      <p className="text-sm">{selectedRegistration.role || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Professional Type</label>
                                      <p className="text-sm">{selectedRegistration.professional_type || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Membership No</label>
                                      <p className="text-sm">{selectedRegistration.membership_no || '-'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-600">Registration No</label>
                                      <p className="text-sm">{selectedRegistration.registration_no || '-'}</p>
                                    </div>
                                    {selectedRegistration.institute_name && (
                                      <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-600">Institute</label>
                                        <p className="text-sm">{selectedRegistration.institute_name}</p>
                                      </div>
                                    )}
                                    <div className="col-span-2">
                                      <label className="text-sm font-medium text-gray-600">Registration Date</label>
                                      <p className="text-sm">
                                        {selectedRegistration.created_at
                                          ? format(new Date(selectedRegistration.created_at), 'dd MMM yyyy HH:mm:ss')
                                          : '-'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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
    </AdminPageWrapper>
  )
}