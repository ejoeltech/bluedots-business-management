import { CURRENCIES, DEFAULT_CURRENCY_CODE, formatCurrency } from '../currency'

describe('Currency Utils', () => {
  describe('CURRENCIES', () => {
    it('includes Nigerian Naira as default', () => {
      const ngn = CURRENCIES.find(c => c.code === 'NGN')
      expect(ngn).toBeDefined()
      expect(ngn?.symbol).toBe('₦')
      expect(ngn?.name).toBe('Nigerian Naira')
    })

    it('includes major world currencies', () => {
      const currencyCodes = CURRENCIES.map(c => c.code)
      expect(currencyCodes).toContain('USD')
      expect(currencyCodes).toContain('EUR')
      expect(currencyCodes).toContain('GBP')
      expect(currencyCodes).toContain('CAD')
    })

    it('has consistent structure for all currencies', () => {
      CURRENCIES.forEach(currency => {
        expect(currency).toHaveProperty('code')
        expect(currency).toHaveProperty('symbol')
        expect(currency).toHaveProperty('name')
        expect(currency).toHaveProperty('position')
        expect(['before', 'after']).toContain(currency.position)
      })
    })
  })

  describe('formatCurrency', () => {
    it('formats Nigerian Naira correctly', () => {
      expect(formatCurrency(1000, 'NGN')).toBe('₦1000.00')
      expect(formatCurrency(123.45, 'NGN')).toBe('₦123.45')
    })

    it('formats US Dollar correctly', () => {
      expect(formatCurrency(1000, 'USD')).toBe('$1000.00')
      expect(formatCurrency(123.45, 'USD')).toBe('$123.45')
    })

    it('uses default currency when invalid code provided', () => {
      expect(formatCurrency(1000, 'INVALID')).toBe('₦1000.00')
    })

    it('uses default currency when no code provided', () => {
      expect(formatCurrency(1000)).toBe('₦1000.00')
    })

    it('handles zero amounts', () => {
      expect(formatCurrency(0, 'NGN')).toBe('₦0.00')
    })

    it('handles negative amounts', () => {
      expect(formatCurrency(-100, 'NGN')).toBe('₦-100.00')
    })
  })
})
