/**
 * @fileoverview Utility functions for common operations
 * @module lib/utils
 */

import {clsx, type ClassValue  } from 'clsx'
import {twMerge  } from 'tailwind-merge'

/**
 * Combines Tailwind CSS classes with proper conflict resolution
 *
 * Merges class names using clsx for conditional classes and twMerge for
 * resolving Tailwind CSS conflicts (e.g., "px-2 px-4" becomes "px-4")
 *
 * @param inputs - Class values to combine (strings, objects, arrays)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * ```tsx
 * // Simple usage
 * cn('px-2 py-1', 'px-4') // Returns: 'py-1 px-4'
 *
 * // Conditional classes
 * cn('text-base', isLarge && 'text-lg', isError && 'text-red-500')
 *
 * // With component props
 * <div className={cn('flex items-center', className)} />
 * ```
 *
 * @see {@link https://github.com/dcastil/tailwind-merge|twMerge}
 * @see {@link https://github.com/lukeed/clsx|clsx}
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Dynamically loads an external JavaScript file
 *
 * Creates a script tag and appends it to the document body. Useful for
 * loading third-party libraries like Razorpay, Google Maps, etc.
 *
 * @param src - URL of the script to load
 * @returns Promise that resolves to true if loaded successfully, false otherwise
 *
 * @example
 * ```typescript
 * // Load Razorpay checkout script
 * const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js')
 * if (loaded) {
 *   // Initialize Razorpay
 *   const razorpay = new Razorpay(options)
 * } else {
 *   console.error('Failed to load Razorpay')
 * }
 * ```
 *
 * @remarks
 * - Script is appended to document.body
 * - Does not check if script is already loaded
 * - Resolves false on error instead of rejecting
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement|HTMLScriptElement}
 */
export function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
