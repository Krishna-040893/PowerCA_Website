'use client'

import {useState, useEffect  } from 'react'
import {AdminLayout  } from '@/components/admin/admin-layout'
import { format } from 'date-fns'
import {User, Mail, Phone,
  Calendar,
  Search,
  Download,
  Eye, CheckCircle, XCircle,
  AlertCircle,
  Shield
 } from 'lucide-react'

interface Customer {
  id: string
  name: string
  email: string
  username?: string
  phone: string
  userRole?: string
  professionalType?: string
  membershipNo?: string
  registrationNo?: string
  instituteName?: string
  firmName?: string
  role: string
  isVerified?: boolean
  createdAt: string
}

interface RawRegistrationData {
  id: string
  name: string
  email: string
  username?: string
  phone: string
  role: string
  professional_type?: string
  membership_no?: string
  registration_no?: string
  institute_name?: string
  firm_name?: string
  is_verified?: boolean
  created_at: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)

      // First try to fetch from registrations endpoint
      let response = await fetch('/api/registrations')
      let data = await response.json()

      if (Array.isArray(data)) {
        // Map registration data to customer format
        const mappedCustomers = data.map((reg: RawRegistrationData) => ({
          id: reg.id,
          name: reg.name,
          email: reg.email,
          username: reg.username,
          phone: reg.phone,
          userRole: reg.role,
          professionalType: reg.professional_type,
          membershipNo: reg.membership_no,
          registrationNo: reg.registration_no,
          instituteName: reg.institute_name,
          firmName: reg.firm_name,
          role: reg.role,
          isVerified: reg.is_verified || false,
          createdAt: reg.created_at
        }))
        setCustomers(mappedCustomers)
      } else {
        // Fallback to auth/register endpoint
        response = await fetch('/api/auth/register')
        data = await response.json()

        if (data.success && data.users) {
          setCustomers(data.users)
        } else {
          // Use demo data if no API works
          setCustomers([
            {
              id: 'DEMO_1',
              name: 'John Doe',
              email: 'john@example.com',
              phone: '9876543210',
              firmName: 'ABC & Associates',
              role: 'user',
              isVerified: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'DEMO_2',
              name: 'Jane Smith',
              email: 'jane@example.com',
              phone: '9876543211',
              firmName: 'XYZ Chartered Accountants',
              role: 'user',
              isVerified: false,
              createdAt: new Date().toISOString()
            }
          ])
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      // Use demo data on error
      setCustomers([
        {
          id: 'DEMO_1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210',
          firmName: 'ABC & Associates',
          role: 'user',
          isVerified: true,
          createdAt: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Firm', 'Role', 'Verified', 'Registered At']
    const csvData = customers.map(customer => [
      customer.id,
      customer.name,
      customer.email,
      customer.phone,
      customer.firmName || '',
      customer.role,
      customer.isVerified ? 'Yes' : 'No',
      customer.createdAt
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `customers_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      (customer.firmName && customer.firmName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesRole = roleFilter === 'all' || customer.role === roleFilter

    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-2">View and manage all registered users</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg">
          {/* Header and Filters */}
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or firm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>Total: {customers.length} customers</span>
              <span>•</span>
              <span>Showing: {filteredCustomers.length} results</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {customer.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {customer.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-2 text-gray-900">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 mt-1">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          {customer.userRole && (
                            <div className="text-gray-900">
                              <span className="font-medium">{customer.userRole}</span>
                              {customer.userRole === 'Professional' && customer.professionalType && (
                                <span className="ml-2 text-gray-600">({customer.professionalType})</span>
                              )}
                            </div>
                          )}
                          {customer.membershipNo && (
                            <div className="text-gray-600">Membership: {customer.membershipNo}</div>
                          )}
                          {customer.registrationNo && (
                            <div className="text-gray-600">Reg: {customer.registrationNo}</div>
                          )}
                          {customer.instituteName && (
                            <div className="text-gray-600">{customer.instituteName}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                            customer.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {customer.role === 'admin' && <Shield className="w-3 h-3" />}
                            {customer.role}
                          </span>
                          {customer.isVerified !== undefined && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              customer.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {customer.isVerified ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  Verified
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-3 h-3" />
                                  Unverified
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setShowDetails(true)
                          }}
                          className="text-primary-600 hover:text-primary-700"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {showDetails && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Customer Details</h2>
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setSelectedCustomer(null)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID</label>
                    <p className="mt-1 text-gray-900">{selectedCustomer.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">System Role</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        selectedCustomer.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedCustomer.role === 'admin' && <Shield className="w-3 h-3" />}
                        {selectedCustomer.role}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-gray-900">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Username</label>
                    <p className="mt-1 text-gray-900">{selectedCustomer.username || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-gray-900">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="mt-1 text-gray-900">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">User Type</label>
                    <p className="mt-1 text-gray-900">
                      {selectedCustomer.userRole || 'Not specified'}
                      {selectedCustomer.userRole === 'Professional' && selectedCustomer.professionalType && (
                        <span className="ml-2 text-gray-600">({selectedCustomer.professionalType})</span>
                      )}
                    </p>
                  </div>
                  {selectedCustomer.membershipNo && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Membership Number</label>
                      <p className="mt-1 text-gray-900">{selectedCustomer.membershipNo}</p>
                    </div>
                  )}
                  {selectedCustomer.registrationNo && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Registration Number</label>
                      <p className="mt-1 text-gray-900">{selectedCustomer.registrationNo}</p>
                    </div>
                  )}
                  {selectedCustomer.instituteName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Institute Name</label>
                      <p className="mt-1 text-gray-900">{selectedCustomer.instituteName}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-500">Verification Status</label>
                    <p className="mt-1">
                      {selectedCustomer.isVerified !== undefined && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          selectedCustomer.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedCustomer.isVerified ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              Unverified
                            </>
                          )}
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Registered At</label>
                    <p className="mt-1 text-gray-900">
                      {format(new Date(selectedCustomer.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}