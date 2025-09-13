import cron from 'node-cron'

// Schedule reminder sending every day at 9 AM
export function setupReminderCron() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder check...')
    
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/reminders/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`Reminder cron job completed: ${result.message}`)
      } else {
        console.error('Failed to send reminders:', response.statusText)
      }
    } catch (error) {
      console.error('Error in reminder cron job:', error)
    }
  }, {
    timezone: "America/New_York"
  })
  
  console.log('Reminder cron job scheduled for 9 AM daily')
}

// For development/testing - run every 5 minutes
export function setupTestReminderCron() {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running test reminder check...')
    
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/reminders/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log(`Test reminder cron job completed: ${result.message}`)
      } else {
        console.error('Failed to send reminders:', response.statusText)
      }
    } catch (error) {
      console.error('Error in test reminder cron job:', error)
    }
  }, {
    timezone: "America/New_York"
  })
  
  console.log('Test reminder cron job scheduled for every 5 minutes')
}
