import { NextRequest } from 'next/server'
import { GET } from '../dashboard/stats/route'

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    customer: {
      count: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
    quote: {
      count: jest.fn(),
    },
    invoice: {
      count: jest.fn(),
    },
    reminder: {
      count: jest.fn(),
    },
    receipt: {
      aggregate: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}))

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => ({
    user: { id: '1', role: 'ADMIN' },
  })),
}))

describe('/api/dashboard/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns dashboard statistics', async () => {
    const { prisma } = require('@/lib/prisma')
    
    // Mock database responses
    prisma.customer.count.mockResolvedValue(10)
    prisma.product.count.mockResolvedValue(5)
    prisma.quote.count.mockResolvedValue(3)
    prisma.invoice.count.mockResolvedValue(8)
    prisma.reminder.count.mockResolvedValue(2)
    prisma.receipt.aggregate.mockResolvedValue({ _sum: { amount: 50000 } })
    prisma.$queryRaw.mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/dashboard/stats')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('totalRevenue', 50000)
    expect(data).toHaveProperty('totalCustomers', 10)
    expect(data).toHaveProperty('totalProducts', 5)
    expect(data).toHaveProperty('monthlyRevenue')
    expect(Array.isArray(data.monthlyRevenue)).toBe(true)
  })

  it('returns 401 for unauthenticated requests', async () => {
    const { getServerSession } = require('next-auth')
    getServerSession.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/dashboard/stats')
    const response = await GET(request)

    expect(response.status).toBe(401)
  })

  it('handles database errors gracefully', async () => {
    const { prisma } = require('@/lib/prisma')
    prisma.customer.count.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/dashboard/stats')
    const response = await GET(request)

    expect(response.status).toBe(500)
  })
})
