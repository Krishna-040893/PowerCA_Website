import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'
import { logger } from '@/lib/logger'

// Which category the homepage carousel opens on. 'all' (or no row) means every
// poster, which is the default.
const DEFAULT_CATEGORY_KEY = 'posters_default_category'

const MISSING_TABLE_HINT =
  'The site_settings table does not exist yet. Run supabase/migrations/064_create_site_settings.sql in the Supabase SQL editor, then try again.'

function isMissingTable(message: string) {
  return message.includes('site_settings') && (message.includes('does not exist') || message.includes('schema cache'))
}

function getServiceClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// GET - the category the carousel currently opens on
export async function GET(_request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({ defaultCategory: 'all' })
    }

    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', DEFAULT_CATEGORY_KEY)
      .maybeSingle()

    if (error) {
      logger.warn('Could not read the default poster category', { error: error.message })
      return NextResponse.json({ defaultCategory: 'all' })
    }

    return NextResponse.json({ defaultCategory: data?.value || 'all' })
  } catch (error) {
    logger.error('Unexpected error reading poster settings', { error })
    return NextResponse.json({ defaultCategory: 'all' })
  }
}

// PUT - change the category the carousel opens on
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
    }

    const body = await request.json()
    const defaultCategory = String(body?.defaultCategory ?? 'all').trim() || 'all'

    const { error } = await supabase
      .from('site_settings')
      .upsert(
        { key: DEFAULT_CATEGORY_KEY, value: defaultCategory, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (error) {
      logger.error('Failed to save the default poster category', { error: error.message })
      return NextResponse.json(
        { error: isMissingTable(error.message) ? MISSING_TABLE_HINT : 'Failed to save the setting' },
        { status: 500 }
      )
    }

    return NextResponse.json({ defaultCategory })
  } catch (error) {
    logger.error('Unexpected error saving poster settings', { error })
    return NextResponse.json({ error: 'Failed to save the setting' }, { status: 500 })
  }
}
