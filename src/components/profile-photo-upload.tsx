'use client'

/**
 * Profile Photo Upload Component
 * Reusable component for uploading and managing user profile photos
 */

import { useState, useRef, ChangeEvent, useEffect } from 'react'
import Image from 'next/image'
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react'

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null
  onPhotoUpdate?: (newUrl: string) => void
  onPhotoDelete?: () => void
  size?: 'sm' | 'md' | 'lg'
  editable?: boolean
  showActionButtons?: boolean
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoUpdate,
  onPhotoDelete,
  size = 'md',
  editable = true,
  showActionButtons = false,
}: ProfilePhotoUploadProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync internal state when prop changes
  useEffect(() => {
    setPhotoUrl(currentPhotoUrl || null)
  }, [currentPhotoUrl])

  // Size configurations
  const sizeConfig = {
    sm: { container: 'w-20 h-20', text: 'text-xs', button: 'w-9 h-9', icon: 16 },
    md: { container: 'w-28 h-28', text: 'text-sm', button: 'w-11 h-11', icon: 18 },
    lg: { container: 'w-36 h-36', text: 'text-base', button: 'w-14 h-14', icon: 20 },
  }

  const currentSize = sizeConfig[size]

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    handleUpload(file)
  }

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      if (photoUrl) {
        formData.append('oldPhotoUrl', photoUrl)
      }

      const response = await fetch('/api/user/profile-photo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setPhotoUrl(data.url)
      setPreviewUrl(null)
      onPhotoUpdate?.(data.url)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload photo')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!photoUrl) return

    const confirmed = confirm('Are you sure you want to delete your profile photo?')
    if (!confirmed) return

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch('/api/user/profile-photo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed')
      }

      setPhotoUrl(null)
      onPhotoDelete?.()
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete photo')
    } finally {
      setIsDeleting(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const displayUrl = previewUrl || photoUrl

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Photo Display */}
      <div className="relative">
        <div
          className={`${currentSize.container} rounded-full border-4 border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center relative group`}
        >
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Profile photo"
              fill
              className="object-cover"
              sizes={size === 'sm' ? '80px' : size === 'md' ? '128px' : '160px'}
            />
          ) : (
            <div className="text-gray-400 dark:text-gray-500">
              <Camera size={size === 'sm' ? 24 : size === 'md' ? 32 : 40} />
            </div>
          )}

          {/* Loading Overlay */}
          {(isUploading || isDeleting) && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className="animate-spin text-white" size={24} />
            </div>
          )}

          {/* Hover Overlay - Only show when editable and not uploading */}
          {editable && !isUploading && !isDeleting && (
            <div
              onClick={triggerFileInput}
              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <Upload className="text-white" size={24} />
            </div>
          )}
        </div>

        {/* Edit/Remove Button Badge */}
        {editable && !isUploading && !isDeleting && (
          <button
            onClick={photoUrl ? handleDelete : triggerFileInput}
            className={`absolute bottom-0 right-0 ${currentSize.button} ${
              photoUrl
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center`}
            aria-label={photoUrl ? 'Remove photo' : 'Edit photo'}
            title={photoUrl ? 'Remove photo' : 'Upload photo'}
          >
            {photoUrl ? (
              <Trash2 size={currentSize.icon} />
            ) : (
              <Camera size={currentSize.icon} />
            )}
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={!editable || isUploading || isDeleting}
      />

      {/* Action Buttons */}
      {editable && showActionButtons && (
        <div className="flex gap-2">
          <button
            onClick={triggerFileInput}
            disabled={isUploading || isDeleting}
            className={`${currentSize.text} px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2`}
          >
            {isUploading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                {photoUrl ? 'Change' : 'Upload'}
              </>
            )}
          </button>

          {photoUrl && (
            <button
              onClick={handleDelete}
              disabled={isUploading || isDeleting}
              className={`${currentSize.text} px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2`}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm text-center">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {editable && !error && (
        <p className="text-gray-500 dark:text-gray-400 text-xs text-center whitespace-nowrap">
          Max size: 5MB. Formats: JPG, PNG, WebP, GIF
        </p>
      )}
    </div>
  )
}
