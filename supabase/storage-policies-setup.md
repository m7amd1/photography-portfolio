# Storage Bucket Policies Setup for 'media' bucket

## Option 1: Make the bucket PUBLIC (Recommended for Portfolio)

1. Go to Supabase Dashboard → Storage
2. Click on the 'media' bucket
3. Click on "Configuration" or the settings icon
4. Toggle "Public bucket" to ON
5. Save changes

This allows:
- Anyone to VIEW images (good for portfolio)
- Only authenticated users to upload/delete (controlled by RLS)

## Option 2: Set up RLS Policies for Storage

If you want to keep the bucket private and use RLS:

1. Go to Supabase Dashboard → Storage
2. Click on the 'media' bucket
3. Go to the "Policies" tab
4. Click "New Policy" for each of these:

### Policy 1: Allow public or authenticated to view
- **Name**: Public view media
- **Policy definition**:
```sql
(bucket_id = 'media')
```
- **Allowed operations**: SELECT
- **Target roles**: Select both `anon` and `authenticated`

### Policy 2: Allow authenticated to upload
- **Name**: Authenticated upload media  
- **Policy definition**:
```sql
(bucket_id = 'media')
```
- **Allowed operations**: INSERT
- **Target roles**: `authenticated`

### Policy 3: Allow users to update their own files
- **Name**: Update own media
- **Policy definition**:
```sql
(bucket_id = 'media' AND auth.uid() = owner)
```
- **Allowed operations**: UPDATE
- **Target roles**: `authenticated`

### Policy 4: Allow users to delete their own files
- **Name**: Delete own media
- **Policy definition**:
```sql
(bucket_id = 'media' AND auth.uid() = owner)
```
- **Allowed operations**: DELETE
- **Target roles**: `authenticated`

## Option 3: Quick SQL to check/create storage policies

Run this in SQL Editor to check current storage policies:

```sql
-- Check if storage schema exists and list policies
SELECT 
    schemaname,
    tablename,
    policyname  
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects';
```

## Testing after setup

After setting up the policies:
1. Refresh your app
2. Try uploading a photo again
3. It should work without the 403 error

## If still having issues:

Make sure:
1. The bucket name is exactly 'media' (case-sensitive)
2. You're logged in as an authenticated user
3. The user_id in your code matches auth.uid()

You can verify your auth user ID:
```sql
-- Run this after logging in to see your user ID
SELECT auth.uid();
```
