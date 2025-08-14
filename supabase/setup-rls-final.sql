-- Complete RLS Setup for media Table
-- Run this entire script in Supabase SQL Editor

-- 1. First ensure RLS is enabled
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view all media" ON media;
DROP POLICY IF EXISTS "Users can insert their own media" ON media;
DROP POLICY IF EXISTS "Users can update their own media" ON media;
DROP POLICY IF EXISTS "Users can delete their own media" ON media;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON media;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON media;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON media;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON media;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON media;

-- 3. Create new policies
-- Allow all authenticated users to view all media (for gallery)
CREATE POLICY "authenticated_users_can_view_all_media" 
ON media FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to insert their own media
CREATE POLICY "authenticated_users_can_insert_own_media" 
ON media FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own media
CREATE POLICY "authenticated_users_can_update_own_media" 
ON media FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own media
CREATE POLICY "authenticated_users_can_delete_own_media" 
ON media FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 4. Grant necessary permissions
GRANT ALL ON media TO authenticated;

-- 5. Verify the setup
SELECT 'RLS Setup Complete!' as status;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'media';

-- List all policies on media table
SELECT pol.polname, pol.polcmd, pol.polroles::regrole[], pol.polqual, pol.polwithcheck
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
WHERE pc.relname = 'media';
