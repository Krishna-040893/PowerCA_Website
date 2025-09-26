/**
 * Sanitization utility for preventing XSS attacks in email templates and user input
 */

/**
 * HTML entities that need to be escaped
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
}

/**
 * Escape HTML special characters to prevent XSS
 * @param text The text to escape
 * @returns Escaped text safe for HTML output
 */
export function escapeHtml(text: string): string {
  if (!text) return ''

  return String(text).replace(/[&<>"'`=\/]/g, (char) => {
    return HTML_ENTITIES[char] || char
  })
}

/**
 * Sanitize user input for safe display in HTML
 * @param input The user input to sanitize
 * @param options Sanitization options
 * @returns Sanitized string
 */
export function sanitizeInput(
  input: string,
  options: {
    maxLength?: number
    allowNewlines?: boolean
    allowBasicFormatting?: boolean
  } = {}
): string {
  if (!input) return ''

  let sanitized = String(input)

  // Trim and limit length
  if (options.maxLength) {
    sanitized = sanitized.slice(0, options.maxLength)
  }

  // Remove or replace newlines
  if (!options.allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]+/g, ' ')
  } else {
    // Convert newlines to <br> tags safely
    sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\n/g, '<br>')
  }

  // Basic HTML escaping
  sanitized = escapeHtml(sanitized)

  // If basic formatting is allowed, convert safe markdown-like syntax
  if (options.allowBasicFormatting) {
    // Bold: **text** -> <strong>text</strong>
    sanitized = sanitized.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

    // Italic: *text* -> <em>text</em>
    sanitized = sanitized.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  }

  return sanitized
}

/**
 * Sanitize email address
 * @param email The email to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''

  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  const trimmed = email.trim().toLowerCase()

  if (emailRegex.test(trimmed)) {
    return escapeHtml(trimmed)
  }

  return ''
}

/**
 * Sanitize phone number
 * @param phone The phone number to sanitize
 * @returns Sanitized phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''

  // Remove all non-numeric characters except + for international
  const cleaned = phone.replace(/[^\d+]/g, '')

  // Limit length to prevent abuse
  const limited = cleaned.slice(0, 20)

  return escapeHtml(limited)
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 * @param url The URL to sanitize
 * @returns Sanitized URL or # if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '#'

  const trimmed = url.trim()

  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerUrl = trimmed.toLowerCase()

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return '#'
    }
  }

  // Ensure URL starts with http://, https://, or /
  if (!trimmed.match(/^(https?:\/\/|\/)/i)) {
    return '#'
  }

  return escapeHtml(trimmed)
}

/**
 * Sanitize data for email templates
 * @param data The data object to sanitize
 * @returns Sanitized data object
 */
export function sanitizeEmailData(data: Record<string, unknown>): Record<string, string> {
  const sanitized: Record<string, string> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      sanitized[key] = ''
      continue
    }

    // Handle different data types
    switch (typeof value) {
      case 'string':
        // Special handling for known fields
        if (key.toLowerCase().includes('email')) {
          sanitized[key] = sanitizeEmail(value)
        } else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('mobile')) {
          sanitized[key] = sanitizePhone(value)
        } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
          sanitized[key] = sanitizeUrl(value)
        } else {
          // Default string sanitization
          sanitized[key] = sanitizeInput(value, {
            maxLength: 1000,
            allowNewlines: true
          })
        }
        break

      case 'number':
        sanitized[key] = value.toString()
        break

      case 'boolean':
        sanitized[key] = value.toString()
        break

      case 'object':
        if (Array.isArray(value)) {
          sanitized[key] = value.map(item =>
            typeof item === 'object' ? JSON.stringify(sanitizeEmailData(item)) : sanitizeInput(String(item))
          ).join(', ')
        } else if (value instanceof Date) {
          sanitized[key] = value.toISOString()
        } else {
          sanitized[key] = JSON.stringify(sanitizeEmailData(value as Record<string, unknown>))
        }
        break

      default:
        sanitized[key] = escapeHtml(String(value))
    }
  }

  return sanitized
}

/**
 * Strip all HTML tags from a string
 * @param html The HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return ''

  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '')

  // Decode HTML entities
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '=',
    '&nbsp;': ' '
  }

  for (const [entity, char] of Object.entries(entities)) {
    text = text.replace(new RegExp(entity, 'g'), char)
  }

  return text.trim()
}

/**
 * Validate and sanitize GST number (Indian tax ID)
 * @param gst The GST number to validate
 * @returns Sanitized GST or empty string if invalid
 */
export function sanitizeGST(gst: string): string {
  if (!gst) return ''

  // GST format: 22AAAAA0000A1Z5
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

  const cleaned = gst.toUpperCase().replace(/\s/g, '')

  if (gstRegex.test(cleaned)) {
    return cleaned
  }

  return ''
}