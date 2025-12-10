import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { logger } from '@/lib/logger'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch agreement document status
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error } = await supabase
      .from('registration_forms')
      .select('agreement_downloaded_at, agreement_uploaded_at, agreement_file_path, agreement_signing_method')
      .eq('email', session.user.email)
      .single()

    if (error) {
      logger.error('Error fetching agreement status', error)
      return NextResponse.json({ error: 'Failed to fetch agreement status' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        hasDownloaded: !!user?.agreement_downloaded_at,
        downloadedAt: user?.agreement_downloaded_at,
        hasUploaded: !!user?.agreement_uploaded_at,
        uploadedAt: user?.agreement_uploaded_at,
        filePath: user?.agreement_file_path,
        signingMethod: user?.agreement_signing_method
      }
    })
  } catch (error) {
    logger.error('Error in agreement GET', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Mark agreement as downloaded or upload signed agreement
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''

    // Handle JSON request (mark as downloaded or submit digital signature)
    if (contentType.includes('application/json')) {
      const body = await request.json()

      if (body.action === 'download') {
        const signingMethod = body.signingMethod || 'manual'
        const { error } = await supabase
          .from('registration_forms')
          .update({
            agreement_downloaded_at: new Date().toISOString(),
            agreement_signing_method: signingMethod
          })
          .eq('email', session.user.email)

        if (error) {
          logger.error('Error marking agreement as downloaded', error)
          return NextResponse.json({ error: 'Failed to update download status' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Download recorded', signingMethod })
      }

      // Handle digital signature submission
      if (body.action === 'sign' && body.signatureData) {
        // First check if user has downloaded the agreement
        const { data: user, error: fetchError } = await supabase
          .from('registration_forms')
          .select('agreement_downloaded_at, id')
          .eq('email', session.user.email)
          .single()

        if (fetchError || !user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (!user.agreement_downloaded_at) {
          return NextResponse.json({
            error: 'Please download the agreement first before signing',
            code: 'DOWNLOAD_REQUIRED'
          }, { status: 400 })
        }

        // Convert base64 signature to buffer
        const base64Data = body.signatureData.replace(/^data:image\/png;base64,/, '')
        const signatureBuffer = Buffer.from(base64Data, 'base64')

        // Create unique filename for signature
        const timestamp = Date.now()
        const sanitizedEmail = session.user.email.replace(/[^a-zA-Z0-9]/g, '_')
        const fileName = `${sanitizedEmail}_signature_${timestamp}.png`
        const filePath = `signatures/${fileName}`

        // Upload signature to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('signed-agreements')
          .upload(filePath, signatureBuffer, {
            contentType: 'image/png',
            upsert: true
          })

        if (uploadError) {
          logger.error('Error uploading signature', uploadError)
          return NextResponse.json({ error: 'Failed to upload signature' }, { status: 500 })
        }

        // Update database with signature info
        const { error: updateError } = await supabase
          .from('registration_forms')
          .update({
            agreement_uploaded_at: new Date().toISOString(),
            agreement_file_path: filePath,
            agreement_signed_digitally: true
          })
          .eq('email', session.user.email)

        if (updateError) {
          logger.error('Error updating agreement status', updateError)
          return NextResponse.json({ error: 'Failed to update signature status' }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: 'Agreement signed digitally',
          filePath
        })
      }
    }

    // Handle file upload (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      // First check if user has downloaded the agreement
      const { data: user, error: fetchError } = await supabase
        .from('registration_forms')
        .select('agreement_downloaded_at, id, name')
        .eq('email', session.user.email)
        .single()

      if (fetchError || !user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      if (!user.agreement_downloaded_at) {
        return NextResponse.json({
          error: 'Please download the agreement first before uploading the signed version',
          code: 'DOWNLOAD_REQUIRED'
        }, { status: 400 })
      }

      const formData = await request.formData()
      const file = formData.get('file') as File
      const signingMethod = formData.get('signingMethod') as string || 'manual'

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Validate file type
      if (file.type !== 'application/pdf') {
        return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
      }

      // Get user name (sanitize for file system - lowercase with hyphens)
      const userName = (user.name || 'unknown')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')

      // Format as DDsigned (e.g., 10signed)
      const uploadDate = new Date()
      const day = uploadDate.getDate()
      const dateString = `${day}signed`

      // Create filename: {documentname}-{username}-{date}signed.pdf
      // Remove any existing "-signed" suffix to avoid duplication like "signed-signed"
      const originalFileName = file.name
      const fileNameWithoutExt = originalFileName
        .replace(/\.pdf$/i, '')
        .replace(/-signed$/i, '')  // Remove existing -signed suffix if present
        .replace(/_signed$/i, '')  // Remove existing _signed suffix if present

      const signedFileName = `${fileNameWithoutExt}-${userName}-${dateString}.pdf`

      // Store in local project folder: uploads/client-signed-agreements/{filename}
      const uploadsDir = path.join(process.cwd(), 'uploads', 'client-signed-agreements')
      const filePath = `uploads/client-signed-agreements/${signedFileName}`
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

      // Update database with upload info and signing method
      const { error: updateError } = await supabase
        .from('registration_forms')
        .update({
          agreement_uploaded_at: new Date().toISOString(),
          agreement_file_path: filePath,
          agreement_signing_method: signingMethod
        })
        .eq('email', session.user.email)

      if (updateError) {
        logger.error('Error updating agreement status', updateError)
        return NextResponse.json({ error: 'Failed to update upload status' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Agreement uploaded successfully',
        filePath
      })
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    logger.error('Error in agreement POST', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
