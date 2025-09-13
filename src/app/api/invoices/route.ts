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
    const { customerId, productId, quantity, total, status } = body

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
        status: status || 'unpaid',
        userId: parseInt(session.user.id)
      },
      include: {
        customer: true,
        product: true
      }
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
