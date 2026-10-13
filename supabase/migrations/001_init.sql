-- Outfit Assistant schema. Single-user app: every table has RLS enabled with
-- no policies, so only the server (service-role key) can read or write.

create extension if not exists pgcrypto;

create table profile (
  id int primary key default 1 check (id = 1),
  lat double precision,
  lon double precision,
  timezone text,
  push_subscription jsonb,
  style_profile text,
  -- Minimum days between wears, per category.
  rotation jsonb not null default
    '{"top":5,"bottom":3,"dress":5,"shoes":3,"outerwear":2,"accessory":2}'::jsonb,
  last_daily_run date,
  updated_at timestamptz not null default now()
);
insert into profile (id) values (1);

create table inspiration_images (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  summary text,
  created_at timestamptz not null default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  category text not null
    check (category in ('top','bottom','dress','shoes','outerwear','accessory')),
  name text not null,
  colors text[] not null default '{}',
  pattern text,
  material text,
  formality int not null default 3 check (formality between 1 and 5),
  warmth int not null default 3 check (warmth between 1 and 5),
  seasons text[] not null default '{}',
  description text,
  thumb_path text,
  active boolean not null default true,
  wear_count int not null default 0,
  last_worn_at date,
  created_at timestamptz not null default now()
);

create table outfit_logs (
  id uuid primary key default gen_random_uuid(),
  worn_on date not null,
  photo_path text,
  status text not null default 'pending_review'
    check (status in ('pending_review','confirmed')),
  analysis jsonb,
  created_at timestamptz not null default now()
);
create index outfit_logs_worn_on on outfit_logs (worn_on);

create table outfit_log_items (
  log_id uuid not null references outfit_logs(id) on delete cascade,
  item_id uuid not null references items(id) on delete cascade,
  primary key (log_id, item_id)
);

create table suggestions (
  id uuid primary key default gen_random_uuid(),
  for_date date not null,
  item_ids uuid[] not null,
  backup_item_ids uuid[] not null default '{}',
  headline text,
  reasoning text,
  weather jsonb,
  status text not null default 'suggested'
    check (status in ('suggested','worn','skipped')),
  created_at timestamptz not null default now()
);
create index suggestions_for_date on suggestions (for_date);

-- Recompute wear_count / last_worn_at from confirmed logs.
create or replace function refresh_item_wear() returns void
language sql as $$
  update items i set
    wear_count = coalesce(w.cnt, 0),
    last_worn_at = w.last_worn
  from (
    select it.id,
           count(l.id) filter (where l.status = 'confirmed') as cnt,
           max(l.worn_on) filter (where l.status = 'confirmed') as last_worn
    from items it
    left join outfit_log_items li on li.item_id = it.id
    left join outfit_logs l on l.id = li.log_id
    group by it.id
  ) w
  where w.id = i.id;
$$;

alter table profile enable row level security;
alter table inspiration_images enable row level security;
alter table items enable row level security;
alter table outfit_logs enable row level security;
alter table outfit_log_items enable row level security;
alter table suggestions enable row level security;

-- Private bucket for all photos; the app hands out short-lived signed URLs.
insert into storage.buckets (id, name, public) values ('photos', 'photos', false)
on conflict (id) do nothing;
