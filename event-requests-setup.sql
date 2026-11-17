-- Run once in Supabase SQL Editor. Requests are private, even to anonymous readers.
create table if not exists public.event_requests (
 id uuid primary key default gen_random_uuid(),
 requester text not null,
 email text not null default '',
 title text not null,
 event_date date not null,
 time text not null default '',
 location text not null default '',
 description text not null default '',
 status text not null default 'pending' check (status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 published_event_id uuid references public.events(id) on delete set null
);
alter table public.event_requests enable row level security;
-- No anon/authenticated policies: only server service-role requests can access this table.
create index if not exists event_requests_status_created_idx on public.event_requests(status, created_at desc);

-- Atomic review: never grant EXECUTE on this function to public clients.
create or replace function public.review_flotoon_event_request(request_id uuid, decision text)
returns uuid language plpgsql security definer set search_path = public as $$
declare r public.event_requests%rowtype; eid uuid;
begin
 if decision not in ('approve','reject') then raise exception 'Invalid decision'; end if;
 select * into r from public.event_requests where id=request_id for update;
 if not found then raise exception 'Request not found'; end if;
 if r.status <> 'pending' then raise exception 'Request already reviewed'; end if;
 if decision='approve' then
  insert into public.events(title,event_date,time,location,description)
  values(r.title,r.event_date,r.time,r.location,r.description) returning id into eid;
 end if;
 update public.event_requests set status=case when decision='approve' then 'approved' else 'rejected' end,
 reviewed_at=now(), published_event_id=eid where id=request_id;
 return eid;
end; $$;
revoke all on function public.review_flotoon_event_request(uuid,text) from public, anon, authenticated;
grant execute on function public.review_flotoon_event_request(uuid,text) to service_role;
