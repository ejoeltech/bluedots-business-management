# Bluedots Technologies - Business Management System

A comprehensive business management web application built with Next.js, TypeScript, Prisma, and TailwindCSS for Bluedots Technologies.

## Features

### 🔐 Authentication & Authorization
- Role-based access control (Admin, Manager, User)
- Secure authentication with NextAuth.js
- Session management

### 👥 Customer Management (CRM)
- Complete CRUD operations for customers
- Customer profiles with contact information
- Activity tracking (quotes, invoices, reminders)

### 📄 Document Management
- **Quotes**: Create, manage, and export quotes as PDF/JPEG
- **Invoices**: Generate invoices with product tracking
- **Receipts**: Record payments and generate receipts
- Export functionality for all documents (PDF, JPEG, CSV)

### 📦 Inventory Management
- Product catalog management
- Stock tracking for distilled water and other products
- Real-time inventory updates
- Low stock alerts

### 🔔 Customer Reminders
- Automated reminder system for tubular battery servicing
- Customizable reminder intervals (default: 90 days)
- Due date tracking and notifications
- Manual reminder sending

### 📊 Dashboard & Analytics
- Real-time business metrics
- Revenue tracking
- Customer statistics
- Quick action buttons

### 🎨 Modern UI/UX
- Responsive design for mobile and desktop
- Clean, professional interface
- TailwindCSS styling
- Intuitive navigation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **PDF Generation**: jsPDF, html2canvas
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bluedots-business-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the following variables in `.env.local`:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   DATABASE_URL="file:./dev.db"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Start the development server**
```bash
npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

After seeding the database, you can login with:

- **Admin**: admin@bluedots.com / admin123
- **Manager**: manager@bluedots.com / manager123  
- **User**: user@bluedots.com / user123

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── customers/         # Customer management
│   ├── invoices/          # Invoice management
│   ├── quotes/            # Quote management
│   ├── receipts/          # Receipt management
│   ├── inventory/         # Inventory management
│   ├── reminders/         # Reminder management
│   └── settings/          # Settings page
├── components/            # Reusable components
│   ├── Layout.tsx         # Main layout component
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── InvoicePDF.tsx     # PDF generation for invoices
│   ├── QuotePDF.tsx       # PDF generation for quotes
│   └── ReceiptPDF.tsx     # PDF generation for receipts
├── lib/                   # Utility libraries
│   ├── auth.ts            # NextAuth configuration
│   └── prisma.ts          # Prisma client
└── types/                 # TypeScript type definitions
```

## Database Schema

The application uses the following main entities:

- **Users**: System users with role-based access
- **Customers**: Customer information and relationships
- **Products**: Inventory items (distilled water, batteries, etc.)
- **Quotes**: Customer quotations
- **Invoices**: Sales invoices with product tracking
- **Receipts**: Payment records
- **Reminders**: Customer service reminders

## Deployment

### Vercel Deployment

1. **Connect to GitHub**
   - Push your code to a GitHub repository
   - Connect the repository to Vercel

2. **Set environment variables in Vercel**
   - `NEXTAUTH_URL`: Your production URL
   - `NEXTAUTH_SECRET`: A secure random string
   - `DATABASE_URL`: Your production database URL

3. **Deploy**
   - Vercel will automatically deploy on push to main branch

### Database Migration for Production

For production, you'll want to use PostgreSQL:

1. **Update Prisma schema**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Deploy database**
   ```bash
   npx prisma migrate deploy
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signout` - User sign out

### Customers
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get customer details
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/[id]` - Get invoice details
- `PUT /api/invoices/[id]` - Update invoice status
- `DELETE /api/invoices/[id]` - Delete invoice

### Quotes
- `GET /api/quotes` - List all quotes
- `POST /api/quotes` - Create new quote
- `GET /api/quotes/[id]` - Get quote details
- `PUT /api/quotes/[id]` - Update quote
- `DELETE /api/quotes/[id]` - Delete quote

### Receipts
- `GET /api/receipts` - List all receipts
- `POST /api/receipts` - Record new payment

### Reminders
- `GET /api/reminders` - List all reminders
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/[id]` - Update reminder
- `DELETE /api/reminders/[id]` - Delete reminder
- `POST /api/reminders/send` - Send due reminders

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Bluedots Technologies** - Comprehensive Business Management Solution