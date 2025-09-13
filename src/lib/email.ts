import nodemailer from 'nodemailer'

// Email configuration interface
export interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// Email template interface
export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter

  constructor(config?: EmailConfig) {
    // Use provided config or environment variables
    const emailConfig = config || {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    }

    this.transporter = nodemailer.createTransport(emailConfig)
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify()
      return true
    } catch (error) {
      console.error('Email configuration test failed:', error)
      return false
    }
  }

  // Send email
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  // Generate reminder email template
  generateReminderTemplate(customerName: string, product: string, nextDue: Date): EmailTemplate {
    const subject = `Service Reminder - ${product}`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Service Reminder</h1>
            <p>Bluedots Technologies</p>
          </div>
          <div class="content">
            <h2>Hello ${customerName}!</h2>
            <p>This is a friendly reminder that your <strong>${product}</strong> service is due soon.</p>
            <p><strong>Next Service Date:</strong> ${nextDue.toLocaleDateString()}</p>
            <p>Please contact us to schedule your service appointment at your earliest convenience.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="tel:+1234567890" class="button">Call Us Now</a>
            </p>
            <p>Thank you for choosing Bluedots Technologies for your business needs!</p>
          </div>
          <div class="footer">
            <p>Bluedots Technologies<br>
            📞 Phone: +1 (555) 123-4567<br>
            📧 Email: info@bluedots.com<br>
            🌐 Web: www.bluedots.com</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      Service Reminder - Bluedots Technologies
      
      Hello ${customerName}!
      
      This is a friendly reminder that your ${product} service is due soon.
      
      Next Service Date: ${nextDue.toLocaleDateString()}
      
      Please contact us to schedule your service appointment at your earliest convenience.
      
      Phone: +1 (555) 123-4567
      Email: info@bluedots.com
      
      Thank you for choosing Bluedots Technologies for your business needs!
    `

    return { subject, html, text }
  }

  // Generate invoice notification template
  generateInvoiceNotificationTemplate(customerName: string, invoiceId: number, amount: number, currency: string): EmailTemplate {
    const subject = `New Invoice #${invoiceId} - Bluedots Technologies`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Invoice</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
          .amount { font-size: 24px; font-weight: bold; color: #4F46E5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📄 New Invoice</h1>
            <p>Bluedots Technologies</p>
          </div>
          <div class="content">
            <h2>Hello ${customerName}!</h2>
            <p>A new invoice has been generated for your account.</p>
            <p><strong>Invoice Number:</strong> #${invoiceId}</p>
            <p><strong>Amount Due:</strong> <span class="amount">${currency === 'NGN' ? '₦' : '$'}${amount.toFixed(2)}</span></p>
            <p>Please review the attached invoice and process payment at your earliest convenience.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="tel:+1234567890" class="button">Contact Us</a>
            </p>
            <p>Thank you for your business!</p>
          </div>
          <div class="footer">
            <p>Bluedots Technologies<br>
            📞 Phone: +1 (555) 123-4567<br>
            📧 Email: info@bluedots.com<br>
            🌐 Web: www.bluedots.com</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      New Invoice - Bluedots Technologies
      
      Hello ${customerName}!
      
      A new invoice has been generated for your account.
      
      Invoice Number: #${invoiceId}
      Amount Due: ${currency === 'NGN' ? '₦' : '$'}${amount.toFixed(2)}
      
      Please review the invoice and process payment at your earliest convenience.
      
      Phone: +1 (555) 123-4567
      Email: info@bluedots.com
      
      Thank you for your business!
    `

    return { subject, html, text }
  }

  // Generate quote notification template
  generateQuoteNotificationTemplate(customerName: string, quoteId: number, amount: number, currency: string): EmailTemplate {
    const subject = `New Quote #${quoteId} - Bluedots Technologies`
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Quote</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
          .amount { font-size: 24px; font-weight: bold; color: #4F46E5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💼 New Quote</h1>
            <p>Bluedots Technologies</p>
          </div>
          <div class="content">
            <h2>Hello ${customerName}!</h2>
            <p>A new quote has been prepared for your consideration.</p>
            <p><strong>Quote Number:</strong> #${quoteId}</p>
            <p><strong>Estimated Amount:</strong> <span class="amount">${currency === 'NGN' ? '₦' : '$'}${amount.toFixed(2)}</span></p>
            <p>This quote is valid for 30 days. Please review and let us know if you have any questions.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="tel:+1234567890" class="button">Contact Us</a>
            </p>
            <p>We look forward to working with you!</p>
          </div>
          <div class="footer">
            <p>Bluedots Technologies<br>
            📞 Phone: +1 (555) 123-4567<br>
            📧 Email: info@bluedots.com<br>
            🌐 Web: www.bluedots.com</p>
          </div>
        </div>
      </body>
      </html>
    `

    const text = `
      New Quote - Bluedots Technologies
      
      Hello ${customerName}!
      
      A new quote has been prepared for your consideration.
      
      Quote Number: #${quoteId}
      Estimated Amount: ${currency === 'NGN' ? '₦' : '$'}${amount.toFixed(2)}
      
      This quote is valid for 30 days. Please review and let us know if you have any questions.
      
      Phone: +1 (555) 123-4567
      Email: info@bluedots.com
      
      We look forward to working with you!
    `

    return { subject, html, text }
  }
}

// Create singleton instance
export const emailService = new EmailService()
