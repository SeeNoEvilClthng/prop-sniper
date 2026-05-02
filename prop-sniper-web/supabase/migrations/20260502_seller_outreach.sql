create extension if not exists "pgcrypto";

alter table if exists public.leads
  add column if not exists property_address text,
  add column if not exists zip text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists source text,
  add column if not exists motivation_score integer,
  add column if not exists condition_score integer,
  add column if not exists timeline_score integer,
  add column if not exists price_score integer,
  add column if not exists total_score integer,
  add column if not exists ai_summary text,
  add column if not exists last_contact_at timestamptz,
  add column if not exists updated_at timestamptz default timezone('utc', now());

update public.leads
set
  property_address = coalesce(property_address, address),
  zip = coalesce(zip, zip_code),
  phone = coalesce(phone, owner_phone),
  email = coalesce(email, owner_email),
  total_score = coalesce(total_score, lead_score),
  ai_summary = coalesce(ai_summary, ai_analysis),
  updated_at = coalesce(updated_at, created_at, timezone('utc', now()))
where true;

create table if not exists public.outreach_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  user_id uuid,
  direction text not null default 'outbound',
  message_body text not null,
  message_sid text,
  from_number text,
  to_number text,
  status text not null default 'queued',
  replied_interest boolean,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.call_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  user_id uuid,
  provider text not null default 'placeholder',
  call_sid text,
  direction text not null default 'outbound',
  status text not null default 'queued',
  transcript text,
  condition text,
  motivation text,
  timeline text,
  asking_price numeric,
  ai_summary text,
  wants_callback boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete cascade,
  user_id uuid,
  contact_name text,
  phone text,
  appointment_time timestamptz,
  status text not null default 'needs_scheduling',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists outreach_messages_lead_id_idx
  on public.outreach_messages (lead_id, created_at desc);

create index if not exists call_logs_lead_id_idx
  on public.call_logs (lead_id, created_at desc);

create index if not exists appointments_lead_id_idx
  on public.appointments (lead_id, created_at desc);
