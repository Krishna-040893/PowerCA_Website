'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useAdminAuth  } from '@/hooks/useAdminAuth'
import {AdminPageWrapper  } from '@/components/admin/admin-page-wrapper'
import { AdminPagination } from '@/components/admin/admin-pagination'
import {
  DataTableFilters,
  DataTablePanel,
  DataTableToolbar,
  FilterMenu,
  RowActions,
  RowIconButton,
  RowMenu,
  ToolbarButton,
  dataTableClass,
} from '@/components/admin/data-table'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow  } from '@/components/ui/table'
import {Badge  } from '@/components/ui/badge'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui/select'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle  } from '@/components/ui/dialog'
import {Label  } from '@/components/ui/label'
import {Loader2, RefreshCw, AlertCircle, Eye, Pencil } from 'lucide-react'
import { format } from 'date-fns'
import {toast  } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  username: string
  phone: string
  role: string
  professional_type?: string
  created_at: string
  is_affiliate: boolean
  affiliate_status?: string
}

export default function AdminUserManagementPage() {
  const { isAuthenticated, isLoading: authLoading, adminUser, getAuthHeaders } = useAdminAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [updating, setUpdating] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/users', {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (data.success && data.users) {
        setUsers(data.users)
      } else if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users')
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')

      // Set sample data for demo
      setUsers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          username: 'johndoe',
          phone: '9876543210',
          role: 'Professional',
          professional_type: 'CA',
          created_at: new Date().toISOString(),
          is_affiliate: false
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          username: 'janesmith',
          phone: '9876543211',
          role: 'Student',
          created_at: new Date().toISOString(),
          is_affiliate: true,
          affiliate_status: 'approved'
        }
      ])
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers()
    }
  }, [isAuthenticated, fetchUsers])

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ role: newRole })
      })

      if (response.ok) {
        await fetchUsers()
        setShowRoleDialog(false)
        setSelectedUser(null)
        setNewRole('')
        toast.success('User role updated successfully')
      } else {
        throw new Error('Failed to update user role')
      }
    } catch (err) {
      console.error('Error updating user:', err)
      toast.error('Failed to update user role')
    } finally {
      setUpdating(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage)

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter])

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
      title="User Management"
      description="Manage user accounts and permissions"
    >
        <DataTablePanel>
          <DataTableToolbar
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by name, email, or username..."
            actions={
              <ToolbarButton onClick={fetchUsers}>
                <RefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh
              </ToolbarButton>
            }
          />

          <DataTableFilters>
            <FilterMenu
              label="Role"
              value={roleFilter}
              onValueChange={setRoleFilter}
              allValue="all"
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'Professional', label: 'Professional' },
                { value: 'Student', label: 'Student' },
                { value: 'Admin', label: 'Admin' },
              ]}
            />
          </DataTableFilters>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600" />
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className={dataTableClass}>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          {user.professional_type || '-'}
                        </TableCell>
                        <TableCell>{user.is_affiliate && 'Affiliate'}</TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <RowActions>
                            <RowIconButton
                              label="Edit role"
                              onClick={() => {
                                setSelectedUser(user)
                                setNewRole(user.role)
                                setShowRoleDialog(true)
                              }}
                            >
                              <Pencil />
                            </RowIconButton>
                            <RowMenu
                              items={[
                                {
                                  label: 'View details',
                                  icon: <Eye className="h-4 w-4" />,
                                  onSelect: () => {
                                    setSelectedUser(user)
                                    setShowDetailsDialog(true)
                                  },
                                },
                              ]}
                            />
                          </RowActions>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!loading && (
              <AdminPagination
                currentPage={currentPage}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(n) => {
                  setItemsPerPage(n)
                  setCurrentPage(1)
                }}
                itemName="users"
              />
            )}
        </DataTablePanel>

        {/* User Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Complete information for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-sm">{selectedUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Username</label>
                    <p className="text-sm">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-sm">{selectedUser.phone || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Role</label>
                    <p className="text-sm">{selectedUser.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Professional Type</label>
                    <p className="text-sm">{selectedUser.professional_type || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Member Since</label>
                    <p className="text-sm">
                      {format(new Date(selectedUser.created_at), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  {selectedUser.is_affiliate && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-600">Affiliate Status</label>
                      <Badge variant="secondary">
                        {selectedUser.affiliate_status || 'Active'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User Role</DialogTitle>
              <DialogDescription>
                Change the role for {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role">User Role</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newRole === 'Admin' && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    Warning: Admin role grants full system access
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <ToolbarButton onClick={() => setShowRoleDialog(false)} disabled={updating}>
                Cancel
              </ToolbarButton>
              <ToolbarButton
                variant="primary"
                onClick={() => selectedUser && updateUserRole(selectedUser.id, newRole)}
                disabled={updating || !newRole || !selectedUser}
              >
                {updating && <Loader2 className="animate-spin" />}
                Update Role
              </ToolbarButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </AdminPageWrapper>
  )
}