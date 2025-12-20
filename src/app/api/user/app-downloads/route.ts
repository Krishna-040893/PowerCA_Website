import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Fetch user's app download purchases (only captured/completed payments)
    const { data: downloads, error } = await supabase
      .from('app_download_payments')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('status', 'captured')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching app downloads', error)
      return NextResponse.json(
        { error: 'Failed to fetch downloads' },
        { status: 500 }
      )
    }

    // Format the response
    const formattedDownloads = (downloads || []).map(download => ({
      id: download.id,
      orderId: download.order_id,
      paymentId: download.payment_id,
      productName: download.product_name,
      amount: download.amount,
      downloadCount: download.download_count,
      maxDownloads: download.max_downloads,
      isDownloaded: download.download_count > 0,
      downloadedAt: download.last_download_at,
      purchasedAt: download.created_at,
      status: download.status,
      downloadToken: download.download_token,
      downloadLinkExpiry: download.download_link_expiry
    }))

    return NextResponse.json({
      success: true,
      downloads: formattedDownloads,
      hasDownloads: formattedDownloads.length > 0
    })

  } catch (error) {
    logger.error('Error in app downloads API', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
