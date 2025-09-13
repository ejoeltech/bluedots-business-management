export interface Currency {
  code: string
  name: string
  symbol: string
  position: 'before' | 'after' // Where to place the symbol
}

export const CURRENCIES: Currency[] = [
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    position: 'before'
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    position: 'before'
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    position: 'after'
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    position: 'before'
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    position: 'before'
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    position: 'before'
  },
  {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: '₵',
    position: 'before'
  },
  {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    position: 'before'
  }
]

export const DEFAULT_CURRENCY = 'NGN'

export function getCurrency(code: string): Currency {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0]
}

export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = getCurrency(currencyCode)
  const formattedAmount = amount.toFixed(2)
  
  if (currency.position === 'before') {
    return `${currency.symbol}${formattedAmount}`
  } else {
    return `${formattedAmount} ${currency.symbol}`
  }
}

export function getCurrencyOptions() {
  return CURRENCIES.map(currency => ({
    value: currency.code,
    label: `${currency.symbol} ${currency.name} (${currency.code})`
  }))
}
