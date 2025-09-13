import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ensureDatabaseInitialized } from '@/lib/startup'

export async function middleware(request: NextRequest) {
  // Only run database initialization for API routes that need it
  if (request.nextUrl.pathname.startsWith('/api/')) {
    try {
      await ensureDatabaseInitialized()
    } catch (error) {
      console.error('Middleware database initialization error:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
