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

    const receipts = await prisma.receipt.findMany({
      include: {
        invoice: {
          include: {
            customer: true,
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(receipts)
  } catch (error) {
    console.error('Error fetching receipts:', error)
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
    const { invoiceId, amount } = body

    if (!invoiceId || amount === undefined) {
      return NextResponse.json({ error: 'Invoice ID and amount are required' }, { status: 400 })
    }

    // Create receipt
    const receipt = await prisma.receipt.create({
      data: {
        invoiceId: parseInt(invoiceId),
        amount: parseFloat(amount),
        userId: parseInt(session.user.id)
      },
      include: {
        invoice: {
          include: {
            customer: true,
            product: true
          }
        }
      }
    })

    // Update invoice status to paid
    await prisma.invoice.update({
      where: { id: parseInt(invoiceId) },
      data: { status: 'paid' }
    })

    return NextResponse.json(receipt, { status: 201 })
  } catch (error) {
    console.error('Error creating receipt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
