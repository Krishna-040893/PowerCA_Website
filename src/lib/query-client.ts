import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { toast } from 'sonner'
import { logger } from './logger'

// Create a query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long before data is considered stale
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Cache time - how long before inactive data is removed from cache
      gcTime: 10 * 60 * 1000, // 10 minutes
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch configuration
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Global error handling for queries
      if (query.state.data === undefined) {
        logger.error('Query failed', error, { queryKey: query.queryKey })

        // Show user-friendly error messages
        const errorMessage = error instanceof Error ? error.message : 'An error occurred'

        // Only show toast for user-facing queries
        if (!query.queryKey[0]?.toString().includes('internal')) {
          toast.error(`Failed to load data: ${errorMessage}`)
        }
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      // Global error handling for mutations
      logger.error('Mutation failed', error, {
        mutationKey: mutation.options.mutationKey
      })

      const errorMessage = error instanceof Error ? error.message : 'An error occurred'

      // Show error toast for all mutations unless explicitly disabled
      if (mutation.options.meta?.showErrorToast !== false) {
        toast.error(`Operation failed: ${errorMessage}`)
      }
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      // Show success toast for mutations if enabled
      if (mutation.options.meta?.showSuccessToast) {
        const message = mutation.options.meta?.successMessage || 'Operation successful'
        toast.success(message as string)
      }
    },
  }),
})