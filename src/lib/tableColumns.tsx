import type { ReactNode } from 'react';
import type { RecordType, Supplier } from './types';
import type { DashboardData } from './compute';
import {
  enrichAudit,
  enrichComplaint,
  enrichOTD,
  enrichPPM,
  enrichTechnicalReview,
  fmtDate,
  fmtMonth,
  supplierName,
} from './compute';

const S = (v: unknown) => (v == null || v === '' ? '—' : String(v));

export interface ColumnDef {
  label: string;
  get: (row: any) => ReactNode;
}

const DOC_COLUMN: ColumnDef = {
  label: 'Document',
  get: (r) =>
    r.doc_url ? (
      <a href={r.doc_url} target="_blank" rel="noopener noreferrer">
        View
      </a>
    ) : (
      '—'
    ),
};

export function getEnrichedRows(type: RecordType, data: DashboardData, suppliers: Supplier[]): any[] {
  switch (type) {
    case 'suppliers':
      return data.suppliers;
    case 'technical_reviews':
      return data.technical_reviews.map((r) => ({ ...enrichTechnicalReview(r), supplierName: supplierName(suppliers, r.supplier_id) }));
    case 'quality_complaints':
      return data.quality_complaints.map((r) => ({ ...enrichComplaint(r), supplierName: supplierName(suppliers, r.supplier_id) }));
    case 'monthly_ppm':
      return data.monthly_ppm.map((r) => ({ ...enrichPPM(r), supplierName: supplierName(suppliers, r.supplier_id) }));
    case 'delivery_performance':
      return data.delivery_performance.map((r) => ({ ...enrichOTD(r), supplierName: supplierName(suppliers, r.supplier_id) }));
    case 'supplier_audits':
      return data.supplier_audits.map((r) => ({ ...enrichAudit(r), supplierName: supplierName(suppliers, r.supplier_id) }));
    case 'apqp_parts':
      return data.apqp_parts.map((r) => ({ ...r, supplierName: r.supplier_name || '—' }));
  }
}

export function getColumnDefs(type: RecordType): ColumnDef[] {
  const defs: Record<RecordType, ColumnDef[]> = {
    suppliers: [
      { label: 'ID', get: (r) => S(r.display_id) },
      { label: 'Name', get: (r) => S(r.name) },
      { label: 'Commodity', get: (r) => S(r.commodity) },
      { label: 'Category', get: (r) => S(r.category) },
      { label: 'Location', get: (r) => S(r.location) },
      { label: 'Criticality', get: (r) => S(r.criticality) },
      { label: 'Onboard Date', get: (r) => fmtDate(r.onboard_date) },
      { label: 'SQE Owner', get: (r) => S(r.sqe_owner) },
      { label: 'Status', get: (r) => S(r.status) },
      DOC_COLUMN,
    ],
    technical_reviews: [
      { label: 'ID', get: (r) => S(r.display_id) },
      { label: 'Supplier', get: (r) => S(r.supplierName) },
      { label: 'Type', get: (r) => S(r.review_type) },
      { label: 'Planned', get: (r) => fmtDate(r.planned_date) },
      { label: 'Actual', get: (r) => fmtDate(r.actual_date) },
      { label: 'Status', get: (r) => S(r.status) },
      { label: 'Reviewer', get: (r) => S(r.reviewer) },
      { label: 'Target Closure', get: (r) => fmtDate(r.target_closure) },
      { label: 'Actual Closure', get: (r) => fmtDate(r.actual_closure) },
      { label: 'Days Late', get: (r) => (r.daysLate == null ? '—' : r.daysLate > 0 ? `+${r.daysLate}` : String(r.daysLate)) },
      DOC_COLUMN,
    ],
    quality_complaints: [
      { label: 'ID', get: (r) => S(r.display_id) },
      { label: 'Date Raised', get: (r) => fmtDate(r.date_raised) },
      { label: 'Supplier', get: (r) => S(r.supplierName) },
      { label: 'Part No.', get: (r) => S(r.part_no) },
      { label: 'Defect', get: (r) => S(r.defect_description) },
      { label: 'Qty Rej.', get: (r) => S(r.qty_rej) },
      { label: 'Severity', get: (r) => S(r.severity) },
      { label: 'Target Close', get: (r) => fmtDate(r.target_close) },
      { label: 'Actual Close', get: (r) => fmtDate(r.actual_close) },
      { label: '8D Status', get: (r) => S(r.status) },
      { label: 'Days Open', get: (r) => S(r.daysOpen) },
      DOC_COLUMN,
    ],
    monthly_ppm: [
      { label: 'Supplier', get: (r) => S(r.supplierName) },
      { label: 'Month', get: (r) => fmtMonth(r.month) },
      { label: 'Qty Received', get: (r) => S(r.qty_received) },
      { label: 'Qty Rejected', get: (r) => S(r.qty_rejected) },
      { label: 'PPM', get: (r) => S(Math.round(r.ppm)) },
      { label: 'Target PPM', get: (r) => S(r.target_ppm) },
      { label: 'Status', get: (r) => S(r.status) },
      { label: 'Quarter', get: (r) => S(r.quarter) },
      DOC_COLUMN,
    ],
    delivery_performance: [
      { label: 'Supplier', get: (r) => S(r.supplierName) },
      { label: 'Month', get: (r) => fmtMonth(r.month) },
      { label: 'Orders Due', get: (r) => S(r.orders_due) },
      { label: 'On-Time', get: (r) => S(r.orders_on_time) },
      { label: 'OTD %', get: (r) => S(r.otd.toFixed(1)) + '%' },
      { label: 'Target OTD %', get: (r) => S(r.target_otd) + '%' },
      { label: 'Status', get: (r) => S(r.status) },
      { label: 'Quarter', get: (r) => S(r.quarter) },
      DOC_COLUMN,
    ],
    supplier_audits: [
      { label: 'ID', get: (r) => S(r.display_id) },
      { label: 'Supplier', get: (r) => S(r.supplierName) },
      { label: 'Audit Type', get: (r) => S(r.audit_type) },
      { label: 'Planned', get: (r) => fmtDate(r.planned_date) },
      { label: 'Actual', get: (r) => fmtDate(r.actual_date) },
      { label: 'Auditor', get: (r) => S(r.auditor) },
      { label: 'Score', get: (r) => S(r.score) + '%' },
      { label: 'Rating', get: (r) => S(r.rating) },
      { label: 'Major NCs', get: (r) => S(r.major_ncs) },
      { label: 'Minor NCs', get: (r) => S(r.minor_ncs) },
      { label: 'CAPA Status', get: (r) => S(r.capa_status) },
      { label: 'Next Audit Due', get: (r) => fmtDate(r.next_audit_due) },
      DOC_COLUMN,
    ],
    apqp_parts: [
      { label: 'Supplier', get: (r) => S(r.supplierName) },
      { label: 'Part Name', get: (r) => S(r.part_name) },
      { label: 'Part No.', get: (r) => S(r.part_no) },
      { label: 'Project', get: (r) => S(r.project_name) },
      { label: 'Plant', get: (r) => S(r.plant) },
      { label: 'Kickoff (P/A)', get: (r) => `${fmtDate(r.kickoff_plan)} / ${fmtDate(r.kickoff_actual)}` },
      { label: 'Off-Tool Sample (P/A)', get: (r) => `${fmtDate(r.off_tool_plan)} / ${fmtDate(r.off_tool_actual)}` },
      { label: 'PPAP (P/A)', get: (r) => `${fmtDate(r.ppap_plan)} / ${fmtDate(r.ppap_actual)}` },
      { label: 'Run at Rate (P/A)', get: (r) => `${fmtDate(r.run_at_rate_plan)} / ${fmtDate(r.run_at_rate_actual)}` },
      { label: 'SOP (P/A)', get: (r) => `${fmtDate(r.sop_plan)} / ${fmtDate(r.sop_actual)}` },
      { label: 'Status', get: (r) => S(r.status) },
      DOC_COLUMN,
    ],
  };
  return defs[type];
}
