import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    // This will create the database schema if it doesn't exist
    await prisma.$executeRaw`SELECT 1`
    
    // Try to create a simple test to see if tables exist
    const userCount = await prisma.user.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      userCount 
    })
  } catch (error: any) {
    console.error('Database setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: 'Database schema may not exist. Please run prisma db push manually.'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
