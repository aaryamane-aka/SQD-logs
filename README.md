# SQD Supplier OKR Dashboard

React + TypeScript (Vite) app backed by Supabase (Postgres + Auth), styled with
Tailwind CSS + shadcn/ui, built from the design handoff in [`handoff/`](handoff/README.md)
and extended with an OKR (Objectives & Key Results) tracking system.

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).

3. **Run the migrations**: open the Supabase project's SQL Editor and run, in order:
   - [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — the 7 core
     data tables, `profiles`, and Row Level Security policies enforcing the permissions
     matrix from the handoff README.
   - [`supabase/migrations/0002_doc_links_and_okr.sql`](supabase/migrations/0002_doc_links_and_okr.sql) —
     adds a `doc_url` link field to every record type, three more audit types (CQI-X, Safe
     Launch, VDA 6.3), and the `objectives` / `key_results` / `okr_monthly_entries` tables
     (internal-only) behind the OKR tab.

4. **Configure env vars**: copy `.env.example` to `.env` and fill in your project's URL and
   anon/public key (Project Settings → API in the Supabase dashboard):
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

5. **Run it**
   ```
   npm run dev
   ```

6. **Create your first account**: sign up through the app's login screen. New accounts
   default to the least-privileged `supplier` role with no supplier binding (blocked from
   all data). Promote your own account to `internal` once via SQL:
   ```sql
   update profiles set user_role = 'internal' where email = 'you@company.com';
   ```
   After that, use the in-app **Users** tab (visible to internal accounts) to assign roles
   and bind supplier accounts to their supplier record — no more manual SQL needed.

## Local UI preview without Supabase

Set `VITE_MOCK_MODE=true` in `.env` to run the app against local sample data (no Supabase
project required) with a role/supplier switcher in a top bar. The OKR mock fixtures are
seeded from the real source report's Jan/Feb 2026 numbers, so the Total row can be checked
against that report directly (3.32 / 3.53). This mode is for UI review/demoing only — data
isn't persisted and the real auth/permissions system isn't exercised. Leave it unset (or
`false`) for real use.

## Project structure

- `supabase/migrations/` — schema, RLS policies, triggers (display IDs, auto profile
  creation on signup), doc links, and the OKR tables.
- `src/lib/schema.ts` — form field definitions and role permissions per record type.
- `src/lib/compute.ts` — scorecard, portfolio summary, and monthly report slide formulas.
- `src/lib/okr.ts` — OKR grid building and the weighted Total-score formula (verified
  against the source report's own numbers; see the comment at `computeTotalForMonth`).
- `src/lib/pptxExport.ts` — renders the Monthly Report's slide model to a real, downloadable
  `.pptx` file client-side (via `pptxgenjs`), from the same slide data the in-app preview uses.
- `src/hooks/useDashboardData.ts` / `useOkrData.ts` — data layers for the core records and
  for Objectives/Key Results/monthly entries respectively (RLS scopes rows per user).
- `src/tabs/` — Overview (scorecard + OKR summary card), OKR (objectives/key results/monthly
  scorecard grid, internal-only), generic data tab (table + add/edit modal), Monthly Report
  (slide deck + `.pptx` download), Users (internal-only role/supplier assignment).
- `src/components/ui/` — shadcn/ui primitives (button, dialog, select, table, etc.).
- `src/mock/` — local sample-data mode for UI preview, see above.

## Known gaps vs. the full spec

- APQP Parts' "supplier can edit status/notes only" restriction (from the handoff's
  permissions table) is enforced by only showing editable fields the UI allows in the form;
  RLS enforces row-level access but not column-level restriction within a row update.
- Document links are a URL field (paste a link to wherever the file already lives), not a
  file upload — no Supabase Storage integration.
