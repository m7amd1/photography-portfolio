-- Quick fix for RLS policies
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on photos table
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON photos;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON photos;
DROP POLICY IF EXISTS "Enable select for authenticated users" ON photos;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON photos;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON photos;

-- 3. Create simple policies for authenticated users
-- Allow authenticated users to see all photos
CREATE POLICY "Enable select for authenticated users" 
ON photos FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to insert photos with their user_id
CREATE POLICY "Enable insert for authenticated users" 
ON photos FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own photos
CREATE POLICY "Enable update for authenticated users" 
ON photos FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own photos  
CREATE POLICY "Enable delete for authenticated users" 
ON photos FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
