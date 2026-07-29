# SQD Supplier Dashboard

React + TypeScript (Vite) app backed by Supabase (Postgres + Auth), built from the
design handoff in [`handoff/`](handoff/README.md).

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com) (free tier is fine).

3. **Run the migration**: open the Supabase project's SQL Editor and run the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). This creates all
   7 data tables, the `profiles` table, and Row Level Security policies enforcing the
   permissions matrix from the handoff README.

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
project required) with a role/supplier switcher in a top bar. This is for UI
review/demoing only — data isn't persisted and the real auth/permissions system isn't
exercised. Leave it unset (or `false`) for real use.

## Project structure

- `supabase/migrations/0001_init.sql` — schema, RLS policies, triggers (display IDs, auto
  profile creation on signup).
- `src/lib/schema.ts` — form field definitions and role permissions per record type,
  mirroring the prototype's `SCHEMAS` / `ROLE_PERMS`.
- `src/lib/compute.ts` — scorecard, portfolio summary, and monthly report slide formulas,
  ported 1:1 from the prototype's logic.
- `src/hooks/useDashboardData.ts` — fetches all 7 record types (RLS scopes rows per user)
  and exposes insert/update/delete.
- `src/tabs/` — Overview (scorecard), generic data tab (table + add/edit modal), Monthly
  Report (slide deck), Users (internal-only role/supplier assignment).
- `src/mock/` — local sample-data mode for UI preview, see above.

## Known gaps vs. the full spec

- The monthly report is an in-app slide viewer, not an exportable `.pptx` — the original
  handoff calls this out as a separate follow-up (server-side PPTX generation) if needed.
- APQP Parts' "supplier can edit status/notes only" restriction (from the handoff's
  permissions table) is enforced by only showing editable fields the UI allows in the form;
  RLS enforces row-level access but not column-level restriction within a row update.
