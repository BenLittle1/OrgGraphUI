"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { supabase, createUserProfile, getUserProfile, updateUserProfile, onAuthStateChange } from "@/lib/supabase"
import type { 
  AuthContextValue, 
  AuthState, 
  AuthResult, 
  ProfileResult, 
  User, 
  UserProfile, 
  UserProfileUpdate,
  AuthError 
} from "@/types/auth"
import type { Session } from "@supabase/supabase-js"

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Initialize auth state
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: false,
    initialLoading: true,
    error: null,
    isAuthenticated: false,
    isEmailConfirmed: false
  })

  // Helper function to update auth state
  const updateAuthState = useCallback((updates: Partial<AuthState>) => {
    setAuthState(prev => ({ ...prev, ...updates }))
  }, [])

  // Helper function to handle authentication errors
  const handleAuthError = useCallback((error: any): string => {
    if (!error) return "An unknown error occurred"
    
    const errorMessage = error.message?.toLowerCase() || ""
    
    // Map Supabase errors to our custom error types
    if (errorMessage.includes("invalid login credentials")) {
      return "Invalid email or password"
    }
    if (errorMessage.includes("email not confirmed")) {
      return "Please check your email and click the confirmation link"
    }
    if (errorMessage.includes("signup disabled")) {
      return "Account registration is currently disabled"
    }
    if (errorMessage.includes("email already registered")) {
      return "An account with this email already exists"
    }
    if (errorMessage.includes("weak password")) {
      return "Password is too weak. Please use at least 8 characters"
    }
    if (errorMessage.includes("invalid email")) {
      return "Please enter a valid email address"
    }
    if (errorMessage.includes("too many requests")) {
      return "Too many requests. Please wait a moment and try again"
    }
    if (errorMessage.includes("network")) {
      return "Network error. Please check your connection"
    }
    
    return error.message || "An unexpected error occurred"
  }, [])

  // Load user profile after authentication
  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { profile, error } = await getUserProfile(userId)
      if (error) {
        console.error("Failed to load user profile:", error)
        return null
      }
      return profile
    } catch (error) {
      console.error("Error loading user profile:", error)
      return null
    }
  }, [])

  // Check authentication state on mount and auth changes
  const checkAuthState = useCallback(async () => {
    try {
      updateAuthState({ loading: true, error: null })
      
      // Remove race condition - just use direct getSession call
      // Supabase handles its own timeouts and retries internally
      const { data: { session }, error } = await supabase.auth.getSession()
      
      console.log("Session check result:", { session: !!session, error: !!error, userId: session?.user?.id })
      
      if (error) {
        console.error("Auth session error:", error)
        updateAuthState({ 
          loading: false, 
          initialLoading: false,
          error: handleAuthError(error),
          user: null,
          session: null,
          profile: null,
          isAuthenticated: false,
          isEmailConfirmed: false
        })
        return
      }

      if (session?.user) {
        // Load user profile without race condition
        let profile: any = null
        try {
          profile = await loadUserProfile(session.user.id)
        } catch (profileError) {
          console.warn("Profile loading failed, continuing without profile:", profileError)
          // Continue without profile - don't block authentication
        }
        
        const user: User = {
          ...session.user,
          full_name: profile?.full_name,
          profile
        }

        updateAuthState({
          user,
          session,
          profile,
          loading: false,
          initialLoading: false,
          error: null,
          isAuthenticated: true,
          isEmailConfirmed: session.user.email_confirmed_at != null
        })
      } else {
        updateAuthState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          initialLoading: false,
          error: null,
          isAuthenticated: false,
          isEmailConfirmed: false
        })
      }
    } catch (error) {
      console.error("Check auth state error:", error)
      updateAuthState({
        loading: false,
        initialLoading: false,
        error: handleAuthError(error),
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isEmailConfirmed: false
      })
    } finally {
      // Ensure initialLoading is always set to false
      updateAuthState(prev => ({ ...prev, loading: false, initialLoading: false }))
    }
  }, [handleAuthError, loadUserProfile, updateAuthState])

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      updateAuthState({ loading: true, error: null })

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })

      if (error) {
        const errorMessage = handleAuthError(error)
        updateAuthState({ loading: false, error: errorMessage })
        return { success: false, error: errorMessage }
      }

      if (data.session?.user) {
        // Load user profile
        const profile = await loadUserProfile(data.session.user.id)
        
        const user: User = {
          ...data.session.user,
          full_name: profile?.full_name,
          profile
        }

        updateAuthState({
          user,
          session: data.session,
          profile,
          loading: false,
          error: null,
          isAuthenticated: true,
          isEmailConfirmed: data.session.user.email_confirmed_at != null
        })

        return { 
          success: true, 
          user, 
          session: data.session 
        }
      }

      updateAuthState({ loading: false })
      return { success: false, error: "Sign in failed" }
    } catch (error) {
      const errorMessage = handleAuthError(error)
      updateAuthState({ loading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }, [handleAuthError, loadUserProfile, updateAuthState])

  // Sign up with email, password, and full name
  const signUp = useCallback(async (email: string, password: string, fullName: string): Promise<AuthResult> => {
    try {
      updateAuthState({ loading: true, error: null })

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      })

      if (error) {
        const errorMessage = handleAuthError(error)
        updateAuthState({ loading: false, error: errorMessage })
        return { success: false, error: errorMessage }
      }

      if (data.user) {
        // Create user profile in our database
        try {
          const { profile, error: profileError } = await createUserProfile(
            data.user.id,
            email.trim(),
            fullName.trim()
          )

          if (profileError) {
            console.error("Failed to create user profile:", profileError)
          }

          const user: User = {
            ...data.user,
            full_name: fullName.trim(),
            profile: profile || undefined
          }

          // If session exists (auto-confirmed), update state
          if (data.session) {
            updateAuthState({
              user,
              session: data.session,
              profile,
              loading: false,
              error: null,
              isAuthenticated: true,
              isEmailConfirmed: data.user.email_confirmed_at != null
            })
          } else {
            // Email confirmation required
            updateAuthState({
              user: null,
              session: null,
              profile: null,
              loading: false,
              error: null,
              isAuthenticated: false,
              isEmailConfirmed: false
            })
          }

          return { 
            success: true, 
            user, 
            session: data.session 
          }
        } catch (profileError) {
          console.error("Profile creation error:", profileError)
          // Continue with signup even if profile creation fails
          updateAuthState({ loading: false })
          return { 
            success: true, 
            user: data.user as User, 
            session: data.session 
          }
        }
      }

      updateAuthState({ loading: false })
      return { success: false, error: "Sign up failed" }
    } catch (error) {
      const errorMessage = handleAuthError(error)
      updateAuthState({ loading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }, [handleAuthError, updateAuthState])

  // Sign in with OAuth providers
  const signInWithOAuth = useCallback(async (provider: 'google' | 'github'): Promise<AuthResult> => {
    try {
      updateAuthState({ loading: true, error: null })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/organizations`
        }
      })

      if (error) {
        const errorMessage = handleAuthError(error)
        updateAuthState({ loading: false, error: errorMessage })
        return { success: false, error: errorMessage }
      }

      // OAuth redirects, so we return success immediately
      return { success: true }
    } catch (error) {
      const errorMessage = handleAuthError(error)
      updateAuthState({ loading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }, [handleAuthError, updateAuthState])

  // Sign out
  const signOut = useCallback(async (): Promise<AuthResult> => {
    try {
      updateAuthState({ loading: true, error: null })

      const { error } = await supabase.auth.signOut()

      if (error) {
        const errorMessage = handleAuthError(error)
        updateAuthState({ loading: false, error: errorMessage })
        return { success: false, error: errorMessage }
      }

      updateAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        error: null,
        isAuthenticated: false,
        isEmailConfirmed: false
      })

      return { success: true }
    } catch (error) {
      const errorMessage = handleAuthError(error)
      updateAuthState({ loading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }, [handleAuthError, updateAuthState])

  // Reset password
  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      updateAuthState({ loading: true, error: null })

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/update-password`
      })

      updateAuthState({ loading: false })

      if (error) {
        const errorMessage = handleAuthError(error)
        updateAuthState({ error: errorMessage })
        return { success: false, error: errorMessage }
      }

      return { success: true }
    } catch (error) {
      const errorMessage = handleAuthError(error)
      updateAuthState({ loading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }, [handleAuthError, updateAuthState])

  // Update password
  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    try {
      updateAuthState({ loading: true, error: null })

      const { data, error } = await supabase.auth.updateUser({ password })

      updateAuthState({ loading: false })

      if (error) {
        const errorMessage = handleAuthError(error)
        updateAuthState({ error: errorMessage })
        return { success: false, error: errorMessage }
      }

      return { success: true, user: data.user as User }
    } catch (error) {
      const errorMessage = handleAuthError(error)
      updateAuthState({ loading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }, [handleAuthError, updateAuthState])

  // Update user profile
  const updateProfile = useCallback(async (updates: UserProfileUpdate): Promise<ProfileResult> => {
    try {
      if (!authState.user) {
        return { success: false, error: "Not authenticated" }
      }

      updateAuthState({ loading: true, error: null })

      const { profile, error } = await updateUserProfile(authState.user.id, updates)
      const typedProfile = profile as UserProfile | null

      if (error) {
        const errorMessage = handleAuthError(error)
        updateAuthState({ loading: false, error: errorMessage })
        return { success: false, error: errorMessage }
      }

      // Update auth state with new profile
      const updatedUser: User = {
        ...(authState.user || {} as User),
        full_name: typedProfile?.full_name,
        profile: typedProfile
      }

      updateAuthState({
        user: updatedUser,
        profile: typedProfile,
        loading: false,
        error: null
      })

      return { success: true, profile: typedProfile }
    } catch (error) {
      const errorMessage = handleAuthError(error)
      updateAuthState({ loading: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }, [authState.user, handleAuthError, updateAuthState])

  // Refresh user profile
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!authState.user) return

    try {
      const profile = await loadUserProfile(authState.user.id)
      
      const updatedUser: User = {
        ...authState.user,
        full_name: profile?.full_name,
        profile
      }

      updateAuthState({
        user: updatedUser,
        profile
      })
    } catch (error) {
      console.error("Failed to refresh profile:", error)
    }
  }, [authState.user, loadUserProfile, updateAuthState])

  // Set up auth state listener on mount
  useEffect(() => {
    console.log("AuthProvider useEffect: Starting auth initialization")
    
    // Skip initial checkAuthState - let the auth state listener handle everything
    // This avoids the hanging getSession() issue

    // Failsafe timeout to prevent infinite loading - reduced to 10 seconds
    const failsafeTimeout = setTimeout(() => {
      setAuthState(prev => {
        if (prev.initialLoading) {
          console.warn("Authentication check timed out, proceeding as unauthenticated")
          return {
            ...prev,
            loading: false,
            initialLoading: false,
            error: null, // Don't show error for timeout, just proceed
            isAuthenticated: false,
            isEmailConfirmed: false
          }
        }
        return prev
      })
    }, 10000) // 10 seconds absolute timeout

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id)
      
      // Clear failsafe timeout since we got a response
      clearTimeout(failsafeTimeout)

      if (event === 'SIGNED_IN' && session?.user) {
        console.log("Processing SIGNED_IN event for user:", session.user.id)
        
        // Set auth state immediately without waiting for profile
        const user: User = {
          ...session.user,
          full_name: session.user.user_metadata?.full_name,
          profile: null // Will be loaded asynchronously
        }

        console.log("Setting auth state to authenticated for SIGNED_IN")
        updateAuthState({
          user,
          session,
          profile: null,
          loading: false,
          initialLoading: false,
          error: null,
          isAuthenticated: true,
          isEmailConfirmed: session.user.email_confirmed_at != null
        })

        // Load profile asynchronously without blocking auth
        loadUserProfile(session.user.id).then(profile => {
          if (profile) {
            console.log("Profile loaded, updating user data")
            const updatedUser: User = {
              ...session.user,
              full_name: profile.full_name,
              profile
            }
            updateAuthState(prev => ({ ...prev, user: updatedUser, profile }))
          }
        }).catch(error => {
          console.warn("Profile loading failed during auth state change:", error)
        })
      } else if (event === 'SIGNED_OUT') {
        updateAuthState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          initialLoading: false,
          error: null,
          isAuthenticated: false,
          isEmailConfirmed: false
        })
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        updateAuthState({
          session,
          error: null
        })
      } else if (event === 'USER_UPDATED' && session?.user) {
        let profile: any = null
        try {
          profile = await loadUserProfile(session.user.id)
        } catch (error) {
          console.warn("Profile loading failed during user update:", error)
        }
        
        const user: User = {
          ...session.user,
          full_name: profile?.full_name,
          profile
        }

        updateAuthState({
          user,
          session,
          profile,
          error: null
        })
      } else if (event === 'INITIAL_SESSION' && session?.user) {
        // Handle initial session - this is key for page reload!
        console.log("Initial session found:", session.user.id)
        let profile: any = null
        try {
          profile = await loadUserProfile(session.user.id)
        } catch (error) {
          console.warn("Profile loading failed during initial session:", error)
        }
        
        const user: User = {
          ...session.user,
          full_name: profile?.full_name,
          profile
        }

        updateAuthState({
          user,
          session,
          profile,
          loading: false,
          initialLoading: false,
          error: null,
          isAuthenticated: true,
          isEmailConfirmed: session.user.email_confirmed_at != null
        })
      } else if (event === 'INITIAL_SESSION' && !session) {
        // No session found on page load
        console.log("No initial session found")
        updateAuthState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          initialLoading: false,
          error: null,
          isAuthenticated: false,
          isEmailConfirmed: false
        })
      }
    })

    return () => {
      clearTimeout(failsafeTimeout)
      subscription.unsubscribe()
    }
  }, [checkAuthState, loadUserProfile, updateAuthState])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: AuthContextValue = useMemo(() => ({
    ...authState,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    checkAuthState
  }), [
    authState,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    checkAuthState
  ])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Utility hook to check if user is authenticated (for convenience)
export function useAuthCheck(): { isAuthenticated: boolean; loading: boolean } {
  const { isAuthenticated, initialLoading } = useAuth()
  return { 
    isAuthenticated, 
    loading: initialLoading 
  }
}

// Utility hook to get current user (for convenience)
export function useUser(): { user: User | null; profile: UserProfile | null; loading: boolean } {
  const { user, profile, initialLoading } = useAuth()
  return { 
    user, 
    profile, 
    loading: initialLoading 
  }
}