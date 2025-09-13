'use client'

import { useEffect, useState } from 'react'
import { WifiOff, RefreshCw, Home, ArrowLeft } from 'lucide-react'

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial status
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  const handleGoBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <WifiOff className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          It looks like you've lost your internet connection. Don't worry, some features are still available offline.
        </p>

        {/* Connection Status */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6 ${
          isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isOnline ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          {isOnline ? 'Connected' : 'Disconnected'}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            disabled={retryCount > 3}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${retryCount > 0 ? 'animate-spin' : ''}`} />
            {retryCount > 3 ? 'Too Many Attempts' : 'Try Again'}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoHome}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </button>

            <button
              onClick={handleGoBack}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>

        {/* Offline Features */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Available Offline:
          </h3>
          <ul className="text-sm text-blue-700 text-left space-y-1">
            <li>• View cached dashboard data</li>
            <li>• Browse previously loaded pages</li>
            <li>• Access cached customer information</li>
            <li>• View saved invoices and quotes</li>
          </ul>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-xs text-gray-500">
          <p>
            Your data will sync automatically when you're back online.
          </p>
          {retryCount > 0 && (
            <p className="mt-1">
              Retry attempts: {retryCount}/3
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
