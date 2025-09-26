'use client'

import React, { memo, useState, useCallback } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
  containerClassName?: string
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
  fallbackSrc?: string
}

/**
 * Optimized image component with lazy loading, blur placeholder, and error handling
 */
export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  containerClassName = '',
  objectFit = 'cover',
  sizes,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.jpg'
}) => {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = useCallback(() => {
    setIsLoading(false)
    setHasError(false)
    onLoad?.()
  }, [onLoad])

  const handleError = useCallback(() => {
    setHasError(true)
    setIsLoading(false)
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc)
    }
    onError?.()
  }, [imageSrc, fallbackSrc, onError])

  // Generate blur data URL if not provided
  const getBlurDataURL = () => {
    if (blurDataURL) return blurDataURL
    // Default blur placeholder
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k='
  }

  // Calculate sizes for responsive images
  const getSizes = () => {
    if (sizes) return sizes
    // Default responsive sizes
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
  }

  // If dimensions are provided, use fixed layout
  const hasFixedDimensions = width && height

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse',
            className
          )}
          style={{
            width: width || '100%',
            height: height || '100%'
          }}
        />
      )}

      {/* Error state */}
      {hasError && imageSrc === fallbackSrc && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-gray-100',
            className
          )}
          style={{
            width: width || '100%',
            height: height || '100%'
          }}
        >
          <span className="text-gray-400 text-sm">Failed to load image</span>
        </div>
      )}

      {/* Image component */}
      {hasFixedDimensions ? (
        <Image
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          style={{ objectFit }}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={getBlurDataURL()}
          onLoad={handleLoad}
          onError={handleError}
          sizes={getSizes()}
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          priority={priority}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            className
          )}
          style={{ objectFit }}
          quality={quality}
          placeholder={placeholder}
          blurDataURL={getBlurDataURL()}
          onLoad={handleLoad}
          onError={handleError}
          sizes={getSizes()}
        />
      )}
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

/**
 * Responsive image component that automatically adjusts based on screen size
 */
export const ResponsiveImage = memo<{
  src: string
  alt: string
  aspectRatio?: string
  priority?: boolean
  className?: string
}>(({
  src,
  alt,
  aspectRatio = '16/9',
  priority = false,
  className = ''
}) => {
  return (
    <div
      className={cn('relative w-full', className)}
      style={{ aspectRatio }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        priority={priority}
        objectFit="cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  )
})

ResponsiveImage.displayName = 'ResponsiveImage'

/**
 * Background image component with lazy loading
 */
export const BackgroundImage = memo<{
  src: string
  alt?: string
  children: React.ReactNode
  className?: string
  overlayOpacity?: number
}>(({
  src,
  alt = 'Background image',
  children,
  className = '',
  overlayOpacity = 0.5
}) => {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 -z-10">
        <OptimizedImage
          src={src}
          alt={alt}
          objectFit="cover"
          priority={false}
        />
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black"
          style={{ opacity: overlayOpacity }}
        />
      </div>
      {children}
    </div>
  )
})

BackgroundImage.displayName = 'BackgroundImage'