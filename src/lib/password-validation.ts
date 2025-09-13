export interface PasswordValidationResult {
  isValid: boolean
  score: number // 0-4
  feedback: string[]
  requirements: {
    length: boolean
    uppercase: boolean
    lowercase: boolean
    numbers: boolean
    symbols: boolean
  }
}

export function validatePasswordStrength(password: string): PasswordValidationResult {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }

  let score = 0
  const feedback: string[] = []

  // Calculate score
  if (requirements.length) score++
  if (requirements.uppercase) score++
  if (requirements.lowercase) score++
  if (requirements.numbers) score++
  if (requirements.symbols) score++

  // Generate feedback
  if (!requirements.length) {
    feedback.push('Password must be at least 8 characters long')
  }
  if (!requirements.uppercase) {
    feedback.push('Password must contain at least one uppercase letter')
  }
  if (!requirements.lowercase) {
    feedback.push('Password must contain at least one lowercase letter')
  }
  if (!requirements.numbers) {
    feedback.push('Password must contain at least one number')
  }
  if (!requirements.symbols) {
    feedback.push('Password must contain at least one special character')
  }

  const isValid = score >= 4 && requirements.length

  return {
    isValid,
    score,
    feedback,
    requirements
  }
}

export function getPasswordStrengthText(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'Very Weak'
    case 2:
      return 'Weak'
    case 3:
      return 'Fair'
    case 4:
      return 'Good'
    case 5:
      return 'Strong'
    default:
      return 'Unknown'
  }
}

export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0:
    case 1:
      return 'bg-red-500'
    case 2:
      return 'bg-orange-500'
    case 3:
      return 'bg-yellow-500'
    case 4:
      return 'bg-blue-500'
    case 5:
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}
