'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Layout from '@/components/Layout'
import ConfigurationBackup from '@/components/ConfigurationBackup'
import AppUpdateExport from '@/components/AppUpdateExport'
import { Shield, Database, Download, AlertTriangle } from 'lucide-react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Shield },
    { id: 'config-backup', name: 'Configuration Backup', icon: Download },
    { id: 'app-update', name: 'App Update', icon: Database }
  ]

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
          <p className="mt-2 text-sm text-gray-600">
            System administration and data management tools.
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
              <div className="text-sm text-red-700">
                <p className="font-medium">Admin Access Required</p>
                <p>These features require administrator privileges and can affect the entire application.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Administration Overview
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Welcome to the administration panel. Here you can manage system backups, 
                    configuration settings, and perform critical system operations.
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Download className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">Configuration Backup</h4>
                          <p className="text-xs text-blue-700">Export and restore app settings</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Database className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-green-900">App Update</h4>
                          <p className="text-xs text-green-700">Complete data export/import</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-red-900">System Reset</h4>
                          <p className="text-xs text-red-700">Reset to default configuration</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Important Notes:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                      <li>Always backup your data before making system changes</li>
                      <li>Import operations will replace existing data</li>
                      <li>Reset operations cannot be undone</li>
                      <li>Test operations in a development environment first</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'config-backup' && (
            <ConfigurationBackup />
          )}

          {activeTab === 'app-update' && (
            <AppUpdateExport />
          )}
        </div>
      </div>
    </Layout>
  )
}
