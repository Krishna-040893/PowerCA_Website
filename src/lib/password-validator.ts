/**
 * Password validation utility with strong security requirements
 */

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong' | 'very-strong'
  score: number
}

// Common weak passwords to check against
const COMMON_PASSWORDS = [
  'password', '12345678', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', '1234567890',
  'qwertyuiop', 'abc123', 'Password1', 'password1', '123456789',
  'welcome123', 'admin123', 'root123', 'pass123', 'test123'
]

// Password requirements configuration
export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true
}

/**
 * Validates a password against security requirements
 * @param password The password to validate
 * @param userInfo Optional user information to check against (email, name, username)
 * @returns Validation result with errors and strength assessment
 */
export function validatePassword(
  password: string,
  userInfo?: {
    email?: string
    username?: string
    name?: string
  }
): PasswordValidationResult {
  const errors: string[] = []
  let score = 0

  // Check minimum length
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`)
  } else {
    score += 2
    // Bonus points for extra length
    if (password.length >= 16) score += 1
    if (password.length >= 20) score += 1
  }

  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else if (/[A-Z]/.test(password)) {
    score += 1
  }

  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else if (/[a-z]/.test(password)) {
    score += 1
  }

  // Check for numbers
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else if (/\d/.test(password)) {
    score += 1
  }

  // Check for special characters
  const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !specialCharsRegex.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)')
  } else if (specialCharsRegex.test(password)) {
    score += 2
  }

  // Check against common passwords
  if (PASSWORD_REQUIREMENTS.preventCommonPasswords) {
    const lowerPassword = password.toLowerCase()
    if (COMMON_PASSWORDS.some(common => lowerPassword.includes(common))) {
      errors.push('Password is too common. Please choose a more unique password')
      score = Math.max(0, score - 3)
    }
  }

  // Check for user information in password
  if (PASSWORD_REQUIREMENTS.preventUserInfo && userInfo) {
    const lowerPassword = password.toLowerCase()

    // Check email
    if (userInfo.email) {
      const emailParts = userInfo.email.toLowerCase().split('@')[0].split(/[._-]/)
      for (const part of emailParts) {
        if (part.length > 3 && lowerPassword.includes(part)) {
          errors.push('Password should not contain parts of your email address')
          score = Math.max(0, score - 2)
          break
        }
      }
    }

    // Check username
    if (userInfo.username && userInfo.username.length > 3) {
      if (lowerPassword.includes(userInfo.username.toLowerCase())) {
        errors.push('Password should not contain your username')
        score = Math.max(0, score - 2)
      }
    }

    // Check name
    if (userInfo.name) {
      const nameParts = userInfo.name.toLowerCase().split(/\s+/)
      for (const part of nameParts) {
        if (part.length > 3 && lowerPassword.includes(part)) {
          errors.push('Password should not contain your name')
          score = Math.max(0, score - 2)
          break
        }
      }
    }
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters (e.g., aaa, 111)')
    score = Math.max(0, score - 1)
  }

  // Check for keyboard patterns
  const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', '12345', '67890', 'qweasd']
  const lowerPassword = password.toLowerCase()
  if (keyboardPatterns.some(pattern => lowerPassword.includes(pattern))) {
    errors.push('Password should not contain keyboard patterns')
    score = Math.max(0, score - 2)
  }

  // Determine strength based on score
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak'
  if (score >= 8) {
    strength = 'very-strong'
  } else if (score >= 6) {
    strength = 'strong'
  } else if (score >= 4) {
    strength = 'medium'
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(10, score) // Cap at 10
  }
}

/**
 * Generates a strong random password
 * @param length Password length (default: 16)
 * @returns A strong random password
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-=[]{}|:;<>?,./'

  const allChars = uppercase + lowercase + numbers + special
  let password = ''

  // Ensure at least one character from each required set
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Gets a user-friendly strength message
 * @param strength The password strength
 * @returns A descriptive message about the password strength
 */
export function getStrengthMessage(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'very-strong':
      return 'Excellent password! Very strong security.'
    case 'strong':
      return 'Good password strength.'
    case 'medium':
      return 'Password could be stronger. Consider adding more complexity.'
    case 'weak':
      return 'Weak password. Please choose a stronger password.'
    default:
      return 'Please enter a password.'
  }
}

/**
 * Gets CSS class name for strength indicator
 * @param strength The password strength
 * @returns CSS class name for styling
 */
export function getStrengthColor(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'very-strong':
      return 'text-green-600 bg-green-100'
    case 'strong':
      return 'text-blue-600 bg-blue-100'
    case 'medium':
      return 'text-yellow-600 bg-yellow-100'
    case 'weak':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}