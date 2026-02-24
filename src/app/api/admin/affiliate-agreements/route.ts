import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'

// GET - Fetch all affiliate agreements for admin
export async function GET() {
  try {
    const auth = await requireAdminAuth()
    if (!auth) {
      return createUnauthorizedResponse()
    }

    const supabase = createAdminClient()

    // Try with company signing columns first, fallback if they don't exist yet
    let agreements
    const { data: fullData, error: fullError } = await supabase
      .from('affiliate_registrations')
      .select('id, full_name, email, phone, agreement_downloaded_at, agreement_uploaded_at, agreement_file_path, agreement_signing_method, agreement_company_signed_at, agreement_company_file_path, created_at')
      .not('agreement_downloaded_at', 'is', null)
      .order('created_at', { ascending: false })

    if (fullError && fullError.message?.includes('does not exist')) {
      // Company signing columns not yet added - fallback
      const { data: basicData, error: basicError } = await supabase
        .from('affiliate_registrations')
        .select('id, full_name, email, phone, agreement_downloaded_at, agreement_uploaded_at, agreement_file_path, agreement_signing_method, created_at')
        .not('agreement_downloaded_at', 'is', null)
        .order('created_at', { ascending: false })

      if (basicError) {
        console.error('Error fetching affiliate agreements:', basicError)
        if (basicError.message?.includes('agreement_downloaded_at') || basicError.code === '42703') {
          return NextResponse.json({
            success: true,
            agreements: [],
            stats: { total: 0, draft: 0, signed: 0 }
          })
        }
        return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 })
      }
      agreements = basicData
    } else if (fullError) {
      console.error('Error fetching affiliate agreements:', fullError)
      if (fullError.code === '42703') {
        return NextResponse.json({
          success: true,
          agreements: [],
          stats: { total: 0, draft: 0, signed: 0 }
        })
      }
      return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 })
    } else {
      agreements = fullData
    }

    // Transform data with status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedAgreements = (agreements || []).map((affiliate: any) => {
      let status: 'draft' | 'signed' = 'draft'

      if (affiliate.agreement_uploaded_at) {
        status = 'signed'
      }

      return {
        id: affiliate.id,
        name: affiliate.full_name || '',
        email: affiliate.email || '',
        phone: affiliate.phone || '',
        role: 'affiliate',
        status,
        downloadedAt: affiliate.agreement_downloaded_at,
        uploadedAt: affiliate.agreement_uploaded_at,
        filePath: affiliate.agreement_file_path,
        signingMethod: affiliate.agreement_signing_method || null,
        companySignedAt: affiliate.agreement_company_signed_at || null,
        companyFilePath: affiliate.agreement_company_file_path || null,
        createdAt: affiliate.created_at
      }
    })

    // Calculate stats
    const stats = {
      total: transformedAgreements.length,
      draft: transformedAgreements.filter(a => a.status === 'draft').length,
      signed: transformedAgreements.filter(a => a.status === 'signed').length
    }

    return NextResponse.json({
      success: true,
      agreements: transformedAgreements,
      stats
    })
  } catch (error) {
    console.error('Error in affiliate agreements GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
