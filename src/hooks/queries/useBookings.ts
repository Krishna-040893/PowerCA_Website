import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, handleApiResponse } from '@/lib/api-client'

export const BOOKINGS_QUERY_KEY = ['bookings']

interface Booking {
  id: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  firmName?: string
  message?: string
  status: 'pending' | 'confirmed' | 'cancelled'
  createdAt: string
}

// Query hook to fetch all bookings
export const useBookings = () => {
  return useQuery({
    queryKey: BOOKINGS_QUERY_KEY,
    queryFn: async () => {
      const response = await api.bookings.list()
      return handleApiResponse(response)
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Query hook to fetch a single booking
export const useBooking = (id: string) => {
  return useQuery({
    queryKey: [...BOOKINGS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await api.bookings.get(id)
      return handleApiResponse(response)
    },
    enabled: !!id,
  })
}

// Mutation hook to create a booking
export const useCreateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
      const response = await api.bookings.create(data)
      return handleApiResponse(response)
    },
    onSuccess: () => {
      // Invalidate and refetch bookings list
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY })
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Booking created successfully!',
    },
  })
}

// Mutation hook to update a booking
export const useUpdateBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Booking> }) => {
      const response = await api.bookings.update(id, data)
      return handleApiResponse(response)
    },
    onSuccess: (_, variables) => {
      // Invalidate specific booking and list
      queryClient.invalidateQueries({ queryKey: [...BOOKINGS_QUERY_KEY, variables.id] })
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY })
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Booking updated successfully!',
    },
  })
}

// Mutation hook to delete a booking
export const useDeleteBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.bookings.delete(id)
      return handleApiResponse(response)
    },
    onSuccess: (_, id) => {
      // Remove from cache immediately
      queryClient.removeQueries({ queryKey: [...BOOKINGS_QUERY_KEY, id] })
      // Refetch list
      queryClient.invalidateQueries({ queryKey: BOOKINGS_QUERY_KEY })
    },
    meta: {
      showSuccessToast: true,
      successMessage: 'Booking deleted successfully!',
    },
  })
}