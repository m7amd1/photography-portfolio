-- Fix RLS policies for photos table
-- First, drop existing policies if any
DROP POLICY IF EXISTS "Users can view all photos" ON photos;
DROP POLICY IF EXISTS "Users can insert their own photos" ON photos;
DROP POLICY IF EXISTS "Users can update their own photos" ON photos;
DROP POLICY IF EXISTS "Users can delete their own photos" ON photos;

-- Create new policies for photos table
-- Allow authenticated users to view all photos
CREATE POLICY "Users can view all photos" 
ON photos FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to insert their own photos
CREATE POLICY "Users can insert their own photos" 
ON photos FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own photos
CREATE POLICY "Users can update their own photos" 
ON photos FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own photos
CREATE POLICY "Users can delete their own photos" 
ON photos FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Storage policies for media bucket
-- Note: Storage policies need to be set via Supabase Dashboard or using the storage API
-- Here are the policies you should apply in the Supabase Dashboard:

/*
For the 'media' bucket, you need to set these policies in Supabase Dashboard:

1. Go to Storage -> Policies
2. For the 'media' bucket, add these policies:

SELECT (View):
- Policy name: "Allow authenticated users to view photos"
- Target roles: authenticated
- Policy definition: true

INSERT (Upload):
- Policy name: "Allow authenticated users to upload"
- Target roles: authenticated  
- Policy definition: true

UPDATE:
- Policy name: "Allow users to update their own uploads"
- Target roles: authenticated
- Policy definition: (bucket_id = 'media' AND auth.uid() = owner)

DELETE:
- Policy name: "Allow users to delete their own uploads"
- Target roles: authenticated
- Policy definition: (bucket_id = 'media' AND auth.uid() = owner)
*/

-- Verify RLS is enabled on photos table
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT ALL ON photos TO authenticated;
-- No sequence grant needed as photos table uses UUID for id
