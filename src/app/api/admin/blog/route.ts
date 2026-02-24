import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'
import { logger } from '@/lib/logger'

// Safe JSON parse with fallback
function safeJsonParse<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return value as T ?? fallback
  try {
    return JSON.parse(value)
  } catch {
    logger.error('Failed to parse JSON field', { value: typeof value === 'string' ? value.substring(0, 100) : 'non-string' })
    return fallback
  }
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// GET - Fetch all blog posts (including drafts for admin)
export async function GET(_request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { posts: [], error: 'Database configuration missing' },
        { status: 200 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching blog posts:', error)
      return NextResponse.json(
        { posts: [], error: error.message },
        { status: 200 }
      )
    }

    return NextResponse.json({
      posts: posts || [],
      total: posts?.length || 0
    })

  } catch (error) {
    logger.error('Failed to fetch blog posts:', error)
    return NextResponse.json(
      { posts: [], error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 200 }
    )
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const body = await request.json()
    const { title, subtitle, excerpt, content, author, category, readTime, imageUrl, isBreaking, isPublished, documents, keyDates, sidebarSummary } = body

    if (!title || !excerpt || !content || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // Generate slug from title
    let slug = generateSlug(title)

    // Check if slug exists and make it unique
    const { data: existingSlugs } = await supabase
      .from('blog_posts')
      .select('slug')
      .like('slug', `${slug}%`)

    if (existingSlugs && existingSlugs.length > 0) {
      slug = `${slug}-${Date.now()}`
    }

    const { data: newPost, error } = await supabase
      .from('blog_posts')
      .insert({
        title,
        subtitle: subtitle || null,
        slug,
        excerpt,
        content,
        author: author || 'PowerCA Team',
        category,
        read_time: readTime || '5 min read',
        image_url: imageUrl || null,
        is_breaking: isBreaking || false,
        is_published: isPublished !== undefined ? isPublished : true,
        published_at: (isPublished !== undefined ? isPublished : true) ? new Date().toISOString() : null,
        documents: documents ? safeJsonParse(documents, []) : [],
        key_dates: keyDates ? safeJsonParse(keyDates, []) : [],
        sidebar_summary: sidebarSummary ? safeJsonParse(sidebarSummary, {}) : {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating blog post:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      post: newPost,
      message: 'Blog post created successfully'
    })

  } catch (error) {
    logger.error('Failed to create blog post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update blog post
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const body = await request.json()
    const { id, title, subtitle, excerpt, content, author, category, readTime, imageUrl, isBreaking, isPublished, documents, keyDates, sidebarSummary } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Blog post ID is required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) {
      updateData.title = title
      // Regenerate slug if title changed
      updateData.slug = generateSlug(title)
    }
    if (subtitle !== undefined) updateData.subtitle = subtitle
    if (excerpt !== undefined) updateData.excerpt = excerpt
    if (content !== undefined) updateData.content = content
    if (author !== undefined) updateData.author = author
    if (category !== undefined) updateData.category = category
    if (readTime !== undefined) updateData.read_time = readTime
    if (imageUrl !== undefined) updateData.image_url = imageUrl
    if (isBreaking !== undefined) updateData.is_breaking = isBreaking
    if (isPublished !== undefined) updateData.is_published = isPublished
    if (documents !== undefined) updateData.documents = safeJsonParse(documents, [])
    if (keyDates !== undefined) updateData.key_dates = safeJsonParse(keyDates, [])
    if (sidebarSummary !== undefined) updateData.sidebar_summary = safeJsonParse(sidebarSummary, {})

    const { data: updatedPost, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating blog post:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      post: updatedPost,
      message: 'Blog post updated successfully'
    })

  } catch (error) {
    logger.error('Failed to update blog post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete blog post(s)
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })

    // Check for bulk delete (ids in body) or single delete (id in query)
    const { searchParams } = new URL(request.url)
    const singleId = searchParams.get('id')

    if (singleId) {
      // Single delete via query param
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', singleId)

      if (error) {
        logger.error('Error deleting blog post:', error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        message: 'Blog post deleted successfully'
      })
    }

    // Bulk delete via request body
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Blog post ID(s) required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .in('id', ids)

    if (error) {
      logger.error('Error deleting blog posts:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Successfully deleted ${ids.length} blog post(s)`
    })

  } catch (error) {
    logger.error('Failed to delete blog post:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
