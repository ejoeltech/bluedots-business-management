import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initializeDatabase } from '@/lib/database-init'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // First, ensure database schema exists
    console.log('🔧 Ensuring database schema exists...')
    const dbInitResult = await initializeDatabase()
    
    if (!dbInitResult.success) {
      return NextResponse.json({ 
        error: 'Failed to initialize database schema',
        details: dbInitResult.error
      }, { status: 500 })
    }
    
    console.log('✅ Database schema ready, checking for existing data...')
    
    // Check if users already exist with proper error handling
    let existingUsers = []
    try {
      existingUsers = await prisma.user.findMany()
    } catch (error) {
      console.error('Error checking existing users:', error)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: 'Unable to connect to database. Please ensure the database is properly configured.'
      }, { status: 500 })
    }
    
    if (existingUsers.length > 0) {
      return NextResponse.json({ 
        message: 'Database already seeded',
        users: existingUsers.length
      })
    }

    // Create default users
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const hashedManagerPassword = await bcrypt.hash('manager123', 10)
    const hashedUserPassword = await bcrypt.hash('user123', 10)

    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@bluedots.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    const managerUser = await prisma.user.create({
      data: {
        name: 'Manager User',
        email: 'manager@bluedots.com',
        password: hashedManagerPassword,
        role: 'MANAGER',
      },
    })

    const regularUser = await prisma.user.create({
      data: {
        name: 'Regular User',
        email: 'user@bluedots.com',
        password: hashedUserPassword,
        role: 'USER',
      },
    })

    // Create default products
    const distilledWater = await prisma.product.create({
      data: {
        name: 'Distilled Water',
        type: 'Distilled Water',
        stock: 100,
        price: 2.50,
        currency: 'NGN',
      },
    })

    const battery = await prisma.product.create({
      data: {
        name: 'Tubular Battery 100Ah',
        type: 'Battery',
        stock: 25,
        price: 150.00,
        currency: 'NGN',
      },
    })

    // Create sample customer
    const sampleCustomer = await prisma.customer.create({
      data: {
        name: 'Sample Customer',
        email: 'customer@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, City, State 12345',
        userId: adminUser.id,
      },
    })

    // Create sample reminder
    const sampleReminder = await prisma.reminder.create({
      data: {
        customerId: sampleCustomer.id,
        product: 'Tubular Battery Servicing',
        interval: 90,
        nextDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      },
    })

    return NextResponse.json({
      message: 'Database seeded successfully!',
      data: {
        users: [
          { email: 'admin@bluedots.com', password: 'admin123', role: 'ADMIN' },
          { email: 'manager@bluedots.com', password: 'manager123', role: 'MANAGER' },
          { email: 'user@bluedots.com', password: 'user123', role: 'USER' }
        ],
        products: [
          { name: 'Distilled Water', stock: 100, price: 2.50 },
          { name: 'Tubular Battery 100Ah', stock: 25, price: 150.00 }
        ],
        sampleData: {
          customers: 1,
          reminders: 1
        }
      }
    })
  } catch (error) {
    console.error('Database seeding error:', error)
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
