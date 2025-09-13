import { NextRequest, NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/database-init'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting database initialization...')
    
    const result = await initializeDatabase()
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: result.schemaCreated 
          ? 'Database schema created successfully' 
          : 'Database connection successful - schema already exists',
        schemaExists: result.schemaExists,
        schemaCreated: result.schemaCreated
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error,
        details: 'Failed to initialize database schema'
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Database setup error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: 'Unexpected error during database setup'
    }, { status: 500 })
  }
}
