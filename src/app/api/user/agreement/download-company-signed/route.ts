import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import path from 'path'
import { logger } from '@/lib/logger'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Download company-signed agreement document
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user, error } = await supabase
      .from('registration_forms')
      .select('agreement_company_signed_at, agreement_company_file_path')
      .eq('email', session.user.email)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!user.agreement_company_signed_at || !user.agreement_company_file_path) {
      return NextResponse.json({ error: 'Company has not signed the agreement yet' }, { status: 400 })
    }

    const filePath = user.agreement_company_file_path

    // Security check
    if (!filePath.startsWith('uploads/company-signed-agreements/')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    const fullPath = path.join(process.cwd(), filePath)

    try {
      const fileBuffer = await readFile(fullPath)
      const fileName = path.basename(filePath)

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      })
    } catch (fsError) {
      logger.error('Error reading company-signed file', fsError)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
  } catch (error) {
    logger.error('Error in company-signed download', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
