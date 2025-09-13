'use client'

import { useState, useEffect } from 'react'
import { Mail, TestTube, Save, AlertCircle } from 'lucide-react'

interface EmailConfig {
  host: string
  port: string
  secure: boolean
  user: string
  pass: string
  from: string
}

export default function EmailSettings() {
  const [config, setConfig] = useState<EmailConfig>({
    host: '',
    port: '587',
    secure: false,
    user: '',
    pass: '',
    from: ''
  })
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    // Load current configuration from environment or localStorage
    const savedConfig = localStorage.getItem('email-config')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])

  const handleInputChange = (field: keyof EmailConfig, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const testEmailConfiguration = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/email/send', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setTestResult({
          success: data.configured,
          message: data.message
        })
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Test failed'
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test email configuration'
      })
    } finally {
      setLoading(false)
    }
  }

  const saveConfiguration = () => {
    localStorage.setItem('email-config', JSON.stringify(config))
    setSaveResult({
      success: true,
      message: 'Configuration saved locally (Note: This is for demo purposes. In production, configure environment variables on your server)'
    })
    
    setTimeout(() => setSaveResult(null), 5000)
  }

  const sendTestEmail = async () => {
    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: config.from, // Send test email to the configured from address
          type: 'reminder',
          data: {
            customerName: 'Test User',
            product: 'Test Service',
            nextDue: new Date().toISOString()
          }
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Test email sent successfully!'
        })
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to send test email'
        })
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to send test email'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-blue-900">Email Configuration</h3>
        </div>
        <p className="text-blue-700 text-sm mt-1">
          Configure email settings for automated notifications and reminders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Host
            </label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => handleInputChange('host', e.target.value)}
              placeholder="smtp.gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Port
            </label>
            <input
              type="text"
              value={config.port}
              onChange={(e) => handleInputChange('port', e.target.value)}
              placeholder="587"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="secure"
              checked={config.secure}
              onChange={(e) => handleInputChange('secure', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="secure" className="ml-2 block text-sm text-gray-700">
              Use SSL/TLS (secure)
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username/Email
            </label>
            <input
              type="email"
              value={config.user}
              onChange={(e) => handleInputChange('user', e.target.value)}
              placeholder="your-email@gmail.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password/App Password
            </label>
            <input
              type="password"
              value={config.pass}
              onChange={(e) => handleInputChange('pass', e.target.value)}
              placeholder="Your email password or app password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Email
            </label>
            <input
              type="email"
              value={config.from}
              onChange={(e) => handleInputChange('from', e.target.value)}
              placeholder="noreply@bluedots.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={testEmailConfiguration}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <TestTube className="h-4 w-4 mr-2" />
          Test Connection
        </button>

        <button
          onClick={sendTestEmail}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
        >
          <Mail className="h-4 w-4 mr-2" />
          Send Test Email
        </button>

        <button
          onClick={saveConfiguration}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Configuration
        </button>
      </div>

      {/* Results */}
      {testResult && (
        <div className={`p-4 rounded-lg border ${
          testResult.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">
              {testResult.success ? 'Success' : 'Error'}
            </span>
          </div>
          <p className="mt-1 text-sm">{testResult.message}</p>
        </div>
      )}

      {saveResult && (
        <div className="p-4 rounded-lg border bg-blue-50 border-blue-200 text-blue-800">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Configuration Saved</span>
          </div>
          <p className="mt-1 text-sm">{saveResult.message}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Setup Instructions:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• For Gmail: Use smtp.gmail.com, port 587, enable "Less secure app access" or use App Password</li>
          <li>• For Outlook: Use smtp-mail.outlook.com, port 587</li>
          <li>• For Yahoo: Use smtp.mail.yahoo.com, port 587</li>
          <li>• For custom SMTP: Contact your email provider for settings</li>
          <li>• <strong>Production:</strong> Set environment variables EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM</li>
        </ul>
      </div>
    </div>
  )
}
