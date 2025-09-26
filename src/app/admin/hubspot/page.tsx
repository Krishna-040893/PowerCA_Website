'use client'

import {motion  } from 'framer-motion'
import {AdminPageWrapper  } from '@/components/admin/admin-page-wrapper'
import HubSpotMetricsCard from '@/components/admin/HubSpotMetricsCard'
import HubSpotBulkSync from '@/components/admin/HubSpotBulkSync'
import DealPipelineVisualization from '@/components/admin/DealPipelineVisualization'
import HubSpotWorkflowsManager from '@/components/admin/HubSpotWorkflowsManager'
import {Button  } from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Badge  } from '@/components/ui/badge'
import {ExternalLink, Zap, Users, Target, Mail } from 'lucide-react'

export default function HubSpotManagementPage() {
  return (
    <AdminPageWrapper
      title="HubSpot CRM Integration"
      description="Manage your HubSpot CRM integration, workflows, and customer insights"
      actions={
        <Button asChild>
          <a
            href={`https://app.hubspot.com/contacts/${process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open HubSpot
          </a>
        </Button>
      }
    >
      {/* Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
      >
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">CRM Status</p>
                <p className="text-2xl font-bold">Connected</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Auto Sync</p>
                <p className="text-2xl font-bold">Active</p>
              </div>
              <Zap className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Workflows</p>
                <p className="text-2xl font-bold">4</p>
              </div>
              <Mail className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Deals</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics and Bulk Sync */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
      >
        <HubSpotMetricsCard />
        <HubSpotBulkSync />
      </motion.div>

      {/* Deal Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <DealPipelineVisualization />
      </motion.div>

      {/* Workflows Manager */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <HubSpotWorkflowsManager />
      </motion.div>

      {/* Integration Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-8"
      >
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-indigo-900">HubSpot Integration Benefits</CardTitle>
            <CardDescription className="text-indigo-700">
              Your PowerCA platform is fully integrated with HubSpot CRM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-700">✓ Active</Badge>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Automatic Sync</h4>
                <p className="text-sm text-gray-600">New registrations sync to HubSpot instantly</p>
              </div>

              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-700">✓ Active</Badge>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Lead Scoring</h4>
                <p className="text-sm text-gray-600">AI-powered lead scoring and insights</p>
              </div>

              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-100 text-purple-700">✓ Active</Badge>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Email Automation</h4>
                <p className="text-sm text-gray-600">Automated email sequences and nurturing</p>
              </div>

              <div className="p-3 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-orange-100 text-orange-700">✓ Active</Badge>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Sales Pipeline</h4>
                <p className="text-sm text-gray-600">Track deals and conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AdminPageWrapper>
  )
}