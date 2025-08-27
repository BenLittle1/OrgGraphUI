import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

// Database type definitions for Supabase generated types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile
        Insert: UserProfileInsert
        Update: Partial<UserProfileUpdate> & { updated_at?: string }
      }
      // Add other table types as needed
    }
  }
}

/**
 * Extended User interface that includes our custom fields
 * Extends Supabase User with profile information
 */
export interface User extends SupabaseUser {
  // Profile information from our profiles table
  full_name?: string
  profile?: UserProfile | null
}

/**
 * User Profile interface for our profiles table
 * This represents the structure of user data in our database
 */
export interface UserProfile {
  id: string                    // UUID from auth.users
  full_name: string            // User's full display name
  email: string                // User's email address
  avatar_url?: string | null   // Profile picture URL (optional)
  created_at: string           // ISO timestamp when profile was created
  updated_at: string           // ISO timestamp when profile was last updated
}

/**
 * Type for inserting new user profiles
 */
export interface UserProfileInsert {
  id: string
  full_name: string
  email: string
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
}

/**
 * Type for updating existing user profiles
 */
export interface UserProfileUpdate {
  full_name?: string
  email?: string
  avatar_url?: string | null
  updated_at?: string
}

/**
 * Authentication state interface for our auth context
 */
export interface AuthState {
  // Current user and session
  user: User | null
  session: Session | null
  profile: UserProfile | null
  
  // Loading states
  loading: boolean
  initialLoading: boolean
  
  // Error states
  error: string | null
  
  // Authentication status
  isAuthenticated: boolean
  isEmailConfirmed: boolean
}

/**
 * Authentication context value interface
 * This defines what our auth context provider exposes
 */
export interface AuthContextValue extends AuthState {
  // Auth actions
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>
  signInWithOAuth: (provider: 'google' | 'github') => Promise<AuthResult>
  signOut: () => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  updatePassword: (password: string) => Promise<AuthResult>
  
  // Profile actions
  updateProfile: (updates: UserProfileUpdate) => Promise<ProfileResult>
  refreshProfile: () => Promise<void>
  
  // Utility functions
  checkAuthState: () => Promise<void>
}

/**
 * Result type for authentication operations
 */
export interface AuthResult {
  success: boolean
  error?: string | null
  user?: User | null
  session?: Session | null
}

/**
 * Result type for profile operations
 */
export interface ProfileResult {
  success: boolean
  error?: string | null
  profile?: UserProfile | null
}

/**
 * Sign up form data interface
 */
export interface SignUpData {
  email: string
  password: string
  fullName: string
  confirmPassword?: string
}

/**
 * Sign in form data interface
 */
export interface SignInData {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Password reset form data interface
 */
export interface ResetPasswordData {
  email: string
}

/**
 * Update password form data interface
 */
export interface UpdatePasswordData {
  currentPassword?: string
  newPassword: string
  confirmPassword: string
}

/**
 * OAuth provider types
 */
export type OAuthProvider = 'google' | 'github' | 'discord' | 'facebook'

/**
 * Auth error types for better error handling
 */
export enum AuthError {
  // Sign in errors
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  TOO_MANY_REQUESTS = 'too_many_requests',
  
  // Sign up errors
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  WEAK_PASSWORD = 'weak_password',
  INVALID_EMAIL = 'invalid_email',
  
  // Profile errors
  PROFILE_NOT_FOUND = 'profile_not_found',
  PROFILE_UPDATE_FAILED = 'profile_update_failed',
  
  // General errors
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error',
  SESSION_EXPIRED = 'session_expired',
  UNAUTHORIZED = 'unauthorized'
}

/**
 * Auth event types for state management
 */
export enum AuthEvent {
  SIGNED_IN = 'SIGNED_IN',
  SIGNED_OUT = 'SIGNED_OUT',
  PASSWORD_RECOVERY = 'PASSWORD_RECOVERY',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  USER_UPDATED = 'USER_UPDATED'
}

/**
 * Protected route configuration
 */
export interface RouteConfig {
  path: string
  requiresAuth: boolean
  requiredRole?: string
  redirectTo?: string
}

/**
 * User role enum for authorization
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

/**
 * Session configuration interface
 */
export interface SessionConfig {
  expiresIn?: number
  refreshThreshold?: number
  autoRefresh?: boolean
}

/**
 * Auth provider configuration
 */
export interface AuthProviderConfig {
  redirectTo?: string
  scopes?: string
}

// Type guards for runtime type checking

/**
 * Type guard to check if an error is an AuthError
 */
export const isAuthError = (error: any): error is AuthError => {
  return Object.values(AuthError).includes(error)
}

/**
 * Type guard to check if user is authenticated
 */
export const isUserAuthenticated = (user: User | null): user is User => {
  return user !== null && user.id !== undefined
}

/**
 * Type guard to check if profile exists
 */
export const hasUserProfile = (profile: UserProfile | null): profile is UserProfile => {
  return profile !== null && profile.id !== undefined
}

// Utility types

/**
 * Partial auth state for updates
 */
export type PartialAuthState = Partial<AuthState>

/**
 * Auth context action types
 */
export type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INITIAL_LOADING'; payload: boolean }
  | { type: 'RESET_STATE' }

export default Database