import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function initializeDatabase() {
  try {
    console.log('🔍 Checking database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Try to query users table to check if schema exists
    try {
      await prisma.user.findMany()
      console.log('✅ Database schema exists')
      return { success: true, schemaExists: true }
    } catch (error: any) {
      console.log('⚠️ Database schema does not exist, attempting to create...')
      
      // Try to create schema using raw SQL
      try {
        // Create the Role enum first
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
            "id" SERIAL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "email" TEXT NOT NULL UNIQUE,
            "password" TEXT NOT NULL,
            "role" "Role" NOT NULL DEFAULT 'USER',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `
        
        // Create Customer table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Customer" (
            "id" SERIAL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "email" TEXT,
            "phone" TEXT,
            "address" TEXT,
            "userId" INTEGER,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `
        
        // Create Product table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Product" (
            "id" SERIAL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "stock" INTEGER NOT NULL DEFAULT 0,
            "price" DOUBLE PRECISION NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `
        
        // Create Quote table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Quote" (
            "id" SERIAL PRIMARY KEY,
            "customerId" INTEGER NOT NULL,
            "userId" INTEGER,
            "total" DOUBLE PRECISION NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'pending',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `
        
        // Create Invoice table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Invoice" (
            "id" SERIAL PRIMARY KEY,
            "customerId" INTEGER NOT NULL,
            "userId" INTEGER,
            "productId" INTEGER,
            "quantity" INTEGER NOT NULL DEFAULT 1,
            "total" DOUBLE PRECISION NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'unpaid',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
            FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `
        
        // Create Receipt table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Receipt" (
            "id" SERIAL PRIMARY KEY,
            "invoiceId" INTEGER NOT NULL,
            "userId" INTEGER,
            "amount" DOUBLE PRECISION NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `
        
        // Create Reminder table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "Reminder" (
            "id" SERIAL PRIMARY KEY,
            "customerId" INTEGER NOT NULL,
            "product" TEXT NOT NULL,
            "interval" INTEGER NOT NULL DEFAULT 90,
            "nextDue" TIMESTAMP(3) NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
          );
        `
        
        console.log('✅ Database schema created successfully')
        return { success: true, schemaExists: false, schemaCreated: true }
        
      } catch (schemaError: any) {
        console.error('❌ Failed to create database schema:', schemaError)
        return { success: false, error: schemaError.message }
      }
    }
    
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error)
    return { success: false, error: error.message }
  } finally {
    await prisma.$disconnect()
  }
}
