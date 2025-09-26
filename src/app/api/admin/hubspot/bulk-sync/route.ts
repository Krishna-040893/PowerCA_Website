import {NextRequest, NextResponse  } from 'next/server'
import {syncMiddleware  } from '@/middleware/hubspot-sync'
import {createAdminClient  } from '@/lib/supabase/admin'
import {logger  } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { syncUsers, syncBookings, syncAffiliates, updateExisting: _updateExisting } = body

    let totalSynced = 0
    const errors: string[] = []

    // Sync Users/Registrations
    if (syncUsers) {
      try {
        // Check if Supabase is configured
        const supabase = createAdminClient()

        // Fetch registrations from Supabase
        const { data: registrations, error } = await supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          logger.error('Error fetching registrations for bulk sync', error)
          errors.push(`Failed to fetch registrations: ${error.message}`)
        } else if (registrations) {
          // Sync each registration to HubSpot
          for (const registration of registrations) {
            try {
              await syncMiddleware.afterUserCreate({
                id: registration.id,
                email: registration.email,
                firstName: registration.name?.split(' ')[0],
                lastName: registration.name?.split(' ').slice(1).join(' '),
                phone: registration.phone,
                firmName: registration.firm_name,
                caNumber: registration.membership_no || registration.membership_number,
                status: 'lead'
              })
              totalSynced++
            } catch (syncError) {
              logger.error(`Failed to sync registration ${registration.id}`, syncError)
              errors.push(`Failed to sync ${registration.email}`)
            }

            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
      } catch (error) {
        logger.error('Error in user sync process', error)
        errors.push('Failed to process user sync')
      }
    }

    // Sync Bookings (if requested)
    if (syncBookings) {
      try {
        const supabase = createAdminClient()

        const { data: bookings, error } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          errors.push(`Failed to fetch bookings: ${error.message}`)
        } else if (bookings) {
          for (const booking of bookings) {
            try {
              await syncMiddleware.afterDemoScheduled({
                email: booking.email,
                firmName: booking.firm_name || 'Unknown',
                contactName: booking.name,
                scheduledTime: booking.demo_date || booking.created_at,
                requirements: booking.requirements || booking.message
              })
              totalSynced++
            } catch (syncError) {
              logger.error(`Failed to sync booking ${booking.id}`, syncError)
              errors.push(`Failed to sync booking for ${booking.email}`)
            }

            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
      } catch (error) {
        logger.error('Error in booking sync process', error)
        errors.push('Failed to process booking sync')
      }
    }

    // Sync Affiliates (if requested)
    if (syncAffiliates) {
      try {
        const supabase = createAdminClient()

        const { data: affiliates, error } = await supabase
          .from('affiliate_applications')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          errors.push(`Failed to fetch affiliates: ${error.message}`)
        } else if (affiliates) {
          for (const affiliate of affiliates) {
            try {
              await syncMiddleware.afterUserCreate({
                id: affiliate.id,
                email: affiliate.email,
                firstName: affiliate.name?.split(' ')[0],
                lastName: affiliate.name?.split(' ').slice(1).join(' '),
                phone: affiliate.phone,
                firmName: affiliate.firm_name,
                status: 'partner'
              })
              totalSynced++
            } catch (syncError) {
              logger.error(`Failed to sync affiliate ${affiliate.id}`, syncError)
              errors.push(`Failed to sync affiliate ${affiliate.email}`)
            }

            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
      } catch (error) {
        logger.error('Error in affiliate sync process', error)
        errors.push('Failed to process affiliate sync')
      }
    }

    logger.info(`Bulk sync completed: ${totalSynced} records synced, ${errors.length} errors`)

    return NextResponse.json({
      success: true,
      totalSynced,
      errors,
      message: errors.length === 0
        ? `Successfully synced ${totalSynced} records to HubSpot`
        : `Synced ${totalSynced} records with ${errors.length} errors`
    })

  } catch (error) {
    logger.error('Bulk sync API error', error)
    return NextResponse.json(
      { error: 'Internal server error during bulk sync' },
      { status: 500 }
    )
  }
}