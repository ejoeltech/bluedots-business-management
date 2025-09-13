import { render, screen } from '@testing-library/react'
import PasswordStrengthIndicator from '../PasswordStrengthIndicator'

describe('PasswordStrengthIndicator', () => {
  it('renders nothing when password is empty', () => {
    const { container } = render(<PasswordStrengthIndicator password="" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows weak password strength', () => {
    render(<PasswordStrengthIndicator password="123" />)
    
    expect(screen.getByText('Very Weak')).toBeInTheDocument()
    expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument()
    expect(screen.getByText('Password must contain at least one uppercase letter')).toBeInTheDocument()
  })

  it('shows strong password strength', () => {
    render(<PasswordStrengthIndicator password="StrongPass123!" />)
    
    expect(screen.getByText('Strong')).toBeInTheDocument()
    
    // Check that all requirements are met (green checkmarks)
    const checkmarks = screen.getAllByRole('img', { hidden: true })
    expect(checkmarks).toHaveLength(5) // 5 requirements
  })

  it('hides feedback when showFeedback is false', () => {
    render(<PasswordStrengthIndicator password="123" showFeedback={false} />)
    
    expect(screen.getByText('Very Weak')).toBeInTheDocument()
    expect(screen.queryByText('Password must be at least 8 characters long')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <PasswordStrengthIndicator password="test" className="custom-class" />
    )
    
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
