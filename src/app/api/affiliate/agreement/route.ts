import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

// Create client inside route handlers to avoid module-level env access issues

// GET - Fetch affiliate agreement status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const { data: affiliate, error } = await supabase
      .from('affiliate_applications')
      .select('agreement_downloaded_at, agreement_uploaded_at, agreement_file_path')
      .eq('email', session.user.email)
      .single()

    if (error && error.code !== 'PGRST116') {
      logger.error('Error fetching agreement status', error)
      return NextResponse.json({ error: 'Failed to fetch agreement status' }, { status: 500 })
    }

    return NextResponse.json({
      hasDownloaded: !!affiliate?.agreement_downloaded_at,
      hasUploaded: !!affiliate?.agreement_uploaded_at,
      downloadedAt: affiliate?.agreement_downloaded_at,
      uploadedAt: affiliate?.agreement_uploaded_at,
      filePath: affiliate?.agreement_file_path
    })
  } catch (error) {
    logger.error('Error in affiliate agreement GET', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Record agreement download
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, signingMethod } = body

    if (action === 'download') {
      const supabase = createAdminClient()
      const { error } = await supabase
        .from('affiliate_applications')
        .update({
          agreement_downloaded_at: new Date().toISOString(),
          agreement_signing_method: signingMethod
        })
        .eq('email', session.user.email)

      if (error) {
        logger.error('Error recording download', error)
        return NextResponse.json({ error: 'Failed to record download' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    logger.error('Error in affiliate agreement POST', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
