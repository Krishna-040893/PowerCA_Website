'use client'

import {useState, useEffect  } from 'react'
import {AdminLayout  } from '@/components/admin/admin-layout'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow  } from '@/components/ui/table'
import {Badge  } from '@/components/ui/badge'
import {Button  } from '@/components/ui/button'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui/select'
import {RefreshCw, Users, Star, Crown  } from 'lucide-react'
import { format } from 'date-fns'
import {toast  } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  username: string
  phone: string
  role: 'admin' | 'subscriber' | 'affiliate'
  user_type?: string
  professional_type?: string
  membership_no?: string
  registration_no?: string
  institute_name?: string
  is_verified: boolean
  is_active: boolean
  created_at: string
  affiliateProfile?: {
    affiliate_code: string
    status: string
    total_referrals: number
    total_earnings: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set())

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      if (data.success) {
        setUsers(data.users || [])
      } else {
        throw new Error(data.error || 'Failed to fetch users')
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const updateUserRole = async (userId: string, newRole: string) => {
    setUpdatingUsers(prev => new Set(prev).add(userId))
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          newRole,
          adminId: 'current-admin' // TODO: Get from session
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user role')
      }

      const result = await response.json()
      if (result.success) {
        // Update the user in the local state
        setUsers(prev => prev.map(user =>
          user.id === userId
            ? {
                ...user,
                role: newRole as 'admin' | 'subscriber' | 'affiliate'
              }
            : user
        ))
        toast.success('User role updated successfully!')
      }
    } catch (err) {
      console.error('Error updating user role:', err)
      toast.error('Failed to update user role')
    } finally {
      setUpdatingUsers(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'affiliate':
        return 'bg-purple-100 text-purple-800'
      case 'subscriber':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />
      case 'affiliate':
        return <Star className="h-4 w-4" />
      case 'subscriber':
      default:
        return <Users className="h-4 w-4" />
    }
  }

  const roleOptions: Array<'admin' | 'subscriber' | 'affiliate'> = [
    'subscriber',
    'affiliate',
    'admin'
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600">Manage user roles and promote users to affiliates</p>
        </div>

        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  View and manage user roles. Promote subscribers and customers to affiliates.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  disabled={loading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-600">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>User Type</TableHead>
                      <TableHead>Current Role</TableHead>
                      <TableHead>Affiliate Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Change Role</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>
                          {user.user_type && (
                            <Badge variant="outline">
                              {user.user_type}
                              {user.professional_type && ` (${user.professional_type})`}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            <div className="flex items-center gap-1">
                              {getRoleIcon(user.role)}
                              {user.role}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.affiliateProfile ? (
                            <div className="text-sm">
                              <p>Code: {user.affiliateProfile.affiliate_code}</p>
                              <p>Referrals: {user.affiliateProfile.total_referrals}</p>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {user.is_verified && (
                              <Badge variant="outline" className="text-green-600">
                                Verified
                              </Badge>
                            )}
                            {user.is_active ? (
                              <Badge variant="outline" className="text-green-600">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-600">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => updateUserRole(user.id, newRole)}
                            disabled={updatingUsers.has(user.id)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {roleOptions.map((role) => (
                                <SelectItem key={role} value={role}>
                                  <div className="flex items-center gap-2">
                                    {getRoleIcon(role)}
                                    {role}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {updatingUsers.has(user.id) && (
                            <div className="flex items-center gap-1 text-sm text-blue-600">
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Updating...
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {users.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Total users: {users.length}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}