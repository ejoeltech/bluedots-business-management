import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    console.log('🚀 Starting comprehensive database setup...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connection established')

    // Create all tables using raw SQL to ensure they exist
    const createTablesSQL = `
      -- Create Users table
      CREATE TABLE IF NOT EXISTS "User" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role "Role" NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- Create Customers table
      CREATE TABLE IF NOT EXISTS "Customer" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        "userId" INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- Create Products table
      CREATE TABLE IF NOT EXISTS "Product" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        price DOUBLE PRECISION NOT NULL,
        currency TEXT NOT NULL DEFAULT 'NGN',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- Create Quotes table
      CREATE TABLE IF NOT EXISTS "Quote" (
        id SERIAL PRIMARY KEY,
        "customerId" INTEGER NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
        "userId" INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
        total DOUBLE PRECISION NOT NULL,
        currency TEXT NOT NULL DEFAULT 'NGN',
        status TEXT NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- Create Invoices table
      CREATE TABLE IF NOT EXISTS "Invoice" (
        id SERIAL PRIMARY KEY,
        "customerId" INTEGER NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
        "userId" INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
        "productId" INTEGER REFERENCES "Product"(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        total DOUBLE PRECISION NOT NULL,
        currency TEXT NOT NULL DEFAULT 'NGN',
        status TEXT NOT NULL DEFAULT 'unpaid',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- Create Receipts table
      CREATE TABLE IF NOT EXISTS "Receipt" (
        id SERIAL PRIMARY KEY,
        "invoiceId" INTEGER NOT NULL REFERENCES "Invoice"(id) ON DELETE CASCADE,
        "userId" INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
        amount DOUBLE PRECISION NOT NULL,
        currency TEXT NOT NULL DEFAULT 'NGN',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- Create Reminders table
      CREATE TABLE IF NOT EXISTS "Reminder" (
        id SERIAL PRIMARY KEY,
        "customerId" INTEGER NOT NULL REFERENCES "Customer"(id) ON DELETE CASCADE,
        product TEXT NOT NULL,
        interval INTEGER NOT NULL DEFAULT 90,
        "nextDue" TIMESTAMP(3) NOT NULL,
        status "ReminderStatus" NOT NULL DEFAULT 'ACTIVE',
        priority "ReminderPriority" NOT NULL DEFAULT 'MEDIUM',
        "templateId" INTEGER,
        "lastSent" TIMESTAMP(3),
        "escalationLevel" INTEGER NOT NULL DEFAULT 0,
        "maxEscalationLevel" INTEGER NOT NULL DEFAULT 3,
        "autoEscalate" BOOLEAN NOT NULL DEFAULT true,
        notes TEXT,
        "userId" INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- Create ReminderTemplates table
      CREATE TABLE IF NOT EXISTS "ReminderTemplate" (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        type "ReminderType" NOT NULL DEFAULT 'SERVICE',
        priority "ReminderPriority" NOT NULL DEFAULT 'MEDIUM',
        "escalationLevel" INTEGER NOT NULL DEFAULT 0,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "userId" INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- Create ReminderCommunications table
      CREATE TABLE IF NOT EXISTS "ReminderCommunication" (
        id SERIAL PRIMARY KEY,
        "reminderId" INTEGER NOT NULL REFERENCES "Reminder"(id) ON DELETE CASCADE,
        type "CommunicationType" NOT NULL,
        status "CommunicationStatus" NOT NULL DEFAULT 'PENDING',
        "sentAt" TIMESTAMP(3),
        recipient TEXT NOT NULL,
        subject TEXT,
        content TEXT NOT NULL,
        "templateId" INTEGER REFERENCES "ReminderTemplate"(id) ON DELETE SET NULL,
        "errorMessage" TEXT,
        "retryCount" INTEGER NOT NULL DEFAULT 0,
        "maxRetries" INTEGER NOT NULL DEFAULT 3,
        "userId" INTEGER REFERENCES "User"(id) ON DELETE SET NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- Create NotificationSettings table
      CREATE TABLE IF NOT EXISTS "NotificationSettings" (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
        "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
        "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
        "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
        "reminderAdvanceDays" INTEGER NOT NULL DEFAULT 7,
        "escalationEnabled" BOOLEAN NOT NULL DEFAULT true,
        "autoEscalateDays" INTEGER NOT NULL DEFAULT 3,
        "quietHoursStart" TEXT,
        "quietHoursEnd" TEXT,
        timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );

      -- Create enums
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "ReminderStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "ReminderPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "ReminderType" AS ENUM ('SERVICE', 'PAYMENT', 'FOLLOW_UP', 'APPOINTMENT', 'MAINTENANCE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "CommunicationType" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'CALL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "CommunicationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // Execute the SQL
    await prisma.$executeRawUnsafe(createTablesSQL)
    console.log('✅ All database tables created successfully')

    // Check if we have any data
    const userCount = await prisma.user.count()
    const customerCount = await prisma.customer.count()
    const productCount = await prisma.product.count()

    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      schemaCreated: true,
      data: {
        users: userCount,
        customers: customerCount,
        products: productCount
      }
    })

  } catch (error) {
    console.error('❌ Database setup failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Database setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
