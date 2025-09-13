const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bluedots.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@bluedots.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10)
  
  const manager = await prisma.user.upsert({
    where: { email: 'manager@bluedots.com' },
    update: {},
    create: {
      name: 'Manager User',
      email: 'manager@bluedots.com',
      password: managerPassword,
      role: 'MANAGER',
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'user@bluedots.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@bluedots.com',
      password: userPassword,
      role: 'USER',
    },
  })

  // Create sample products
  const distilledWater = await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Distilled Water',
      type: 'Distilled Water',
      stock: 100,
      price: 2.50,
    },
  })

  const battery = await prisma.product.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Tubular Battery 100Ah',
      type: 'Battery',
      stock: 25,
      price: 150.00,
    },
  })

  // Create sample customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+1-555-0123',
      address: '123 Main St, Anytown, USA',
      userId: admin.id,
    },
  })

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Jane Doe',
      email: 'jane.doe@email.com',
      phone: '+1-555-0456',
      address: '456 Oak Ave, Somewhere, USA',
      userId: manager.id,
    },
  })

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Bob Johnson',
      email: 'bob.johnson@email.com',
      phone: '+1-555-0789',
      address: '789 Pine Rd, Nowhere, USA',
      userId: user.id,
    },
  })

  // Create sample quotes
  await prisma.quote.create({
    data: {
      customerId: customer1.id,
      userId: admin.id,
      total: 300.00,
      status: 'pending',
    },
  })

  await prisma.quote.create({
    data: {
      customerId: customer2.id,
      userId: manager.id,
      total: 450.00,
      status: 'approved',
    },
  })

  // Create sample invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      customerId: customer1.id,
      userId: admin.id,
      productId: distilledWater.id,
      quantity: 20,
      total: 50.00,
      status: 'unpaid',
    },
  })

  const invoice2 = await prisma.invoice.create({
    data: {
      customerId: customer2.id,
      userId: manager.id,
      productId: battery.id,
      quantity: 2,
      total: 300.00,
      status: 'paid',
    },
  })

  // Create sample receipts
  await prisma.receipt.create({
    data: {
      invoiceId: invoice2.id,
      userId: manager.id,
      amount: 300.00,
    },
  })

  // Create sample reminders
  await prisma.reminder.create({
    data: {
      customerId: customer1.id,
      product: 'Tubular Battery Servicing',
      interval: 90,
      nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  })

  await prisma.reminder.create({
    data: {
      customerId: customer2.id,
      product: 'Tubular Battery Servicing',
      interval: 120,
      nextDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    },
  })

  console.log('Seed data created successfully!')
  console.log('Users created:', { admin: admin.email, manager: manager.email, user: user.email })
  console.log('Default passwords: admin123, manager123, user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
