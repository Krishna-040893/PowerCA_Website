/**
 * Database entity types
 * These types represent the structure of data in the database
 */

export interface User {
  id: string
  name: string
  email: string
  password?: string // Optional as we don't always return it
  role: 'user' | 'admin' | 'affiliate'
  emailVerified?: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export interface Booking {
  id: string
  name: string
  email: string
  phone: string
  firmName?: string
  date: string | Date
  time: string
  message?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  userId?: string
  createdAt: string | Date
  updatedAt: string | Date
}

export interface Registration {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  plan?: 'starter' | 'professional' | 'enterprise'
  source?: string
  referralCode?: string
  status: 'pending' | 'active' | 'inactive'
  createdAt: string | Date
  updatedAt: string | Date
}

export interface AffiliateApplication {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  website?: string
  experience: string
  clientBase: string
  whyPartner: string
  referralCode?: string
  status: 'pending' | 'approved' | 'rejected'
  userId?: string
  approvedAt?: string | Date
  createdAt: string | Date
  updatedAt: string | Date
}

export interface AffiliateProfile {
  id: string
  userId: string
  affiliateId: string
  companyName: string
  description?: string
  specializations?: string[]
  yearsOfExperience?: number
  clientsServed?: number
  achievements?: string[]
  testimonials?: Array<{
    clientName: string
    testimonial: string
    rating: number
  }>
  socialLinks?: {
    linkedin?: string
    twitter?: string
    website?: string
  }
  referralCount: number
  maxReferrals: number
  earnings: number
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string | Date
  updatedAt: string | Date
}

export interface Payment {
  id: string
  orderId: string
  paymentId: string
  signature?: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  userId?: string
  customerDetails: {
    name: string
    email: string
    phone: string
    company?: string
    gst?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
  }
  metadata?: Record<string, unknown>
  createdAt: string | Date
  updatedAt: string | Date
}

export interface AdminUser {
  id: string
  username: string
  email?: string
  passwordHash?: string // Never send to client
  role: 'superadmin' | 'admin' | 'moderator'
  permissions?: string[]
  lastLogin?: string | Date
  isActive: boolean
  createdAt: string | Date
  updatedAt: string | Date
}