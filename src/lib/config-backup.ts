export interface AppConfiguration {
  company: {
    name: string
    address: string
    phone: string
    email: string
    website: string
  }
  reminders: {
    defaultInterval: number
    emailNotifications: boolean
    autoSend: boolean
  }
  theme: {
    primaryColor: string
    secondaryColor: string
  }
  version: string
  exportDate: string
  exportType: 'configuration'
}

export interface AppUpdateData {
  data: {
    customers: any[]
    products: any[]
    invoices: any[]
    quotes: any[]
    receipts: any[]
    reminders: any[]
    users: any[]
  }
  config: AppConfiguration
  metadata: {
    version: string
    exportDate: string
    recordCounts: {
      customers: number
      products: number
      invoices: number
      quotes: number
      receipts: number
      reminders: number
      users: number
    }
  }
  exportType: 'app-update'
}

export class ConfigBackupManager {
  static async exportConfiguration(): Promise<AppConfiguration> {
    // In a real app, these would come from a settings API or database
    // For now, we'll return default configuration structure
    return {
      company: {
        name: 'Bluedots Technologies',
        address: '123 Business St, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'info@bluedots.com',
        website: 'www.bluedots.com'
      },
      reminders: {
        defaultInterval: 90,
        emailNotifications: true,
        autoSend: false
      },
      theme: {
        primaryColor: '#4F46E5',
        secondaryColor: '#10B981'
      },
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      exportType: 'configuration'
    }
  }

  static async importConfiguration(config: AppConfiguration): Promise<{ success: boolean; message: string }> {
    try {
      // Validate configuration structure
      if (!this.validateConfiguration(config)) {
        return { success: false, message: 'Invalid configuration format' }
      }

      // In a real app, you would save this to your settings store
      console.log('Importing configuration:', config)
      
      return { 
        success: true, 
        message: 'Configuration imported successfully' 
      }
    } catch (error) {
      console.error('Configuration import error:', error)
      return { 
        success: false, 
        message: 'Failed to import configuration' 
      }
    }
  }

  static validateConfiguration(config: any): boolean {
    try {
      return (
        config &&
        config.company &&
        config.reminders &&
        config.theme &&
        config.version &&
        config.exportDate &&
        config.exportType === 'configuration'
      )
    } catch {
      return false
    }
  }

  static downloadFile(data: any, filename: string, type: string = 'application/json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  static async readFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          resolve(data)
        } catch (error) {
          reject(new Error('Invalid JSON file'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }
}
