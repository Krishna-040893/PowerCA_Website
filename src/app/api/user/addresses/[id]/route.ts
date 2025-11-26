import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'

// Common spelling corrections for Indian cities
const citySpellingCorrections: Record<string, string> = {
  'bangalroe': 'Bangalore', 'banglore': 'Bangalore', 'banglaore': 'Bangalore',
  'bengluru': 'Bangalore', 'bengaluru': 'Bangalore', 'bangaluru': 'Bangalore',
  'banagalore': 'Bangalore', 'bangalore': 'Bangalore',
  'mumbai': 'Mumbai', 'mubai': 'Mumbai', 'mumbaii': 'Mumbai', 'bombay': 'Mumbai',
  'delhi': 'Delhi', 'dehli': 'Delhi', 'delli': 'Delhi',
  'newdelhi': 'New Delhi', 'new delhi': 'New Delhi',
  'chennai': 'Chennai', 'chenai': 'Chennai', 'channai': 'Chennai', 'madras': 'Chennai',
  'hyderabad': 'Hyderabad', 'hydrabad': 'Hyderabad', 'hiderabad': 'Hyderabad',
  'kolkata': 'Kolkata', 'kolkatta': 'Kolkata', 'calcutta': 'Kolkata',
  'pune': 'Pune', 'poona': 'Pune', 'puna': 'Pune',
  'ahmedabad': 'Ahmedabad', 'ahemdabad': 'Ahmedabad', 'ahmadabad': 'Ahmedabad',
  'jaipur': 'Jaipur', 'jaiur': 'Jaipur', 'jaipure': 'Jaipur',
  'lucknow': 'Lucknow', 'luknow': 'Lucknow', 'luckow': 'Lucknow',
  'chandigarh': 'Chandigarh', 'chandigrah': 'Chandigarh',
  'gurgaon': 'Gurugram', 'gurugram': 'Gurugram', 'gurgoan': 'Gurugram',
  'noida': 'Noida', 'nodia': 'Noida',
  'coimbatore': 'Coimbatore', 'coimbatur': 'Coimbatore',
  'indore': 'Indore', 'indor': 'Indore',
  'kochi': 'Kochi', 'cochin': 'Kochi', 'kochin': 'Kochi',
  'nagpur': 'Nagpur', 'nagpure': 'Nagpur',
  'surat': 'Surat', 'suart': 'Surat',
  'vadodara': 'Vadodara', 'baroda': 'Vadodara',
  'visakhapatnam': 'Visakhapatnam', 'vizag': 'Visakhapatnam',
  'bhopal': 'Bhopal', 'bhoapl': 'Bhopal',
  'patna': 'Patna', 'panta': 'Patna',
  'ranchi': 'Ranchi', 'rachi': 'Ranchi',
  'thiruvananthapuram': 'Thiruvananthapuram', 'trivandrum': 'Thiruvananthapuram',
}

// Helper function to normalize location name (Title Case + Spelling Correction)
const normalizeLocation = (location: string): string => {
  if (!location) return ''
  const trimmed = location.trim().toLowerCase()
  if (citySpellingCorrections[trimmed]) {
    return citySpellingCorrections[trimmed]
  }
  return trimmed
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

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
        label: label ? normalizeLocation(label) : null
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
