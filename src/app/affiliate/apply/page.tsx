'use client'

import {useState, useEffect  } from 'react'
import {useRouter  } from 'next/navigation'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Button  } from '@/components/ui/button'
import {Input  } from '@/components/ui/input'
import {Label  } from '@/components/ui/label'
import {Textarea  } from '@/components/ui/textarea'
import {Star, DollarSign, Users, TrendingUp } from 'lucide-react'
import {User  } from '@/types/common'
import {toast  } from 'sonner'

export default function AffiliateApplicationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    accountEmail: '',
    paymentEmail: '',
    websiteUrl: '',
    promotionMethod: ''
  })

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setFormData(prev => ({
        ...prev,
        name: parsedUser.name || '',
        accountEmail: parsedUser.email || ''
      }))
    } else {
      router.push('/auth/login')
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          ...formData
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Affiliate application submitted successfully! We will review your application and get back to you soon.')
        router.push('/')
      } else {
        toast.error(result.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Become a PowerCA Affiliate</h1>
          <p className="mt-2 text-lg text-gray-600">
            Join our affiliate program and earn commissions by promoting PowerCA services
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Earn Commission</h3>
              <p className="text-gray-600">Get 10% commission on every successful referral</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Grow Your Network</h3>
              <p className="text-gray-600">Build your professional network while earning</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">Track Performance</h3>
              <p className="text-gray-600">Monitor your referrals and earnings in real-time</p>
            </CardContent>
          </Card>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Affiliate Application</CardTitle>
            <CardDescription>
              Please provide the following information to apply for our affiliate program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="accountEmail">Account Email *</Label>
                  <Input
                    id="accountEmail"
                    name="accountEmail"
                    type="email"
                    value={formData.accountEmail}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email associated with your PowerCA account
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="paymentEmail">Payment Email *</Label>
                  <Input
                    id="paymentEmail"
                    name="paymentEmail"
                    type="email"
                    value={formData.paymentEmail}
                    onChange={handleInputChange}
                    required
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email for receiving commission payments
                  </p>
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    placeholder="https://yourwebsite.com"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your website or social media profile (optional)
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="promotionMethod">How will you promote us? *</Label>
                <Textarea
                  id="promotionMethod"
                  name="promotionMethod"
                  value={formData.promotionMethod}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-1"
                  placeholder="Please describe how you plan to promote PowerCA services. Include details about your audience, marketing channels, and promotional strategies..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum 50 characters required
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Commission rate: 10% on successful referrals</li>
                  <li>• Payments are processed monthly</li>
                  <li>• You must comply with our marketing guidelines</li>
                  <li>• Applications are reviewed within 3-5 business days</li>
                  <li>• Affiliate status can be revoked for policy violations</li>
                </ul>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || formData.promotionMethod.length < 50}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </div>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}