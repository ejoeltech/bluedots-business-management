# Vercel Deployment Guide

This guide will help you deploy your Next.js shop application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Database**: You'll need to set up a production database (recommended: PostgreSQL)

## Database Setup

Since your current setup uses SQLite (which is not suitable for production), you'll need to migrate to a production database:

### Option 1: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to Storage tab
3. Create a new Postgres database
4. Copy the connection string

### Option 2: External Database
- **Neon** (Free tier available): [neon.tech](https://neon.tech)
- **PlanetScale**: [planetscale.com](https://planetscale.com)
- **Supabase**: [supabase.com](https://supabase.com)

## Environment Variables

Set these environment variables in your Vercel project settings:

### Required Variables
```
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
DATABASE_URL=your-production-database-url
```

### How to Set Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable for Production, Preview, and Development environments

## Deployment Steps

### 1. Connect Repository
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js project

### 2. Configure Build Settings
- **Framework Preset**: Next.js
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Database Migration
Update your `prisma/schema.prisma` to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Deploy
1. Push your changes to GitHub
2. Vercel will automatically deploy
3. Check the deployment logs for any errors

## Important Notes

### SQLite Limitations
- SQLite files are not persistent on Vercel
- Use PostgreSQL or another production database
- Your current `prisma/dev.db` will not work in production

### Cron Jobs
The configuration includes a cron job for reminders:
- **Path**: `/api/cron`
- **Schedule**: Daily at 9 AM UTC
- Make sure to implement this endpoint in your API routes

### File Uploads
If you're using file uploads, consider:
- Using Vercel Blob for file storage
- Or external services like AWS S3, Cloudinary

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure DATABASE_URL is correctly set
   - Check if your database allows connections from Vercel IPs

2. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Run `npm run build` locally to test

3. **Environment Variables**
   - Double-check all required variables are set
   - Ensure no typos in variable names

### Performance Optimization

1. **Image Optimization**
   - Consider using Vercel's Image Optimization
   - Update `next.config.ts` if needed

2. **Database Queries**
   - Optimize Prisma queries
   - Use database indexes for frequently queried fields

## Monitoring

- Use Vercel Analytics for performance monitoring
- Set up error tracking with Sentry or similar
- Monitor database performance

## Security

- Use strong, unique secrets for NEXTAUTH_SECRET
- Enable HTTPS (automatic with Vercel)
- Regularly update dependencies
- Use environment variables for all sensitive data

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Next.js Documentation: [nextjs.org/docs](https://nextjs.org/docs)
- Prisma Documentation: [prisma.io/docs](https://prisma.io/docs)
