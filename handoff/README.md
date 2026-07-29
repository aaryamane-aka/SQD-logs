# Handoff: SQD Supplier Dashboard

## Overview
A Supplier Quality & Development (SQD) dashboard for uploading/logging supplier quality data (master data, technical reviews, quality complaints, monthly PPM, delivery performance, supplier audits, APQP part tracking) and generating a monthly report. Two user views: **Internal SQD** (full access) and **Supplier** (self-service, scoped to their own data).

## About the Design Files
The bundled file (`Supplier Dashboard.dc.html`) is a **working HTML/JS prototype** — real interaction logic (add/edit/delete, computed scorecards, report generation) but with **no backend**: all data lives in the browser's `localStorage`, so nothing is shared across users or devices. It is a design + behavior reference, not production code to copy verbatim. The task is to **recreate this functionality in a real app with a shared backend** — most importantly:
- A database so multiple users (internal SQD staff and suppliers) read/write the same records
- Authentication/authorization so each user only sees/edits what their role allows
- The same computed logic (scorecard formulas, PPM/OTD calculations, monthly report generation), moved to a proper data layer

Use whatever stack fits your existing codebase (React + a hosted DB like Supabase/Postgres is a natural fit given the prototype's component structure). If no environment exists yet, React is recommended since the prototype's structure maps directly to React components/state.

## Fidelity
**High-fidelity for behavior, medium-fidelity for visuals.** All CRUD flows, permissions, and formulas are final/intended logic — implement them exactly. Visual styling (colors, spacing) is a reasonable enterprise-dashboard direction but not a pixel-perfect brand spec — feel free to apply your product's existing design system/components as long as the information architecture and interactions are preserved.

## Data Model
Seven record types, all linked to a `Supplier`. Recommended DB tables (one per type) with a `supplier_id` foreign key (except `suppliers` itself):

### suppliers
| field | type | notes |
|---|---|---|
| id | string (e.g. `SUP-001`) | auto-generated, sequential |
| name | text | required |
| commodity | text | |
| category | enum | Direct Material / Indirect Material / Service |
| location | text | |
| criticality | enum | A / B / C |
| onboard_date | date | |
| sqe_owner | text | internal owner name |
| status | enum | Active / Probation / Inactive |

### technical_reviews
| field | type |
|---|---|
| id | string `TR-001` |
| supplier_id | FK |
| review_type | enum: PPAP / Design Review / Process Review / New Product Intro |
| planned_date | date |
| actual_date | date |
| status | enum: Scheduled / In Progress / Closed / Overdue |
| reviewer | text |
| key_findings | text |
| action_items | text |
| target_closure | date |
| actual_closure | date |

Computed: `days_late` = if Closed, `actual_closure - target_closure`; if Overdue, `today - target_closure`; else null.

### quality_complaints (8D/CAPA log)
| field | type |
|---|---|
| id | string `QC-001` |
| date_raised | date |
| supplier_id | FK |
| part_no | text |
| defect_description | text |
| qty_rcvd, qty_rej | number |
| severity | enum: Minor / Major / Critical |
| root_cause | text |
| corrective_action | text |
| target_close, actual_close | date |
| status | enum: Open / In Progress / Closed |

Computed: `days_open` = `(actual_close ?? today) - date_raised`.

### monthly_ppm
| field | type |
|---|---|
| supplier_id | FK |
| month | `YYYY-MM` |
| qty_received, qty_rejected | number |
| target_ppm | number |

Computed: `ppm = qty_rejected / qty_received * 1e6`; `status` = `ppm <= target_ppm ? 'Within Target' : 'Exceeds Target'`; `quarter` derived from month.

### delivery_performance
| field | type |
|---|---|
| supplier_id | FK |
| month | `YYYY-MM` |
| orders_due, orders_on_time | number |
| target_otd | number (0–100 scale, e.g. 98 = 98%) |

Computed: `otd = orders_on_time / orders_due * 100`; `status` = `otd >= target_otd ? 'Meets Target' : 'Below Target'`.

### supplier_audits
| field | type |
|---|---|
| id | string `AU-001` |
| supplier_id | FK |
| audit_type | enum: System Audit (IATF 16949) / System Audit (ISO 9001) / Process Audit / Product Audit / MQS Audit |
| planned_date, actual_date | date |
| auditor | text |
| score | number 0–100 |
| major_ncs, minor_ncs | number |
| capa_due | date |
| capa_status | enum: Open / In Progress / Closed |
| next_audit_due | date |

Computed: `rating` = score≥90 A, ≥80 B, ≥70 C, else D.

### apqp_parts
| field | type |
|---|---|
| id | string `APQP-001` |
| supplier_name | **free text** (typed, not a dropdown — matched to `suppliers.name` case-insensitively for rollups; consider migrating to a real FK once supplier names are guaranteed unique) |
| part_name | text |
| part_no | text |
| project_name | text |
| plant | text (manufacturing plant) |
| kickoff_plan, kickoff_actual | date |
| off_tool_plan, off_tool_actual | date |
| ppap_plan, ppap_actual | date |
| run_at_rate_plan, run_at_rate_actual | date |
| sop_plan, sop_actual | date |
| status | enum: Not Started / On Track / At Risk / Delayed / Complete |

## Roles & Permissions
Two roles, `internal` and `supplier`. A supplier user is bound to exactly one `supplier_id` (their own company).

| Record type | Internal | Supplier: Add | Supplier: Edit | Supplier: Delete |
|---|---|---|---|---|
| suppliers | full CRUD | ✗ | ✗ | ✗ |
| technical_reviews | full CRUD | ✗ | ✓ (their rows only) | ✗ |
| quality_complaints | full CRUD | ✓ | ✓ | ✗ |
| monthly_ppm | full CRUD | ✓ | ✓ | ✗ |
| delivery_performance | full CRUD | ✓ | ✓ | ✗ |
| supplier_audits | full CRUD | ✗ | ✗ | ✗ |
| apqp_parts | full CRUD | ✗ | ✓ (status/notes) | ✗ |

Supplier users only ever see rows where `supplier_id` matches their own (for `apqp_parts`, matched by supplier name).

## Overview Scorecard (per supplier, computed)
For each supplier, aggregate across all their `monthly_ppm` / `delivery_performance` / `quality_complaints` / `supplier_audits` / `technical_reviews` / `apqp_parts` rows:

- **Avg PPM** = `sum(qty_rejected) / sum(qty_received) * 1e6` across all their PPM rows. **Target PPM** = average of their entered `target_ppm` values. Status: On Target if avg ≤ target, else Above Target.
- **Avg OTD %** = `sum(orders_on_time) / sum(orders_due) * 100`. Target OTD = average of entered targets. Status: On Target if avg ≥ target, else Below Target.
- **Open Complaints** = count where `status != 'Closed'`. **Critical Complaints** = count where `severity == 'Critical'`.
- **Audit Score** = average of `score` across their audits. **Audit Rating** = letter grade from that average.
- **Reviews On-Time %** = (closed reviews where `actual_closure <= target_closure`) / (all reviews with status Closed or Overdue).
- **APQP Status** = if any part At Risk/Delayed → "N At Risk"; else if all Complete → "All Complete"; else "`X/Y Complete`".
- **Overall Score** (weighted 0–100, renormalized over available components):
  - PPM 30%: `100 - max(0, (avgPPM - targetPPM) / targetPPM * 100)`, clamped 0–100
  - OTD 25%: `avgOTD / targetOTD * 100`, clamped 0–100
  - Complaints 15%: `100 - criticalComplaints*25 - openComplaints*10`, floor 0
  - Audit score 20%: raw average score
  - Reviews on-time 10%: raw percentage
  - **Overall Rating**: ≥90 A, ≥80 B, ≥70 C, else D
- Portfolio summary card: supplier count, count rated A, count rated D, portfolio avg PPM (mean of supplier avg PPMs), portfolio avg OTD.

## Monthly Report (generated)
User picks a `YYYY-MM` month (from months present in PPM/OTD data). Produces a slide-style deck:
1. **Title slide** — month label.
2. **Portfolio summary slide** — supplier count reporting that month, portfolio PPM/OTD for that month only (aggregated from that month's rows), complaints raised that month (by `date_raised`), critical complaint count, audits with planned/actual date in that month.
3. **Scorecard bar-chart slide** — horizontal bar per supplier of Overall Score (0–100), colored by rating letter.
4. **One slide per supplier** — that month's PPM (actual vs target bar), OTD (actual vs target bar), complaint count, audit count, current APQP summary, overall score/rating.
5. **Closing slide**.

Note in the UI: this in-app deck view is a stand-in for an exportable PowerPoint — if the real product needs an actual .pptx export, that's a separate implementation (e.g. a server-side pptx generation library) not covered by this prototype.

## Interactions & Behavior
- Left sidebar: 9 tabs (Overview, Suppliers, Technical Reviews, Quality Complaints, Monthly PPM, Delivery Performance, Supplier Audits, APQP Parts, Monthly Report) + role toggle (Internal SQD / Supplier) + supplier picker (visible only in Supplier role).
- Each data tab: table of records with Edit/Delete actions (gated by permissions above) + an "Add" button opening a modal form generated from that record type's field schema (see Data Model above — every field in each table above is a form field; selects are dropdowns, dates are date inputs, months are month inputs, free text is text/textarea).
- If Supplier role is active and no supplier is selected yet, block all tab content with a prompt to pick a supplier first.
- If no suppliers exist yet, block Add on other tabs with a "add a supplier first" notice.
- Deleting a record asks for confirmation.
- All data persists (in the prototype: localStorage under key `sqd_dashboard_v1`; in production: your database).

## Design Tokens (approximate — restyle to your product's system as needed)
- Background: `#f5f6f8`; surface/cards: `#fff`; borders: `#e2e5ea` / `#eef0f3`
- Text: `#1c2230` primary, `#6b7280` secondary
- Accent/primary action: `#2f5fb3`
- Status colors: success `#1f8a5c`, warning `#b4790a`, danger `#c23b3b`
- Sidebar: dark navy `#12203f`, active item `#1d3a66`
- Report deck slide background: `#0d1b34`
- Font: system UI sans-serif for body; monospace for numeric figures (PPM, %, scores)
- Border radius: 6–10px on cards/buttons/inputs

## Files
- `Supplier Dashboard.dc.html` — the full working prototype (open directly in a browser). Template markup + logic class are both in this one file; read the `<script type="text/x-dc" data-dc-script>` block at the bottom for the exact current formulas/permissions if anything above is ambiguous.
