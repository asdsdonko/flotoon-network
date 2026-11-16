-- Run in Supabase > SQL Editor. Public pages can read these tables;
-- only the server-side service role (never exposed to the browser) can write.
create table if not exists public.ras (
 id uuid primary key default gen_random_uuid(),
 name text not null default '', role text not null default 'West Flo RA',
 email text not null default '', slack text not null default '',
 image_url text not null default '', sort_order integer not null default 0
);
create table if not exists public.events (
 id uuid primary key default gen_random_uuid(),
 title text not null default '', event_date date not null,
 time text not null default '', location text not null default '',
 description text not null default '', image_url text not null default ''
);
create table if not exists public.albums (
 id uuid primary key default gen_random_uuid(),
 title text not null default '', image_url text not null default '',
 photos text[] not null default '{}', created_at timestamptz not null default now()
);
create table if not exists public.settings (
 key text primary key, value text not null default ''
);
alter table public.ras enable row level security;
alter table public.events enable row level security;
alter table public.albums enable row level security;
alter table public.settings enable row level security;
create policy "public read ras" on public.ras for select to anon using (true);
create policy "public read events" on public.events for select to anon using (true);
create policy "public read albums" on public.albums for select to anon using (true);
create policy "public read settings" on public.settings for select to anon using (true);
insert into public.ras (name,sort_order)
select 'RA '||n,n from generate_series(1,11) n
where not exists (select 1 from public.ras);
insert into public.settings(key,value) values('slack_url','') on conflict(key) do nothing;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('flotoon-images','flotoon-images',true,8388608,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict(id) do nothing;
create policy "public read flotoon images" on storage.objects for select to anon using(bucket_id='flotoon-images');
