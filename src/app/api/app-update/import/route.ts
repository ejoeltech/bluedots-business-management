import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin privileges
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Read and parse the file
    const fileContent = await file.text()
    let appData: any

    try {
      appData = JSON.parse(fileContent)
    } catch (error) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 })
    }

    // Validate the app data structure
    if (!appData.exportType || appData.exportType !== 'app-update') {
      return NextResponse.json({ error: 'Invalid app update file' }, { status: 400 })
    }

    if (!appData.data || !appData.metadata) {
      return NextResponse.json({ error: 'Invalid data structure' }, { status: 400 })
    }

    // Start database transaction
    await prisma.$transaction(async (tx) => {
      // Clear existing data (except current admin user)
      const currentUserId = session.user.id

      await Promise.all([
        tx.receipt.deleteMany(),
        tx.invoice.deleteMany(),
        tx.quote.deleteMany(),
        tx.reminder.deleteMany(),
        tx.product.deleteMany(),
        tx.customer.deleteMany(),
        tx.user.deleteMany({
          where: {
            id: {
              not: parseInt(currentUserId)
            }
          }
        })
      ])

      // Import new data
      const { customers, products, invoices, quotes, receipts, reminders, users } = appData.data

      // Import users (excluding passwords and current user)
      if (users && users.length > 0) {
        for (const user of users) {
          if (user.id !== parseInt(currentUserId)) {
            await tx.user.create({
              data: {
                name: user.name,
                email: user.email,
                password: 'temp_password_123', // Temporary password, should be reset
                role: user.role,
                createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
                updatedAt: user.updatedAt ? new Date(user.updatedAt) : new Date()
              }
            })
          }
        }
      }

      // Import customers
      if (customers && customers.length > 0) {
        for (const customer of customers) {
          await tx.customer.create({
            data: {
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              userId: customer.userId,
              createdAt: customer.createdAt ? new Date(customer.createdAt) : new Date(),
              updatedAt: customer.updatedAt ? new Date(customer.updatedAt) : new Date()
            }
          })
        }
      }

      // Import products
      if (products && products.length > 0) {
        for (const product of products) {
          await tx.product.create({
            data: {
              name: product.name,
              type: product.type,
              stock: product.stock,
              price: product.price,
              createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
              updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date()
            }
          })
        }
      }

      // Import quotes
      if (quotes && quotes.length > 0) {
        for (const quote of quotes) {
          await tx.quote.create({
            data: {
              customerId: quote.customerId,
              userId: quote.userId,
              total: quote.total,
              status: quote.status,
              createdAt: quote.createdAt ? new Date(quote.createdAt) : new Date(),
              updatedAt: quote.updatedAt ? new Date(quote.updatedAt) : new Date()
            }
          })
        }
      }

      // Import invoices
      if (invoices && invoices.length > 0) {
        for (const invoice of invoices) {
          await tx.invoice.create({
            data: {
              customerId: invoice.customerId,
              userId: invoice.userId,
              productId: invoice.productId,
              quantity: invoice.quantity,
              total: invoice.total,
              status: invoice.status,
              createdAt: invoice.createdAt ? new Date(invoice.createdAt) : new Date(),
              updatedAt: invoice.updatedAt ? new Date(invoice.updatedAt) : new Date()
            }
          })
        }
      }

      // Import receipts
      if (receipts && receipts.length > 0) {
        for (const receipt of receipts) {
          await tx.receipt.create({
            data: {
              invoiceId: receipt.invoiceId,
              userId: receipt.userId,
              amount: receipt.amount,
              createdAt: receipt.createdAt ? new Date(receipt.createdAt) : new Date(),
              updatedAt: receipt.updatedAt ? new Date(receipt.updatedAt) : new Date()
            }
          })
        }
      }

      // Import reminders
      if (reminders && reminders.length > 0) {
        for (const reminder of reminders) {
          await tx.reminder.create({
            data: {
              customerId: reminder.customerId,
              product: reminder.product,
              interval: reminder.interval,
              nextDue: reminder.nextDue ? new Date(reminder.nextDue) : new Date(),
              createdAt: reminder.createdAt ? new Date(reminder.createdAt) : new Date(),
              updatedAt: reminder.updatedAt ? new Date(reminder.updatedAt) : new Date()
            }
          })
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'App data imported successfully',
      data: {
        importedRecords: appData.metadata.recordCounts,
        importDate: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('App data import error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to import app data' 
    }, { status: 500 })
  }
}
