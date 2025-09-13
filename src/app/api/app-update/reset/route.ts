import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin privileges
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Start database transaction to reset everything
    await prisma.$transaction(async (tx) => {
      // Clear all data
      await Promise.all([
        tx.receipt.deleteMany(),
        tx.invoice.deleteMany(),
        tx.quote.deleteMany(),
        tx.reminder.deleteMany(),
        tx.product.deleteMany(),
        tx.customer.deleteMany(),
        tx.user.deleteMany()
      ])

      // Reset to default admin user
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await tx.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@bluedots.com',
          password: hashedPassword,
          role: 'ADMIN',
        },
      })

      // Create default products
      await Promise.all([
        tx.product.create({
          data: {
            name: 'Distilled Water',
            type: 'Distilled Water',
            stock: 100,
            price: 2.50,
          },
        }),
        tx.product.create({
          data: {
            name: 'Tubular Battery 100Ah',
            type: 'Battery',
            stock: 25,
            price: 150.00,
          },
        })
      ])
    })

    return NextResponse.json({
      success: true,
      message: 'Application reset to default configuration successfully',
      data: {
        resetDate: new Date().toISOString(),
        defaultUser: {
          email: 'admin@bluedots.com',
          password: 'admin123'
        }
      }
    })
  } catch (error) {
    console.error('App reset error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to reset application' 
    }, { status: 500 })
  }
}
