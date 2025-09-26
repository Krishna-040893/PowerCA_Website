'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface LoadingState {
  [key: string]: boolean
}

interface LoadingContextType {
  isLoading: (key?: string) => boolean
  startLoading: (key?: string) => void
  stopLoading: (key?: string) => void
  setLoading: (key: string, value: boolean) => void
  loadingStates: LoadingState
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({})

  const isLoading = useCallback((key?: string) => {
    if (!key) {
      // Check if any loading state is true
      return Object.values(loadingStates).some(state => state)
    }
    return loadingStates[key] || false
  }, [loadingStates])

  const startLoading = useCallback((key: string = 'default') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: true
    }))
  }, [])

  const stopLoading = useCallback((key: string = 'default') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: false
    }))
  }, [])

  const setLoading = useCallback((key: string, value: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        startLoading,
        stopLoading,
        setLoading,
        loadingStates
      }}
    >
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading(key?: string) {
  const context = useContext(LoadingContext)

  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }

  return {
    isLoading: () => context.isLoading(key),
    startLoading: () => context.startLoading(key),
    stopLoading: () => context.stopLoading(key),
    setLoading: (value: boolean) => key ? context.setLoading(key, value) : undefined,
  }
}

// Hook for managing async operations with loading states
export function useAsyncOperation<T = any>(
  operation: (...args: any[]) => Promise<T>,
  key: string = 'default'
) {
  const { startLoading, stopLoading, isLoading } = useLoading(key)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (...args: any[]) => {
    startLoading()
    setError(null)

    try {
      const result = await operation(...args)
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred')
      setError(error)
      throw error
    } finally {
      stopLoading()
    }
  }, [operation, startLoading, stopLoading])

  return {
    execute,
    isLoading: isLoading(),
    error,
    data,
    reset: () => {
      setError(null)
      setData(null)
    }
  }
}