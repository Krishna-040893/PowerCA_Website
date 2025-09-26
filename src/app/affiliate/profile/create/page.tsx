'use client'

import {useState, useEffect, useCallback  } from 'react'
import {useRouter  } from 'next/navigation'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Label  } from '@/components/ui/label'
import {Textarea  } from '@/components/ui/textarea'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue  } from '@/components/ui/select'
import {Alert, AlertDescription  } from '@/components/ui/alert'
import { Building, Globe, FileText, TrendingUp, Send, AlertCircle  } from 'lucide-react'
import {createClient  } from '@supabase/supabase-js'
import {toast  } from 'sonner'
import type { AffiliateUser, AffiliateApplication } from '@/types/affiliate'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function AffiliateProfileCreatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<AffiliateUser | null>(null)
  const [existingApplication, setExistingApplication] = useState<AffiliateApplication | null>(null)
  const [formData, setFormData] = useState({
    companyName: '',
    websiteUrl: '',
    promotionMethod: '',
    expectedReferrals: '',
    reason: ''
  })

  const checkUserAndApplication = useCallback(async () => {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) {
      router.push('/auth/login')
      return
    }

    const userData = JSON.parse(storedUser)
    setUser(userData)

    // Check if user is already an affiliate
    if (userData.role !== 'affiliate' && !userData.is_affiliate) {
      toast.error('You need to be an affiliate to access this page')
      router.push('/dashboard')
      return
    }

    // Check for existing application
    const { data: application } = await supabase
      .from('affiliate_applications')
      .select('*')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (application) {
      setExistingApplication(application)
    }

    // Check for existing approved profile
    const { data: profile } = await supabase
      .from('affiliate_profiles')
      .select('*')
      .eq('user_id', userData.id)
      .eq('status', 'approved')
      .single()

    if (profile) {
      router.push('/affiliate/dashboard')
    }
  }, [router])

  useEffect(() => {
    checkUserAndApplication()
  }, [checkUserAndApplication])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please login to continue')
      router.push('/login')
      return
    }

    setLoading(true)

    try {
      // Create affiliate application
      const { error: appError } = await supabase
        .from('affiliate_applications')
        .insert({
          user_id: user.id,
          company_name: formData.companyName,
          website_url: formData.websiteUrl,
          promotion_method: formData.promotionMethod,
          expected_referrals: formData.expectedReferrals,
          reason: formData.reason,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (appError) throw appError

      // Update or create affiliate profile with pending status
      const { data: existingProfile } = await supabase
        .from('affiliate_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('affiliate_profiles')
          .update({
            company_name: formData.companyName,
            website_url: formData.websiteUrl,
            description: formData.reason,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) throw updateError
      } else {
        // Create new profile
        const { error: profileError } = await supabase
          .from('affiliate_profiles')
          .insert({
            user_id: user.id,
            affiliate_code: `AFF${user.id.substring(0, 8).toUpperCase()}`,
            company_name: formData.companyName,
            website_url: formData.websiteUrl,
            description: formData.reason,
            status: 'pending',
            commission_rate: 10,
            created_at: new Date().toISOString()
          })

        if (profileError) throw profileError
      }

      toast.success('Your affiliate application has been submitted successfully! We will review it and get back to you soon.')
      router.push('/affiliate/dashboard')
    } catch (error) {
      console.error('Error submitting application:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application. Please try again.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (existingApplication && existingApplication.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Application Under Review</CardTitle>
              <CardDescription>
                Your affiliate application is currently being reviewed by our team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  We typically review applications within 24-48 hours. You'll be notified once your application is approved.
                </AlertDescription>
              </Alert>
              <div className="mt-6 space-y-2">
                <p><strong>Company:</strong> {existingApplication.company_name}</p>
                <p><strong>Website:</strong> {existingApplication.website_url}</p>
                <p><strong>Status:</strong> <span className="text-yellow-600">Pending Review</span></p>
                <p><strong>Submitted:</strong> {new Date(existingApplication.created_at).toLocaleDateString()}</p>
              </div>
              <Button
                onClick={() => router.push('/dashboard')}
                className="mt-6"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your Affiliate Profile</CardTitle>
            <CardDescription>
              Tell us about your business and how you plan to promote PowerCA services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Business Information
                </h3>

                <div>
                  <Label htmlFor="companyName">Company/Business Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Your company or business name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="websiteUrl">Website URL *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="websiteUrl"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                      placeholder="https://www.example.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Promotion Strategy */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Promotion Strategy
                </h3>

                <div>
                  <Label htmlFor="promotionMethod">How will you promote PowerCA? *</Label>
                  <Select
                    value={formData.promotionMethod}
                    onValueChange={(value) => handleSelectChange('promotionMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select promotion method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website/Blog</SelectItem>
                      <SelectItem value="social_media">Social Media Marketing</SelectItem>
                      <SelectItem value="email">Email Marketing</SelectItem>
                      <SelectItem value="referrals">Client Referrals</SelectItem>
                      <SelectItem value="events">Events & Workshops</SelectItem>
                      <SelectItem value="other">Other Methods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expectedReferrals">Expected Monthly Referrals *</Label>
                  <Select
                    value={formData.expectedReferrals}
                    onValueChange={(value) => handleSelectChange('expectedReferrals', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select expected referrals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5">1-5 referrals</SelectItem>
                      <SelectItem value="6-10">6-10 referrals</SelectItem>
                      <SelectItem value="11-20">11-20 referrals</SelectItem>
                      <SelectItem value="21-50">21-50 referrals</SelectItem>
                      <SelectItem value="50+">50+ referrals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Additional Information
                </h3>

                <div>
                  <Label htmlFor="reason">Why do you want to become a PowerCA affiliate? *</Label>
                  <Textarea
                    id="reason"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Tell us about your interest in partnering with PowerCA..."
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}