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

    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        product: true,
        receipts: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    
    // If it's a database table error, return empty array instead of 500
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('Invoices table does not exist, returning empty array')
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
    const { customerId, productId, quantity, total, currency, status } = body

    if (!customerId || !productId || !quantity || total === undefined) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    // Update product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: parseInt(quantity)
        }
      }
    })

    const invoice = await prisma.invoice.create({
      data: {
        customerId: parseInt(customerId),
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        total: parseFloat(total),
        currency: currency || 'NGN',
        status: status || 'unpaid',
        userId: parseInt(session.user.id)
      },
      include: {
        customer: true,
        product: true
      }
    })

    // Send email notification to customer if email is available
    if (invoice.customer.email) {
      try {
        const template = emailService.generateInvoiceNotificationTemplate(
          invoice.customer.name,
          invoice.id,
          invoice.total,
          invoice.currency || 'NGN'
        )
        
        await emailService.sendEmail(invoice.customer.email, template)
        console.log(`Invoice notification sent to ${invoice.customer.name} (${invoice.customer.email})`)
      } catch (error) {
        console.error('Failed to send invoice notification:', error)
        // Don't fail the invoice creation if email fails
      }
    }

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
