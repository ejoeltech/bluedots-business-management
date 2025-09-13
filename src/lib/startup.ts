import { initializeDatabase } from './database-init'

let isInitialized = false

export async function ensureDatabaseInitialized() {
  if (isInitialized) {
    return { success: true, alreadyInitialized: true }
  }

  try {
    console.log('🔧 Running database initialization on startup...')
    const result = await initializeDatabase()
    
    if (result.success) {
      isInitialized = true
      console.log('✅ Database initialization completed successfully')
      return { ...result, alreadyInitialized: false }
    } else {
      console.error('❌ Database initialization failed:', result.error)
      return result
    }
  } catch (error: any) {
    console.error('❌ Startup database initialization error:', error)
    return { success: false, error: error.message }
  }
}
