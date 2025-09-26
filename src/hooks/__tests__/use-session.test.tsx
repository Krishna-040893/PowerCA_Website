import { renderHook } from '@testing-library/react'
import { useSession } from '../use-session'
import { useRouter } from 'next/navigation'
import React from 'react'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock fetch
global.fetch = jest.fn()

describe('useSession Hook', () => {
  const mockPush = jest.fn()
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('should initialize with loading state', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves

    const { result } = renderHook(() => useSession())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
  })

  it('should fetch user session on mount', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser }),
    })

    const { result } = renderHook(() => useSession())

    // Initial state
    expect(result.current.loading).toBe(true)

    // Wait for the effect to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    // Session should be loaded
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/session')
  })

  it('should handle session check failure', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useSession())

    // Wait for the effect to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(result.current.user).toBeNull()
  })

  it('should handle logout', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

    const { result } = renderHook(() => useSession())

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0))

    // Call logout
    await result.current.logout()

    // Should have called logout endpoint
    expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })

    // Should redirect to home
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('should check authentication status', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser }),
    })

    const { result } = renderHook(() => useSession())

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0))

    // Call checkAuth
    const isAuthenticated = await result.current.checkAuth()

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/session')
    expect(isAuthenticated).toBe(true)
  })

  it('should return false when user is not authenticated', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ user: null }),
    })

    const { result } = renderHook(() => useSession())

    // Wait for initial load
    await new Promise(resolve => setTimeout(resolve, 0))

    const isAuthenticated = await result.current.checkAuth()
    expect(isAuthenticated).toBe(false)
  })

  it('should provide consistent user data after loading', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
    }

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ user: mockUser }),
    })

    const { result, rerender } = renderHook(() => useSession())

    // Initial state
    expect(result.current.loading).toBe(true)

    // Wait for loading to complete
    await new Promise(resolve => setTimeout(resolve, 0))

    // Rerender to check if state persists
    rerender()

    // User should be consistent after rerender
    expect(result.current.user).toEqual(mockUser)
  })
})