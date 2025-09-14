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

    // Test database connection first
    await prisma.$connect()
    
    const products = await prisma.product.findMany({
      include: {
        _count: {
          select: {
            invoices: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    
    // If it's a database table error, return empty array instead of 500
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.log('Products table does not exist, returning empty array')
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
    const { name, type, stock, price, currency } = body

    if (!name || !type || stock === undefined || price === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        type,
        stock: parseInt(stock),
        price: parseFloat(price),
        currency: currency || 'NGN'
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
