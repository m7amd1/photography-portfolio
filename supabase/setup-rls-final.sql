-- Complete RLS Setup for Photos Table
-- Run this entire script in Supabase SQL Editor

-- 1. First ensure RLS is enabled
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view all photos" ON photos;
DROP POLICY IF EXISTS "Users can insert their own photos" ON photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON photos;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON photos;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON photos;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON photos;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON photos;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON photos;

-- 3. Create new policies
-- Allow all authenticated users to view all photos (for gallery)
CREATE POLICY "authenticated_users_can_view_all_photos" 
ON photos FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to insert their own photos
CREATE POLICY "authenticated_users_can_insert_own_photos" 
ON photos FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own photos
CREATE POLICY "authenticated_users_can_update_own_photos" 
ON photos FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own photos
CREATE POLICY "authenticated_users_can_delete_own_photos" 
ON photos FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- 4. Grant necessary permissions
GRANT ALL ON photos TO authenticated;

-- 5. Verify the setup
SELECT 'RLS Setup Complete!' as status;

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'photos';

-- List all policies on photos table
SELECT pol.polname, pol.polcmd, pol.polroles::regrole[], pol.polqual, pol.polwithcheck
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
WHERE pc.relname = 'photos';
