import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'
import { logger } from '@/lib/logger'

const DEFAULT_CATEGORY_KEY = 'posters_default_category'

function getServiceClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// DELETE - remove a category, leaving its posters in place but untagged
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
    }

    const name = request.nextUrl.searchParams.get('name')?.trim()
    if (!name) {
      return NextResponse.json({ error: 'A category name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('posters')
      .update({ category: null })
      .eq('category', name)
      .select('id')

    if (error) {
      logger.error('Failed to remove poster category', { error: error.message })
      return NextResponse.json({ error: 'Failed to remove the category' }, { status: 500 })
    }

    // Don't leave the carousel pointing at a category that no longer exists.
    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', DEFAULT_CATEGORY_KEY)
      .maybeSingle()

    if (setting?.value === name) {
      await supabase
        .from('site_settings')
        .upsert(
          { key: DEFAULT_CATEGORY_KEY, value: 'all', updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
    }

    return NextResponse.json({ cleared: data?.length ?? 0 })
  } catch (error) {
    logger.error('Unexpected error removing poster category', { error })
    return NextResponse.json({ error: 'Failed to remove the category' }, { status: 500 })
  }
}

// PUT - rename a category across every poster that uses it
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
    const from = String(body?.from ?? '').trim()
    const to = String(body?.to ?? '').trim()

    if (!from) {
      return NextResponse.json({ error: 'The current category name is required' }, { status: 400 })
    }
    if (!to) {
      return NextResponse.json({ error: 'Enter a new category name' }, { status: 400 })
    }
    if (from === to) {
      return NextResponse.json({ renamed: 0, to })
    }

    const { data, error } = await supabase
      .from('posters')
      .update({ category: to })
      .eq('category', from)
      .select('id')

    if (error) {
      logger.error('Failed to rename poster category', { error: error.message })
      return NextResponse.json({ error: 'Failed to rename the category' }, { status: 500 })
    }

    // Keep the carousel's default pointing at the renamed category rather than
    // one that no longer exists.
    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', DEFAULT_CATEGORY_KEY)
      .maybeSingle()

    if (setting?.value === from) {
      await supabase
        .from('site_settings')
        .upsert(
          { key: DEFAULT_CATEGORY_KEY, value: to, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        )
    }

    return NextResponse.json({ renamed: data?.length ?? 0, to })
  } catch (error) {
    logger.error('Unexpected error renaming poster category', { error })
    return NextResponse.json({ error: 'Failed to rename the category' }, { status: 500 })
  }
}
