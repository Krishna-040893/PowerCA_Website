/**
 * Domain model types
 */

export interface User {
  id: string
  name: string
  email: string
  role?: 'user' | 'admin' | 'affiliate'
  image?: string
  emailVerified?: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface AuthResponse {
  token: string
  user: User
}

export interface SessionResponse {
  user: User
}

export interface BookingData {
  name: string
  email: string
  phone: string
  firmName?: string
  date: string | Date
  time: string
  message?: string
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
}

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface UserUpdateData {
  name?: string
  email?: string
  role?: 'user' | 'admin' | 'affiliate'
  image?: string
}