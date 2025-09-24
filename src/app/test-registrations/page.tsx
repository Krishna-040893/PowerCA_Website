"use client"

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function TestRegistrationsPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .limit(5)

      setResult({
        success: !error,
        error: error?.message,
        data: data,
        count: data?.length || 0,
        supabaseUrl,
        hasAnon: !!supabaseAnonKey
      })
    } catch (err: any) {
      setResult({
        success: false,
        error: err.message,
        data: null,
        count: 0
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Registrations Table</h1>

      <button
        onClick={testConnection}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Results:</h2>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}