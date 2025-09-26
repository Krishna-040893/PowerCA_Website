'use client'

import {useState, useEffect  } from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Badge  } from '@/components/ui/badge'
import {Button  } from '@/components/ui/button'
import {Progress  } from '@/components/ui/progress'
import {Calendar,
  User,
  Target, ArrowRight,
  RefreshCw,
  ExternalLink, Clock,
  AlertCircle
 } from 'lucide-react'

interface Deal {
  id: string
  name: string
  value: number
  stage: string
  probability: number
  closeDate: string
  contactName: string
  contactEmail: string
  lastActivity: string
  daysInStage: number
}

interface PipelineStage {
  id: string
  name: string
  deals: Deal[]
  totalValue: number
  conversionRate: number
  color: string
}

export default function DealPipelineVisualization() {
  const [pipeline, setPipeline] = useState<PipelineStage[]>([])
  const [totalPipelineValue, setTotalPipelineValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [_selectedDeal, _setSelectedDeal] = useState<Deal | null>(null)

  useEffect(() => {
    fetchPipelineData()
  }, [])

  const fetchPipelineData = async () => {
    try {
      // Mock pipeline data (in production, fetch from HubSpot API)
      const mockPipeline: PipelineStage[] = [
        {
          id: '1',
          name: 'Lead',
          color: 'blue',
          conversionRate: 25,
          deals: [
            {
              id: 'deal1',
              name: 'PowerCA Pro - ABC Chartered Accountants',
              value: 25000,
              stage: 'Lead',
              probability: 10,
              closeDate: '2024-10-15',
              contactName: 'Rajesh Kumar',
              contactEmail: 'rajesh@abcca.com',
              lastActivity: '2024-09-20',
              daysInStage: 5
            },
            {
              id: 'deal2',
              name: 'PowerCA Enterprise - XYZ & Associates',
              value: 45000,
              stage: 'Lead',
              probability: 15,
              closeDate: '2024-10-30',
              contactName: 'Priya Sharma',
              contactEmail: 'priya@xyzca.com',
              lastActivity: '2024-09-22',
              daysInStage: 3
            }
          ],
          totalValue: 70000
        },
        {
          id: '2',
          name: 'Demo Scheduled',
          color: 'orange',
          conversionRate: 45,
          deals: [
            {
              id: 'deal3',
              name: 'PowerCA Pro - DEF Consultants',
              value: 30000,
              stage: 'Demo Scheduled',
              probability: 40,
              closeDate: '2024-10-10',
              contactName: 'Amit Patel',
              contactEmail: 'amit@defconsult.com',
              lastActivity: '2024-09-23',
              daysInStage: 2
            }
          ],
          totalValue: 30000
        },
        {
          id: '3',
          name: 'Proposal Sent',
          color: 'purple',
          conversionRate: 60,
          deals: [
            {
              id: 'deal4',
              name: 'PowerCA Enterprise - GHI Partners',
              value: 55000,
              stage: 'Proposal Sent',
              probability: 65,
              closeDate: '2024-10-05',
              contactName: 'Sneha Reddy',
              contactEmail: 'sneha@ghipartners.com',
              lastActivity: '2024-09-21',
              daysInStage: 4
            },
            {
              id: 'deal5',
              name: 'PowerCA Pro - JKL Associates',
              value: 28000,
              stage: 'Proposal Sent',
              probability: 70,
              closeDate: '2024-10-08',
              contactName: 'Vikram Singh',
              contactEmail: 'vikram@jklassoc.com',
              lastActivity: '2024-09-24',
              daysInStage: 1
            }
          ],
          totalValue: 83000
        },
        {
          id: '4',
          name: 'Negotiation',
          color: 'green',
          conversionRate: 80,
          deals: [
            {
              id: 'deal6',
              name: 'PowerCA Enterprise - MNO & Co',
              value: 62000,
              stage: 'Negotiation',
              probability: 85,
              closeDate: '2024-09-30',
              contactName: 'Kavita Joshi',
              contactEmail: 'kavita@mnoco.com',
              lastActivity: '2024-09-24',
              daysInStage: 7
            }
          ],
          totalValue: 62000
        }
      ]

      setPipeline(mockPipeline)
      setTotalPipelineValue(mockPipeline.reduce((sum, stage) => sum + stage.totalValue, 0))
    } catch (error) {
      console.error('Failed to fetch pipeline data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStageColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-500'
  }

  const getStageTextColor = (color: string) => {
    const colors = {
      blue: 'text-blue-700',
      orange: 'text-orange-700',
      purple: 'text-purple-700',
      green: 'text-green-700'
    }
    return colors[color as keyof typeof colors] || 'text-gray-700'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getDaysColor = (days: number) => {
    if (days <= 3) return 'text-green-600'
    if (days <= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

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
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Deal Pipeline
            </CardTitle>
            <CardDescription className="text-indigo-100">
              Total Pipeline Value: {formatCurrency(totalPipelineValue)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Pipeline Overview */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="grid grid-cols-4 gap-4">
            {pipeline.map((stage, index) => (
              <div key={stage.id} className="text-center">
                <div className={`w-full h-2 rounded-full bg-gray-200 mb-2`}>
                  <div
                    className={`h-2 rounded-full ${getStageColor(stage.color)}`}
                    style={{ width: `${stage.conversionRate}%` }}
                  />
                </div>
                <div className="text-sm font-medium">{stage.name}</div>
                <div className="text-xs text-gray-500">{stage.conversionRate}% conversion</div>
                <div className="text-sm font-bold mt-1">{formatCurrency(stage.totalValue)}</div>
                {index < pipeline.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-gray-400 mx-auto mt-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="grid grid-cols-1 lg:grid-cols-4 divide-x">
          {pipeline.map((stage) => (
            <div key={stage.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`font-semibold ${getStageTextColor(stage.color)}`}>
                  {stage.name}
                </h3>
                <Badge variant="secondary">{stage.deals.length}</Badge>
              </div>

              <div className="space-y-3">
                {stage.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => _setSelectedDeal(deal)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 mb-1">
                          {deal.name.split(' - ')[0]}
                        </div>
                        <div className="text-xs text-gray-600">
                          {deal.name.split(' - ')[1]}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{formatCurrency(deal.value)}</span>
                        <Badge variant="outline" className="text-xs">
                          {deal.probability}%
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(deal.closeDate).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>{deal.contactName}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className={getDaysColor(deal.daysInStage)}>
                            {deal.daysInStage} days in stage
                          </span>
                        </div>
                        {deal.daysInStage > 7 && (
                          <AlertCircle className="h-3 w-3 text-red-500" />
                        )}
                      </div>

                      <Progress value={deal.probability} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>

              {stage.deals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No deals in this stage</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pipeline Summary */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {pipeline.reduce((sum, stage) => sum + stage.deals.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Deals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPipelineValue)}
              </div>
              <div className="text-sm text-gray-600">Pipeline Value</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  pipeline.reduce((sum, stage) => sum + stage.conversionRate, 0) / pipeline.length
                )}%
              </div>
              <div className="text-sm text-gray-600">Avg. Conversion</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}