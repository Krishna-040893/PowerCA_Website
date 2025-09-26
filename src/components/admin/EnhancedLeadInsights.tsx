'use client'

import {useState, useEffect, useCallback  } from 'react'
import {Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {Badge  } from '@/components/ui/badge'
import {Button  } from '@/components/ui/button'
import {Tabs, TabsContent, TabsList, TabsTrigger  } from '@/components/ui/tabs'
import {Progress  } from '@/components/ui/progress'
import {ExternalLink, Mail,
  MousePointer,
  Eye,
  Activity,
  Calendar, TrendingUp,
  MessageSquare,
  Star, Globe } from 'lucide-react'
import {hubspotService  } from '@/lib/hubspot-service'

interface HubSpotContact {
  id: string
  properties: {
    hubspotscore?: string
    hs_email_open_count?: string
    hs_email_click_count?: string
    num_notes?: string
    num_contacted_notes?: string
    hs_analytics_num_page_views?: string
    hs_analytics_num_visits?: string
    hs_analytics_last_visit_timestamp?: string
    email?: string
    firstname?: string
    lastname?: string
    [key: string]: string | undefined
  }
}

interface EmailCampaignStats {
  totalCampaigns: number
  emailsSent: number
  openRate: number
  clickRate: number
  bounceRate: number
  unsubscribeRate: number
  lastCampaignDate: string
  bestPerformingSubject: string
}

interface WebActivityData {
  pageViews: number
  sessionCount: number
  averageSessionDuration: number
  lastVisitDate: string
  topPages: string[]
  deviceType: string
  trafficSource: string
}

interface LeadInsights {
  contact?: HubSpotContact | null
  emailStats?: EmailCampaignStats
  webActivity?: WebActivityData
  leadScore?: number
  lastActivity?: string
  hubspotscore?: string
  hs_analytics_num_visits?: string
  hs_analytics_num_page_views?: string
  hs_analytics_last_visit_timestamp?: string
  hs_email_open_count?: string
  hs_email_click_count?: string
  num_notes?: string
}

interface EnhancedLeadInsightsProps {
  userEmail: string
}

export default function EnhancedLeadInsights({ userEmail }: EnhancedLeadInsightsProps) {
  const [insights, setInsights] = useState<LeadInsights | null>(null)
  const [emailStats, setEmailStats] = useState<EmailCampaignStats>({
    totalCampaigns: 0,
    emailsSent: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    unsubscribeRate: 0,
    lastCampaignDate: '',
    bestPerformingSubject: '',
  })
  const [webActivity, setWebActivity] = useState<WebActivityData>({
    pageViews: 0,
    sessionCount: 0,
    averageSessionDuration: 0,
    lastVisitDate: '',
    topPages: [],
    deviceType: '',
    trafficSource: ''
  })
  const [loading, setLoading] = useState(true)

  const fetchAllData = useCallback(async () => {
    try {
      // Fetch HubSpot contact data
      const contactData = await hubspotService.getLeadInsights(userEmail)
      setInsights(contactData?.properties || null)

      // Mock email campaign data (in production, fetch from HubSpot API)
      setEmailStats({
        totalCampaigns: 8,
        emailsSent: 24,
        openRate: 34.5,
        clickRate: 12.8,
        bounceRate: 2.1,
        unsubscribeRate: 0.4,
        lastCampaignDate: '2024-09-20',
        bestPerformingSubject: 'Your PowerCA Trial is Expiring Soon'
      })

      // Mock web activity data
      setWebActivity({
        pageViews: 47,
        sessionCount: 12,
        averageSessionDuration: 285,
        lastVisitDate: '2024-09-23',
        topPages: ['/pricing', '/features', '/about', '/contact'],
        deviceType: 'Desktop',
        trafficSource: 'Organic Search'
      })
    } catch (error) {
      console.error('Failed to fetch enhanced lead insights:', error)
    } finally {
      setLoading(false)
    }
  }, [userEmail])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enhanced Lead Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Enhanced Lead Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No HubSpot data available for this contact.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Enhanced Lead Intelligence
          </CardTitle>
          <Badge variant="secondary">HubSpot CRM</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="web">Web Activity</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Lead Score & Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                <Star className="h-6 w-6 mb-2" />
                <div className="text-2xl font-bold">{insights.hubspotscore || 'N/A'}</div>
                <div className="text-sm opacity-90">Lead Score</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <Activity className="h-6 w-6 mb-2" />
                <div className="text-2xl font-bold">{insights.hs_analytics_num_visits || '0'}</div>
                <div className="text-sm opacity-90">Total Visits</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Page Views</span>
                </div>
                <span className="font-semibold">{insights.hs_analytics_num_page_views || '0'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Email Opens</span>
                </div>
                <span className="font-semibold">{insights?.hs_email_open_count || '0'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Email Clicks</span>
                </div>
                <span className="font-semibold">{insights?.hs_email_click_count || '0'}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Notes</span>
                </div>
                <span className="font-semibold">{insights?.num_notes || '0'}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Email Campaign Performance</h3>
                <Badge variant="outline">{emailStats.totalCampaigns} campaigns</Badge>
              </div>

              {/* Email Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Open Rate</span>
                    <span className="font-semibold">{emailStats.openRate}%</span>
                  </div>
                  <Progress value={emailStats.openRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Click Rate</span>
                    <span className="font-semibold">{emailStats.clickRate}%</span>
                  </div>
                  <Progress value={emailStats.clickRate} className="h-2" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-blue-50 rounded">
                  <div className="text-lg font-bold text-blue-900">{emailStats.emailsSent}</div>
                  <div className="text-xs text-blue-600">Emails Sent</div>
                </div>
                <div className="p-3 bg-red-50 rounded">
                  <div className="text-lg font-bold text-red-900">{emailStats.bounceRate}%</div>
                  <div className="text-xs text-red-600">Bounce Rate</div>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-lg font-bold text-orange-900">{emailStats.unsubscribeRate}%</div>
                  <div className="text-xs text-orange-600">Unsubscribe</div>
                </div>
              </div>

              {emailStats.bestPerformingSubject && (
                <div className="p-3 bg-green-50 rounded border border-green-200">
                  <div className="text-sm font-medium text-green-800 mb-1">Best Performing Subject:</div>
                  <div className="text-sm text-green-700">"{emailStats.bestPerformingSubject}"</div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="web" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Website Activity</h3>
                <Badge variant="outline">{webActivity.sessionCount} sessions</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Page Views</span>
                    <span className="font-semibold">{webActivity.pageViews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg. Session Duration</span>
                    <span className="font-semibold">{Math.floor(webActivity.averageSessionDuration / 60)}m {webActivity.averageSessionDuration % 60}s</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Device Type</span>
                    <span className="font-semibold">{webActivity.deviceType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Traffic Source</span>
                    <span className="font-semibold">{webActivity.trafficSource}</span>
                  </div>
                </div>
              </div>

              {webActivity.topPages.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Most Visited Pages:</div>
                  <div className="space-y-1">
                    {webActivity.topPages.map((page, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Globe className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{page}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Engagement Timeline</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Last Website Visit</div>
                    <div className="text-xs text-gray-600">{webActivity.lastVisitDate}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <Mail className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Last Email Campaign</div>
                    <div className="text-xs text-gray-600">{emailStats.lastCampaignDate}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                  <Activity className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">Latest Activity</div>
                    <div className="text-xs text-gray-600">
                      {insights.hs_analytics_last_visit_timestamp
                        ? new Date(parseInt(insights.hs_analytics_last_visit_timestamp)).toLocaleDateString()
                        : 'No recent activity'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Button */}
        <div className="mt-4 pt-4 border-t">
          <Button asChild className="w-full">
            <a
              href={`https://app.hubspot.com/contacts/${process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}/contact/${userEmail}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Profile in HubSpot
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}