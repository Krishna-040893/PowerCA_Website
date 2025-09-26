// Affiliate types
export interface AffiliateUser {
  id: string
  email: string
  full_name?: string
  created_at: string
}

export interface AffiliateApplication {
  id: string
  user_id: string
  company_name: string
  website_url: string
  promotion_method: string
  expected_referrals: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at?: string
}

export interface AffiliateProfile {
  id: string
  user_id: string
  referral_code: string
  commission_rate: number
  total_referrals: number
  total_earnings: number
  created_at: string
}