import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const supabase = createAdminClient()

    // Get affiliate info
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliate_applications')
      .select('id, name')
      .eq('email', session.user.email)
      .single()

    if (affiliateError || !affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
    }

    // Get affiliate name (sanitize for file system - lowercase with hyphens)
    const affiliateName = (affiliate.name || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')

    // Create filename: {documentname}-{affiliatename}-signed.pdf
    const originalFileName = file.name
    const fileNameWithoutExt = originalFileName.replace(/\.pdf$/i, '')
    const signedFileName = `${fileNameWithoutExt}-${affiliateName}-signed.pdf`

    // Store in local project folder: uploads/affiliate-signed-agreements/{filename}
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
      .from('affiliate_applications')
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
  } catch (error) {
    logger.error('Error in affiliate agreement upload', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
