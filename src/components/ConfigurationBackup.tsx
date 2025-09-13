'use client'

import { useState } from 'react'
import { Download, Upload, Settings, AlertTriangle, CheckCircle } from 'lucide-react'
import { ConfigBackupManager } from '@/lib/config-backup'

export default function ConfigurationBackup() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleExport = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/config/backup')
      if (!response.ok) {
        throw new Error('Failed to export configuration')
      }

      const config = await response.json()
      ConfigBackupManager.downloadFile(
        config, 
        `bluedots-config-backup-${new Date().toISOString().split('T')[0]}.json`
      )

      setMessage({ type: 'success', text: 'Configuration exported successfully' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export configuration' })
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    setMessage(null)

    try {
      const config = await ConfigBackupManager.readFile(file)
      
      const response = await fetch('/api/config/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configuration: config }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Configuration restored successfully' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to restore configuration' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to import configuration file' })
    } finally {
      setLoading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center mb-4">
          <Settings className="h-6 w-6 text-indigo-600 mr-3" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Configuration Backup & Restore
          </h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-6">
          Backup your application configuration settings or restore from a previous backup.
          This includes company information, reminder settings, and theme preferences.
        </p>

        {message && (
          <div className={`mb-4 p-4 rounded-md flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            )}
            <span className={`text-sm font-medium ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {message.text}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Export Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Download className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Export Configuration</h4>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Download your current configuration settings as a JSON file.
            </p>
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Exporting...' : 'Export Configuration'}
            </button>
          </div>

          {/* Import Configuration */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Upload className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="text-sm font-medium text-gray-900">Import Configuration</h4>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Upload a previously exported configuration file to restore settings.
            </p>
            <label className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50">
              {loading ? 'Importing...' : 'Import Configuration'}
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

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">Important:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Configuration restore will overwrite current settings</li>
                <li>Only JSON files exported from this application are supported</li>
                <li>Make sure to backup your current configuration before importing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
