"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  requireEmailConfirmation?: boolean
  fallback?: React.ReactNode
}

/**
 * AuthGuard component that protects routes requiring authentication
 * 
 * @param children - The protected content to render when authenticated
 * @param redirectTo - Where to redirect unauthenticated users (default: '/signin')
 * @param requireEmailConfirmation - Whether email confirmation is required (default: false)
 * @param fallback - Custom loading component (default: centered spinner)
 */
export function AuthGuard({ 
  children, 
  redirectTo = "/signin",
  requireEmailConfirmation = false,
  fallback
}: AuthGuardProps): React.ReactElement {
  const { 
    isAuthenticated, 
    isEmailConfirmed, 
    initialLoading, 
    user 
  } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect during initial loading
    if (initialLoading) return

    // If not authenticated, redirect to sign in
    if (!isAuthenticated) {
      // Preserve the intended destination for redirect after login
      const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(pathname)}`
      router.push(redirectUrl)
      return
    }

    // If email confirmation is required but user email is not confirmed
    if (requireEmailConfirmation && !isEmailConfirmed) {
      router.push("/verify-email")
      return
    }
  }, [
    isAuthenticated,
    isEmailConfirmed,
    initialLoading,
    router,
    redirectTo,
    requireEmailConfirmation,
    pathname
  ])

  // Show loading state during initial authentication check
  if (initialLoading) {
    return (fallback || <AuthGuardLoadingFallback />) as React.ReactElement
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return (fallback || <AuthGuardLoadingFallback />) as React.ReactElement
  }

  // Don't render protected content if email confirmation is required but not confirmed
  if (requireEmailConfirmation && !isEmailConfirmed) {
    return (fallback || <EmailConfirmationRequired />) as React.ReactElement
  }

  // User is authenticated and meets all requirements
  return <>{children}</> as React.ReactElement
}

/**
 * Default loading fallback component
 */
function AuthGuardLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Email confirmation required fallback component
 */
function EmailConfirmationRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-3">
            <svg 
              className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" 
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Email Confirmation Required
          </h2>
          <p className="text-sm text-muted-foreground">
            Please check your email and click the confirmation link to access this page.
          </p>
          <p className="text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Higher-order component version of AuthGuard for wrapping components
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps?: Omit<AuthGuardProps, 'children'>
) {
  const AuthGuardedComponent = (props: P) => {
    return (
      <AuthGuard {...guardProps}>
        <Component {...props} />
      </AuthGuard>
    )
  }

  // Preserve component name for debugging
  AuthGuardedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`

  return AuthGuardedComponent
}

/**
 * Hook to check authentication status and redirect if necessary
 * Useful for pages that need authentication but handle their own loading/redirect logic
 */
export function useAuthGuard(redirectTo: string = "/signin") {
  const { isAuthenticated, initialLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!initialLoading && !isAuthenticated) {
      const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(pathname)}`
      router.push(redirectUrl)
    }
  }, [isAuthenticated, initialLoading, router, redirectTo, pathname])

  return {
    isAuthenticated,
    isLoading: initialLoading,
    shouldRedirect: !initialLoading && !isAuthenticated
  }
}

/**
 * Component that renders children only when user is NOT authenticated
 * Useful for login/signup pages that should redirect authenticated users
 */
export function GuestGuard({ 
  children, 
  redirectTo = "/organizations" 
}: { 
  children: React.ReactNode
  redirectTo?: string 
}): React.ReactElement {
  const { isAuthenticated, initialLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initialLoading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, initialLoading, router, redirectTo])

  // Show loading during initial check
  if (initialLoading) {
    return <AuthGuardLoadingFallback /> as React.ReactElement
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return <AuthGuardLoadingFallback /> as React.ReactElement
  }

  // User is not authenticated, show guest content
  return <>{children}</> as React.ReactElement
}

export default AuthGuard