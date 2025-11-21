import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/user/addresses/[id] - Get a specific address
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { data: address, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (error || !address) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      address
    })
  } catch (error) {
    console.error('Error in GET /api/user/addresses/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/user/addresses/[id] - Update an address
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      full_name,
      firm_name,
      gst_no,
      address,
      city,
      state,
      postcode,
      country,
      phone,
      email,
      is_default,
      label
    } = body

    const supabase = createAdminClient()

    // Verify ownership
    const { data: existingAddress } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    // Update the address
    const { data: updatedAddress, error } = await supabase
      .from('user_addresses')
      .update({
        full_name,
        firm_name,
        gst_no: gst_no || null,
        address,
        city,
        state,
        postcode,
        country,
        phone,
        email,
        is_default,
        label: label || null
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating address:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update address' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      address: updatedAddress
    })
  } catch (error) {
    console.error('Error in PUT /api/user/addresses/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/user/addresses/[id] - Delete an address
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const supabase = createAdminClient()

    // Verify ownership and check if it's the default address
    const { data: existingAddress } = await supabase
      .from('user_addresses')
      .select('is_default')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    // Delete the address
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error deleting address:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete address' },
        { status: 500 }
      )
    }

    // If the deleted address was default, make another address default
    if (existingAddress.is_default) {
      const { data: remainingAddresses } = await supabase
        .from('user_addresses')
        .select('id')
        .eq('user_id', session.user.id)
        .limit(1)

      if (remainingAddresses && remainingAddresses.length > 0) {
        await supabase
          .from('user_addresses')
          .update({ is_default: true })
          .eq('id', remainingAddresses[0].id)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    })
  } catch (error) {
    console.error('Error in DELETE /api/user/addresses/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
