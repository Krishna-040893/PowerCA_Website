'use client'

import {useState, useEffect  } from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Badge  } from '@/components/ui/badge'
import {Button  } from '@/components/ui/button'
import {Switch  } from '@/components/ui/switch'
import {Alert, AlertDescription  } from '@/components/ui/alert'
import {Tabs, TabsContent, TabsList, TabsTrigger  } from '@/components/ui/tabs'
import {Workflow,
  Play,
  Pause,
  Settings, Mail, Users,
  Target,
  Zap, CheckCircle, Clock,
  AlertTriangle,
  BarChart3,
  Plus
 } from 'lucide-react'

interface WorkflowAction {
  id: string
  type: 'email' | 'task' | 'delay' | 'property_update' | 'notification'
  name: string
  description: string
  delay?: number
}

interface WorkflowTrigger {
  type: 'registration' | 'demo_booked' | 'email_opened' | 'page_visited' | 'form_submitted'
  name: string
  description: string
}

interface Workflow {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  actions: WorkflowAction[]
  status: 'active' | 'paused' | 'draft'
  enrolledContacts: number
  completedContacts: number
  performanceRate: number
  lastTriggered: string
  category: 'nurture' | 'onboarding' | 'retention' | 'sales'
}

export default function HubSpotWorkflowsManager() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    try {
      // Mock workflow data (in production, fetch from HubSpot API)
      const mockWorkflows: Workflow[] = [
        {
          id: 'wf1',
          name: 'New User Onboarding',
          description: 'Welcome series for new registrations',
          trigger: {
            type: 'registration',
            name: 'User Registration',
            description: 'Triggered when a new user registers'
          },
          actions: [
            {
              id: 'a1',
              type: 'email',
              name: 'Welcome Email',
              description: 'Send welcome email immediately'
            },
            {
              id: 'a2',
              type: 'delay',
              name: 'Wait 1 Day',
              description: 'Wait 24 hours',
              delay: 1440
            },
            {
              id: 'a3',
              type: 'email',
              name: 'Getting Started Guide',
              description: 'Send getting started email'
            },
            {
              id: 'a4',
              type: 'delay',
              name: 'Wait 3 Days',
              description: 'Wait 72 hours',
              delay: 4320
            },
            {
              id: 'a5',
              type: 'email',
              name: 'Feature Highlights',
              description: 'Send feature overview email'
            }
          ],
          status: 'active',
          enrolledContacts: 125,
          completedContacts: 98,
          performanceRate: 78.4,
          lastTriggered: '2024-09-24 14:30',
          category: 'onboarding'
        },
        {
          id: 'wf2',
          name: 'Demo Follow-up Sequence',
          description: 'Follow-up series after demo booking',
          trigger: {
            type: 'demo_booked',
            name: 'Demo Booked',
            description: 'Triggered when a demo is scheduled'
          },
          actions: [
            {
              id: 'a6',
              type: 'email',
              name: 'Demo Confirmation',
              description: 'Confirm demo booking details'
            },
            {
              id: 'a7',
              type: 'task',
              name: 'Prepare Demo',
              description: 'Create task for sales team'
            },
            {
              id: 'a8',
              type: 'delay',
              name: 'Wait 1 Day',
              description: 'Wait until day before demo',
              delay: 1440
            },
            {
              id: 'a9',
              type: 'email',
              name: 'Demo Reminder',
              description: 'Send reminder 24h before demo'
            }
          ],
          status: 'active',
          enrolledContacts: 47,
          completedContacts: 42,
          performanceRate: 89.4,
          lastTriggered: '2024-09-24 16:45',
          category: 'sales'
        },
        {
          id: 'wf3',
          name: 'Trial Expiry Nurture',
          description: 'Nurture users before trial expires',
          trigger: {
            type: 'page_visited',
            name: 'Trial Status Page',
            description: 'When user visits trial status page'
          },
          actions: [
            {
              id: 'a10',
              type: 'email',
              name: 'Trial Expiry Warning',
              description: 'Notify about upcoming trial expiry'
            },
            {
              id: 'a11',
              type: 'delay',
              name: 'Wait 2 Days',
              description: 'Wait 48 hours',
              delay: 2880
            },
            {
              id: 'a12',
              type: 'email',
              name: 'Upgrade Incentive',
              description: 'Send special upgrade offer'
            }
          ],
          status: 'paused',
          enrolledContacts: 23,
          completedContacts: 18,
          performanceRate: 65.2,
          lastTriggered: '2024-09-20 09:15',
          category: 'retention'
        },
        {
          id: 'wf4',
          name: 'Re-engagement Campaign',
          description: 'Re-engage inactive users',
          trigger: {
            type: 'email_opened',
            name: 'Email Engagement',
            description: 'When user stops opening emails'
          },
          actions: [
            {
              id: 'a13',
              type: 'email',
              name: 'We Miss You',
              description: 'Re-engagement email'
            },
            {
              id: 'a14',
              type: 'delay',
              name: 'Wait 1 Week',
              description: 'Wait 7 days',
              delay: 10080
            },
            {
              id: 'a15',
              type: 'email',
              name: 'Special Offer',
              description: 'Send discount offer'
            }
          ],
          status: 'draft',
          enrolledContacts: 0,
          completedContacts: 0,
          performanceRate: 0,
          lastTriggered: '',
          category: 'nurture'
        }
      ]

      setWorkflows(mockWorkflows)
    } catch (error) {
      console.error('Failed to fetch workflows:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWorkflowStatus = (workflowId: string) => {
    setWorkflows(prev => prev.map(workflow =>
      workflow.id === workflowId
        ? {
            ...workflow,
            status: workflow.status === 'active' ? 'paused' : 'active'
          }
        : workflow
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'onboarding':
        return <Users className="h-4 w-4" />
      case 'sales':
        return <Target className="h-4 w-4" />
      case 'retention':
        return <BarChart3 className="h-4 w-4" />
      case 'nurture':
        return <Mail className="h-4 w-4" />
      default:
        return <Workflow className="h-4 w-4" />
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-3 w-3" />
      case 'delay':
        return <Clock className="h-3 w-3" />
      case 'task':
        return <CheckCircle className="h-3 w-3" />
      case 'property_update':
        return <Settings className="h-3 w-3" />
      default:
        return <Zap className="h-3 w-3" />
    }
  }

  const filteredWorkflows = workflows.filter(workflow => {
    switch (activeTab) {
      case 'active':
        return workflow.status === 'active'
      case 'paused':
        return workflow.status === 'paused'
      case 'draft':
        return workflow.status === 'draft'
      default:
        return true
    }
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5" />
                Marketing Automation Workflows
              </CardTitle>
              <CardDescription className="text-purple-100">
                Automated HubSpot workflows for customer engagement
              </CardDescription>
            </div>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <Plus className="h-4 w-4 mr-2" />
              New Workflow
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active ({workflows.filter(w => w.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({workflows.filter(w => w.status === 'paused').length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({workflows.filter(w => w.status === 'draft').length})</TabsTrigger>
          <TabsTrigger value="all">All ({workflows.length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredWorkflows.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Workflow className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No workflows found</h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'draft' ? 'Create your first workflow to get started.' : `No ${activeTab} workflows available.`}
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredWorkflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          {getCategoryIcon(workflow.category)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          <CardDescription>{workflow.description}</CardDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(workflow.status)}>
                              {workflow.status === 'active' && <Play className="h-3 w-3 mr-1" />}
                              {workflow.status === 'paused' && <Pause className="h-3 w-3 mr-1" />}
                              {workflow.status === 'draft' && <Settings className="h-3 w-3 mr-1" />}
                              {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                            </Badge>
                            <Badge variant="outline">{workflow.category}</Badge>
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={workflow.status === 'active'}
                        onCheckedChange={() => toggleWorkflowStatus(workflow.id)}
                        disabled={workflow.status === 'draft'}
                      />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Workflow Stats */}
                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{workflow.enrolledContacts}</div>
                        <div className="text-xs text-gray-600">Enrolled</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{workflow.completedContacts}</div>
                        <div className="text-xs text-gray-600">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{workflow.performanceRate}%</div>
                        <div className="text-xs text-gray-600">Performance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{workflow.lastTriggered || 'Never'}</div>
                        <div className="text-xs text-gray-600">Last Triggered</div>
                      </div>
                    </div>

                    {/* Workflow Trigger */}
                    <div>
                      <h4 className="font-medium mb-2">Trigger</h4>
                      <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{workflow.trigger.name}</span>
                        <span className="text-xs text-gray-500">• {workflow.trigger.description}</span>
                      </div>
                    </div>

                    {/* Workflow Actions */}
                    <div>
                      <h4 className="font-medium mb-2">Actions ({workflow.actions.length})</h4>
                      <div className="space-y-2">
                        {workflow.actions.slice(0, 3).map((action, index) => (
                          <div key={action.id} className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs">
                              {index + 1}
                            </div>
                            <div className="flex items-center gap-2">
                              {getActionIcon(action.type)}
                              <span className="text-sm">{action.name}</span>
                              {action.delay && (
                                <Badge variant="outline" className="text-xs">
                                  {action.delay > 1440 ? `${Math.round(action.delay / 1440)}d` : `${Math.round(action.delay / 60)}h`}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                        {workflow.actions.length > 3 && (
                          <div className="text-xs text-gray-500 ml-9">
                            +{workflow.actions.length - 3} more actions
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Workflow Performance Alert */}
                    {workflow.status === 'active' && workflow.performanceRate < 50 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          This workflow has a low performance rate. Consider optimizing the content or timing.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analytics
                      </Button>
                      <Button variant="outline" size="sm">
                        View in HubSpot
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}