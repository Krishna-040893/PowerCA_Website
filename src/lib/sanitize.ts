/**
 * Server-safe HTML sanitizer
 *
 * Provides XSS protection without requiring DOM/jsdom (which causes ES module issues in Vercel)
 * Strips all HTML tags and dangerous characters
 */

/**
 * Sanitize and remove all HTML tags from a string
 * Safe for server-side use (no DOM/jsdom required)
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  return (
    input
      // Remove all HTML tags
      .replace(/<[^>]*>/g, '')
      // Decode HTML entities to prevent double-encoding attacks
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&amp;/g, '&')
      // Remove null bytes
      .replace(/\0/g, '')
      // Trim whitespace
      .trim()
  )
}

/**
 * Sanitize required field (returns empty string if invalid)
 */
export function sanitizeRequired(value: unknown): string {
  if (typeof value !== 'string') {
    return ''
  }

  const sanitized = sanitizeHtml(value)
  return sanitized || ''
}

/**
 * Sanitize optional field (returns undefined if empty/invalid)
 */
export function sanitizeOptional(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const sanitized = sanitizeHtml(value)
  return sanitized || undefined
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: unknown): string {
  if (typeof email !== 'string') {
    return ''
  }

  // Remove whitespace and convert to lowercase
  const cleaned = email.trim().toLowerCase()

  // Remove any HTML tags (paranoid check)
  const sanitized = sanitizeHtml(cleaned)

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) {
    return ''
  }

  return sanitized
}

/**
 * Sanitize phone number (allows digits, spaces, +, -, (, ))
 */
export function sanitizePhone(phone: unknown): string | undefined {
  if (typeof phone !== 'string') {
    return undefined
  }

  // Remove HTML tags first
  const cleaned = sanitizeHtml(phone)

  // Keep only valid phone characters
  const sanitized = cleaned.replace(/[^0-9+\-() ]/g, '').trim()

  return sanitized || undefined
}

/**
 * Sanitize URL (basic validation)
 */
export function sanitizeUrl(url: unknown): string | undefined {
  if (typeof url !== 'string') {
    return undefined
  }

  const cleaned = sanitizeHtml(url).trim()

  // Must start with http:// or https://
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    return undefined
  }

  try {
    new URL(cleaned)
    return cleaned
  } catch {
    return undefined
  }
}
