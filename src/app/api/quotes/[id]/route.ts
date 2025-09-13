import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quote = await prisma.quote.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        customer: true
      }
    })

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { total, status } = body

    if (total === undefined) {
      return NextResponse.json({ error: 'Total is required' }, { status: 400 })
    }

    const quote = await prisma.quote.update({
      where: { id: parseInt(params.id) },
      data: {
        total: parseFloat(total),
        status: status || 'pending'
      },
      include: {
        customer: true
      }
    })

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.quote.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ message: 'Quote deleted successfully' })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
