import type { RecordType } from './types';

export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'month' | 'number' | 'supplier';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
}

export interface RecordSchema {
  label: string;
  fields: FieldDef[];
}

// Field configs mirror the prototype's SCHEMAS exactly, keyed by the Postgres
// table name and using the DB's snake_case column names directly.
export const SCHEMAS: Record<RecordType, RecordSchema> = {
  suppliers: {
    label: 'Supplier',
    fields: [
      { key: 'name', label: 'Supplier Name', type: 'text' },
      { key: 'commodity', label: 'Commodity', type: 'text' },
      { key: 'category', label: 'Category', type: 'select', options: ['Direct Material', 'Indirect Material', 'Service'] },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'criticality', label: 'Criticality', type: 'select', options: ['A', 'B', 'C'] },
      { key: 'onboard_date', label: 'Onboard Date', type: 'date' },
      { key: 'sqe_owner', label: 'SQE Owner', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Probation', 'Inactive'] },
    ],
  },
  technical_reviews: {
    label: 'Technical Review',
    fields: [
      { key: 'supplier_id', label: 'Supplier', type: 'supplier' },
      { key: 'review_type', label: 'Review Type', type: 'select', options: ['PPAP', 'Design Review', 'Process Review', 'New Product Intro'] },
      { key: 'planned_date', label: 'Planned Date', type: 'date' },
      { key: 'actual_date', label: 'Actual Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In Progress', 'Closed', 'Overdue'] },
      { key: 'reviewer', label: 'Reviewer', type: 'text' },
      { key: 'key_findings', label: 'Key Findings', type: 'textarea' },
      { key: 'action_items', label: 'Action Items', type: 'textarea' },
      { key: 'target_closure', label: 'Target Closure', type: 'date' },
      { key: 'actual_closure', label: 'Actual Closure', type: 'date' },
    ],
  },
  quality_complaints: {
    label: 'Complaint',
    fields: [
      { key: 'date_raised', label: 'Date Raised', type: 'date' },
      { key: 'supplier_id', label: 'Supplier', type: 'supplier' },
      { key: 'part_no', label: 'Part No.', type: 'text' },
      { key: 'defect_description', label: 'Defect Description', type: 'textarea' },
      { key: 'qty_rcvd', label: 'Qty Received', type: 'number' },
      { key: 'qty_rej', label: 'Qty Rejected', type: 'number' },
      { key: 'severity', label: 'Severity', type: 'select', options: ['Minor', 'Major', 'Critical'] },
      { key: 'root_cause', label: 'Root Cause', type: 'textarea' },
      { key: 'corrective_action', label: 'Corrective Action', type: 'textarea' },
      { key: 'target_close', label: 'Target Close', type: 'date' },
      { key: 'actual_close', label: 'Actual Close', type: 'date' },
      { key: 'status', label: '8D Status', type: 'select', options: ['Open', 'In Progress', 'Closed'] },
    ],
  },
  monthly_ppm: {
    label: 'PPM Entry',
    fields: [
      { key: 'supplier_id', label: 'Supplier', type: 'supplier' },
      { key: 'month', label: 'Month', type: 'month' },
      { key: 'qty_received', label: 'Qty Received', type: 'number' },
      { key: 'qty_rejected', label: 'Qty Rejected', type: 'number' },
      { key: 'target_ppm', label: 'Target PPM', type: 'number' },
    ],
  },
  delivery_performance: {
    label: 'OTD Entry',
    fields: [
      { key: 'supplier_id', label: 'Supplier', type: 'supplier' },
      { key: 'month', label: 'Month', type: 'month' },
      { key: 'orders_due', label: 'Orders Due', type: 'number' },
      { key: 'orders_on_time', label: 'Orders On-Time', type: 'number' },
      { key: 'target_otd', label: 'Target OTD %', type: 'number' },
    ],
  },
  supplier_audits: {
    label: 'Audit',
    fields: [
      { key: 'supplier_id', label: 'Supplier', type: 'supplier' },
      { key: 'audit_type', label: 'Audit Type', type: 'select', options: ['System Audit (IATF 16949)', 'System Audit (ISO 9001)', 'Process Audit', 'Product Audit', 'MQS Audit'] },
      { key: 'planned_date', label: 'Planned Date', type: 'date' },
      { key: 'actual_date', label: 'Actual Date', type: 'date' },
      { key: 'auditor', label: 'Auditor', type: 'text' },
      { key: 'score', label: 'Score (%)', type: 'number' },
      { key: 'major_ncs', label: 'Major NCs', type: 'number' },
      { key: 'minor_ncs', label: 'Minor NCs', type: 'number' },
      { key: 'capa_due', label: 'CAPA Due', type: 'date' },
      { key: 'capa_status', label: 'CAPA Status', type: 'select', options: ['Open', 'In Progress', 'Closed'] },
      { key: 'next_audit_due', label: 'Next Audit Due', type: 'date' },
    ],
  },
  apqp_parts: {
    label: 'APQP Part',
    fields: [
      { key: 'supplier_name', label: 'Supplier Name', type: 'text' },
      { key: 'part_name', label: 'Part Name', type: 'text' },
      { key: 'part_no', label: 'Part Number', type: 'text' },
      { key: 'project_name', label: 'Project Name', type: 'text' },
      { key: 'plant', label: 'Manufacturing Plant', type: 'text' },
      { key: 'kickoff_plan', label: 'Project Kickoff — Plan', type: 'date' },
      { key: 'kickoff_actual', label: 'Project Kickoff — Actual', type: 'date' },
      { key: 'off_tool_plan', label: 'Off Tool Sample — Plan', type: 'date' },
      { key: 'off_tool_actual', label: 'Off Tool Sample — Actual', type: 'date' },
      { key: 'ppap_plan', label: 'PPAP — Plan', type: 'date' },
      { key: 'ppap_actual', label: 'PPAP — Actual', type: 'date' },
      { key: 'run_at_rate_plan', label: 'Run at Rate — Plan', type: 'date' },
      { key: 'run_at_rate_actual', label: 'Run at Rate — Actual', type: 'date' },
      { key: 'sop_plan', label: 'SOP — Plan', type: 'date' },
      { key: 'sop_actual', label: 'SOP — Actual', type: 'date' },
      { key: 'status', label: 'Current Status', type: 'select', options: ['Not Started', 'On Track', 'At Risk', 'Delayed', 'Complete'] },
    ],
  },
};

export interface RolePerm {
  add: boolean;
  edit: boolean;
  del: boolean;
}

// Supplier-role permissions. Internal role always has full CRUD.
export const ROLE_PERMS: Record<RecordType, RolePerm> = {
  suppliers: { add: false, edit: false, del: false },
  technical_reviews: { add: false, edit: true, del: false },
  quality_complaints: { add: true, edit: true, del: false },
  monthly_ppm: { add: true, edit: true, del: false },
  delivery_performance: { add: true, edit: true, del: false },
  supplier_audits: { add: false, edit: false, del: false },
  apqp_parts: { add: false, edit: true, del: false },
};

// For record types where the handoff restricts suppliers to editing only
// specific fields (e.g. apqp_parts: "status/notes" only), list those field
// keys here. Absent entries mean no field-level restriction beyond the
// add/edit/delete gating in ROLE_PERMS.
export const SUPPLIER_EDITABLE_FIELDS: Partial<Record<RecordType, string[]>> = {
  apqp_parts: ['status'],
};

export const DATA_TAB_TYPES: RecordType[] = [
  'suppliers',
  'technical_reviews',
  'quality_complaints',
  'monthly_ppm',
  'delivery_performance',
  'supplier_audits',
  'apqp_parts',
];

export type TabKey = RecordType | 'overview' | 'monthly_report' | 'users';

export const TABLIST: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'technical_reviews', label: 'Technical Reviews' },
  { key: 'quality_complaints', label: 'Quality Complaints' },
  { key: 'monthly_ppm', label: 'Monthly PPM' },
  { key: 'delivery_performance', label: 'Delivery Performance' },
  { key: 'supplier_audits', label: 'Supplier Audits' },
  { key: 'apqp_parts', label: 'APQP Parts' },
  { key: 'monthly_report', label: 'Monthly Report' },
];
