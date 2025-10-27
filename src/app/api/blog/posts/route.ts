import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { posts: [], error: 'Database configuration missing' },
        { status: 200 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Fetch published blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json(
        { posts: [], error: error.message },
        { status: 200 }
      )
    }

    // Helper function to format date like static blogs (e.g., "September 25, 2025")
    const formatDate = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }

    // Transform data to match BlogPost interface exactly
    const transformedPosts = (posts || []).map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      date: formatDate(post.published_at || post.created_at),
      category: post.category,
      readTime: post.read_time,
      image: post.image_url || '',
      link: `/blog/${post.slug}`,
      isBreaking: post.is_breaking || false
    }))

    return NextResponse.json({
      posts: transformedPosts,
      total: transformedPosts.length
    })

  } catch (error) {
    console.error('Failed to fetch blog posts:', error)
    return NextResponse.json(
      { posts: [], error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 200 }
    )
  }
}
