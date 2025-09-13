import { ReminderPriority, CommunicationType, CommunicationStatus } from '@prisma/client'
import { emailService } from './email'
import { processTemplate } from './reminder-templates'

export interface NotificationContext {
  customer: {
    id: number
    name: string
    email: string
    phone?: string | null
  }
  reminder: {
    id: number
    product: string
    nextDue: Date
    priority: ReminderPriority
    escalationLevel: number
    templateId?: number | null
  }
  template: {
    subject: string
    body: string
    type: CommunicationType
  }
  variables: Record<string, any>
}

export interface NotificationSettings {
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

export class SmartNotificationEngine {
  private settings: NotificationSettings

  constructor(settings: NotificationSettings) {
    this.settings = settings
  }

  async sendNotification(context: NotificationContext): Promise<{
    success: boolean
    communicationId?: number
    error?: string
  }> {
    try {
      // Check if we're in quiet hours
      if (this.isQuietHours()) {
        return {
          success: false,
          error: 'Quiet hours - notification scheduled for later'
        }
      }

      // Process template with variables
      const subject = processTemplate(context.template.subject, context.variables)
      const body = processTemplate(context.template.body, context.variables)

      // Determine notification channels based on priority and settings
      const channels = this.getNotificationChannels(context.reminder.priority)

      const results = await Promise.allSettled(
        channels.map(channel => this.sendViaChannel(channel, context, subject, body))
      )

      const successful = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      )

      return {
        success: successful.length > 0,
        error: successful.length === 0 ? 'All notification channels failed' : undefined
      }
    } catch (error) {
      console.error('Smart notification error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private async sendViaChannel(
    channel: CommunicationType,
    context: NotificationContext,
    subject: string,
    body: string
  ): Promise<{ success: boolean; communicationId?: number; error?: string }> {
    switch (channel) {
      case 'EMAIL':
        return this.sendEmail(context, subject, body)
      case 'SMS':
        return this.sendSMS(context, body)
      case 'PUSH':
        return this.sendPush(context, subject, body)
      case 'CALL':
        return this.sendCall(context, body)
      default:
        return { success: false, error: 'Unsupported channel' }
    }
  }

  private async sendEmail(
    context: NotificationContext,
    subject: string,
    body: string
  ): Promise<{ success: boolean; communicationId?: number; error?: string }> {
    if (!this.settings.emailEnabled) {
      return { success: false, error: 'Email notifications disabled' }
    }

    try {
      await emailService.sendEmail(
        context.customer.email,
        {
          subject,
          html: body.replace(/\n/g, '<br>'),
          text: body
        }
      )

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email send failed'
      }
    }
  }

  private async sendSMS(
    context: NotificationContext,
    body: string
  ): Promise<{ success: boolean; communicationId?: number; error?: string }> {
    if (!this.settings.smsEnabled || !context.customer.phone) {
      return { success: false, error: 'SMS notifications disabled or no phone number' }
    }

    try {
      // In a real implementation, integrate with SMS service like Twilio
      console.log(`SMS to ${context.customer.phone}: ${body}`)
      
      // Simulate SMS sending
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMS send failed'
      }
    }
  }

  private async sendPush(
    context: NotificationContext,
    subject: string,
    body: string
  ): Promise<{ success: boolean; communicationId?: number; error?: string }> {
    if (!this.settings.pushEnabled) {
      return { success: false, error: 'Push notifications disabled' }
    }

    try {
      // In a real implementation, integrate with push notification service
      console.log(`Push notification: ${subject} - ${body}`)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Push notification failed'
      }
    }
  }

  private async sendCall(
    context: NotificationContext,
    body: string
  ): Promise<{ success: boolean; communicationId?: number; error?: string }> {
    if (!context.customer.phone) {
      return { success: false, error: 'No phone number available' }
    }

    try {
      // In a real implementation, integrate with voice service like Twilio
      console.log(`Call to ${context.customer.phone}: ${body}`)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Call failed'
      }
    }
  }

  private getNotificationChannels(priority: ReminderPriority): CommunicationType[] {
    const channels: CommunicationType[] = []

    switch (priority) {
      case 'URGENT':
        channels.push('EMAIL', 'SMS', 'PUSH', 'CALL')
        break
      case 'HIGH':
        channels.push('EMAIL', 'SMS', 'PUSH')
        break
      case 'MEDIUM':
        channels.push('EMAIL', 'PUSH')
        break
      case 'LOW':
        channels.push('EMAIL')
        break
    }

    return channels
  }

  private isQuietHours(): boolean {
    if (!this.settings.quietHoursStart || !this.settings.quietHoursEnd) {
      return false
    }

    const now = new Date()
    const currentTime = now.toLocaleTimeString('en-US', {
      timeZone: this.settings.timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    })

    return currentTime >= this.settings.quietHoursStart && 
           currentTime <= this.settings.quietHoursEnd
  }

  calculateNextReminderDate(dueDate: Date, advanceDays: number = 7): Date {
    const nextDate = new Date(dueDate)
    nextDate.setDate(nextDate.getDate() - advanceDays)
    return nextDate
  }

  shouldEscalate(
    reminder: {
      escalationLevel: number
      maxEscalationLevel: number
      lastSent?: Date
      autoEscalate: boolean
    }
  ): boolean {
    if (!reminder.autoEscalate || reminder.escalationLevel >= reminder.maxEscalationLevel) {
      return false
    }

    if (!reminder.lastSent) {
      return true
    }

    const daysSinceLastSent = Math.floor(
      (Date.now() - reminder.lastSent.getTime()) / (1000 * 60 * 60 * 24)
    )

    return daysSinceLastSent >= this.settings.autoEscalateDays
  }

  getEscalatedPriority(currentPriority: ReminderPriority): ReminderPriority {
    switch (currentPriority) {
      case 'LOW':
        return 'MEDIUM'
      case 'MEDIUM':
        return 'HIGH'
      case 'HIGH':
        return 'URGENT'
      case 'URGENT':
        return 'URGENT' // Already at highest priority
    }
  }
}
