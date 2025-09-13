'use client'

import { useState, useEffect } from 'react'
import { Bell, Mail, MessageSquare, Phone, Clock, Globe } from 'lucide-react'

interface NotificationSettings {
  id?: number
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  reminderAdvanceDays: number
  escalationEnabled: boolean
  autoEscalateDays: number
  quietHoursStart?: string
  quietHoursEnd?: string
  timezone: string
}

export default function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    reminderAdvanceDays: 7,
    escalationEnabled: true,
    autoEscalateDays: 3,
    timezone: 'Africa/Lagos'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/notification-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data || settings)
      } else {
        console.error('Failed to fetch notification settings')
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/notification-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notification settings saved successfully!' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to save settings' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save notification settings' })
    } finally {
      setSaving(false)
    }
  }

  const handleTestNotification = async () => {
    try {
      const response = await fetch('/api/notification-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'email' })
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Test notification sent successfully!' })
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Failed to send test notification' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test notification' })
    }
  }

  const timeZones = [
    'Africa/Lagos',
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Europe/London',
    'Europe/Paris',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Notification Preferences
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Configure how and when you receive notifications for reminders and system updates.
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-md p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Notification Channels */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Channels
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <label className="text-sm font-medium text-gray-900">Email Notifications</label>
                  <p className="text-sm text-gray-500">Receive reminders and updates via email</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.emailEnabled}
                onChange={(e) => setSettings({ ...settings, emailEnabled: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <label className="text-sm font-medium text-gray-900">SMS Notifications</label>
                  <p className="text-sm text-gray-500">Receive urgent reminders via SMS (requires phone number)</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.smsEnabled}
                onChange={(e) => setSettings({ ...settings, smsEnabled: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <label className="text-sm font-medium text-gray-900">Push Notifications</label>
                  <p className="text-sm text-gray-500">Receive browser push notifications</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.pushEnabled}
                onChange={(e) => setSettings({ ...settings, pushEnabled: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Timing Settings */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Timing Settings
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reminder Advance Days
              </label>
              <p className="text-sm text-gray-500 mb-2">
                How many days before due date to send reminders
              </p>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.reminderAdvanceDays}
                onChange={(e) => setSettings({ ...settings, reminderAdvanceDays: parseInt(e.target.value) })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Auto-Escalate Days
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Days to wait before escalating reminder priority
              </p>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.autoEscalateDays}
                onChange={(e) => setSettings({ ...settings, autoEscalateDays: parseInt(e.target.value) })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {timeZones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quiet Hours
              </label>
              <p className="text-sm text-gray-500 mb-2">
                Don't send notifications during these hours
              </p>
              <div className="flex space-x-2">
                <input
                  type="time"
                  value={settings.quietHoursStart || ''}
                  onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Start"
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="time"
                  value={settings.quietHoursEnd || ''}
                  onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value })}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="End"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Escalation Settings */}
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Escalation Settings
          </h4>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={settings.escalationEnabled}
              onChange={(e) => setSettings({ ...settings, escalationEnabled: e.target.checked })}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Enable automatic reminder escalation
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            When enabled, reminders will automatically increase in priority if not acknowledged within the specified timeframe.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleTestNotification}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Bell className="h-4 w-4 mr-2" />
            Test Notification
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
