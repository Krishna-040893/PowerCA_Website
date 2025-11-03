import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function DELETE(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Delete user's data from related tables
    // Note: Depending on your database setup and foreign key constraints,
    // you might need to delete in a specific order

    const userEmail = session.user.email

    // Delete payments
    const { error: paymentsError } = await supabase
      .from('payments')
      .delete()
      .eq('email', userEmail)

    if (paymentsError) {
      logger.error('Error deleting user payments', paymentsError)
    }

    // Delete user registrations
    const { error: registrationsError } = await supabase
      .from('registrations')
      .delete()
      .eq('email', userEmail)

    if (registrationsError) {
      logger.error('Error deleting user registrations', registrationsError)
    }

    // Delete from users table if it exists
    // Note: You may need to adjust this based on your actual table structure
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('email', userEmail)

    if (userError && userError.code !== 'PGRST116') { // Ignore "not found" errors
      logger.error('Error deleting user', userError)
    }

    logger.info('User account deleted successfully', { email: userEmail })

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    })

  } catch (error) {
    logger.error('Error deleting user account', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
