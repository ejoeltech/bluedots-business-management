import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // In a real application, you would send emails here
    // For now, we'll just log the reminders and update their next due date
    const sentReminders = []

    for (const reminder of dueReminders) {
      // Calculate next due date
      const nextDue = new Date(reminder.nextDue)
      nextDue.setDate(nextDue.getDate() + reminder.interval)

      // Update reminder with new due date
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { nextDue }
      })

      sentReminders.push({
        id: reminder.id,
        customer: reminder.customer.name,
        product: reminder.product,
        nextDue: nextDue.toISOString()
      })

      console.log(`Reminder sent for ${reminder.customer.name} - ${reminder.product}`)
    }

    return NextResponse.json({
      message: `${sentReminders.length} reminders processed`,
      reminders: sentReminders
    })
  } catch (error) {
    console.error('Error sending reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
