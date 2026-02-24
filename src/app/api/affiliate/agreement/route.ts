import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { logger } from '@/lib/logger'

// GET - Fetch affiliate agreement status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Try with company signing columns first, fallback if they don't exist yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let affiliate: any = null
    const { data: fullData, error: fullError } = await supabase
      .from('affiliate_registrations')
      .select('agreement_downloaded_at, agreement_uploaded_at, agreement_file_path, agreement_company_signed_at, agreement_company_file_path, full_name')
      .eq('email', session.user.email)
      .single()

    if (fullError && fullError.message?.includes('does not exist')) {
      // Company signing columns not yet added - fallback
      const { data: basicData, error: basicError } = await supabase
        .from('affiliate_registrations')
        .select('agreement_downloaded_at, agreement_uploaded_at, agreement_file_path, full_name')
        .eq('email', session.user.email)
        .single()

      if (basicError && basicError.code !== 'PGRST116') {
        logger.error('Error fetching agreement status', basicError)
        return NextResponse.json({ error: 'Failed to fetch agreement status' }, { status: 500 })
      }
      affiliate = basicData
    } else if (fullError && fullError.code !== 'PGRST116') {
      logger.error('Error fetching agreement status', fullError)
      return NextResponse.json({ error: 'Failed to fetch agreement status' }, { status: 500 })
    } else {
      affiliate = fullData
    }

    return NextResponse.json({
      hasDownloaded: !!affiliate?.agreement_downloaded_at,
      hasUploaded: !!affiliate?.agreement_uploaded_at,
      downloadedAt: affiliate?.agreement_downloaded_at,
      uploadedAt: affiliate?.agreement_uploaded_at,
      filePath: affiliate?.agreement_file_path,
      hasCompanySigned: !!affiliate?.agreement_company_signed_at,
      companySignedAt: affiliate?.agreement_company_signed_at || null,
      companyFilePath: affiliate?.agreement_company_file_path || null,
    })
  } catch (error) {
    logger.error('Error in affiliate agreement GET', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Record agreement download or handle file upload
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    const supabase = createAdminClient()

    // Handle JSON request (mark as downloaded)
    if (contentType.includes('application/json')) {
      const body = await request.json()
      const { action, signingMethod } = body

      if (action === 'download') {
        const { error } = await supabase
          .from('affiliate_registrations')
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
    }

    // Handle file upload (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      // First check if affiliate has downloaded the agreement
      const { data: affiliate, error: fetchError } = await supabase
        .from('affiliate_registrations')
        .select('agreement_downloaded_at, id, full_name')
        .eq('email', session.user.email)
        .single()

      if (fetchError || !affiliate) {
        return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
      }

      if (!affiliate.agreement_downloaded_at) {
        return NextResponse.json({
          error: 'Please download the agreement first before uploading the signed version',
          code: 'DOWNLOAD_REQUIRED'
        }, { status: 400 })
      }

      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
      }

      // Get affiliate name (sanitize for file system - lowercase with hyphens)
      const affiliateName = (affiliate.full_name || 'unknown')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')

      // Create filename - remove "test" word (case-insensitive) and clean up
      const originalFileName = file.name
      const fileNameWithoutExt = originalFileName
        .replace(/\.pdf$/i, '')
        .replace(/-?test-?/gi, '-')  // Remove "test" with surrounding hyphens
        .replace(/--+/g, '-')        // Clean up multiple hyphens
        .replace(/^-|-$/g, '')       // Remove leading/trailing hyphens
      const signedFileName = `${fileNameWithoutExt}-${affiliateName}-signed.pdf`

      // Store in local project folder
      const uploadsDir = path.join(process.cwd(), 'uploads', 'affiliate-signed-agreements')
      const filePath = `uploads/affiliate-signed-agreements/${signedFileName}`
      const fullPath = path.join(uploadsDir, signedFileName)

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Create directory if it doesn't exist and save file locally
      try {
        await mkdir(uploadsDir, { recursive: true })
        await writeFile(fullPath, buffer)
      } catch (fsError) {
        logger.error('Error saving file locally', fsError)
        return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
      }

      // Update affiliate record
      const { error: updateError } = await supabase
        .from('affiliate_registrations')
        .update({
          agreement_uploaded_at: new Date().toISOString(),
          agreement_file_path: filePath
        })
        .eq('email', session.user.email)

      if (updateError) {
        logger.error('Error updating affiliate record', updateError)
        return NextResponse.json({ error: 'Failed to update record' }, { status: 500 })
      }

      return NextResponse.json({ success: true, filePath })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    logger.error('Error in affiliate agreement POST', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
