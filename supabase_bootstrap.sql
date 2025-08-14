-- Photography portfolio bootstrap for a fresh Supabase project
-- Run this in the Supabase SQL editor on your new project
-- It creates tables, enables RLS, policies for admin + authenticated users,
-- and storage bucket rules for public viewing and controlled writes.

-- 1) Helper: admin detection based on auth.users.raw_app_meta_data.role = 'admin'
--    Set this via Dashboard -> Authentication -> Users -> Edit user -> App Metadata -> { "role": "admin" }
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from auth.users u
    where u.id = auth.uid()
      and coalesce(u.raw_app_meta_data->>'role','') = 'admin'
  );
$$;

comment on function public.is_admin is 'Returns true if the current JWT belongs to a user with app_metadata.role = "admin".';

-- 2) Tables
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  title text,
  category_id uuid references public.categories(id) on delete set null,
  storage_path text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger photos_set_updated_at
  before update on public.photos
  for each row execute function public.set_updated_at();

-- 3) Enable RLS
alter table public.categories enable row level security;
alter table public.photos enable row level security;

-- 4) Policies
-- Categories
-- Read: everyone (public) can read categories
create policy if not exists "Public read categories"
  on public.categories for select
  using (true);

-- Write: only admins can insert/update/delete categories
create policy if not exists "Admins manage categories"
  on public.categories for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Photos
-- Read: everyone (public) can read photos metadata
create policy if not exists "Public read photos"
  on public.photos for select
  using (true);

-- Insert: authenticated users can insert their own photos; admins can insert any
create policy if not exists "Authenticated insert own photos"
  on public.photos for insert to authenticated
  with check (
    (auth.uid() is not null and user_id = auth.uid())
    or public.is_admin()
  );

-- Update: owner or admin
create policy if not exists "Owner or admin update photos"
  on public.photos for update to authenticated
  using (
    (user_id = auth.uid())
    or public.is_admin()
  )
  with check (
    (user_id = auth.uid())
    or public.is_admin()
  );

-- Delete: owner or admin
create policy if not exists "Owner or admin delete photos"
  on public.photos for delete to authenticated
  using (
    (user_id = auth.uid())
    or public.is_admin()
  );

-- 5) Storage: bucket + policies
-- Create a public bucket for photos if it doesn't exist
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Public can read files in the bucket
create policy if not exists "Public read storage objects"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Authenticated users can upload to the bucket
create policy if not exists "Authenticated upload storage objects"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos');

-- Authenticated users can update or delete their own files; admins can manage all
create policy if not exists "Owner or admin modify storage objects"
  on storage.objects for update to authenticated
  using ((bucket_id = 'photos') and ((owner = auth.uid()) or public.is_admin()))
  with check ((bucket_id = 'photos') and ((owner = auth.uid()) or public.is_admin()));

create policy if not exists "Owner or admin delete storage objects"
  on storage.objects for delete to authenticated
  using ((bucket_id = 'photos') and ((owner = auth.uid()) or public.is_admin()));

-- 6) Optional: tighten anon access to writes by ensuring only authenticated role has write policies
-- Note: Supabase evaluates policies per role; above scopes writes to authenticated only.

-- 7) Helpful indexes
create index if not exists photos_category_id_idx on public.photos(category_id);
create index if not exists photos_user_id_idx on public.photos(user_id);

-- 8) Seed default category
insert into public.categories (name)
values ('uncategorized')
on conflict (name) do nothing;

