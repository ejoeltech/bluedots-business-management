import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reminders = await prisma.reminder.findMany({
      include: {
        customer: true
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
    const { customerId, product, interval, nextDue } = body

    if (!customerId || !product || !interval || !nextDue) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const reminder = await prisma.reminder.create({
      data: {
        customerId: parseInt(customerId),
        product,
        interval: parseInt(interval),
        nextDue: new Date(nextDue)
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
