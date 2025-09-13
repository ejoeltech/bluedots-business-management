import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { product, interval, nextDue } = body

    if (!product || !interval || !nextDue) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const reminder = await prisma.reminder.update({
      where: { id: parseInt(params.id) },
      data: {
        product,
        interval: parseInt(interval),
        nextDue: new Date(nextDue)
      },
      include: {
        customer: true
      }
    })

    return NextResponse.json(reminder)
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.reminder.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ message: 'Reminder deleted successfully' })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
