import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SmartNotificationEngine } from '@/lib/smart-notifications'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reminders = await prisma.reminder.findMany({
      include: {
        customer: true,
        template: true,
        communications: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: {
        nextDue: 'asc'
      }
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      customerId, 
      product, 
      interval, 
      nextDue, 
      priority = 'MEDIUM',
      templateId,
      notes,
      autoEscalate = true,
      maxEscalationLevel = 3
    } = body

    if (!customerId || !product || !interval || !nextDue) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const reminder = await prisma.reminder.create({
      data: {
        customerId: parseInt(customerId),
        product,
        interval: parseInt(interval),
        nextDue: new Date(nextDue),
        priority,
        templateId: templateId ? parseInt(templateId) : null,
        notes,
        autoEscalate,
        maxEscalationLevel: parseInt(maxEscalationLevel),
        userId: parseInt(session.user.id)
      },
      include: {
        customer: true
      }
    })

    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
