import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find reminders that are due today or overdue
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dueReminders = await prisma.reminder.findMany({
      where: {
        nextDue: {
          lte: today
        }
      },
      include: {
        customer: true
      }
    })

    // Send email reminders and update their next due date
    const sentReminders = []
    const failedReminders = []

    for (const reminder of dueReminders) {
      try {
        // Calculate next due date
        const nextDue = new Date(reminder.nextDue)
        nextDue.setDate(nextDue.getDate() + reminder.interval)

        // Send email if customer has email address
        if (reminder.customer.email) {
          const template = emailService.generateReminderTemplate(
            reminder.customer.name,
            reminder.product,
            nextDue
          )
          
          const emailSent = await emailService.sendEmail(reminder.customer.email, template)
          
          if (emailSent) {
            console.log(`Email reminder sent to ${reminder.customer.name} (${reminder.customer.email})`)
          } else {
            console.log(`Failed to send email to ${reminder.customer.name} (${reminder.customer.email})`)
            failedReminders.push({
              id: reminder.id,
              customer: reminder.customer.name,
              email: reminder.customer.email,
              product: reminder.product
            })
          }
        } else {
          console.log(`No email address for customer ${reminder.customer.name}`)
        }

        // Update reminder with new due date
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { nextDue }
        })

        sentReminders.push({
          id: reminder.id,
          customer: reminder.customer.name,
          email: reminder.customer.email,
          product: reminder.product,
          nextDue: nextDue.toISOString()
        })

      } catch (error) {
        console.error(`Error processing reminder ${reminder.id}:`, error)
        failedReminders.push({
          id: reminder.id,
          customer: reminder.customer.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `${sentReminders.length} reminders processed successfully`,
      sent: sentReminders.length,
      failed: failedReminders.length,
      reminders: sentReminders,
      errors: failedReminders
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
