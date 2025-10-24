/**
 * Image Upload Utilities for Supabase Storage
 * Handles profile photo uploads, validation, and management
 */

import { createClient } from '@/lib/supabase/client'
import { createAdminClient } from '@/lib/supabase/admin'

// Configuration
const BUCKET_NAME = 'profile-photos'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

/**
 * Validates image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG, PNG, WebP, and GIF images are allowed'
    }
  }

  return { valid: true }
}

/**
 * Compresses image file (basic client-side compression)
 */
export async function compressImage(file: File, maxWidth: number = 800): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Failed to compress image'))
            }
          },
          file.type,
          0.85 // Quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
  })
}

/**
 * Uploads profile photo to Supabase Storage (SERVER-SIDE ONLY)
 * @param userId - User ID for folder organization
 * @param file - Image file to upload
 * @param compress - Whether to compress the image (default: false for server, use client-side compression)
 *
 * NOTE: This function uses the admin client and should only be called from server-side code
 * (API routes, server components, etc.) to bypass RLS policies
 *
 * Server-side compression is disabled because FileReader is browser-only.
 * For compression, do it client-side before sending to API.
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File,
  compress: boolean = false  // Disabled by default on server
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Note: Compression is skipped on server-side as FileReader is browser-only
    // Client-side compression can be done before sending to this API
    const uploadFile = file

    // Use admin client to bypass RLS (since we're using NextAuth, not Supabase Auth)
    const supabase = createAdminClient()

    // Generate unique filename
    const fileExt = uploadFile.name.split('.').pop()
    const fileName = `${userId}/profile-${Date.now()}.${fileExt}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, uploadFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    return { success: true, url: publicUrl }
  } catch (error) {
    console.error('Unexpected error during upload:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    }
  }
}

/**
 * Deletes a profile photo from storage (SERVER-SIDE ONLY)
 * @param photoUrl - Full URL or path of the photo to delete
 *
 * NOTE: This function uses the admin client and should only be called from server-side code
 */
export async function deleteProfilePhoto(photoUrl: string): Promise<boolean> {
  try {
    if (!photoUrl) return false

    // Use admin client to bypass RLS (since we're using NextAuth, not Supabase Auth)
    const supabase = createAdminClient()

    // Extract file path from URL
    const url = new URL(photoUrl)
    const pathMatch = url.pathname.match(/\/profile-photos\/(.+)$/)

    if (!pathMatch || !pathMatch[1]) {
      console.error('Invalid photo URL format')
      return false
    }

    const filePath = pathMatch[1]

    // Delete from storage
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error during delete:', error)
    return false
  }
}

/**
 * Updates user profile photo URL in database (server-side)
 * @param userId - User ID
 * @param photoUrl - New photo URL
 * @param userType - Type of user ('regular' or 'affiliate')
 */
export async function updateProfilePhotoInDB(
  userId: string,
  photoUrl: string,
  userType: 'regular' | 'affiliate' = 'regular'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient()

    const tableName = userType === 'affiliate'
      ? 'affiliate_registrations'
      : 'registration_forms'

    const { error } = await supabase
      .from(tableName)
      .update({ profile_photo_url: photoUrl })
      .eq('id', userId)

    if (error) {
      console.error('Database update error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Unexpected error updating database:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database update failed'
    }
  }
}

/**
 * Gets the current profile photo URL from database
 */
export async function getProfilePhotoUrl(
  userId: string,
  userType: 'regular' | 'affiliate' = 'regular'
): Promise<string | null> {
  try {
    const supabase = createClient()

    const tableName = userType === 'affiliate'
      ? 'affiliate_registrations'
      : 'registration_forms'

    const { data, error } = await supabase
      .from(tableName)
      .select('profile_photo_url')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return data.profile_photo_url
  } catch (error) {
    console.error('Error fetching profile photo URL:', error)
    return null
  }
}
