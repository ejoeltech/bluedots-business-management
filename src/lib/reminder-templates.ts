import { ReminderType, ReminderPriority } from '@prisma/client'

export interface ReminderTemplateData {
  name: string
  subject: string
  body: string
  type: ReminderType
  priority: ReminderPriority
  escalationLevel: number
  isDefault?: boolean
}

export const DEFAULT_REMINDER_TEMPLATES: ReminderTemplateData[] = [
  {
    name: 'Battery Service Reminder',
    subject: '🔋 Battery Service Due - {{customerName}}',
    body: `Dear {{customerName}},

Your {{product}} service is due on {{dueDate}}.

Service Details:
- Product: {{product}}
- Due Date: {{dueDate}}
- Interval: {{interval}} days

Please contact us to schedule your service appointment.

Best regards,
{{companyName}}`,
    type: 'SERVICE',
    priority: 'MEDIUM',
    escalationLevel: 0,
    isDefault: true
  },
  {
    name: 'Payment Follow-up',
    subject: '💳 Payment Reminder - Invoice #{{invoiceNumber}}',
    body: `Dear {{customerName}},

This is a friendly reminder that payment for Invoice #{{invoiceNumber}} is overdue.

Invoice Details:
- Amount: {{amount}}
- Due Date: {{dueDate}}
- Days Overdue: {{daysOverdue}}

Please make payment at your earliest convenience to avoid any service interruption.

Best regards,
{{companyName}}`,
    type: 'PAYMENT',
    priority: 'HIGH',
    escalationLevel: 1,
    isDefault: true
  },
  {
    name: 'Appointment Confirmation',
    subject: '📅 Appointment Confirmation - {{serviceType}}',
    body: `Dear {{customerName}},

Your appointment for {{serviceType}} has been confirmed.

Appointment Details:
- Date: {{appointmentDate}}
- Time: {{appointmentTime}}
- Service: {{serviceType}}
- Technician: {{technicianName}}

Please arrive 15 minutes early. If you need to reschedule, please contact us at least 24 hours in advance.

Best regards,
{{companyName}}`,
    type: 'APPOINTMENT',
    priority: 'MEDIUM',
    escalationLevel: 0,
    isDefault: true
  },
  {
    name: 'Maintenance Follow-up',
    subject: '🔧 Maintenance Follow-up - {{product}}',
    body: `Dear {{customerName}},

We hope your recent {{product}} maintenance was completed to your satisfaction.

Service Details:
- Product: {{product}}
- Service Date: {{serviceDate}}
- Next Service Due: {{nextDueDate}}

If you have any questions or concerns, please don't hesitate to contact us.

Best regards,
{{companyName}}`,
    type: 'MAINTENANCE',
    priority: 'LOW',
    escalationLevel: 0,
    isDefault: true
  },
  {
    name: 'Urgent Payment Notice',
    subject: '🚨 URGENT: Final Payment Notice - {{invoiceNumber}}',
    body: `Dear {{customerName}},

This is your final notice regarding overdue payment for Invoice #{{invoiceNumber}}.

Invoice Details:
- Amount: {{amount}}
- Due Date: {{dueDate}}
- Days Overdue: {{daysOverdue}}

Payment must be received within 7 days to avoid service suspension. Please contact us immediately to resolve this matter.

Best regards,
{{companyName}}`,
    type: 'PAYMENT',
    priority: 'URGENT',
    escalationLevel: 3,
    isDefault: true
  }
]

export function processTemplate(template: string, variables: Record<string, any>): string {
  let processedTemplate = template

  // Replace all variables in the format {{variableName}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    processedTemplate = processedTemplate.replace(regex, String(value || ''))
  })

  return processedTemplate
}

export function getTemplateVariables(template: string): string[] {
  const matches = template.match(/{{([^}]+)}}/g)
  if (!matches) return []
  
  return matches.map(match => match.replace(/[{}]/g, ''))
}

export function validateTemplate(template: ReminderTemplateData): string[] {
  const errors: string[] = []

  if (!template.name?.trim()) {
    errors.push('Template name is required')
  }

  if (!template.subject?.trim()) {
    errors.push('Subject is required')
  }

  if (!template.body?.trim()) {
    errors.push('Body content is required')
  }

  if (template.subject && template.subject.length > 200) {
    errors.push('Subject must be less than 200 characters')
  }

  if (template.body && template.body.length > 5000) {
    errors.push('Body must be less than 5000 characters')
  }

  return errors
}

export function getDefaultTemplate(type: ReminderType, escalationLevel: number = 0): ReminderTemplateData | undefined {
  return DEFAULT_REMINDER_TEMPLATES.find(template => 
    template.type === type && template.escalationLevel === escalationLevel
  )
}
