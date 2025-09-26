// Admin and registration types
export interface Registration {
  id: string
  name: string
  email: string
  phone: string
  password?: string
  plan_type: 'Basic' | 'Standard' | 'Premium'
  user_type: 'Student' | 'Professional'
  created_at: string
  updated_at?: string
}

export interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  created_at: string
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  revenue: number
  growth: number
  bookings?: number
  registrations?: number
}

export interface HubSpotContact {
  id?: string
  email: string
  firstname?: string
  lastname?: string
  phone?: string
  company?: string
  [key: string]: string | undefined
}

export interface TestData {
  id: string
  type: string
  status: string
  amount?: number
  created_at: string
  [key: string]: string | number | undefined
}