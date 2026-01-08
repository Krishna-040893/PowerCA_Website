import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'
import { logger } from '@/lib/logger'

export async function GET(_req: NextRequest) {
  try {
    // Verify admin authentication
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const supabase = createAdminClient()
    const { data: inquiries, error } = await supabase
      .from('enterprise_inquiries')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({ inquiries: [] })
      }
      logger.error('Failed to fetch enterprise inquiries', error)
      return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
    }

    return NextResponse.json({ inquiries: inquiries || [] })
  } catch (error) {
    logger.error('Error in enterprise inquiries API', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Verify admin authentication
    const session = await requireAdminAuth()
    if (!session) {
      return createUnauthorizedResponse()
    }

    const body = await req.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'contacted', 'converted', 'rejected']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
      .from('enterprise_inquiries')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      logger.error('Failed to update enterprise inquiry', error)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Status updated successfully' })
  } catch (error) {
    logger.error('Error updating enterprise inquiry', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
