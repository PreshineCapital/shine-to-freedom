import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = await createClient()

  // Safely check if a user session exists
  const { data: { user } } = await supabase.auth.getUser()

  // If there is no logged-in user and they try to visit the dashboard, kick them back to login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}

// This tells Next.js to run this guard ONLY on your dashboard paths
export const config = {
  matcher: ['/dashboard/:path*'],
}