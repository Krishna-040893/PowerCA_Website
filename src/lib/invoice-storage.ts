import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logger'

const INVOICE_BUCKET = 'invoices'

/**
 * Upload invoice PDF to Supabase Storage
 * @param invoiceNumber - The invoice number (used as filename)
 * @param pdfBuffer - The PDF buffer
 * @returns Public URL of the uploaded PDF or null if failed
 */
export async function uploadInvoiceToStorage(
  invoiceNumber: string,
  pdfBuffer: Buffer
): Promise<string | null> {
  try {
    const supabase = createAdminClient()
    const fileName = `${invoiceNumber}.pdf`
    const filePath = `invoices/${fileName}`

    logger.info('Uploading invoice to storage', { invoiceNumber, filePath })

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(INVOICE_BUCKET)
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true, // Overwrite if exists
        cacheControl: '31536000', // Cache for 1 year
      })

    if (error) {
      logger.error('Failed to upload invoice to storage', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(INVOICE_BUCKET)
      .getPublicUrl(filePath)

    logger.info('Invoice uploaded successfully', {
      invoiceNumber,
      publicUrl,
      path: data.path
    })

    return publicUrl
  } catch (error) {
    logger.error('Exception uploading invoice to storage', error)
    return null
  }
}

/**
 * Download invoice PDF from Supabase Storage
 * @param invoiceNumber - The invoice number
 * @returns PDF buffer or null if not found
 */
export async function downloadInvoiceFromStorage(
  invoiceNumber: string
): Promise<Buffer | null> {
  try {
    const supabase = createAdminClient()
    const filePath = `invoices/${invoiceNumber}.pdf`

    logger.info('Downloading invoice from storage', { invoiceNumber, filePath })

    const { data, error } = await supabase.storage
      .from(INVOICE_BUCKET)
      .download(filePath)

    if (error) {
      logger.info('Invoice not found in storage', { invoiceNumber, error: error.message })
      return null
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    logger.info('Invoice downloaded from storage', {
      invoiceNumber,
      size: buffer.length
    })

    return buffer
  } catch (error) {
    logger.error('Exception downloading invoice from storage', error)
    return null
  }
}

/**
 * Check if invoice exists in storage
 * @param invoiceNumber - The invoice number
 * @returns True if exists, false otherwise
 */
export async function invoiceExistsInStorage(
  invoiceNumber: string
): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const filePath = `invoices/${invoiceNumber}.pdf`

    const { data, error } = await supabase.storage
      .from(INVOICE_BUCKET)
      .list('invoices', {
        search: `${invoiceNumber}.pdf`
      })

    if (error) {
      return false
    }

    return data.length > 0
  } catch (error) {
    logger.error('Exception checking invoice existence in storage', error)
    return false
  }
}

/**
 * Get public URL for invoice (without downloading)
 * @param invoiceNumber - The invoice number
 * @returns Public URL or null
 */
export async function getInvoicePublicUrl(
  invoiceNumber: string
): Promise<string | null> {
  try {
    const exists = await invoiceExistsInStorage(invoiceNumber)
    if (!exists) {
      return null
    }

    const supabase = createAdminClient()
    const filePath = `invoices/${invoiceNumber}.pdf`

    const { data: { publicUrl } } = supabase.storage
      .from(INVOICE_BUCKET)
      .getPublicUrl(filePath)

    return publicUrl
  } catch (error) {
    logger.error('Exception getting invoice public URL', error)
    return null
  }
}
