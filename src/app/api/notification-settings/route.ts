import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.notificationSettings.findUnique({
      where: { userId: parseInt(session.user.id) }
    })

    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = await prisma.notificationSettings.create({
        data: {
          userId: parseInt(session.user.id),
          emailEnabled: true,
          smsEnabled: false,
          pushEnabled: true,
          reminderAdvanceDays: 7,
          escalationEnabled: true,
          autoEscalateDays: 3,
          timezone: 'Africa/Lagos'
        }
      })
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      emailEnabled,
      smsEnabled,
      pushEnabled,
      reminderAdvanceDays,
      escalationEnabled,
      autoEscalateDays,
      quietHoursStart,
      quietHoursEnd,
      timezone
    } = body

    // Validate input
    if (reminderAdvanceDays < 1 || reminderAdvanceDays > 30) {
      return NextResponse.json(
        { error: 'Reminder advance days must be between 1 and 30' },
        { status: 400 }
      )
    }

    if (autoEscalateDays < 1 || autoEscalateDays > 30) {
      return NextResponse.json(
        { error: 'Auto-escalate days must be between 1 and 30' },
        { status: 400 }
      )
    }

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: parseInt(session.user.id) },
      update: {
        emailEnabled,
        smsEnabled,
        pushEnabled,
        reminderAdvanceDays: parseInt(reminderAdvanceDays),
        escalationEnabled,
        autoEscalateDays: parseInt(autoEscalateDays),
        quietHoursStart,
        quietHoursEnd,
        timezone
      },
      create: {
        userId: parseInt(session.user.id),
        emailEnabled,
        smsEnabled,
        pushEnabled,
        reminderAdvanceDays: parseInt(reminderAdvanceDays),
        escalationEnabled,
        autoEscalateDays: parseInt(autoEscalateDays),
        quietHoursStart,
        quietHoursEnd,
        timezone
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving notification settings:', error)
    return NextResponse.json(
      { error: 'Failed to save notification settings' },
      { status: 500 }
    )
  }
}
