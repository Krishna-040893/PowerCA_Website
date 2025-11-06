import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

/**
 * DELETE endpoint to remove cached invoice PDF from storage
 * This forces regeneration on next download with updated data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const { invoiceNumber } = await params

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: 'Invoice number is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Delete the PDF from storage
    const filePath = `invoices/${invoiceNumber}.pdf`
    const { error } = await supabase.storage
      .from('invoices')
      .remove([filePath])

    if (error) {
      logger.error('Failed to delete invoice from storage', { invoiceNumber, error })
      // Don't throw error - file might not exist
    }

    logger.info('Invoice deleted from storage, will regenerate on next download', { invoiceNumber })

    return NextResponse.json({
      success: true,
      message: 'Invoice cache cleared. PDF will be regenerated on next download with latest data.',
      invoiceNumber
    })

  } catch (error) {
    logger.error('Error deleting invoice', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}
