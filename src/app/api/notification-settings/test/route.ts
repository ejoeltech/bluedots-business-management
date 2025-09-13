import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type = 'email' } = body

    if (type === 'email') {
      try {
        await emailService.sendEmail(
          session.user.email,
          {
            subject: 'Test Notification - Bluedots Technologies',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4F46E5;">🔔 Test Notification</h2>
                <p>Hello ${session.user.name || 'User'},</p>
                <p>This is a test notification from your Bluedots Technologies Business Management System.</p>
                <p>If you received this email, your notification settings are working correctly!</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #6b7280; font-size: 14px;">
                  This is an automated test message. You can safely ignore it.
                </p>
              </div>
            `,
            text: `
Test Notification - Bluedots Technologies

Hello ${session.user.name || 'User'},

This is a test notification from your Bluedots Technologies Business Management System.

If you received this email, your notification settings are working correctly!

This is an automated test message. You can safely ignore it.
            `
          }
        )

        return NextResponse.json({ 
          success: true, 
          message: 'Test email sent successfully' 
        })
      } catch (error) {
        console.error('Error sending test email:', error)
        return NextResponse.json(
          { error: 'Failed to send test email. Please check your email configuration.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Unsupported notification type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    )
  }
}
