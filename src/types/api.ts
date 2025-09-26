/**
 * API Type Definitions
 * Centralized types for all API routes
 */

// Common API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  error: string
  details?: string
  code?: string
  status?: number
}

// Admin Types
export interface AdminLoginRequest {
  username: string
  password: string
}

export interface AdminLoginResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    username: string
    email: string
    role: string
  }
  error?: string
}

// Booking Types
export interface Booking {
  id: string
  name: string
  email: string
  phone: string
  firm_name?: string
  date: string
  time: string
  type: 'demo' | 'consultation' | 'support'
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  message?: string
  created_at: string
  updated_at?: string
}

export interface BookingUpdateRequest {
  status: Booking['status']
}

// Payment Types
export interface PaymentOrderRequest {
  amount: number
  planType?: string
  productId?: string
  planId?: string
  customerDetails?: CustomerDetails
  name?: string
  email?: string
  phone?: string
  company?: string
}

export interface CustomerDetails {
  name: string
  email: string
  phone?: string
  company?: string
  gst?: string
}

export interface PaymentOrderResponse {
  success: boolean
  id?: string
  orderId?: string
  amount?: number
  currency?: string
  key?: string
  error?: string
}

export interface PaymentVerifyRequest {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  orderDetails?: {
    amount: number
    customerEmail?: string
    customerName?: string
  }
}

// Registration Types
export interface RegistrationRequest {
  name: string
  email: string
  username?: string
  password: string
  phone: string
  role?: 'Professional' | 'Student' | 'user'
  professionalType?: 'CA' | 'CMA' | 'CS' | 'Advocate' | 'Other'
  membershipNo?: string
  membershipNumber?: string
  registrationNo?: string
  instituteName?: string
  firmName?: string
}

export interface RegistrationResponse {
  success: boolean
  user?: {
    id: string
    name: string
    email: string
    username?: string
    role: string
  }
  message?: string
  error?: string
}

// Affiliate Types
export interface AffiliateApplication {
  id: string
  user_id: string
  user_email: string
  affiliate_id?: string
  full_name: string
  phone: string
  company_name?: string
  website?: string
  promotion_methods: string
  expected_referrals: string
  experience: string
  additional_info?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  approved_at?: string
  approved_by?: string
}

export interface AffiliateProfile {
  id: string
  user_id: string
  affiliate_id: string
  full_name: string
  email: string
  phone: string
  company_name?: string
  website?: string
  status: 'active' | 'inactive' | 'suspended'
  total_referrals: number
  successful_referrals: number
  total_commission: number
  pending_commission: number
  created_at: string
}

export interface ReferralData {
  id: string
  affiliate_id: string
  referred_email: string
  referred_name: string
  referred_phone?: string
  status: 'pending' | 'contacted' | 'converted' | 'expired'
  commission_amount?: number
  commission_status?: 'pending' | 'approved' | 'paid'
  created_at: string
  converted_at?: string
}

// HubSpot Types
export interface HubSpotContact {
  id?: string
  properties: {
    firstname?: string
    lastname?: string
    email: string
    phone?: string
    company?: string
    [key: string]: string | number | boolean | undefined
  }
}

export interface HubSpotDeal {
  id?: string
  properties: {
    dealname: string
    amount?: number
    dealstage?: string
    closedate?: string
    [key: string]: string | number | boolean | undefined
  }
}

// Supabase Error Types
export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

// Database Update Types
export interface DatabaseUpdateData {
  [key: string]: string | number | boolean | null | undefined
}

// Pagination Types
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}