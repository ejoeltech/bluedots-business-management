'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import ConfigurationBackup from '@/components/ConfigurationBackup'
import AppUpdateExport from '@/components/AppUpdateExport'
import EmailSettings from '@/components/EmailSettings'
import NotificationSettings from '@/components/NotificationSettings'
import { Settings, User, Bell, Building, Palette, Database, Download, Mail, Zap } from 'lucide-react'
import ReminderTemplates from '@/components/ReminderTemplates'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company')
  const [reminderSubTab, setReminderSubTab] = useState('settings')
  const [companySettings, setCompanySettings] = useState({
    name: 'Bluedots Technologies',
    address: '123 Business St, City, State 12345',
    phone: '+1 (555) 123-4567',
    email: 'info@bluedots.com',
    website: 'www.bluedots.com'
  })
  const [reminderSettings, setReminderSettings] = useState({
    defaultInterval: 90,
    emailNotifications: true,
    autoSend: false
  })
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#4F46E5',
    secondaryColor: '#10B981'
  })

  const tabs = [
    { id: 'company', name: 'Company Info', icon: Building },
    { id: 'reminders', name: 'Reminders', icon: Bell },
    { id: 'notifications', name: 'Notifications', icon: Zap },
    { id: 'email', name: 'Email Settings', icon: Mail },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'backup', name: 'Backup & Restore', icon: Download },
    { id: 'app-update', name: 'App Update', icon: Database },
    { id: 'account', name: 'Account', icon: User }
  ]

  const handleCompanySave = (e: React.FormEvent) => {
    e.preventDefault()
    // Save company settings
    alert('Company settings saved!')
  }

  const handleReminderSave = (e: React.FormEvent) => {
    e.preventDefault()
    // Save reminder settings
    alert('Reminder settings saved!')
  }

  const handleThemeSave = (e: React.FormEvent) => {
    e.preventDefault()
    // Save theme settings
    alert('Theme settings saved!')
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage your application settings and preferences.
            </p>
          </div>
        </div>

        <div className="mt-8">
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
            {/* Company Settings */}
            {activeTab === 'company' && (
              <form onSubmit={handleCompanySave} className="space-y-6">
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Company Information
                  </h3>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companySettings.name}
                        onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={companySettings.phone}
                        onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <textarea
                        rows={3}
                        value={companySettings.address}
                        onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={companySettings.email}
                        onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Website
                      </label>
                      <input
                        type="text"
                        value={companySettings.website}
                        onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save Company Settings
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Reminder Settings */}
            {activeTab === 'reminders' && (
              <div className="space-y-6">
                {/* Sub-tabs for Reminders */}
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setReminderSubTab('settings')}
                        className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                          reminderSubTab === 'settings'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => setReminderSubTab('templates')}
                        className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                          reminderSubTab === 'templates'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Templates
                      </button>
                    </nav>
                  </div>

                  {/* Reminder Settings Sub-tab */}
                  {reminderSubTab === 'settings' && (
                    <form onSubmit={handleReminderSave} className="space-y-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Reminder Settings
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Default Reminder Interval (days)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={reminderSettings.defaultInterval}
                            onChange={(e) => setReminderSettings({ ...reminderSettings, defaultInterval: parseInt(e.target.value) })}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div className="flex items-center">
                          <input
                            id="email-notifications"
                            type="checkbox"
                            checked={reminderSettings.emailNotifications}
                            onChange={(e) => setReminderSettings({ ...reminderSettings, emailNotifications: e.target.checked })}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-900">
                            Enable email notifications for reminders
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            id="auto-send"
                            type="checkbox"
                            checked={reminderSettings.autoSend}
                            onChange={(e) => setReminderSettings({ ...reminderSettings, autoSend: e.target.checked })}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label htmlFor="auto-send" className="ml-2 block text-sm text-gray-900">
                            Automatically send reminders when due
                          </label>
                        </div>
                      </div>

                      <div className="mt-6">
                        <button
                          type="submit"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save Reminder Settings
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Reminder Templates Sub-tab */}
                  {reminderSubTab === 'templates' && (
                    <ReminderTemplates />
                  )}
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <NotificationSettings />
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <EmailSettings />
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <form onSubmit={handleThemeSave} className="space-y-6">
                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Appearance Settings
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Primary Color
                      </label>
                      <input
                        type="color"
                        value={themeSettings.primaryColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, primaryColor: e.target.value })}
                        className="mt-1 block h-10 w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Secondary Color
                      </label>
                      <input
                        type="color"
                        value={themeSettings.secondaryColor}
                        onChange={(e) => setThemeSettings({ ...themeSettings, secondaryColor: e.target.value })}
                        className="mt-1 block h-10 w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save Appearance Settings
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Configuration Backup & Restore */}
            {activeTab === 'backup' && (
              <ConfigurationBackup />
            )}

            {/* App Update Export/Import */}
            {activeTab === 'app-update' && (
              <AppUpdateExport />
            )}

            {/* Account Settings */}
            {activeTab === 'account' && (
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Account Settings
                </h3>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Settings className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Account Management
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Account settings are managed through your authentication provider.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Change Password
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center py-2 px-4 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
