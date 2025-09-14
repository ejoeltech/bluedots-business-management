'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'

interface DatabaseStatus {
  status: string
  database: string
  tables: {
    users: number
    customers: number
    products: number
  }
  timestamp: string
  error?: string
}

export default function DatabaseStatusPage() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkDatabaseStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/health')
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data)
      } else {
        setError(data.error || 'Failed to check database status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const initializeDatabase = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/init-db', { method: 'POST' })
      const data = await response.json()
      
      if (response.ok) {
        alert('Database initialized successfully!')
        checkDatabaseStatus()
      } else {
        setError(data.error || 'Failed to initialize database')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Database Status</h1>
            <p className="mt-2 text-sm text-gray-700">
              Check and manage your database connection and tables.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-3">
            <button
              onClick={checkDatabaseStatus}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Refresh Status'}
            </button>
            <button
              onClick={initializeDatabase}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Initializing...' : 'Initialize Database'}
            </button>
          </div>
        </div>

        <div className="mt-8">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {status && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Database Status
                </h3>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className={`p-4 rounded-lg ${status.status === 'healthy' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-2 w-2 rounded-full ${status.status === 'healthy' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Status</p>
                        <p className={`text-sm ${status.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                          {status.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${status.database === 'connected' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 h-2 w-2 rounded-full ${status.database === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Database</p>
                        <p className={`text-sm ${status.database === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
                          {status.database.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Users</p>
                        <p className="text-sm text-gray-600">{status.tables.users}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Customers</p>
                        <p className="text-sm text-gray-600">{status.tables.customers}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Last Checked</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(status.timestamp).toLocaleString()}
                  </p>
                </div>

                {status.error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <h4 className="text-sm font-medium text-red-800">Error Details</h4>
                    <p className="text-sm text-red-700 mt-1">{status.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
