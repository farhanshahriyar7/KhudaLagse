-- 1. Create a public bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- 2. Allow public access to view avatar images
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 3. Allow authenticated users to upload their own avatar
create policy "Users can upload their own avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- 4. Allow users to update their own avatar
create policy "Users can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' and auth.role() = 'authenticated' );

-- 5. Allow users to delete their own avatar
create policy "Users can delete their own avatar."
  on storage.objects for delete
  using ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
