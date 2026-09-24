create table public.contact_messages (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 200),
  message text not null check (char_length(message) between 1 and 5000)
);
-- Only the edge function (service role) reads/writes; no public policies on purpose.
alter table public.contact_messages enable row level security;
create index contact_messages_email_created_idx on public.contact_messages (email, created_at desc);
