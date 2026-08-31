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

    const { data, error } = await supabase
      .from('posters')
      .select('id, title, alt_text, image_url, display_order')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch published posters', { error: error.message })
      return NextResponse.json({ posters: [] })
    }

    return NextResponse.json({ posters: data ?? [] })
  } catch (error) {
    logger.error('Unexpected error fetching published posters', { error })
    return NextResponse.json({ posters: [] })
  }
}
