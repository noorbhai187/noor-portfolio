-- A daily write keeps the free-tier project from being paused for inactivity.
create table if not exists public.keepalive (
  id int primary key default 1 check (id = 1),
  pinged_at timestamptz not null default now()
);
alter table public.keepalive enable row level security; -- no policies: only the function below touches it

create or replace function public.keepalive()
returns timestamptz
language sql
security definer
set search_path = ''
as $$
  insert into public.keepalive (id, pinged_at) values (1, now())
  on conflict (id) do update set pinged_at = excluded.pinged_at
  returning pinged_at;
$$;

revoke all on function public.keepalive() from public;
grant execute on function public.keepalive() to anon;
