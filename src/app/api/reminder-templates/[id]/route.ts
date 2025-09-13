import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { validateTemplate } from '@/lib/reminder-templates'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const template = await prisma.reminderTemplate.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { userId: parseInt(session.user.id) },
          { isDefault: true }
        ]
      }
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching reminder template:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminder template' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, subject, body: templateBody, type, priority, escalationLevel, isActive } = body

    // Check if template exists and user has permission
    const existingTemplate = await prisma.reminderTemplate.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(session.user.id) // Only allow editing user's own templates
      }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

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

    const template = await prisma.reminderTemplate.update({
      where: { id: parseInt(id) },
      data: {
        name,
        subject,
        body: templateBody,
        type,
        priority,
        escalationLevel: escalationLevel || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating reminder template:', error)
    return NextResponse.json(
      { error: 'Failed to update reminder template' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if template exists and user has permission
    const existingTemplate = await prisma.reminderTemplate.findFirst({
      where: {
        id: parseInt(id),
        userId: parseInt(session.user.id) // Only allow deleting user's own templates
      }
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Check if template is being used by any reminders
    const reminderCount = await prisma.reminder.count({
      where: { templateId: parseInt(id) }
    })

    if (reminderCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete template that is being used by reminders' },
        { status: 400 }
      )
    }

    await prisma.reminderTemplate.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ message: 'Template deleted successfully' })
  } catch (error) {
    console.error('Error deleting reminder template:', error)
    return NextResponse.json(
      { error: 'Failed to delete reminder template' },
      { status: 500 }
    )
  }
}
