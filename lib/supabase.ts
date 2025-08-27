import { createClient } from '@supabase/supabase-js'
import type { Database, UserProfileUpdate } from '@/types/auth'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/**
 * Supabase client configured for Next.js App Router
 * Uses client-side configuration for browser-based authentication
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure session persistence for Next.js App Router
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Configure flow for Next.js App Router
    flowType: 'pkce'
  },
  // Global configuration
  global: {
    headers: {
      'X-Client-Info': 'warpdrive-nextjs-app'
    }
  },
  // Real-time configuration
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

/**
 * Helper function to get the current session
 * Useful for server-side operations in App Router
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

/**
 * Helper function to get the current user
 * Returns null if not authenticated
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

/**
 * Helper function to sign out
 * Clears session and redirects appropriately
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Helper function to check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { session } = await getSession()
  return !!session
}

/**
 * Helper function to get user profile by ID
 */
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return { profile: data, error }
}

/**
 * Helper function to update user profile
 */
export const updateUserProfile = async (userId: string, updates: UserProfileUpdate) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()
  
  return { profile: data, error }
}

/**
 * Helper function to create user profile
 * Called during sign up process
 */
export const createUserProfile = async (userId: string, email: string, fullName?: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      full_name: fullName || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
  
  return { profile: data, error }
}

// Auth state change listeners
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback)
}

// Export the client as default for convenience
export default supabase