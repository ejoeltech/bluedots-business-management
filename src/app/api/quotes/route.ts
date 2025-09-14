import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test database connection first
    await prisma.$connect()

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
    
    // If it's a database table error, return empty array instead of 500
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('Quotes table does not exist, returning empty array')
      return NextResponse.json([])
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await prisma.$disconnect()
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

    // Send email notification to customer if email is available
    if (quote.customer.email) {
      try {
        const template = emailService.generateQuoteNotificationTemplate(
          quote.customer.name,
          quote.id,
          quote.total,
          quote.currency || 'NGN'
        )
        
        await emailService.sendEmail(quote.customer.email, template)
        console.log(`Quote notification sent to ${quote.customer.name} (${quote.customer.email})`)
      } catch (error) {
        console.error('Failed to send quote notification:', error)
        // Don't fail the quote creation if email fails
      }
    }

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
