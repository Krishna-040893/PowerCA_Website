import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'
import { createAdminClient } from '@/lib/supabase/admin'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// POST - Upload company-signed agreement for affiliate
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminAuth()
    if (!auth) {
      return createUnauthorizedResponse()
    }

    const supabase = createAdminClient()
    const formData = await request.formData()
    const file = formData.get('file') as File
    const affiliateId = formData.get('affiliateId') as string

    if (!file || !affiliateId) {
      return NextResponse.json({ error: 'File and affiliateId are required' }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Fetch affiliate info
    const { data: affiliate, error: fetchError } = await supabase
      .from('affiliate_registrations')
      .select('id, full_name, email, agreement_uploaded_at')
      .eq('id', affiliateId)
      .single()

    if (fetchError || !affiliate) {
      return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 })
    }

    if (!affiliate.agreement_uploaded_at) {
      return NextResponse.json({ error: 'Affiliate has not uploaded their signed agreement yet' }, { status: 400 })
    }

    // Get affiliate name (sanitize for file system)
    const affiliateName = (affiliate.full_name || 'unknown')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')

    // Create filename
    const uploadDate = new Date()
    const day = uploadDate.getDate()
    const month = uploadDate.getMonth() + 1
    const year = uploadDate.getFullYear()
    const dateString = `${day}-${month}-${year}`
    const companySignedFileName = `company-signed-affiliate-${affiliateName}-${dateString}.pdf`

    // Store in local project folder
    const uploadsDir = path.join(process.cwd(), 'uploads', 'company-signed-agreements')
    const filePath = `uploads/company-signed-agreements/${companySignedFileName}`
    const fullPath = path.join(uploadsDir, companySignedFileName)

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create directory if it doesn't exist and save file locally
    try {
      await mkdir(uploadsDir, { recursive: true })
      await writeFile(fullPath, buffer)
    } catch (fsError) {
      console.error('Error saving company-signed file:', fsError)
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
    }

    // Update affiliate record with company signing info
    const { error: updateError } = await supabase
      .from('affiliate_registrations')
      .update({
        agreement_company_signed_at: new Date().toISOString(),
        agreement_company_file_path: filePath
      })
      .eq('id', affiliateId)

    if (updateError) {
      console.error('Error updating affiliate company signing status:', updateError)
      return NextResponse.json({ error: 'Failed to update signing status' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Company-signed agreement uploaded successfully',
      filePath
    })
  } catch (error) {
    console.error('Error in affiliate company-signed upload:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
