/**
 * API Route: Profile Photo Upload
 * Handles uploading, updating, and deleting user profile photos
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
  updateProfilePhotoInDB,
  validateImageFile,
} from '@/lib/image-upload'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/user/profile-photo
 * Get current profile photo URL from database
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const userRole = session.user.role

    // Determine user type based on role
    const userType = userRole === 'affiliate' || userRole === 'Affiliate'
      ? 'affiliate'
      : 'regular'

    // Use admin client to fetch profile photo URL
    const supabase = createAdminClient()

    const tableName = userType === 'affiliate'
      ? 'affiliate_registrations'
      : 'registration_forms'

    const { data, error } = await supabase
      .from(tableName)
      .select('profile_photo_url')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile photo URL:', error)
      return NextResponse.json(
        { photoUrl: null },
        { status: 200 }
      )
    }

    return NextResponse.json({
      photoUrl: data?.profile_photo_url || null
    })
  } catch (error) {
    console.error('Profile photo fetch error:', error)
    return NextResponse.json(
      { photoUrl: null },
      { status: 200 }
    )
  }
}

/**
 * POST /api/user/profile-photo
 * Upload a new profile photo
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const userRole = session.user.role

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Get old photo URL to delete later
    const oldPhotoUrl = formData.get('oldPhotoUrl') as string | null

    // Upload new photo (server-side compression disabled)
    const uploadResult = await uploadProfilePhoto(userId, file, false)

    if (!uploadResult.success || !uploadResult.url) {
      return NextResponse.json(
        { error: uploadResult.error || 'Upload failed' },
        { status: 500 }
      )
    }

    // Determine user type based on role
    const userType = userRole === 'affiliate' || userRole === 'Affiliate'
      ? 'affiliate'
      : 'regular'

    // Update database with new photo URL
    const dbUpdateResult = await updateProfilePhotoInDB(
      userId,
      uploadResult.url,
      userType
    )

    if (!dbUpdateResult.success) {
      // If database update fails, try to clean up the uploaded file
      await deleteProfilePhoto(uploadResult.url)
      return NextResponse.json(
        { error: dbUpdateResult.error || 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Delete old photo if it exists
    if (oldPhotoUrl) {
      // Don't wait for deletion, just fire and forget
      deleteProfilePhoto(oldPhotoUrl).catch((error) => {
        console.error('Failed to delete old photo:', error)
      })
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      message: 'Profile photo updated successfully'
    })
  } catch (error) {
    console.error('Profile photo upload error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/profile-photo
 * Delete current profile photo
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const userRole = session.user.role

    // Get photo URL from request body
    const body = await request.json()
    const photoUrl = body.photoUrl as string

    if (!photoUrl) {
      return NextResponse.json(
        { error: 'No photo URL provided' },
        { status: 400 }
      )
    }

    // Delete from storage
    const deleted = await deleteProfilePhoto(photoUrl)

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete photo from storage' },
        { status: 500 }
      )
    }

    // Determine user type based on role
    const userType = userRole === 'affiliate' || userRole === 'Affiliate'
      ? 'affiliate'
      : 'regular'

    // Update database to remove photo URL
    const dbUpdateResult = await updateProfilePhotoInDB(userId, '', userType)

    if (!dbUpdateResult.success) {
      return NextResponse.json(
        { error: dbUpdateResult.error || 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile photo deleted successfully'
    })
  } catch (error) {
    console.error('Profile photo delete error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}
