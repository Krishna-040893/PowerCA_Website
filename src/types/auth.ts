// Core authentication types for PowerCA

export type UserRole = 'admin' | 'subscriber' | 'affiliate' | 'Admin' | 'Affiliate'

export interface User {
  id: string
  email: string
  name: string
  firmName?: string
  role: UserRole
  userType?: string
  isVerified?: boolean
  needsAffiliateSetup?: boolean
  created_at?: string
  updated_at?: string
}

export interface AuthSession {
  user: User
  expires: string
}

export interface AdminUser {
  id?: string
  username: string
  email: string
  role: string
  created_at?: string
  updated_at?: string
}

export interface AdminAuthResult {
  authorized: boolean
  admin?: AdminUser
  error?: string | null
}

export interface JWTPayload {
  id?: string
  username: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegistrationData {
  name: string
  email: string
  password: string
  firmName?: string
  role?: UserRole
  userType?: string
}

export interface AuthError {
  message: string
  code?: string
}

// Admin authentication response types
export interface AdminAuthResponse {
  success: boolean
  message?: string
  admin?: AdminUser
  token?: string
  error?: string
}

// User registration/signup types
export interface SignupResponse {
  success: boolean
  message?: string
  user?: User
  error?: string
}

export interface LoginResponse {
  success: boolean
  message?: string
  user?: User
  token?: string
  error?: string
}