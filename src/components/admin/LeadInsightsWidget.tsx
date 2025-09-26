'use client'

import {useState, useEffect  } from 'react'
import {hubspotService  } from '@/lib/hubspot-service'
import {Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {ExternalLink  } from 'lucide-react'

interface LeadInsightsProps {
  userEmail: string
}

interface HubSpotProperties {
  hubspotscore?: string
  hs_email_open_count?: string
  hs_email_click_count?: string
  num_notes?: string
  num_contacted_notes?: string
  hs_analytics_num_page_views?: string
  hs_analytics_num_visits?: string
  hs_analytics_last_visit_timestamp?: string
}

export default function LeadInsightsWidget({ userEmail }: LeadInsightsProps) {
  const [insights, setInsights] = useState<HubSpotProperties | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsights() {
      try {
        const data = await hubspotService.getLeadInsights(userEmail)
        setInsights(data?.properties as HubSpotProperties || null)
      } catch (error) {
        console.error('Failed to fetch lead insights:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userEmail) {
      fetchInsights()
    }
  }, [userEmail])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead Intelligence</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            No HubSpot data available for this contact.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Contact may not be synced to HubSpot yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'Never'
    return new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Lead Intelligence
          <span className="text-xs font-normal text-gray-500">via HubSpot</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {/* Lead Score */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-gray-600">Lead Score</div>
            <div className="text-2xl font-bold text-blue-600">
              {insights.hubspotscore || 'N/A'}
            </div>
          </div>

          {/* Engagement */}
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-gray-600">Engagement</div>
            <div className="text-lg font-semibold text-green-600">
              {insights.hs_analytics_num_visits || '0'} visits
            </div>
          </div>

          {/* Email Activity */}
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xs text-gray-600">Email Opens</div>
            <div className="text-lg font-semibold text-purple-600">
              {insights.hs_email_open_count || '0'}
            </div>
          </div>

          {/* Last Visit */}
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="text-xs text-gray-600">Last Visit</div>
            <div className="text-sm font-medium text-orange-600">
              {formatDate(insights.hs_analytics_last_visit_timestamp || '')}
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="mt-4 pt-3 border-t space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Page Views</span>
            <span className="font-medium">
              {insights.hs_analytics_num_page_views || '0'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Email Clicks</span>
            <span className="font-medium">
              {insights.hs_email_click_count || '0'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Notes</span>
            <span className="font-medium">
              {insights.num_notes || '0'}
            </span>
          </div>
        </div>

        {/* View in HubSpot Link */}
        <div className="mt-4 pt-3 border-t">
          <a
            href={`https://app.hubspot.com/contacts/${process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}/contact/${userEmail}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            View Full Profile in HubSpot
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}