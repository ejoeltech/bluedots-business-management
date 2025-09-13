import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function initializeDatabase() {
  try {
    console.log('🚀 Starting database initialization...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection established')
    
    // Check if tables exist by trying to query them
    let schemaExists = false
    let schemaCreated = false
    
    try {
      // Try to count users - if this works, schema exists
      const userCount = await prisma.user.count()
      console.log(`✅ Schema exists, found ${userCount} users`)
      schemaExists = true
    } catch (error: any) {
      console.log('❌ Schema does not exist, creating...')
      
      // Schema doesn't exist, try to create it using raw SQL
      try {
        // Create the database schema using raw SQL
        await createDatabaseSchema()
        console.log('✅ Database schema created successfully')
        schemaCreated = true
        schemaExists = true
      } catch (schemaError: any) {
        console.error('❌ Failed to create schema:', schemaError)
        throw new Error(`Schema creation failed: ${schemaError.message}`)
      }
    }
    
    return {
      success: true,
      schemaExists,
      schemaCreated,
      message: schemaCreated 
        ? 'Database schema created successfully' 
        : 'Database connection successful - schema already exists'
    }
    
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error)
    return {
      success: false,
      error: error.message,
      schemaExists: false,
      schemaCreated: false
    }
  } finally {
    await prisma.$disconnect()
  }
}

async function createDatabaseSchema() {
  console.log('🔧 Creating database schema...')
  
  // Create the Role enum
  await prisma.$executeRaw`
    DO $$ BEGIN
      CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `
  
  // Create User table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" SERIAL NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "role" "Role" NOT NULL DEFAULT 'USER',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );
  `
  
  // Create Customer table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Customer" (
      "id" SERIAL NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT,
      "phone" TEXT,
      "address" TEXT,
      "userId" INTEGER,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
    );
  `
  
  // Create Product table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Product" (
      "id" SERIAL NOT NULL,
      "name" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "stock" INTEGER NOT NULL DEFAULT 0,
      "price" DOUBLE PRECISION NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'NGN',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
    );
  `
  
  // Create Quote table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Quote" (
      "id" SERIAL NOT NULL,
      "customerId" INTEGER NOT NULL,
      "userId" INTEGER,
      "total" DOUBLE PRECISION NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'NGN',
      "status" TEXT NOT NULL DEFAULT 'pending',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
    );
  `
  
  // Create Invoice table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Invoice" (
      "id" SERIAL NOT NULL,
      "customerId" INTEGER NOT NULL,
      "userId" INTEGER,
      "productId" INTEGER,
      "quantity" INTEGER NOT NULL DEFAULT 1,
      "total" DOUBLE PRECISION NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'NGN',
      "status" TEXT NOT NULL DEFAULT 'unpaid',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
    );
  `
  
  // Create Receipt table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Receipt" (
      "id" SERIAL NOT NULL,
      "invoiceId" INTEGER NOT NULL,
      "userId" INTEGER,
      "amount" DOUBLE PRECISION NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'NGN',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
    );
  `
  
  // Create Reminder table
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "Reminder" (
      "id" SERIAL NOT NULL,
      "customerId" INTEGER NOT NULL,
      "product" TEXT NOT NULL,
      "interval" INTEGER NOT NULL DEFAULT 90,
      "nextDue" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
    );
  `
  
  // Create indexes
  await prisma.$executeRaw`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  `
  
  // Create foreign key constraints
  await prisma.$executeRaw`
    ALTER TABLE "Customer" 
    ADD CONSTRAINT IF NOT EXISTS "Customer_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  `
  
  await prisma.$executeRaw`
    ALTER TABLE "Quote" 
    ADD CONSTRAINT IF NOT EXISTS "Quote_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  `
  
  await prisma.$executeRaw`
    ALTER TABLE "Quote" 
    ADD CONSTRAINT IF NOT EXISTS "Quote_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  `
  
  await prisma.$executeRaw`
    ALTER TABLE "Invoice" 
    ADD CONSTRAINT IF NOT EXISTS "Invoice_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  `
  
  await prisma.$executeRaw`
    ALTER TABLE "Invoice" 
    ADD CONSTRAINT IF NOT EXISTS "Invoice_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  `
  
  await prisma.$executeRaw`
    ALTER TABLE "Invoice" 
    ADD CONSTRAINT IF NOT EXISTS "Invoice_productId_fkey" 
    FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  `
  
  await prisma.$executeRaw`
    ALTER TABLE "Receipt" 
    ADD CONSTRAINT IF NOT EXISTS "Receipt_invoiceId_fkey" 
    FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  `
  
  await prisma.$executeRaw`
    ALTER TABLE "Receipt" 
    ADD CONSTRAINT IF NOT EXISTS "Receipt_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  `
  
  await prisma.$executeRaw`
    ALTER TABLE "Reminder" 
    ADD CONSTRAINT IF NOT EXISTS "Reminder_customerId_fkey" 
    FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  `
  
  console.log('✅ Database schema creation completed')
}
