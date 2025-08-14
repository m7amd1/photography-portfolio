# Authentication & Authorization Setup Guide

## Overview

This document outlines the complete authentication and authorization system implemented for the Photography Portfolio application using Next.js 15 and Supabase.

## Architecture Components

### 1. Authentication Flow
- **Provider**: Supabase Auth with email/password authentication
- **Session Management**: Server-side session handling using `@supabase/ssr`
- **Client State**: React Context API (`AuthProvider`) for centralized auth state
- **Middleware**: Route protection at the edge using Next.js middleware

### 2. Authorization Levels
- **Public Users**: Can view the portfolio (when implemented)
- **Authenticated Users**: Can manage their own photos
- **Admin Users**: Full access to all photos and admin features

## Implementation Details

### Core Authentication Components

#### 1. Supabase Client (`lib/supabaseClient.ts`)
```typescript
// Singleton client for browser-side operations
import { createClient } from '@supabase/supabase-js'
```

#### 2. SSR Client (`lib/supabase.ts`)
```typescript
// Server-side client with cookie management
import { createServerClient } from '@supabase/ssr'
```

#### 3. Middleware (`middleware.ts`)
- Protects routes requiring authentication
- Handles cookie refresh for session persistence
- Redirects unauthenticated users to `/auth`
- Protected routes: `/dashboard`, `/profile`

#### 4. Auth Provider (`components/auth-provider.tsx`)
- Global authentication context
- Manages user session, profile, and admin status
- Provides `useAuth()` hook for components
- Fetches admin status via Supabase RPC function

#### 5. Login Page (`app/auth/page.tsx`)
- Email/password authentication
- Auto-redirects authenticated users to dashboard
- Error handling and loading states

## Database Schema & Policies

### Photos Table RLS Policies

```sql
-- View all photos (authenticated users)
CREATE POLICY "Users can view all photos" ON photos
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Insert own photos only
CREATE POLICY "Users can insert their own photos" ON photos
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update own photos only
CREATE POLICY "Users can update their own photos" ON photos
FOR UPDATE USING (auth.uid() = user_id);

-- Delete own photos only
CREATE POLICY "Users can delete their own photos" ON photos
FOR DELETE USING (auth.uid() = user_id);
```

### Categories Table RLS Policies

```sql
-- View all categories (authenticated users)
CREATE POLICY "Users can view all categories" ON categories
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can manage categories
CREATE POLICY "Only admins can insert categories" ON categories
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update categories" ON categories
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Only admins can delete categories" ON categories
FOR DELETE USING (public.is_admin());
```

### Admin Check Function

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Storage Configuration

### Bucket: `media`

The application uses a storage bucket named `media` for photo uploads.

#### Option 1: Public Bucket (Recommended for Portfolio)
1. Go to Supabase Dashboard > Storage
2. Click on `media` bucket
3. Toggle "Public bucket" to ON
4. All authenticated users can upload, everyone can view

#### Option 2: RLS Storage Policies
If you need fine-grained control:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media' AND 
  auth.uid() IS NOT NULL
);

-- Allow everyone to view
CREATE POLICY "Public can view photos" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Users can update their own photos
CREATE POLICY "Users can update own photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

## Setting Up Admin Users

To grant admin privileges to a user:

1. Find the user's ID in Supabase Dashboard > Authentication > Users
2. Run this SQL in the SQL Editor:

```sql
UPDATE auth.users
SET raw_app_meta_data = 
  COALESCE(raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('role', 'admin')
WHERE id = 'USER_ID_HERE';
```

## Migration from Deprecated Packages

### Before (auth-helpers-nextjs)
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
```

### After (@supabase/ssr)
```typescript
import { createServerClient } from '@supabase/ssr'
```

Key differences:
- Better cookie handling
- Improved server/client synchronization
- More efficient session management
- Compatible with Next.js 15 App Router

## Features Implemented

### User Features
- ✅ Email/password authentication
- ✅ Protected dashboard access
- ✅ Photo upload with drag & drop
- ✅ Photo deletion with confirmation
- ✅ Category selection for photos
- ✅ Logout functionality

### Admin Features
- ✅ Admin status detection via RPC
- ✅ Admin badge in UI
- ✅ Foundation for admin-only features
- 🔄 Category management (UI ready, needs implementation)
- 🔄 View all users' photos (backend ready, needs UI)

### Security Features
- ✅ Row Level Security on all tables
- ✅ Storage bucket policies
- ✅ Server-side session validation
- ✅ Middleware route protection
- ✅ CSRF protection via Supabase

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Testing the Setup

1. **Test Authentication**
   - Sign up a new user
   - Verify email (if enabled)
   - Login and check redirect to dashboard

2. **Test Photo Management**
   - Upload a photo
   - Select category
   - Delete photo
   - Verify storage and database sync

3. **Test Admin Access**
   - Grant admin role to a user
   - Login as admin
   - Verify admin badge appears
   - Test admin-only features

## Troubleshooting

### Common Issues

1. **403 Unauthorized on Photo Upload**
   - Check storage bucket policies
   - Verify bucket name is "media"
   - Ensure RLS is enabled on photos table

2. **Session Not Persisting**
   - Check middleware configuration
   - Verify cookie settings in SSR client
   - Clear browser cookies and retry

3. **Admin Status Not Showing**
   - Verify is_admin() function exists
   - Check user's app_metadata in auth.users
   - Refresh session after granting admin

## Future Enhancements

- [ ] Social authentication (Google, GitHub)
- [ ] Public gallery view for non-authenticated users
- [ ] User profile management
- [ ] Photo sharing and permissions
- [ ] Bulk photo operations for admins
- [ ] Activity logs and audit trail
- [ ] Rate limiting on uploads
- [ ] Image optimization pipeline

## Security Best Practices

1. **Never expose service keys** - Only use anon key in client
2. **Always validate on backend** - Don't trust client-side checks
3. **Use RLS policies** - Database-level security is crucial
4. **Implement rate limiting** - Prevent abuse
5. **Regular security audits** - Review policies periodically
6. **Monitor usage** - Watch for unusual patterns

## Support & Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

*Last Updated: December 2024*
*Version: 1.0.0*
