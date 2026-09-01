import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// Published posters for the homepage carousel. Cached briefly so a newly
// uploaded poster appears quickly without hitting the database on every visit.
export const revalidate = 60

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ posters: [] })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const query = (columns: string) =>
      supabase
        .from('posters')
        .select(columns)
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })

    let { data, error } = await query('id, title, alt_text, image_url, display_order, category')

    // Categories arrived in migration 063. Until that has been run the column
    // is missing, so fall back to the older shape rather than returning
    // nothing and dropping the homepage back to its bundled posters.
    if (error?.message?.includes('category')) {
      logger.warn('posters.category missing, falling back', { error: error.message })
      ;({ data, error } = await query('id, title, alt_text, image_url, display_order'))
    }

    if (error) {
      logger.error('Failed to fetch published posters', { error: error.message })
      return NextResponse.json({ posters: [] })
    }

    // Which category the carousel should open on. Missing table or row simply
    // means "all", so this never blocks the posters themselves.
    let defaultCategory = 'all'
    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'posters_default_category')
      .maybeSingle()

    if (setting?.value) {
      defaultCategory = setting.value
    }

    return NextResponse.json({ posters: data ?? [], defaultCategory })
  } catch (error) {
    logger.error('Unexpected error fetching published posters', { error })
    return NextResponse.json({ posters: [] })
  }
}
