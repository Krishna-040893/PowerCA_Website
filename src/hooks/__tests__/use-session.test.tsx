import { renderHook } from '@testing-library/react'
import { useSession } from '../use-session'
import { useSession as useNextAuthSession } from 'next-auth/react'

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}))

const mockedUseNextAuthSession = useNextAuthSession as unknown as jest.Mock

describe('useSession hook', () => {
  beforeEach(() => {
    mockedUseNextAuthSession.mockReset()
  })

  it('returns loading state when NextAuth is loading', () => {
    mockedUseNextAuthSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    })

    const { result } = renderHook(() => useSession())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeUndefined()
  })

  it('returns authenticated state when session is present', () => {
    const user = { id: '1', email: 'test@example.com', name: 'Test User' }
    mockedUseNextAuthSession.mockReturnValue({
      data: { user },
      status: 'authenticated',
      update: jest.fn(),
    })

    const { result } = renderHook(() => useSession())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toEqual(user)
  })

  it('returns unauthenticated state when session is missing', () => {
    mockedUseNextAuthSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    })

    const { result } = renderHook(() => useSession())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeUndefined()
  })

  it('exposes the raw session data and update function', () => {
    const user = { id: '1', email: 'test@example.com' }
    const update = jest.fn()

    mockedUseNextAuthSession.mockReturnValue({
      data: { user },
      status: 'authenticated',
      update,
    })

    const { result } = renderHook(() => useSession())

    expect(result.current.session).toEqual({ user })
    expect(result.current.update).toBe(update)
  })
})

