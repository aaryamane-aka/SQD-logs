export type UserRole = 'internal' | 'supplier';

export interface Profile {
  id: string;
  email: string;
  user_role: UserRole;
  supplier_id: string | null;
}

export interface Supplier {
  id: string;
  display_id: string;
  name: string;
  commodity: string | null;
  category: string | null;
  location: string | null;
  criticality: string | null;
  onboard_date: string | null;
  sqe_owner: string | null;
  status: string | null;
  doc_url: string | null;
  created_at: string;
}

export interface TechnicalReview {
  id: string;
  display_id: string;
  supplier_id: string;
  review_type: string | null;
  planned_date: string | null;
  actual_date: string | null;
  status: string | null;
  reviewer: string | null;
  key_findings: string | null;
  action_items: string | null;
  target_closure: string | null;
  actual_closure: string | null;
  doc_url: string | null;
  created_at: string;
}

export interface QualityComplaint {
  id: string;
  display_id: string;
  date_raised: string | null;
  supplier_id: string;
  part_no: string | null;
  defect_description: string | null;
  qty_rcvd: number;
  qty_rej: number;
  severity: string | null;
  root_cause: string | null;
  corrective_action: string | null;
  target_close: string | null;
  actual_close: string | null;
  status: string | null;
  doc_url: string | null;
  created_at: string;
}

export interface MonthlyPPM {
  id: string;
  supplier_id: string;
  month: string;
  qty_received: number;
  qty_rejected: number;
  target_ppm: number;
  doc_url: string | null;
  created_at: string;
}

export interface DeliveryPerformance {
  id: string;
  supplier_id: string;
  month: string;
  orders_due: number;
  orders_on_time: number;
  target_otd: number;
  doc_url: string | null;
  created_at: string;
}

export interface SupplierAudit {
  id: string;
  display_id: string;
  supplier_id: string;
  audit_type: string | null;
  planned_date: string | null;
  actual_date: string | null;
  auditor: string | null;
  score: number | null;
  major_ncs: number;
  minor_ncs: number;
  capa_due: string | null;
  capa_status: string | null;
  next_audit_due: string | null;
  doc_url: string | null;
  created_at: string;
}

export interface ApqpPart {
  id: string;
  display_id: string;
  supplier_name: string | null;
  part_name: string | null;
  part_no: string | null;
  project_name: string | null;
  plant: string | null;
  kickoff_plan: string | null;
  kickoff_actual: string | null;
  off_tool_plan: string | null;
  off_tool_actual: string | null;
  ppap_plan: string | null;
  ppap_actual: string | null;
  run_at_rate_plan: string | null;
  run_at_rate_actual: string | null;
  sop_plan: string | null;
  sop_actual: string | null;
  status: string | null;
  doc_url: string | null;
  created_at: string;
}

export interface Objective {
  id: string;
  display_id: string;
  title: string;
  weight_pct: number | null;
  sort_order: number;
  created_at: string;
}

export interface KeyResult {
  id: string;
  display_id: string;
  objective_id: string;
  title: string;
  weight_pct: number | null;
  target_general: string | null;
  target_challenge: string | null;
  sort_order: number;
  created_at: string;
}

export interface OkrMonthlyEntry {
  id: string;
  key_result_id: string;
  month: string;
  actual: string | null;
  score: number | null;
  created_at: string;
}

export type RecordType =
  | 'suppliers'
  | 'technical_reviews'
  | 'quality_complaints'
  | 'monthly_ppm'
  | 'delivery_performance'
  | 'supplier_audits'
  | 'apqp_parts';

export type AnyRecord =
  | Supplier
  | TechnicalReview
  | QualityComplaint
  | MonthlyPPM
  | DeliveryPerformance
  | SupplierAudit
  | ApqpPart;
