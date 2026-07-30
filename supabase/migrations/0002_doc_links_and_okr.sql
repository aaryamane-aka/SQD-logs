-- SQD Supplier OKR Dashboard — additive migration on top of 0001_init.sql.
-- Run this once in the Supabase project's SQL Editor, after 0001_init.sql.

-- ============================================================================
-- DOCUMENT LINKS
-- A free-text URL field on every record type, letting users attach a link to
-- wherever the supporting document already lives (SharePoint, Google Drive,
-- etc.) rather than uploading a file. No RLS changes needed — existing
-- row-level policies already cover all columns on these tables.
-- ============================================================================
alter table suppliers add column doc_url text;
alter table technical_reviews add column doc_url text;
alter table quality_complaints add column doc_url text;
alter table monthly_ppm add column doc_url text;
alter table delivery_performance add column doc_url text;
alter table supplier_audits add column doc_url text;
alter table apqp_parts add column doc_url text;

-- ============================================================================
-- AUDIT TYPE: add CQI-X / Safe Launch / VDA 6.3 audits to the allowed list.
-- ============================================================================
alter table supplier_audits drop constraint supplier_audits_audit_type_check;
alter table supplier_audits add constraint supplier_audits_audit_type_check
  check (audit_type in (
    'System Audit (IATF 16949)', 'System Audit (ISO 9001)', 'Process Audit', 'Product Audit', 'MQS Audit',
    'CQI-X Audit', 'Safe Launch Audit', 'VDA 6.3 Audit'
  ));

-- ============================================================================
-- OKR: Objectives, Key Results, and monthly Actual/Score entries.
-- Internal-only end to end (structural CRUD is rare/admin; monthly entries
-- are filled in by internal SQD staff, per the source report) — supplier
-- accounts have no visibility into OKR data at all.
-- ============================================================================
create table objectives (
  id uuid primary key default gen_random_uuid(),
  display_id text unique,
  title text not null,
  weight_pct numeric,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create sequence objectives_display_id_seq;
create trigger objectives_display_id
  before insert on objectives
  for each row execute function set_display_id('OBJ', 'objectives_display_id_seq');

create table key_results (
  id uuid primary key default gen_random_uuid(),
  display_id text unique,
  objective_id uuid not null references objectives (id) on delete cascade,
  title text not null,
  weight_pct numeric,
  target_general text,
  target_challenge text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create sequence key_results_display_id_seq;
create trigger key_results_display_id
  before insert on key_results
  for each row execute function set_display_id('KR', 'key_results_display_id_seq');

create table okr_monthly_entries (
  id uuid primary key default gen_random_uuid(),
  key_result_id uuid not null references key_results (id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  actual text,
  score numeric,
  created_at timestamptz not null default now(),
  unique (key_result_id, month)
);

alter table objectives enable row level security;
alter table key_results enable row level security;
alter table okr_monthly_entries enable row level security;

create policy objectives_all on objectives for all
  using (app_role() = 'internal') with check (app_role() = 'internal');
create policy key_results_all on key_results for all
  using (app_role() = 'internal') with check (app_role() = 'internal');
create policy okr_monthly_entries_all on okr_monthly_entries for all
  using (app_role() = 'internal') with check (app_role() = 'internal');
