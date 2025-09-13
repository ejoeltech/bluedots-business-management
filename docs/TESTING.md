# Testing Guide - Bluedots Technologies

## Overview

This document outlines the comprehensive testing strategy for the Bluedots Technologies business management application.

## Testing Framework

- **Jest**: JavaScript testing framework
- **React Testing Library**: Component testing utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **@testing-library/user-event**: User interaction simulation

## Test Structure

```
src/
├── components/__tests__/          # Component tests
├── lib/__tests__/                 # Utility function tests
├── app/api/__tests__/             # API endpoint tests
└── __tests__/                     # Integration tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test PasswordStrengthIndicator.test.tsx
```

## Test Categories

### 1. Unit Tests

#### Component Tests
- Test component rendering
- Test user interactions
- Test prop handling
- Test state changes

Example:
```typescript
// PasswordStrengthIndicator.test.tsx
describe('PasswordStrengthIndicator', () => {
  it('renders nothing when password is empty', () => {
    const { container } = render(<PasswordStrengthIndicator password="" />)
    expect(container.firstChild).toBeNull()
  })
})
```

#### Utility Function Tests
- Test business logic functions
- Test data transformation
- Test validation functions

Example:
```typescript
// password-validation.test.ts
describe('validatePasswordStrength', () => {
  it('returns strong for complex password', () => {
    const result = validatePasswordStrength('StrongPass123!')
    expect(result.isValid).toBe(true)
    expect(result.score).toBe(5)
  })
})
```

### 2. API Tests

#### Endpoint Tests
- Test HTTP methods (GET, POST, PUT, DELETE)
- Test authentication requirements
- Test error handling
- Test response formats

Example:
```typescript
// dashboard-stats.test.ts
describe('/api/dashboard/stats', () => {
  it('returns dashboard statistics', async () => {
    const response = await GET(request)
    expect(response.status).toBe(200)
  })
})
```

### 3. Integration Tests

#### User Flow Tests
- Test complete user journeys
- Test cross-component interactions
- Test API integration

## Mocking Strategy

### Next.js Mocks
```javascript
// jest.setup.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))
```

### NextAuth Mocks
```javascript
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
}))
```

### Database Mocks
```javascript
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))
```

## Coverage Requirements

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Test Data

### Fixtures
Create reusable test data in `src/__tests__/fixtures/`:

```typescript
// fixtures/user.ts
export const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'USER',
}
```

### Database Seeding
Use separate test database for integration tests:

```typescript
// setup.ts
beforeEach(async () => {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.customer.deleteMany(),
  ])
})
```

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Component Testing
- Test behavior, not implementation
- Use `screen` queries for accessibility
- Test user interactions with `userEvent`

### 3. API Testing
- Mock external dependencies
- Test both success and error cases
- Verify response structure

### 4. Async Testing
- Use `async/await` for promises
- Wait for elements with `waitFor`
- Handle loading states

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Deployment builds

## Debugging Tests

### VS Code Integration
Install Jest extension for:
- Test discovery
- Inline test results
- Debugging support

### Console Debugging
```typescript
test('debug example', () => {
  render(<Component />)
  screen.debug() // Prints DOM structure
})
```

## Performance Testing

### Load Testing
- Use tools like Artillery or K6
- Test API endpoints under load
- Monitor response times

### Component Performance
- Use React DevTools Profiler
- Test with large datasets
- Monitor re-renders

## Security Testing

### Authentication Tests
- Test login/logout flows
- Test session management
- Test role-based access

### Input Validation
- Test SQL injection prevention
- Test XSS protection
- Test CSRF protection

## Accessibility Testing

### Automated Testing
```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

test('should not have accessibility violations', async () => {
  const { container } = render(<Component />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Manual Testing
- Keyboard navigation
- Screen reader compatibility
- Color contrast compliance

## Test Maintenance

### Regular Updates
- Update tests when features change
- Remove obsolete tests
- Refactor test utilities

### Documentation
- Keep test documentation current
- Document complex test scenarios
- Share testing best practices

## Troubleshooting

### Common Issues

1. **Mock Not Working**
   - Check import paths
   - Verify mock placement
   - Clear Jest cache

2. **Async Test Failures**
   - Add proper awaits
   - Use waitFor for DOM changes
   - Check timeout settings

3. **Coverage Issues**
   - Add missing test cases
   - Check ignore patterns
   - Review uncovered code

### Getting Help
- Check Jest documentation
- Review React Testing Library guides
- Ask team members for assistance

## Future Enhancements

- Visual regression testing with Chromatic
- End-to-end testing with Playwright
- Performance testing with Lighthouse CI
- Accessibility testing with axe-core
