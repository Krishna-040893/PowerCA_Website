import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth, createUnauthorizedResponse } from '@/lib/auth/admin-session'
import { readFile } from 'fs/promises'
import path from 'path'

// GET - Download affiliate agreement document from local folder
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminAuth()
    if (!auth) {
      return createUnauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json({ error: 'File path is required' }, { status: 400 })
    }

    // Security check: ensure path is within uploads folder
    if (!filePath.startsWith('uploads/affiliate-signed-agreements/')) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Read file from local folder
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
      console.error('Error reading file:', fsError)
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error in affiliate download GET:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
