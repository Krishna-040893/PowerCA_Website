import {NextRequest, NextResponse  } from 'next/server'
import {createAdminClient  } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET(_request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Check if any admin exists
    const { data: admins, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)

    if (error) {
      logger.error('Error checking for admin', error)
      // If there's an error (like table doesn't exist), assume no admin
      return NextResponse.json({ adminExists: false })
    }

    return NextResponse.json({
      adminExists: admins && admins.length > 0
    })
  } catch (error) {
    logger.error('Error in GET /api/setup/check', error)
    // On any error, allow setup to proceed
    return NextResponse.json({ adminExists: false })
  }
}