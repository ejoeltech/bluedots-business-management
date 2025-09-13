import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { emailService } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { to, type, data } = body

    if (!to || !type || !data) {
      return NextResponse.json({ 
        error: 'Missing required fields: to, type, data' 
      }, { status: 400 })
    }

    let template

    switch (type) {
      case 'reminder':
        template = emailService.generateReminderTemplate(
          data.customerName,
          data.product,
          new Date(data.nextDue)
        )
        break
      
      case 'invoice':
        template = emailService.generateInvoiceNotificationTemplate(
          data.customerName,
          data.invoiceId,
          data.amount,
          data.currency || 'NGN'
        )
        break
      
      case 'quote':
        template = emailService.generateQuoteNotificationTemplate(
          data.customerName,
          data.quoteId,
          data.amount,
          data.currency || 'NGN'
        )
        break
      
      default:
        return NextResponse.json({ 
          error: 'Invalid email type' 
        }, { status: 400 })
    }

    const success = await emailService.sendEmail(to, template)

    if (success) {
      return NextResponse.json({ 
        message: 'Email sent successfully' 
      })
    } else {
      return NextResponse.json({ 
        error: 'Failed to send email' 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test email configuration
    const isConfigured = await emailService.testConnection()

    return NextResponse.json({
      configured: isConfigured,
      message: isConfigured 
        ? 'Email service is properly configured' 
        : 'Email service configuration issue - check environment variables'
    })

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
