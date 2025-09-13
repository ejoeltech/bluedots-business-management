import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'
    
    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Fetch basic statistics
    const [
      totalCustomers,
      totalProducts,
      pendingQuotes,
      unpaidInvoices,
      overdueReminders,
      totalRevenue
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.product.count(),
      prisma.quote.count({ where: { status: 'pending' } }),
      prisma.invoice.count({ where: { status: 'unpaid' } }),
      prisma.reminder.count({ 
        where: { 
          nextDue: { 
            lte: now 
          } 
        } 
      }),
      prisma.receipt.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: { gte: startDate }
        }
      })
    ])

    // Generate monthly revenue data
    const monthlyRevenue = []
    const months = []
    
    if (range === '1y') {
      // Generate 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        months.push(date.toISOString().substring(0, 7))
      }
    } else {
      // Generate weeks or days based on range
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        months.push(date.toISOString().substring(0, 10))
      }
    }

    for (const month of months) {
      const monthStart = new Date(month + (range === '1y' ? '-01' : ''))
      const monthEnd = new Date(monthStart)
      
      if (range === '1y') {
        monthEnd.setMonth(monthEnd.getMonth() + 1)
      } else {
        monthEnd.setDate(monthEnd.getDate() + 1)
      }

      const revenue = await prisma.receipt.aggregate({
        _sum: { amount: true },
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      })

      monthlyRevenue.push({
        month: month,
        revenue: revenue._sum.amount || 0
      })
    }

    // Get top customers by revenue
    const topCustomers = await prisma.$queryRaw`
      SELECT 
        c.name,
        COALESCE(SUM(r.amount), 0) as revenue
      FROM "Customer" c
      LEFT JOIN "Invoice" i ON c.id = i."customerId"
      LEFT JOIN "Receipt" r ON i.id = r."invoiceId"
      WHERE r."createdAt" >= ${startDate}
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
      LIMIT 5
    ` as Array<{ name: string; revenue: number }>

    // Get recent activity
    const recentActivity = await Promise.all([
      // Recent invoices
      prisma.invoice.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
      }),
      // Recent quotes
      prisma.quote.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: { customer: true }
      }),
      // Recent customers
      prisma.customer.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' }
      })
    ])

    const activities = []
    
    // Process invoices
    recentActivity[0].forEach(invoice => {
      activities.push({
        type: 'invoice',
        description: `New invoice #${invoice.id} for ${invoice.customer.name}`,
        date: new Date(invoice.createdAt).toLocaleDateString()
      })
    })

    // Process quotes
    recentActivity[1].forEach(quote => {
      activities.push({
        type: 'quote',
        description: `New quote #${quote.id} for ${quote.customer.name}`,
        date: new Date(quote.createdAt).toLocaleDateString()
      })
    })

    // Process customers
    recentActivity[2].forEach(customer => {
      activities.push({
        type: 'customer',
        description: `New customer: ${customer.name}`,
        date: new Date(customer.createdAt).toLocaleDateString()
      })
    })

    // Sort by date and take latest 10
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    activities.splice(10)

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      totalCustomers,
      totalProducts,
      pendingQuotes,
      unpaidInvoices,
      overdueReminders,
      monthlyRevenue,
      topCustomers,
      recentActivity: activities
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
