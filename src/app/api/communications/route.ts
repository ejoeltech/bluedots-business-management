import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')
    const reminderId = searchParams.get('reminderId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}
    
    if (customerId) {
      where.reminder = {
        customerId: parseInt(customerId)
      }
    }
    
    if (reminderId) {
      where.reminderId = parseInt(reminderId)
    }

    const communications = await prisma.reminderCommunication.findMany({
      where,
      include: {
        reminder: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    return NextResponse.json(communications)
  } catch (error) {
    console.error('Error fetching communications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch communications' },
      { status: 500 }
    )
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
      reminderId,
      type,
      recipient,
      subject,
      content,
      templateId
    } = body

    if (!reminderId || !type || !recipient || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify reminder exists and user has access
    const reminder = await prisma.reminder.findUnique({
      where: { id: parseInt(reminderId) },
      include: {
        customer: true
      }
    })

    if (!reminder) {
      return NextResponse.json(
        { error: 'Reminder not found' },
        { status: 404 }
      )
    }

    const communication = await prisma.reminderCommunication.create({
      data: {
        reminderId: parseInt(reminderId),
        type,
        recipient,
        subject,
        content,
        templateId: templateId ? parseInt(templateId) : null,
        userId: parseInt(session.user.id),
        status: 'PENDING'
      },
      include: {
        reminder: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        template: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(communication, { status: 201 })
  } catch (error) {
    console.error('Error creating communication:', error)
    return NextResponse.json(
      { error: 'Failed to create communication' },
      { status: 500 }
    )
  }
}
