// Common type definitions for the PowerCA application

// User related types
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'user' | 'affiliate';
  profile_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Razorpay payment response types
export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      order_id: string;
      payment_id: string;
    };
  };
}

// Customer details for payment processing
export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  company?: string;
  gst?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

// Product details for orders
export interface ProductDetails {
  name: string;
  amount: number;
}

// Affiliate related types
export interface AffiliateApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  services: string;
  referral_code?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export interface AffiliateReferral {
  id: string;
  affiliate_code: string;
  customer_email: string;
  customer_name: string;
  order_amount: number;
  commission_amount: number;
  status: 'pending' | 'paid';
  created_at: string;
  payment_id?: string;
  plan_id?: string;
}

// Registration and user profile types
export interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  user_type: 'student' | 'professional';
  profile_completed: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  company_name?: string;
  company_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  alternate_phone?: string;
  website?: string;
  description?: string;
  gst_number?: string;
  pan_number?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at?: string;
}

// Admin dashboard stats
export interface AdminStats {
  totalUsers: number;
  totalRegistrations: number;
  totalAffiliates: number;
  totalBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
}

// Booking types
export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name?: string;
  preferred_date?: string;
  preferred_time?: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Record<string, unknown>;
}

// Form event types
export type FormChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;

// Component props for tables
export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onSort?: (key: keyof T) => void;
  sortKey?: keyof T;
  sortDirection?: 'asc' | 'desc';
}

// Pagination types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Filter types for admin panels
export interface FilterState {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}