'use client'

import { useState } from 'react'
import { Download, Upload, RefreshCw, Database, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { AppUpdateManager } from '@/lib/app-update'

export default function AppUpdateExport() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)
  const [importPreview, setImportPreview] = useState<any>(null)

  const handleExport = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const appData = await AppUpdateManager.exportAppData()
      AppUpdateManager.downloadZipFile(
        appData, 
        `bluedots-app-update-${new Date().toISOString().split('T')[0]}.json`
      )

      setMessage({ 
        type: 'success', 
        text: `App data exported successfully. Records: ${JSON.stringify(appData.metadata.recordCounts, null, 2)}` 
      })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export app data' })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage(null)
    setImportPreview(null)

    try {
      // First, validate the file
      const appData = await AppUpdateManager.readZipFile(file)
      const validation = AppUpdateManager.validateAppUpdateData(appData)

      if (!validation.valid) {
        setMessage({ 
          type: 'error', 
          text: `Invalid file: ${validation.errors.join(', ')}` 
        })
        return
      }

      // Show preview
      setImportPreview({
        file: file,
        data: appData,
        size: AppUpdateManager.getFileSizeString(file.size)
      })

      setMessage({ 
        type: 'info', 
        text: `File validated successfully. Ready to import ${JSON.stringify(appData.metadata.recordCounts, null, 2)} records.` 
      })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to validate file' })
    } finally {
      setLoading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const confirmImport = async () => {
    if (!importPreview) return

    setLoading(true)
    setMessage(null)

    try {
      const result = await AppUpdateManager.importAppData(importPreview.file)

      if (result.success) {
        setMessage({ type: 'success', text: 'App data imported successfully' })
        setImportPreview(null)
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to import app data' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import app data' })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the application to default settings? This will delete ALL data and cannot be undone.')) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const result = await AppUpdateManager.resetToDefaults()

      if (result.success) {
        setMessage({ type: 'success', text: 'Application reset to default configuration successfully' })
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to reset application' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset application' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Download className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Export Application Data
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Create a complete backup of your application including all data, settings, and configurations.
          </p>

          <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Exporting...' : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Export Complete App Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <Upload className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Import Application Data
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Restore your application from a previously exported backup file.
          </p>

          <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50">
            {loading ? 'Processing...' : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose File to Import
              </>
            )}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Import Preview */}
      {importPreview && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <Info className="h-6 w-6 text-yellow-600 mr-3" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Import Preview
              </h3>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">File Information:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li><strong>File:</strong> {importPreview.file.name}</li>
                <li><strong>Size:</strong> {importPreview.size}</li>
                <li><strong>Export Date:</strong> {new Date(importPreview.data.metadata.exportDate).toLocaleString()}</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-800 mb-2">Data to Import:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <div>Customers: {importPreview.data.metadata.recordCounts.customers}</div>
                <div>Products: {importPreview.data.metadata.recordCounts.products}</div>
                <div>Invoices: {importPreview.data.metadata.recordCounts.invoices}</div>
                <div>Quotes: {importPreview.data.metadata.recordCounts.quotes}</div>
                <div>Receipts: {importPreview.data.metadata.recordCounts.receipts}</div>
                <div>Reminders: {importPreview.data.metadata.recordCounts.reminders}</div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={confirmImport}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Importing...' : 'Confirm Import'}
              </button>
              <button
                onClick={() => setImportPreview(null)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Section */}
      <div className="bg-white shadow rounded-lg border-l-4 border-red-400">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center mb-4">
            <RefreshCw className="h-6 w-6 text-red-600 mr-3" />
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Reset Application
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            <strong className="text-red-600">Danger Zone:</strong> Reset the application to default configuration.
            This will delete ALL data and cannot be undone.
          </p>

          <button
            onClick={handleReset}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </>
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`p-4 rounded-md flex items-start ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : message.type === 'error'
            ? 'bg-red-50 border border-red-200'
            : 'bg-blue-50 border border-blue-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
          ) : message.type === 'error' ? (
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
          ) : (
            <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
          )}
          <div className={`text-sm font-medium ${
            message.type === 'success' ? 'text-green-800' : 
            message.type === 'error' ? 'text-red-800' : 'text-blue-800'
          }`}>
            <pre className="whitespace-pre-wrap">{message.text}</pre>
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-medium">Important Warnings:</p>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>Import operations will completely replace existing data</li>
              <li>Make sure to export current data before importing</li>
              <li>Reset operation will delete ALL data and cannot be undone</li>
              <li>Only use files exported from this application</li>
              <li>Admin privileges are required for all operations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
