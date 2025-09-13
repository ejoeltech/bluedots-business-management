import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { validateTemplate } from '@/lib/reminder-templates'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.reminderTemplate.findMany({
      where: {
        OR: [
          { userId: parseInt(session.user.id) },
          { isDefault: true }
        ],
        isActive: true
      },
      orderBy: [
        { isDefault: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching reminder templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminder templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject, body: templateBody, type, priority, escalationLevel, isDefault } = body

    // Validate template
    const validationErrors = validateTemplate({
      name,
      subject,
      body: templateBody,
      type,
      priority,
      escalationLevel: escalationLevel || 0
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    const template = await prisma.reminderTemplate.create({
      data: {
        name,
        subject,
        body: templateBody,
        type,
        priority,
        escalationLevel: escalationLevel || 0,
        isDefault: isDefault || false,
        userId: parseInt(session.user.id)
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating reminder template:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder template' },
      { status: 500 }
    )
  }
}
