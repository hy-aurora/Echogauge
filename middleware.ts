import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
  // Run on all paths except static files, similar to Clerk docs
  '/((?!.*\\..*|_next).*)',
  '/',
  '/(api|trpc)(.*)'
  ],
};