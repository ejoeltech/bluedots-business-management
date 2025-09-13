import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SmartNotificationEngine } from '@/lib/smart-notifications'
import { getDefaultTemplate, processTemplate } from '@/lib/reminder-templates'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { reminderIds, forceSend = false } = body

    // Get user notification settings
    const userSettings = await prisma.notificationSettings.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    const defaultSettings = {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      reminderAdvanceDays: 7,
      escalationEnabled: true,
      autoEscalateDays: 3,
      timezone: 'Africa/Lagos'
    }

    const notificationEngine = new SmartNotificationEngine(
      userSettings || defaultSettings
    )

    const results = []

    // Process each reminder
    for (const reminderId of reminderIds) {
      try {
        const reminder = await prisma.reminder.findUnique({
          where: { id: reminderId },
          include: {
            customer: true,
            template: true,
            communications: {
              where: { status: 'SENT' },
              orderBy: { sentAt: 'desc' },
              take: 1
            }
          }
        })

        if (!reminder) {
          results.push({ reminderId, success: false, error: 'Reminder not found' })
          continue
        }

        // Check if reminder should be processed
        if (!forceSend && !shouldProcessReminder(reminder, notificationEngine)) {
          results.push({ 
            reminderId, 
            success: false, 
            error: 'Reminder not due for processing' 
          })
          continue
        }

        // Get template
        let template = reminder.template
        if (!template) {
          const defaultTemplate = getDefaultTemplate('SERVICE', reminder.escalationLevel)
          if (defaultTemplate) {
            template = {
              id: 0,
              name: defaultTemplate.name,
              subject: defaultTemplate.subject,
              body: defaultTemplate.body,
              type: defaultTemplate.type,
              priority: defaultTemplate.priority,
              escalationLevel: defaultTemplate.escalationLevel,
              isDefault: true,
              isActive: true,
              userId: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        }

        if (!template) {
          results.push({ reminderId, success: false, error: 'No template available' })
          continue
        }

        // Prepare notification context
        const context = {
          customer: {
            id: reminder.customer.id,
            name: reminder.customer.name,
            email: reminder.customer.email || '',
            phone: reminder.customer.phone
          },
          reminder: {
            id: reminder.id,
            product: reminder.product,
            nextDue: reminder.nextDue,
            priority: reminder.priority,
            escalationLevel: reminder.escalationLevel,
            templateId: reminder.templateId
          },
          template: {
            subject: template.subject,
            body: template.body,
            type: 'EMAIL' as const
          },
          variables: {
            customerName: reminder.customer.name,
            product: reminder.product,
            dueDate: reminder.nextDue.toLocaleDateString(),
            interval: reminder.interval,
            companyName: 'Bluedots Technologies'
          }
        }

        // Send notification
        const notificationResult = await notificationEngine.sendNotification(context)

        // Record communication
        await prisma.reminderCommunication.create({
          data: {
            reminderId: reminder.id,
            type: 'EMAIL',
            status: notificationResult.success ? 'SENT' : 'FAILED',
            sentAt: notificationResult.success ? new Date() : null,
            recipient: reminder.customer.email || '',
            subject: template.subject,
            content: processTemplate(template.body, context.variables),
            templateId: template.id > 0 ? template.id : null,
            errorMessage: notificationResult.error,
            userId: parseInt(session.user.id)
          }
        })

        // Update reminder
        const updateData: any = {
          lastSent: new Date()
        }

        if (notificationResult.success) {
          updateData.escalationLevel = Math.min(
            reminder.escalationLevel + 1,
            reminder.maxEscalationLevel
          )
        }

        await prisma.reminder.update({
          where: { id: reminder.id },
          data: updateData
        })

        results.push({ 
          reminderId, 
          success: notificationResult.success,
          error: notificationResult.error 
        })

      } catch (error) {
        console.error(`Error processing reminder ${reminderId}:`, error)
        results.push({ 
          reminderId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error processing reminders:', error)
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    )
  }
}

function shouldProcessReminder(reminder: any, engine: SmartNotificationEngine): boolean {
  const now = new Date()
  
  // Check if reminder is due
  if (reminder.nextDue > now) {
    return false
  }

  // Check if we should escalate
  if (engine.shouldEscalate(reminder)) {
    return true
  }

  // Check if it's been too long since last communication
  if (reminder.communications.length === 0) {
    return true
  }

  const lastCommunication = reminder.communications[0]
  const daysSinceLastSent = Math.floor(
    (now.getTime() - lastCommunication.sentAt.getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysSinceLastSent >= 1 // Send at least once per day
}
