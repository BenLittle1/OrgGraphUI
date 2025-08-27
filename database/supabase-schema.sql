-- =============================================================================
-- WarpDrive User Authentication Database Schema
-- Supabase Production Migration
-- =============================================================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PROFILES TABLE
-- =============================================================================
-- User profiles table that extends Supabase Auth with additional user data
-- Links to auth.users via foreign key relationship

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL CHECK (length(full_name) >= 1 AND length(full_name) <= 100),
    email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._+%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Additional constraints for data integrity
    CONSTRAINT profiles_email_not_empty CHECK (length(trim(email)) > 0),
    CONSTRAINT profiles_full_name_not_empty CHECK (length(trim(full_name)) > 0)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
-- Create indexes for common query patterns

-- Index on email for lookups (unique to prevent duplicates)
CREATE UNIQUE INDEX idx_profiles_email ON public.profiles(email);

-- Index on created_at for sorting/filtering by registration date
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- Index on updated_at for recent activity queries
CREATE INDEX idx_profiles_updated_at ON public.profiles(updated_at DESC);

-- Partial index on full_name for name searches (only non-empty names)
CREATE INDEX idx_profiles_full_name ON public.profiles(full_name) 
WHERE length(trim(full_name)) > 0;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================
-- Enable RLS on the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile  
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile (for manual creation)
-- Note: Most profiles will be created via trigger, but this allows manual creation
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- =============================================================================
-- TRIGGER FUNCTIONS
-- =============================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically create a user profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, created_at, updated_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.email,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    );
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Profile already exists, ignore the error
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail the auth process
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Trigger: Automatically update updated_at on profile changes
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Trigger: Automatically create profile when user signs up
CREATE TRIGGER trigger_create_profile_on_signup
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- HELPER FUNCTIONS FOR APPLICATION USE
-- =============================================================================

-- Function to safely get or create a user profile
-- This function is called by the auth context createUserProfile() function
CREATE OR REPLACE FUNCTION public.get_or_create_profile(
    user_id UUID,
    user_full_name TEXT DEFAULT NULL,
    user_email TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    profile_record public.profiles%ROWTYPE;
BEGIN
    -- Try to get existing profile
    SELECT * INTO profile_record FROM public.profiles WHERE public.profiles.id = user_id;
    
    -- If profile doesn't exist, create it
    IF NOT FOUND THEN
        INSERT INTO public.profiles (id, full_name, email)
        VALUES (
            user_id,
            COALESCE(user_full_name, 'New User'),
            COALESCE(user_email, '')
        )
        RETURNING * INTO profile_record;
    END IF;
    
    -- Return the profile data
    RETURN QUERY SELECT 
        profile_record.id,
        profile_record.full_name,
        profile_record.email,
        profile_record.created_at,
        profile_record.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user profile with validation
CREATE OR REPLACE FUNCTION public.update_user_profile(
    user_id UUID,
    new_full_name TEXT DEFAULT NULL,
    new_email TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Validate that user can only update their own profile
    IF auth.uid() != user_id THEN
        RAISE EXCEPTION 'Unauthorized: Cannot update another user''s profile';
    END IF;
    
    -- Update profile with provided values (only update non-null values)
    UPDATE public.profiles 
    SET 
        full_name = COALESCE(new_full_name, full_name),
        email = COALESCE(new_email, email),
        updated_at = timezone('utc'::text, now())
    WHERE public.profiles.id = user_id;
    
    -- Return updated profile
    RETURN QUERY SELECT 
        profiles.id,
        profiles.full_name,
        profiles.email,
        profiles.created_at,
        profiles.updated_at
    FROM public.profiles 
    WHERE profiles.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- GRANTS AND PERMISSIONS
-- =============================================================================

-- Grant necessary permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_or_create_profile(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(UUID, TEXT, TEXT) TO authenticated;

-- =============================================================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase Auth with additional user data';
COMMENT ON COLUMN public.profiles.id IS 'Primary key referencing auth.users.id';
COMMENT ON COLUMN public.profiles.full_name IS 'User''s full display name (required, 1-100 chars)';
COMMENT ON COLUMN public.profiles.email IS 'User''s email address with validation';
COMMENT ON COLUMN public.profiles.created_at IS 'Profile creation timestamp (UTC)';
COMMENT ON COLUMN public.profiles.updated_at IS 'Profile last update timestamp (UTC)';

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates profile when user signs up';
COMMENT ON FUNCTION public.handle_updated_at() IS 'Automatically updates updated_at timestamp';
COMMENT ON FUNCTION public.get_or_create_profile(UUID, TEXT, TEXT) IS 'Safely gets existing profile or creates new one';
COMMENT ON FUNCTION public.update_user_profile(UUID, TEXT, TEXT) IS 'Updates user profile with validation';

-- =============================================================================
-- VERIFICATION QUERIES (FOR TESTING - REMOVE IN PRODUCTION)
-- =============================================================================

-- Uncomment these queries to test the schema after migration:

-- -- Test: Check if table was created properly
-- SELECT table_name, column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- -- Test: Check if indexes were created
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'profiles' AND schemaname = 'public';

-- -- Test: Check if RLS policies were created
-- SELECT policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename = 'profiles' AND schemaname = 'public';

-- -- Test: Check if functions were created
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_schema = 'public' 
-- AND routine_name IN ('handle_new_user', 'handle_updated_at', 'get_or_create_profile', 'update_user_profile');

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- This schema provides:
-- ✅ User profiles table with proper constraints and validation
-- ✅ Automatic profile creation on user signup via trigger
-- ✅ Automatic updated_at timestamp management
-- ✅ Row Level Security policies for data protection
-- ✅ Performance indexes for common queries
-- ✅ Helper functions for application integration
-- ✅ Proper error handling and security
-- ✅ Production-ready with comprehensive documentation
-- 
-- Next steps:
-- 1. Execute this schema in Supabase SQL Editor
-- 2. Test user registration flow
-- 3. Verify auth context integration works properly
-- 4. Test RLS policies with different user contexts
-- =============================================================================