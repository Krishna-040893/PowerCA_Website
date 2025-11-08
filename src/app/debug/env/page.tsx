'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'

interface EnvCheck {
  timestamp: string
  nodeEnv: string
  checks: {
    nextauth: {
      url: { exists: boolean; value: string; isDefault: boolean }
      secret: { exists: boolean; length: number; isDefault: boolean }
    }
    supabase: {
      url: { exists: boolean; value: string; isDefault: boolean }
      anonKey: { exists: boolean; length: number }
      serviceRoleKey: { exists: boolean; length: number }
    }
  }
  recommendations: string[]
}

export default function EnvDebugPage() {
  const [envCheck, setEnvCheck] = useState<EnvCheck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchEnvCheck = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/debug/env-check')
      if (!response.ok) {
        if (response.status === 403) {
          setError('This debug endpoint is disabled. Set ALLOW_ENV_DEBUG=true in Vercel to enable.')
        } else {
          setError(`Failed to fetch: ${response.status}`)
        }
        return
      }
      const data = await response.json()
      setEnvCheck(data)
    } catch (err) {
      setError('Failed to fetch environment check: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnvCheck()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Environment Variables Debug</h1>
          <p className="text-gray-600">Check if all required environment variables are properly set on Vercel</p>
          <Alert className="mt-4 bg-yellow-50 border-yellow-200">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Security Notice:</strong> This page should only be used for debugging.
              Delete <code className="bg-yellow-100 px-1 rounded">src/app/debug/env</code> and{' '}
              <code className="bg-yellow-100 px-1 rounded">src/app/api/debug/env-check</code> after fixing issues.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex gap-4 mb-6">
          <Button onClick={fetchEnvCheck} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Check
              </>
            )}
          </Button>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {envCheck && (
          <>
            {/* Recommendations */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Issues found with your environment configuration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {envCheck.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      {rec.includes('✅') ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : rec.includes('❌') ? (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* NextAuth Variables */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>NextAuth Configuration</CardTitle>
                <CardDescription>Required for user and affiliate authentication</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">NEXTAUTH_URL</span>
                    {envCheck.checks.nextauth.url.exists ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                    {envCheck.checks.nextauth.url.value}
                  </div>
                  {envCheck.checks.nextauth.url.isDefault && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ This is the default localhost value. Update to your Vercel URL!
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">NEXTAUTH_SECRET</span>
                    {envCheck.checks.nextauth.secret.exists ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    {envCheck.checks.nextauth.secret.exists
                      ? `Set (${envCheck.checks.nextauth.secret.length} characters)`
                      : 'NOT SET'}
                  </div>
                  {envCheck.checks.nextauth.secret.isDefault && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ Using default value. Generate a secure secret!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Supabase Variables */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Supabase Configuration</CardTitle>
                <CardDescription>Required for database access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">NEXT_PUBLIC_SUPABASE_URL</span>
                    {envCheck.checks.supabase.url.exists ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="bg-gray-100 p-3 rounded text-sm font-mono break-all">
                    {envCheck.checks.supabase.url.value}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
                    {envCheck.checks.supabase.anonKey.exists ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    {envCheck.checks.supabase.anonKey.exists
                      ? `Set (${envCheck.checks.supabase.anonKey.length} characters)`
                      : 'NOT SET'}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">SUPABASE_SERVICE_ROLE_KEY</span>
                    {envCheck.checks.supabase.serviceRoleKey.exists ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="bg-gray-100 p-3 rounded text-sm">
                    {envCheck.checks.supabase.serviceRoleKey.exists
                      ? `Set (${envCheck.checks.supabase.serviceRoleKey.length} characters)`
                      : 'NOT SET'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Environment Info */}
            <Card>
              <CardHeader>
                <CardTitle>Environment Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Node Environment:</span>
                    <span className="font-semibold">{envCheck.nodeEnv}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Checked:</span>
                    <span className="font-semibold">
                      {new Date(envCheck.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
