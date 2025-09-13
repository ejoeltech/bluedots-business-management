import { validatePasswordStrength, getPasswordStrengthText, getPasswordStrengthColor } from '../password-validation'

describe('Password Validation', () => {
  describe('validatePasswordStrength', () => {
    it('returns weak for short password', () => {
      const result = validatePasswordStrength('123')
      
      expect(result.isValid).toBe(false)
      expect(result.score).toBe(0)
      expect(result.feedback).toContain('Password must be at least 8 characters long')
    })

    it('returns strong for complex password', () => {
      const result = validatePasswordStrength('StrongPass123!')
      
      expect(result.isValid).toBe(true)
      expect(result.score).toBe(5)
      expect(result.requirements.length).toBe(true)
      expect(result.requirements.uppercase).toBe(true)
      expect(result.requirements.lowercase).toBe(true)
      expect(result.requirements.numbers).toBe(true)
      expect(result.requirements.symbols).toBe(true)
    })

    it('identifies missing requirements', () => {
      const result = validatePasswordStrength('nouppercase123!')
      
      expect(result.isValid).toBe(false)
      expect(result.score).toBe(4)
      expect(result.requirements.uppercase).toBe(false)
      expect(result.feedback).toContain('Password must contain at least one uppercase letter')
    })
  })

  describe('getPasswordStrengthText', () => {
    it('returns correct strength labels', () => {
      expect(getPasswordStrengthText(0)).toBe('Very Weak')
      expect(getPasswordStrengthText(1)).toBe('Very Weak')
      expect(getPasswordStrengthText(2)).toBe('Weak')
      expect(getPasswordStrengthText(3)).toBe('Fair')
      expect(getPasswordStrengthText(4)).toBe('Good')
      expect(getPasswordStrengthText(5)).toBe('Strong')
    })
  })

  describe('getPasswordStrengthColor', () => {
    it('returns correct color classes', () => {
      expect(getPasswordStrengthColor(0)).toBe('bg-red-500')
      expect(getPasswordStrengthColor(2)).toBe('bg-orange-500')
      expect(getPasswordStrengthColor(3)).toBe('bg-yellow-500')
      expect(getPasswordStrengthColor(4)).toBe('bg-blue-500')
      expect(getPasswordStrengthColor(5)).toBe('bg-green-500')
    })
  })
})
