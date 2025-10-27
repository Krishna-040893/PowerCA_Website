import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { post: null, error: 'Database configuration missing' },
        { status: 200 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Fetch published blog post by slug
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !post) {
      return NextResponse.json(
        { post: null, error: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      post,
    })
  } catch (error) {
    console.error('Failed to fetch blog post:', error)
    return NextResponse.json(
      { post: null, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
