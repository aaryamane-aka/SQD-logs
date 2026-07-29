-- SQD Supplier Dashboard — initial schema, RLS policies, and helper functions.
-- Run this once in the Supabase project's SQL Editor (Dashboard > SQL Editor > New query).

-- ============================================================================
-- PROFILES (role + supplier binding for each authenticated user)
-- ============================================================================
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  user_role text not null default 'supplier' check (user_role in ('internal', 'supplier')),
  supplier_id uuid, -- FK added after suppliers table exists below
  created_at timestamptz not null default now()
);

-- Auto-create a profile row (defaulted to the least-privileged 'supplier' role,
-- unbound to any supplier_id) whenever someone signs up. Promote real internal
-- staff manually afterwards, see bottom of this file.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Security-definer helpers so RLS policies can read the caller's role/supplier
-- without recursively re-evaluating RLS on `profiles` itself.
create function app_role()
returns text
language sql
security definer stable set search_path = public
as $$
  select user_role from profiles where id = auth.uid();
$$;

create function app_supplier_id()
returns uuid
language sql
security definer stable set search_path = public
as $$
  select supplier_id from profiles where id = auth.uid();
$$;

-- ============================================================================
-- SUPPLIERS
-- ============================================================================
create table suppliers (
  id uuid primary key default gen_random_uuid(),
  display_id text unique,
  name text not null,
  commodity text,
  category text check (category in ('Direct Material', 'Indirect Material', 'Service')),
  location text,
  criticality text check (criticality in ('A', 'B', 'C')),
  onboard_date date,
  sqe_owner text,
  status text check (status in ('Active', 'Probation', 'Inactive')),
  created_at timestamptz not null default now()
);

alter table profiles add constraint profiles_supplier_id_fkey
  foreign key (supplier_id) references suppliers (id) on delete set null;

create sequence suppliers_display_id_seq;

create function set_display_id()
returns trigger
language plpgsql
as $$
begin
  if new.display_id is null then
    new.display_id := TG_ARGV[0] || '-' || lpad(nextval(TG_ARGV[1])::text, 3, '0');
  end if;
  return new;
end;
$$;

create trigger suppliers_display_id
  before insert on suppliers
  for each row execute function set_display_id('SUP', 'suppliers_display_id_seq');

-- ============================================================================
-- TECHNICAL REVIEWS
-- ============================================================================
create table technical_reviews (
  id uuid primary key default gen_random_uuid(),
  display_id text unique,
  supplier_id uuid not null references suppliers (id) on delete cascade,
  review_type text check (review_type in ('PPAP', 'Design Review', 'Process Review', 'New Product Intro')),
  planned_date date,
  actual_date date,
  status text check (status in ('Scheduled', 'In Progress', 'Closed', 'Overdue')),
  reviewer text,
  key_findings text,
  action_items text,
  target_closure date,
  actual_closure date,
  created_at timestamptz not null default now()
);

create sequence technical_reviews_display_id_seq;
create trigger technical_reviews_display_id
  before insert on technical_reviews
  for each row execute function set_display_id('TR', 'technical_reviews_display_id_seq');

-- ============================================================================
-- QUALITY COMPLAINTS (8D / CAPA log)
-- ============================================================================
create table quality_complaints (
  id uuid primary key default gen_random_uuid(),
  display_id text unique,
  date_raised date,
  supplier_id uuid not null references suppliers (id) on delete cascade,
  part_no text,
  defect_description text,
  qty_rcvd integer default 0,
  qty_rej integer default 0,
  severity text check (severity in ('Minor', 'Major', 'Critical')),
  root_cause text,
  corrective_action text,
  target_close date,
  actual_close date,
  status text check (status in ('Open', 'In Progress', 'Closed')),
  created_at timestamptz not null default now()
);

create sequence quality_complaints_display_id_seq;
create trigger quality_complaints_display_id
  before insert on quality_complaints
  for each row execute function set_display_id('QC', 'quality_complaints_display_id_seq');

-- ============================================================================
-- MONTHLY PPM
-- ============================================================================
create table monthly_ppm (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers (id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  qty_received integer default 0,
  qty_rejected integer default 0,
  target_ppm numeric default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- DELIVERY PERFORMANCE
-- ============================================================================
create table delivery_performance (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers (id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  orders_due integer default 0,
  orders_on_time integer default 0,
  target_otd numeric default 0,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- SUPPLIER AUDITS
-- ============================================================================
create table supplier_audits (
  id uuid primary key default gen_random_uuid(),
  display_id text unique,
  supplier_id uuid not null references suppliers (id) on delete cascade,
  audit_type text check (audit_type in ('System Audit (IATF 16949)', 'System Audit (ISO 9001)', 'Process Audit', 'Product Audit', 'MQS Audit')),
  planned_date date,
  actual_date date,
  auditor text,
  score numeric,
  major_ncs integer default 0,
  minor_ncs integer default 0,
  capa_due date,
  capa_status text check (capa_status in ('Open', 'In Progress', 'Closed')),
  next_audit_due date,
  created_at timestamptz not null default now()
);

create sequence supplier_audits_display_id_seq;
create trigger supplier_audits_display_id
  before insert on supplier_audits
  for each row execute function set_display_id('AU', 'supplier_audits_display_id_seq');

-- ============================================================================
-- APQP PARTS
-- supplier_name is intentionally free text (matched case-insensitively to
-- suppliers.name for rollups), not a FK — mirrors the prototype's data model.
-- ============================================================================
create table apqp_parts (
  id uuid primary key default gen_random_uuid(),
  display_id text unique,
  supplier_name text,
  part_name text,
  part_no text,
  project_name text,
  plant text,
  kickoff_plan date,
  kickoff_actual date,
  off_tool_plan date,
  off_tool_actual date,
  ppap_plan date,
  ppap_actual date,
  run_at_rate_plan date,
  run_at_rate_actual date,
  sop_plan date,
  sop_actual date,
  status text check (status in ('Not Started', 'On Track', 'At Risk', 'Delayed', 'Complete')),
  created_at timestamptz not null default now()
);

create sequence apqp_parts_display_id_seq;
create trigger apqp_parts_display_id
  before insert on apqp_parts
  for each row execute function set_display_id('APQP', 'apqp_parts_display_id_seq');

-- ============================================================================
-- ROW LEVEL SECURITY
-- Internal: full CRUD on everything.
-- Supplier: scoped to their own supplier_id (or matching supplier name for
-- apqp_parts), with add/edit/delete restricted per the handoff's permissions
-- matrix. Field-level restriction (e.g. supplier can only edit APQP
-- status/notes) is enforced in the app UI, not in RLS.
-- ============================================================================
alter table profiles enable row level security;
alter table suppliers enable row level security;
alter table technical_reviews enable row level security;
alter table quality_complaints enable row level security;
alter table monthly_ppm enable row level security;
alter table delivery_performance enable row level security;
alter table supplier_audits enable row level security;
alter table apqp_parts enable row level security;

-- profiles: everyone can read their own row; internal can read/update all.
create policy profiles_select on profiles for select
  using (id = auth.uid() or app_role() = 'internal');
create policy profiles_update on profiles for update
  using (app_role() = 'internal');

-- suppliers: internal full CRUD; supplier can only read their own row.
create policy suppliers_select on suppliers for select
  using (app_role() = 'internal' or id = app_supplier_id());
create policy suppliers_insert on suppliers for insert
  with check (app_role() = 'internal');
create policy suppliers_update on suppliers for update
  using (app_role() = 'internal');
create policy suppliers_delete on suppliers for delete
  using (app_role() = 'internal');

-- technical_reviews: internal full CRUD; supplier can read/edit (not add/delete) own rows.
create policy technical_reviews_select on technical_reviews for select
  using (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy technical_reviews_insert on technical_reviews for insert
  with check (app_role() = 'internal');
create policy technical_reviews_update on technical_reviews for update
  using (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy technical_reviews_delete on technical_reviews for delete
  using (app_role() = 'internal');

-- quality_complaints: internal full CRUD; supplier can add/edit (not delete) own rows.
create policy quality_complaints_select on quality_complaints for select
  using (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy quality_complaints_insert on quality_complaints for insert
  with check (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy quality_complaints_update on quality_complaints for update
  using (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy quality_complaints_delete on quality_complaints for delete
  using (app_role() = 'internal');

-- monthly_ppm: internal full CRUD; supplier can add/edit (not delete) own rows.
create policy monthly_ppm_select on monthly_ppm for select
  using (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy monthly_ppm_insert on monthly_ppm for insert
  with check (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy monthly_ppm_update on monthly_ppm for update
  using (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy monthly_ppm_delete on monthly_ppm for delete
  using (app_role() = 'internal');

-- delivery_performance: internal full CRUD; supplier can add/edit (not delete) own rows.
create policy delivery_performance_select on delivery_performance for select
  using (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy delivery_performance_insert on delivery_performance for insert
  with check (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy delivery_performance_update on delivery_performance for update
  using (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy delivery_performance_delete on delivery_performance for delete
  using (app_role() = 'internal');

-- supplier_audits: internal full CRUD; supplier read-only on own rows.
create policy supplier_audits_select on supplier_audits for select
  using (app_role() = 'internal' or supplier_id = app_supplier_id());
create policy supplier_audits_insert on supplier_audits for insert
  with check (app_role() = 'internal');
create policy supplier_audits_update on supplier_audits for update
  using (app_role() = 'internal');
create policy supplier_audits_delete on supplier_audits for delete
  using (app_role() = 'internal');

-- apqp_parts: internal full CRUD; supplier can edit (not add/delete) rows
-- matching their supplier name, case-insensitively.
create policy apqp_parts_select on apqp_parts for select
  using (
    app_role() = 'internal'
    or exists (
      select 1 from suppliers s
      where s.id = app_supplier_id()
        and lower(trim(s.name)) = lower(trim(coalesce(apqp_parts.supplier_name, '')))
    )
  );
create policy apqp_parts_insert on apqp_parts for insert
  with check (app_role() = 'internal');
create policy apqp_parts_update on apqp_parts for update
  using (
    app_role() = 'internal'
    or exists (
      select 1 from suppliers s
      where s.id = app_supplier_id()
        and lower(trim(s.name)) = lower(trim(coalesce(apqp_parts.supplier_name, '')))
    )
  );
create policy apqp_parts_delete on apqp_parts for delete
  using (app_role() = 'internal');

-- ============================================================================
-- ONE-TIME MANUAL STEP
-- New signups default to role='supplier' with no supplier_id (blocked from
-- all data until assigned). To create your first internal admin, run after
-- they've signed up once through the app's login screen:
--
--   update profiles set user_role = 'internal' where email = 'you@company.com';
--
-- To bind a supplier user to their company record:
--
--   update profiles set supplier_id = (select id from suppliers where name = 'Acme Corp')
--   where email = 'supplier-contact@acme.com';
-- ============================================================================
