import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin privileges
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Fetch all data from database
    const [customers, products, invoices, quotes, receipts, reminders, users] = await Promise.all([
      prisma.customer.findMany(),
      prisma.product.findMany(),
      prisma.invoice.findMany({
        include: {
          customer: true,
          product: true,
          receipts: true
        }
      }),
      prisma.quote.findMany({
        include: {
          customer: true
        }
      }),
      prisma.receipt.findMany({
        include: {
          invoice: {
            include: {
              customer: true,
              product: true
            }
          }
        }
      }),
      prisma.reminder.findMany({
        include: {
          customer: true
        }
      }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true
          // Exclude password for security
        }
      })
    ])

    const appUpdateData = {
      data: {
        customers,
        products,
        invoices,
        quotes,
        receipts,
        reminders,
        users
      },
      config: {
        company: {
          name: 'Bluedots Technologies',
          address: '123 Business St, City, State 12345',
          phone: '+1 (555) 123-4567',
          email: 'info@bluedots.com',
          website: 'www.bluedots.com'
        },
        reminders: {
          defaultInterval: 90,
          emailNotifications: true,
          autoSend: false
        },
        theme: {
          primaryColor: '#4F46E5',
          secondaryColor: '#10B981'
        },
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        exportType: 'configuration'
      },
      metadata: {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        recordCounts: {
          customers: customers.length,
          products: products.length,
          invoices: invoices.length,
          quotes: quotes.length,
          receipts: receipts.length,
          reminders: reminders.length,
          users: users.length
        }
      },
      exportType: 'app-update'
    }

    return NextResponse.json(appUpdateData)
  } catch (error) {
    console.error('App data export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
