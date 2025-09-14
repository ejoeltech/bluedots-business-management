import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Try to query a simple table
    let userCount = 0
    let customersCount = 0
    let productsCount = 0
    
    try {
      userCount = await prisma.user.count()
    } catch (error) {
      console.log('Users table not accessible:', error)
    }
    
    try {
      customersCount = await prisma.customer.count()
    } catch (error) {
      console.log('Customers table not accessible:', error)
    }
    
    try {
      productsCount = await prisma.product.count()
    } catch (error) {
      console.log('Products table not accessible:', error)
    }

    await prisma.$disconnect()

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      tables: {
        users: userCount,
        customers: customersCount,
        products: productsCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
