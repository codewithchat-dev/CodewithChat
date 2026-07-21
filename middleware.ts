import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)'])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()

  // If logged in user tries to visit landing page, push them to the dashboard
  if (userId && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isPublicRoute(request)) {
    if (!userId) {
      // If not logged in and trying to access a protected route (like a shared project), 
      // redirect to landing page with a flag to auto-open the signup modal
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
