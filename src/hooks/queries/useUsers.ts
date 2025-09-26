import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, handleApiResponse } from '@/lib/api-client'

export const USERS_QUERY_KEY = ['users']
export const USER_SESSION_KEY = ['user', 'session']

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'affiliate'
  createdAt: string
  updatedAt: string
}

// Query hook for current user session
export const useCurrentUser = () => {
  return useQuery({
    queryKey: USER_SESSION_KEY,
    queryFn: async () => {
      const response = await api.auth.getSession()
      return handleApiResponse(response)
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  })
}

// Query hook for admin to fetch all users
export const useUsers = () => {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.admin.users.list()
      return handleApiResponse(response)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Query hook for admin to fetch a single user
export const useUser = (id: string) => {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await api.admin.users.get(id)
      return handleApiResponse(response)
    },
    enabled: !!id,
  })
}

// Mutation hook for user login
export const useLogin = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.auth.login(credentials)
      return handleApiResponse(response)
    },
    onSuccess: (data) => {
      // Update user session in cache
      queryClient.setQueryData(USER_SESSION_KEY, data.user)
      // Store token if provided
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Logged in successfully!',
    },
  })
}

// Mutation hook for user registration
export const useRegister = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const response = await api.auth.register(data)
      return handleApiResponse(response)
    },
    onSuccess: (data) => {
      // Update user session in cache
      queryClient.setQueryData(USER_SESSION_KEY, data.user)
      // Store token if provided
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Registration successful!',
    },
  })
}

// Mutation hook for logout
export const useLogout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await api.auth.logout()
      return handleApiResponse(response)
    },
    onSuccess: () => {
      // Clear all user-related cache
      queryClient.removeQueries({ queryKey: USER_SESSION_KEY })
      queryClient.removeQueries({ queryKey: USERS_QUERY_KEY })
      // Clear token
      localStorage.removeItem('auth_token')
      sessionStorage.removeItem('auth_token')
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Logged out successfully!',
    },
  })
}

// Mutation hook for admin to update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const response = await api.admin.users.update(id, data)
      return handleApiResponse(response)
    },
    onSuccess: (_, variables) => {
      // Invalidate specific user and list
      queryClient.invalidateQueries({ queryKey: [...USERS_QUERY_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'User updated successfully!',
    },
  })
}

// Mutation hook for admin to delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.admin.users.delete(id)
      return handleApiResponse(response)
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: [...USERS_QUERY_KEY, id] })
      // Refetch list
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'User deleted successfully!',
    },
  })
}