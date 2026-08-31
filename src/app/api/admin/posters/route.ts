import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'
import { logger } from '@/lib/logger'

const BUCKET = 'posters'
const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp']

function getServiceClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

// GET - All posters, published or not, for the admin list
export async function GET(_request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({ posters: [], error: 'Database configuration missing' }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('posters')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to fetch posters', { error: error.message })
      return NextResponse.json({ posters: [], error: 'Failed to fetch posters' }, { status: 500 })
    }

    return NextResponse.json({ posters: data ?? [] })
  } catch (error) {
    logger.error('Unexpected error fetching posters', { error })
    return NextResponse.json({ posters: [], error: 'Failed to fetch posters' }, { status: 500 })
  }
}

// POST - Upload a poster image and create its row
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const supabase = getServiceClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const title = String(formData.get('title') ?? '').trim()
    const altText = String(formData.get('altText') ?? '').trim()

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'An image file is required' }, { status: 400 })
    }
    if (!title) {
      return NextResponse.json({ error: 'A title is required' }, { status: 400 })
    }
    if (!altText) {
      return NextResponse.json({ error: 'Alt text is required so the poster is accessible' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only PNG, JPEG and WebP images are allowed' }, { status: 400 })
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
    const storagePath = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, { cacheControl: '3600', upsert: false, contentType: file.type })

    if (uploadError) {
      logger.error('Failed to upload poster image', { error: uploadError.message })
      return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

    // Place new posters at the end of the carousel.
    const { data: lastPoster } = await supabase
      .from('posters')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const displayOrder = (lastPoster?.display_order ?? -1) + 1

    const { data, error } = await supabase
      .from('posters')
      .insert({
        title,
        alt_text: altText,
        image_url: publicUrl,
        storage_path: storagePath,
        display_order: displayOrder,
        is_published: true,
      })
      .select()
      .single()

    if (error) {
      // Don't leave the uploaded file orphaned if the row insert failed.
      await supabase.storage.from(BUCKET).remove([storagePath])
      logger.error('Failed to create poster', { error: error.message })
      return NextResponse.json({ error: 'Failed to save poster' }, { status: 500 })
    }

    return NextResponse.json({ poster: data })
  } catch (error) {
    logger.error('Unexpected error creating poster', { error })
    return NextResponse.json({ error: 'Failed to save poster' }, { status: 500 })
  }
}

// PATCH - Update a poster's details, publish state or position
export async function PATCH(request: NextRequest) {
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
    const { id, title, altText, isPublished, displayOrder } = body

    if (!id) {
      return NextResponse.json({ error: 'Poster id is required' }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = String(title).trim()
    if (altText !== undefined) updateData.alt_text = String(altText).trim()
    if (isPublished !== undefined) updateData.is_published = Boolean(isPublished)
    if (displayOrder !== undefined) updateData.display_order = Number(displayOrder)

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('posters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update poster', { error: error.message })
      return NextResponse.json({ error: 'Failed to update poster' }, { status: 500 })
    }

    return NextResponse.json({ poster: data })
  } catch (error) {
    logger.error('Unexpected error updating poster', { error })
    return NextResponse.json({ error: 'Failed to update poster' }, { status: 500 })
  }
}

// DELETE - Remove a poster and its stored image
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

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Poster id is required' }, { status: 400 })
    }

    const { data: poster } = await supabase
      .from('posters')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle()

    const { error } = await supabase.from('posters').delete().eq('id', id)

    if (error) {
      logger.error('Failed to delete poster', { error: error.message })
      return NextResponse.json({ error: 'Failed to delete poster' }, { status: 500 })
    }

    if (poster?.storage_path) {
      await supabase.storage.from(BUCKET).remove([poster.storage_path])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Unexpected error deleting poster', { error })
    return NextResponse.json({ error: 'Failed to delete poster' }, { status: 500 })
  }
}
