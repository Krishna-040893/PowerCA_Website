import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'

// GET - Fetch all user agreements for admin
export async function GET() {
  try {
    const auth = await requireAdminAuth()
    if (!auth) {
      return createUnauthorizedResponse()
    }

    const supabase = createAdminClient()

    // Fetch only users who have downloaded the agreement (exclude "not started")
    const { data: agreements, error } = await supabase
      .from('registration_forms')
      .select('id, name, email, phone, role, agreement_downloaded_at, agreement_uploaded_at, agreement_file_path, agreement_signing_method, created_at')
      .not('agreement_downloaded_at', 'is', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching agreements:', error)
      return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 })
    }

    // Transform data with status
    const transformedAgreements = (agreements || []).map(user => {
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
