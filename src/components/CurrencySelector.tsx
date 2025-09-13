'use client'

import { getCurrencyOptions } from '@/lib/currency'

interface CurrencySelectorProps {
  value: string
  onChange: (currency: string) => void
  className?: string
}

export default function CurrencySelector({ value, onChange, className = '' }: CurrencySelectorProps) {
  const currencyOptions = getCurrencyOptions()

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    >
      {currencyOptions.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
