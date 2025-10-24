import {NextRequest, NextResponse  } from 'next/server'
import {createAdminClient  } from '@/lib/supabase/admin'
import {REGISTRATION_FORMS_TABLE  } from '@/lib/constants/tables'

export async function GET(request: NextRequest) {
  try {

    const supabase = createAdminClient()

    // Test basic connection
    const { data, error, count } = await supabase
      .from(REGISTRATION_FORMS_TABLE)
      .select('*', { count: 'exact' })
      .limit(5)


    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      })
    }

    return NextResponse.json({
      success: true,
      count,
      data,
      message: 'Successfully connected to Supabase registration_forms table'
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: errorStack
    })
  }
}
