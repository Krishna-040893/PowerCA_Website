'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import {AdminPageWrapper  } from '@/components/admin/admin-page-wrapper'
import {Card, CardContent } from '@/components/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow  } from '@/components/ui/table'
import {Badge  } from '@/components/ui/badge'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui/select'
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger  } from '@/components/ui/dialog'
import {Loader2, RefreshCw, Download, Users, UserCheck, Search, Eye, GraduationCap, User, Mail, Phone, Trash2  } from 'lucide-react'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
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
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { AdminPagination } from '@/components/admin/admin-pagination'
import { formatPhone } from '@/lib/utils'

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
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    professionals: 0,
    students: 0,
    checkouts: 0,
    today: 0
  })

  const fetchRegistrations = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const authHeaders = getAuthHeaders()

      const response = await fetch('/api/registrations', {
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

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

      // Calculate stats (removed checkout count fetching)
      const today = new Date().toISOString().split('T')[0]
      setStats({
        total: transformedRegistrations.length,
        professionals: transformedRegistrations.filter(r => r.role === 'Professional' || r.professional_type).length,
        students: transformedRegistrations.filter(r => r.role === 'Student' || r.role === 'student').length,
        checkouts: 0,
        today: transformedRegistrations.filter(r => r.created_at?.startsWith(today)).length
      })
    } catch (err) {
      clearTimeout(timeoutId)
      // Only show error if it's not an abort error (which happens on component unmount)
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    } finally {
      setLoading(false)
    }

    // Return cleanup function
    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [isAuthenticated, getAuthHeaders])

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Track scroll position for showing/hiding footer action bar
  useEffect(() => {
    // Find the scrollable container
    const scrollContainer = document.querySelector('main.overflow-y-auto')

    const handleScroll = () => {
      if (scrollContainer) {
        // Show footer bar when scrolled more than 100px
        const scrollTop = scrollContainer.scrollTop
        setIsHeaderVisible(scrollTop < 100)
      }
    }

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
      // Check initial state
      handleScroll()
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Created At']
    const csvContent = [
      headers.join(','),
      ...registrations.map(reg => {
        return [
          reg.name,
          reg.email,
          reg.phone || '',
          reg.role,
          format(new Date(reg.created_at), 'yyyy-MM-dd HH:mm:ss')
        ].map(field => `"${field}"`).join(',')
      })
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
                         reg.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reg.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'all' || reg.role?.toLowerCase() === roleFilter.toLowerCase()

    return matchesSearch && matchesRole
  })

  const currentPageItems = filteredRegistrations
    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const allCurrentPageSelected = currentPageItems.length > 0 &&
    currentPageItems.every(item => selectedIds.has(item.id))

  // Selection handlers
  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      const currentPageIds = currentPageItems.map(r => r.id)
      setSelectedIds(new Set(currentPageIds))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean | 'indeterminate') => {
    const newSelected = new Set(selectedIds)
    if (checked === true) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return

    setIsDeleting(true)
    try {
      const authHeaders = getAuthHeaders()
      const response = await fetch('/api/registrations', {
        method: 'DELETE',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids: Array.from(selectedIds) })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete registrations')
      }

      toast.success(`Successfully deleted ${selectedIds.size} registration(s)`)
      setSelectedIds(new Set())
      fetchRegistrations()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete registrations')
    } finally {
      setIsDeleting(false)
    }
  }

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
      title="Registrations"
      description="View detailed information about all registered users"
      stats={[
        { label: 'Total', value: stats.total, color: 'bg-blue-100 text-blue-800' },
        { label: 'Professionals', value: stats.professionals, color: 'bg-green-100 text-green-800' },
        { label: 'Students', value: stats.students, color: 'bg-purple-100 text-purple-800' },
        { label: 'Today', value: stats.today, color: 'bg-orange-100 text-orange-800' }
      ]}
      actions={
        <div className="flex gap-2 flex-wrap items-center">
          {selectedIds.size > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete ({selectedIds.size})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Registrations</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedIds.size} registration(s)?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSelected}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
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
        {/* Main Content Card - Enhanced */}
        <Card className="shadow-sm border border-gray-100">
          {/* <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl font-bold">Registration Details</CardTitle>
                <CardDescription className="text-xs sm:text-sm mt-1">
                  View detailed information about all registered users
                </CardDescription>
              </div>
            </div>
          </CardHeader> */}
          <CardContent>
            {/* Search and Filter Controls - Enhanced Mobile */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name, email, phone or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px] h-10 border-gray-200">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
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
              <div className="text-center py-16">
                <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Registrations Found</h3>
                <p className="text-gray-500">No registrations match your search criteria</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={allCurrentPageSelected}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                            className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                          />
                        </TableHead>
                        <TableHead className="text-base font-bold">Name</TableHead>
                        <TableHead className="text-base font-bold">Email</TableHead>
                        <TableHead className="text-base font-bold">Phone</TableHead>
                        <TableHead className="text-base font-bold">Role</TableHead>
                        <TableHead className="text-base font-bold">Date</TableHead>
                        <TableHead className="text-base font-bold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations
                        .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                        .map((registration) => (
                        <TableRow key={registration.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.has(registration.id)}
                              onCheckedChange={(checked) => handleSelectOne(registration.id, checked)}
                              aria-label={`Select ${registration.name}`}
                              className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{registration.name || '-'}</TableCell>
                          <TableCell>{registration.email || '-'}</TableCell>
                          <TableCell>{formatPhone(registration.phone)}</TableCell>
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
                                  size="sm"
                                  onClick={() => setSelectedRegistration(registration)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white max-w-3xl rounded-xl">
                                <DialogHeader className="border-b pb-3">
                                  <DialogTitle className="text-lg font-bold">Registration Details</DialogTitle>
                                  <DialogDescription className="text-xs text-gray-500">
                                    Complete information for {selectedRegistration?.name}
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedRegistration && (
                                  <div className="space-y-4 pt-2">
                                    {/* User Info Section */}
                                    <div className="bg-blue-50 rounded-lg p-3">
                                      <h4 className="font-semibold text-sm text-blue-900 mb-2.5 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        User Information
                                      </h4>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="text-xs font-medium text-gray-600">Name</label>
                                          <p className="text-sm font-medium text-gray-900">{selectedRegistration.name || '-'}</p>
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-gray-600">Role</label>
                                          <p className="text-sm font-medium text-gray-900">{selectedRegistration.role || '-'}</p>
                                        </div>
                                        <div className="col-span-2">
                                          <label className="text-xs font-medium text-gray-600">Email</label>
                                          <p className="text-sm font-medium text-gray-900 break-all">{selectedRegistration.email || '-'}</p>
                                        </div>
                                        <div>
                                          <label className="text-xs font-medium text-gray-600">Phone</label>
                                          <p className="text-sm font-medium text-gray-900">{selectedRegistration.phone || '-'}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Professional Details Section */}
                                    {(selectedRegistration.professional_type || selectedRegistration.membership_no || selectedRegistration.registration_no) && (
                                      <div className="bg-green-50 rounded-lg p-3">
                                        <h4 className="font-semibold text-sm text-green-900 mb-2.5 flex items-center gap-2">
                                          <UserCheck className="h-4 w-4" />
                                          Professional Details
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                          {selectedRegistration.professional_type && (
                                            <div className="col-span-2">
                                              <label className="text-xs font-medium text-gray-600">Professional Type</label>
                                              <p className="text-sm font-medium text-gray-900">{selectedRegistration.professional_type}</p>
                                            </div>
                                          )}
                                          {selectedRegistration.membership_no && (
                                            <div>
                                              <label className="text-xs font-medium text-gray-600">Membership No</label>
                                              <p className="text-sm font-medium text-gray-900">{selectedRegistration.membership_no}</p>
                                            </div>
                                          )}
                                          {selectedRegistration.registration_no && (
                                            <div>
                                              <label className="text-xs font-medium text-gray-600">Registration No</label>
                                              <p className="text-sm font-medium text-gray-900">{selectedRegistration.registration_no}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Institute Section */}
                                    {selectedRegistration.institute_name && (
                                      <div className="bg-purple-50 rounded-lg p-3">
                                        <h4 className="font-semibold text-sm text-purple-900 mb-2.5 flex items-center gap-2">
                                          <GraduationCap className="h-4 w-4" />
                                          Institute
                                        </h4>
                                        <p className="text-sm font-medium text-gray-900">{selectedRegistration.institute_name}</p>
                                      </div>
                                    )}

                                    {/* Registration Date */}
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <label className="text-xs font-medium text-gray-600">Registration Date</label>
                                      <p className="text-sm font-medium text-gray-900">
                                        {selectedRegistration.created_at
                                          ? format(new Date(selectedRegistration.created_at), 'dd MMM yyyy HH:mm:ss')
                                          : '-'}
                                      </p>
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

                {/* Mobile Card View - Professional Design */}
                <div className="md:hidden space-y-3">
                  {/* Mobile Select All */}
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Checkbox
                      checked={allCurrentPageSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all"
                      className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                    />
                    <span className="text-sm text-gray-600">Select all on this page</span>
                  </div>
                  {filteredRegistrations
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((registration) => (
                    <Card key={registration.id} className={`border shadow-sm hover:shadow-md transition-shadow ${selectedIds.has(registration.id) ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Checkbox and Name */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Checkbox
                                checked={selectedIds.has(registration.id)}
                                onCheckedChange={(checked) => handleSelectOne(registration.id, checked)}
                                aria-label={`Select ${registration.name}`}
                                className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                              />
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm text-gray-900 truncate">{registration.name || '-'}</p>
                                  {registration.username && (
                                    <p className="text-xs text-gray-500 truncate">@{registration.username}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={registration.role === 'Professional' ? 'default' : registration.role === 'Student' ? 'secondary' : 'outline'}
                              className="text-xs flex-shrink-0"
                            >
                              {registration.role || '-'}
                            </Badge>
                          </div>

                          {/* Contact Info - Compact */}
                          <div className="space-y-1.5 bg-gray-50 rounded-lg p-2.5">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-700 truncate">{registration.email || '-'}</span>
                            </div>
                            {registration.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-xs text-gray-700">{formatPhone(registration.phone)}</span>
                              </div>
                            )}
                          </div>

                          {/* Date */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500">
                              {registration.created_at ? format(new Date(registration.created_at), 'dd MMM yyyy') : '-'}
                            </span>
                          </div>

                          {/* Action Button - Enhanced */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                onClick={() => setSelectedRegistration(registration)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white max-w-[90vw] sm:max-w-md rounded-xl">
                              <DialogHeader className="border-b pb-3">
                                <DialogTitle className="text-lg font-bold">Registration Details</DialogTitle>
                                <DialogDescription className="text-xs text-gray-500 break-all">
                                  {selectedRegistration?.name}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedRegistration && (
                                <div className="space-y-4 pt-2">
                                  {/* User Info Section */}
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <h4 className="font-semibold text-sm text-blue-900 mb-2.5 flex items-center gap-2">
                                      <User className="h-4 w-4" />
                                      User Information
                                    </h4>
                                    <div className="space-y-2">
                                      <div>
                                        <label className="text-xs font-medium text-gray-600">Name</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedRegistration.name || '-'}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-600">Email</label>
                                        <p className="text-xs text-gray-700 break-all">{selectedRegistration.email || '-'}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-600">Phone</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedRegistration.phone || '-'}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-600">Role</label>
                                        <p className="text-sm font-medium text-gray-900">{selectedRegistration.role || '-'}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Professional Details Section */}
                                  {(selectedRegistration.professional_type || selectedRegistration.membership_no || selectedRegistration.registration_no) && (
                                    <div className="bg-green-50 rounded-lg p-3">
                                      <h4 className="font-semibold text-sm text-green-900 mb-2.5 flex items-center gap-2">
                                        <UserCheck className="h-4 w-4" />
                                        Professional Details
                                      </h4>
                                      <div className="space-y-2">
                                        {selectedRegistration.professional_type && (
                                          <div>
                                            <label className="text-xs font-medium text-gray-600">Type</label>
                                            <p className="text-sm font-medium text-gray-900">{selectedRegistration.professional_type}</p>
                                          </div>
                                        )}
                                        {selectedRegistration.membership_no && (
                                          <div>
                                            <label className="text-xs font-medium text-gray-600">Membership No</label>
                                            <p className="text-sm font-medium text-gray-900">{selectedRegistration.membership_no}</p>
                                          </div>
                                        )}
                                        {selectedRegistration.registration_no && (
                                          <div>
                                            <label className="text-xs font-medium text-gray-600">Registration No</label>
                                            <p className="text-sm font-medium text-gray-900">{selectedRegistration.registration_no}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Institute Section */}
                                  {selectedRegistration.institute_name && (
                                    <div className="bg-purple-50 rounded-lg p-3">
                                      <h4 className="font-semibold text-sm text-purple-900 mb-2.5 flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        Institute
                                      </h4>
                                      <p className="text-sm font-medium text-gray-900">{selectedRegistration.institute_name}</p>
                                    </div>
                                  )}

                                  {/* Registration Date */}
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <label className="text-xs font-medium text-gray-600">Registration Date</label>
                                    <p className="text-sm font-medium text-gray-900">
                                      {selectedRegistration.created_at
                                        ? format(new Date(selectedRegistration.created_at), 'dd MMM yyyy HH:mm:ss')
                                        : '-'}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                <AdminPagination
                  currentPage={currentPage}
                  totalItems={filteredRegistrations.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={setCurrentPage}
                  itemName="registrations"
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Fixed Bottom Action Bar - Shows when items selected AND header is not visible */}
        {selectedIds.size > 0 && !isHeaderVisible && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] p-4 z-[9999] lg:left-64">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Delete ({selectedIds.size})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Registrations</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedIds.size} registration(s)?
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteSelected}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
    </AdminPageWrapper>
  )
}