import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quotes = await prisma.quote.findMany({
      include: {
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { customerId, total, currency, status } = body

    if (!customerId || total === undefined) {
      return NextResponse.json({ error: 'Customer ID and total are required' }, { status: 400 })
    }

    const quote = await prisma.quote.create({
      data: {
        customerId: parseInt(customerId),
        total: parseFloat(total),
        currency: currency || 'NGN',
        status: status || 'pending',
        userId: parseInt(session.user.id)
      },
      include: {
        customer: true
      }
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
