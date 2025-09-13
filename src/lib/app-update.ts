import archiver from 'archiver'
import { AppConfiguration, AppUpdateData } from './config-backup'

export class AppUpdateManager {
  static async exportAppData(): Promise<AppUpdateData> {
    try {
      // Fetch all data from the database
      const response = await fetch('/api/app-update/export')
      if (!response.ok) {
        throw new Error('Failed to fetch app data')
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Export error:', error)
      throw error
    }
  }

  static async importAppData(file: File): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/app-update/import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Import error:', error)
      return { 
        success: false, 
        message: 'Failed to import app data' 
      }
    }
  }

  static async resetToDefaults(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('/api/app-update/reset', {
        method: 'POST',
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Reset error:', error)
      return { 
        success: false, 
        message: 'Failed to reset application' 
      }
    }
  }

  static validateAppUpdateData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data) {
      errors.push('No data provided')
      return { valid: false, errors }
    }

    if (data.exportType !== 'app-update') {
      errors.push('Invalid export type')
    }

    if (!data.data) {
      errors.push('Missing data section')
    }

    if (!data.config) {
      errors.push('Missing configuration section')
    }

    if (!data.metadata) {
      errors.push('Missing metadata section')
    }

    // Validate data structure
    if (data.data) {
      const requiredTables = ['customers', 'products', 'invoices', 'quotes', 'receipts', 'reminders', 'users']
      for (const table of requiredTables) {
        if (!Array.isArray(data.data[table])) {
          errors.push(`Missing or invalid ${table} data`)
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  static downloadZipFile(data: AppUpdateData, filename: string = 'app-update.zip') {
    // This would typically be handled server-side
    // For client-side, we'll create a JSON file as a fallback
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename.replace('.zip', '.json')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  static async readZipFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          resolve(data)
        } catch (error) {
          reject(new Error('Invalid file format'))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  static getFileSizeString(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}
