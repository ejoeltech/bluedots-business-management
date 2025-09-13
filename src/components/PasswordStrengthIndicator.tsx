'use client'

import { useState, useEffect } from 'react'
import { validatePasswordStrength, getPasswordStrengthText, getPasswordStrengthColor } from '@/lib/password-validation'

interface PasswordStrengthIndicatorProps {
  password: string
  showFeedback?: boolean
  className?: string
}

export default function PasswordStrengthIndicator({ 
  password, 
  showFeedback = true, 
  className = '' 
}: PasswordStrengthIndicatorProps) {
  const [validation, setValidation] = useState(() => validatePasswordStrength(password))

  useEffect(() => {
    setValidation(validatePasswordStrength(password))
  }, [password])

  if (!password) return null

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Strength Bar */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(validation.score)}`}
            style={{ width: `${(validation.score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${
          validation.score <= 2 ? 'text-red-600' :
          validation.score === 3 ? 'text-yellow-600' :
          validation.score === 4 ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {getPasswordStrengthText(validation.score)}
        </span>
      </div>

      {/* Requirements Checklist */}
      {showFeedback && (
        <div className="space-y-1">
          <div className="text-xs text-gray-600 mb-2">Password Requirements:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
            <div className={`flex items-center space-x-2 ${
              validation.requirements.length ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                validation.requirements.length ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {validation.requirements.length && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span>At least 8 characters</span>
            </div>

            <div className={`flex items-center space-x-2 ${
              validation.requirements.uppercase ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                validation.requirements.uppercase ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {validation.requirements.uppercase && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span>Uppercase letter</span>
            </div>

            <div className={`flex items-center space-x-2 ${
              validation.requirements.lowercase ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                validation.requirements.lowercase ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {validation.requirements.lowercase && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span>Lowercase letter</span>
            </div>

            <div className={`flex items-center space-x-2 ${
              validation.requirements.numbers ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                validation.requirements.numbers ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {validation.requirements.numbers && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span>Number</span>
            </div>

            <div className={`flex items-center space-x-2 ${
              validation.requirements.symbols ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${
                validation.requirements.symbols ? 'bg-green-500' : 'bg-red-500'
              }`}>
                {validation.requirements.symbols && (
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span>Special character</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
