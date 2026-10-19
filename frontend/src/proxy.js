import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// public routes: landing page + Clerk auth pages. Everything else requires sign-in.
const isPublicRoute = createRouteMatcher(['/', '/auth/(.*)'])
const isBackendProxyRoute = createRouteMatcher([
  '/api',
  '/api/(.*)',
  '/lists',
  '/lists/(.*)',
  '/posts',
  '/posts/(.*)',
  '/users',
  '/users/(.*)',
  '/cafes',
  '/cafes/(.*)', 
])

export default clerkMiddleware((auth, req) => {
  if (isBackendProxyRoute(req)) {
    return
  }

  if (!isPublicRoute(req)) {
    auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for local API routes
    '/trpc(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}
