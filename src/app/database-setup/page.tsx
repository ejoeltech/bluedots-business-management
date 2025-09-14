'use client'

import { useState } from 'react'

export default function DatabaseSetupPage() {
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)

  const setupDatabase = async () => {
    setLoading(true)
    setStatus('🔄 Setting up database...')
    
    try {
      // Step 1: Setup database schema
      setStatus('📋 Creating database tables...')
      const setupResponse = await fetch('/api/setup-database-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const setupData = await setupResponse.json()
      
      if (!setupResponse.ok) {
        throw new Error(`Setup failed: ${setupData.error}`)
      }
      
      setStatus('🌱 Seeding database with sample data...')
      
      // Step 2: Seed database
      const seedResponse = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const seedData = await seedResponse.json()
      
      if (!seedResponse.ok) {
        throw new Error(`Seeding failed: ${seedData.error}`)
      }
      
      setStatus('✅ Database setup completed successfully!')
      setResults({
        setup: setupData,
        seed: seedData
      })
      
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const testEndpoints = async () => {
    setLoading(true)
    setStatus('🧪 Testing API endpoints...')
    
    const endpoints = [
      '/api/health',
      '/api/customers',
      '/api/products',
      '/api/invoices',
      '/api/quotes',
      '/api/receipts'
    ]
    
    const results: any = {}
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint)
        results[endpoint] = {
          status: response.status,
          ok: response.ok,
          error: response.ok ? null : await response.text()
        }
      } catch (error) {
        results[endpoint] = {
          status: 'ERROR',
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
    
    setStatus('🧪 API endpoint test completed')
    setResults({ apiTest: results })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🛠️ Database Setup & Diagnostics
          </h1>
          
          <div className="space-y-6">
            {/* Setup Button */}
            <div className="text-center">
              <button
                onClick={setupDatabase}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg text-lg"
              >
                {loading ? '⏳ Working...' : '🚀 Setup Database'}
              </button>
            </div>
            
            {/* Test Button */}
            <div className="text-center">
              <button
                onClick={testEndpoints}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg"
              >
                🧪 Test API Endpoints
              </button>
            </div>
            
            {/* Status */}
            {status && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">{status}</p>
              </div>
            )}
            
            {/* Results */}
            {results && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Results:</h3>
                <pre className="text-sm text-gray-700 overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
            
            {/* Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">📋 Instructions:</h3>
              <ol className="text-yellow-700 space-y-1">
                <li>1. Click "Setup Database" to create all tables and seed with sample data</li>
                <li>2. Click "Test API Endpoints" to verify all APIs are working</li>
                <li>3. If successful, go to <a href="/auth/signin" className="underline">Login Page</a></li>
                <li>4. Login with: admin@bluedots.com / admin123</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
