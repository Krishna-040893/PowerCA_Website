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

// GET /api/user/addresses - List all addresses for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    const { data: addresses, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching addresses:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch addresses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      addresses: addresses || []
    })
  } catch (error) {
    console.error('Error in GET /api/user/addresses:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/user/addresses - Create a new address
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Validation
    if (!full_name || !firm_name || !address || !city || !state || !postcode || !country || !phone || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // If this is the first address, make it default
    const { data: existingAddresses } = await supabase
      .from('user_addresses')
      .select('id')
      .eq('user_id', session.user.id)

    const shouldBeDefault = !existingAddresses || existingAddresses.length === 0 || is_default

    const { data: newAddress, error } = await supabase
      .from('user_addresses')
      .insert({
        user_id: session.user.id,
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
        is_default: shouldBeDefault,
        label: label ? normalizeLocation(label) : null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating address:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create address' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      address: newAddress
    })
  } catch (error) {
    console.error('Error in POST /api/user/addresses:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
