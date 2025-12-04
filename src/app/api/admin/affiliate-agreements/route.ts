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

    // Fetch only affiliates who have downloaded the agreement (exclude "not started")
    const { data: agreements, error } = await supabase
      .from('affiliate_applications')
      .select('id, name, email, phone, agreement_downloaded_at, agreement_uploaded_at, agreement_file_path, created_at')
      .not('agreement_downloaded_at', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching affiliate agreements:', error)
      return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 })
    }

    // Transform data with status
    const transformedAgreements = (agreements || []).map(affiliate => {
      let status: 'draft' | 'signed' = 'draft'

      if (affiliate.agreement_uploaded_at) {
        status = 'signed'
      }

      return {
        id: affiliate.id,
        name: affiliate.name || '',
        email: affiliate.email || '',
        phone: affiliate.phone || '',
        role: 'affiliate',
        status,
        downloadedAt: affiliate.agreement_downloaded_at,
        uploadedAt: affiliate.agreement_uploaded_at,
        filePath: affiliate.agreement_file_path,
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
