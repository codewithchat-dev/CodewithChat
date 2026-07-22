import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// ── Public routes — no auth check needed ─────────────────────────────────────
// All marketing, legal, and documentation pages are publicly accessible.
// Only /dashboard and API routes require authentication.
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/pricing',
  '/enterprise',
  '/about',
  '/ai-policy',
  '/privacy',
  '/terms',
  '/faqs',
  '/features',
  '/how-it-works',
  '/templates',
  '/docs(.*)',
  '/preview(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()

  // If logged in user tries to visit landing page, push them to the dashboard
  if (userId && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Only protect dashboard and API routes — let all public pages through freely
  if (!isPublicRoute(request)) {
    if (!userId) {
      // Not logged in + trying to access a protected route → redirect to landing
      const redirectUrl = new URL('/', request.url)
      redirectUrl.searchParams.set('sign_up', 'true')
      redirectUrl.searchParams.set('redirect_url', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    '/__clerk/(.*)',
  ],
}
