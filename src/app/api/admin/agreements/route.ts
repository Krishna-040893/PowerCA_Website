import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'

// GET - Fetch all user agreements for admin (registration_forms only)
export async function GET() {
  try {
    const auth = await requireAdminAuth()
    if (!auth) {
      return createUnauthorizedResponse()
    }

    const supabase = createAdminClient()

    // Fetch only users who have downloaded the agreement (exclude "not started")
    // Try with new columns first, fallback if migration hasn't run
    let agreements
    const { data: fullData, error: fullError } = await supabase
      .from('registration_forms')
      .select('id, name, email, phone, role, agreement_downloaded_at, agreement_uploaded_at, agreement_file_path, agreement_signing_method, agreement_company_signed_at, agreement_company_file_path, agreement_final_downloaded_at, created_at')
      .not('agreement_downloaded_at', 'is', null)
      .order('created_at', { ascending: false })

    if (fullError && fullError.message?.includes('does not exist')) {
      const { data: basicData, error: basicError } = await supabase
        .from('registration_forms')
        .select('id, name, email, phone, role, agreement_downloaded_at, agreement_uploaded_at, agreement_file_path, agreement_signing_method, created_at')
        .not('agreement_downloaded_at', 'is', null)
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error fetching agreements:', basicError)
        return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 })
      }
      agreements = basicData
    } else if (fullError) {
      console.error('Error fetching agreements:', fullError)
      return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 })
    } else {
      agreements = fullData
    }

    // Transform data with status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedAgreements = (agreements || []).map((user: any) => {
      let status: 'pending' | 'draft' | 'signed' = 'pending'

      if (user.agreement_uploaded_at) {
        status = 'signed'
      } else if (user.agreement_downloaded_at) {
        status = 'draft'
      }

      return {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'subscriber',
        status,
        downloadedAt: user.agreement_downloaded_at,
        uploadedAt: user.agreement_uploaded_at,
        filePath: user.agreement_file_path,
        signingMethod: user.agreement_signing_method || null,
        companySignedAt: user.agreement_company_signed_at || null,
        companyFilePath: user.agreement_company_file_path || null,
        finalDownloadedAt: user.agreement_final_downloaded_at || null,
        createdAt: user.created_at
      }
    })

    // Calculate stats
    const stats = {
      total: transformedAgreements.length,
      pending: transformedAgreements.filter(a => a.status === 'pending').length,
      draft: transformedAgreements.filter(a => a.status === 'draft').length,
      signed: transformedAgreements.filter(a => a.status === 'signed').length
    }

    return NextResponse.json({
      success: true,
      agreements: transformedAgreements,
      stats
    })
  } catch (error) {
    console.error('Error in agreements GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
