import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'
import fs from 'fs'
import path from 'path'

// File configuration - change this to your actual application file
const APP_FILE_NAME = 'PowerCA-Demo-Setup.exe'
const APP_DOWNLOAD_NAME = 'PowerCA-Demo-Setup.exe'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'

    if (!token) {
      // Redirect to error page
      return NextResponse.redirect(`${baseUrl}/download-error?reason=missing_token`)
    }

    const supabase = createAdminClient()

    // Find the payment record with this token
    const { data: payment, error } = await supabase
      .from('app_download_payments')
      .select('*')
      .eq('download_token', token)
      .single()

    if (error || !payment) {
      logger.warn('Invalid download token attempted', { token: token.substring(0, 10) + '...' })
      return NextResponse.redirect(`${baseUrl}/download-error?reason=invalid_token`)
    }

    // Check if download link already used (one-time download only)
    if (payment.download_count >= 1) {
      logger.info('Download link already used', {
        orderId: payment.order_id,
        downloadCount: payment.download_count
      })
      return NextResponse.redirect(`${baseUrl}/download-error?reason=already_used&orderId=${payment.order_id}`)
    }

    // Get the file path
    const filePath = path.join(process.cwd(), 'public', 'downloads', APP_FILE_NAME)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      logger.error('Download file not found', { filePath })
      return NextResponse.redirect(`${baseUrl}/download-error?reason=file_not_found`)
    }

    // Increment download count BEFORE serving the file
    await supabase
      .from('app_download_payments')
      .update({
        download_count: payment.download_count + 1,
        last_download_at: new Date().toISOString()
      })
      .eq('id', payment.id)

    logger.info('App download completed (one-time link used)', {
      orderId: payment.order_id,
      email: payment.email
    })

    // Read the file and serve it
    const fileBuffer = fs.readFileSync(filePath)
    const fileStats = fs.statSync(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${APP_DOWNLOAD_NAME}"`,
        'Content-Length': fileStats.size.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    logger.error('App download error', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://powerca.in'
    return NextResponse.redirect(`${baseUrl}/download-error?reason=server_error`)
  }
}
