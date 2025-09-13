import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin privileges
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // In a real application, you would fetch these from your settings store
    const configuration = {
      company: {
        name: 'Bluedots Technologies',
        address: '123 Business St, City, State 12345',
        phone: '+1 (555) 123-4567',
        email: 'info@bluedots.com',
        website: 'www.bluedots.com'
      },
      reminders: {
        defaultInterval: 90,
        emailNotifications: true,
        autoSend: false
      },
      theme: {
        primaryColor: '#4F46E5',
        secondaryColor: '#10B981'
      },
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      exportType: 'configuration'
    }

    return NextResponse.json(configuration)
  } catch (error) {
    console.error('Configuration backup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
