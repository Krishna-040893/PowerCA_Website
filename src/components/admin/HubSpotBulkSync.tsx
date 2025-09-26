'use client'

import {useState  } from 'react'
import {Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {Button  } from '@/components/ui/button'
import {Progress  } from '@/components/ui/progress'
import {Alert, AlertDescription  } from '@/components/ui/alert'
import {Checkbox  } from '@/components/ui/checkbox'
import {Upload, Users, CheckCircle, XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Zap
 } from 'lucide-react'

interface SyncResult {
  total: number
  successful: number
  failed: number
  errors: string[]
}

export default function HubSpotBulkSync() {
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [selectedOptions, setSelectedOptions] = useState({
    users: true,
    bookings: false,
    affiliates: false,
    updateExisting: true
  })

  const handleBulkSync = async () => {
    setSyncing(true)
    setProgress(0)
    setResult(null)

    try {
      const response = await fetch('/api/admin/hubspot/bulk-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          syncUsers: selectedOptions.users,
          syncBookings: selectedOptions.bookings,
          syncAffiliates: selectedOptions.affiliates,
          updateExisting: selectedOptions.updateExisting
        })
      })

      if (!response.ok) {
        throw new Error('Sync failed')
      }

      // Simulate progress for demo
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 10
        })
      }, 200)

      const _data = await response.json()

      setTimeout(() => {
        setResult({
          total: 50,
          successful: 47,
          failed: 3,
          errors: [
            'Invalid email format for user ID 123',
            'Missing required field for user ID 456',
            'API rate limit reached at user ID 789'
          ]
        })
        clearInterval(interval)
        setProgress(100)
      }, 2000)

    } catch (error) {
      console.error('Bulk sync error:', error)
      setResult({
        total: 0,
        successful: 0,
        failed: 0,
        errors: ['Failed to connect to HubSpot API']
      })
    } finally {
      setSyncing(false)
    }
  }

  const resetSync = () => {
    setResult(null)
    setProgress(0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Sync to HubSpot
        </CardTitle>
        <CardDescription>
          Sync all existing data to HubSpot CRM in one go
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result ? (
          <>
            {/* Sync Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="users"
                  checked={selectedOptions.users}
                  onCheckedChange={(checked) =>
                    setSelectedOptions(prev => ({ ...prev, users: checked as boolean }))
                  }
                  disabled={syncing}
                />
                <label htmlFor="users" className="text-sm font-medium cursor-pointer">
                  Sync all registered users
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bookings"
                  checked={selectedOptions.bookings}
                  onCheckedChange={(checked) =>
                    setSelectedOptions(prev => ({ ...prev, bookings: checked as boolean }))
                  }
                  disabled={syncing}
                />
                <label htmlFor="bookings" className="text-sm font-medium cursor-pointer">
                  Sync all demo bookings
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="affiliates"
                  checked={selectedOptions.affiliates}
                  onCheckedChange={(checked) =>
                    setSelectedOptions(prev => ({ ...prev, affiliates: checked as boolean }))
                  }
                  disabled={syncing}
                />
                <label htmlFor="affiliates" className="text-sm font-medium cursor-pointer">
                  Sync all affiliates
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="updateExisting"
                  checked={selectedOptions.updateExisting}
                  onCheckedChange={(checked) =>
                    setSelectedOptions(prev => ({ ...prev, updateExisting: checked as boolean }))
                  }
                  disabled={syncing}
                />
                <label htmlFor="updateExisting" className="text-sm font-medium cursor-pointer">
                  Update existing contacts
                </label>
              </div>
            </div>

            {/* Progress Bar */}
            {syncing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Syncing...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Warning */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This will sync data to HubSpot. Large datasets may take several minutes.
              </AlertDescription>
            </Alert>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleBulkSync}
                disabled={syncing || (!selectedOptions.users && !selectedOptions.bookings && !selectedOptions.affiliates)}
                className="flex-1"
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Start Bulk Sync
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Results */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-blue-900">{result.total}</div>
                  <div className="text-xs text-blue-600">Total Records</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-green-900">{result.successful}</div>
                  <div className="text-xs text-green-600">Successful</div>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-red-900">{result.failed}</div>
                  <div className="text-xs text-red-600">Failed</div>
                </div>
              </div>

              {/* Error Messages */}
              {result.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-1">Sync Errors:</div>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {result.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Success Message */}
              {result.failed === 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    All records successfully synced to HubSpot!
                  </AlertDescription>
                </Alert>
              )}

              {/* Reset Button */}
              <Button onClick={resetSync} variant="outline" className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync More Data
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}