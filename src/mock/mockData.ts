import type { DashboardData } from '../lib/compute';

// Sample seed data for local UI preview (VITE_MOCK_MODE=true), not used in production.
export function buildMockData(): DashboardData {
  const acme = 'sup-acme';
  const globex = 'sup-globex';
  const initech = 'sup-initech';

  return {
    suppliers: [
      { id: acme, display_id: 'SUP-001', name: 'Acme Corp', commodity: 'Stampings', category: 'Direct Material', location: 'Detroit, MI', criticality: 'A', onboard_date: '2021-03-01', sqe_owner: 'Priya N.', status: 'Active', doc_url: 'https://example.com/docs/acme-nda.pdf', created_at: '2021-03-01' },
      { id: globex, display_id: 'SUP-002', name: 'Globex Industries', commodity: 'Electronics', category: 'Direct Material', location: 'Austin, TX', criticality: 'B', onboard_date: '2022-01-15', sqe_owner: 'Sam O.', status: 'Active', doc_url: null, created_at: '2022-01-15' },
      { id: initech, display_id: 'SUP-003', name: 'Initech Plastics', commodity: 'Injection Molding', category: 'Direct Material', location: 'Reno, NV', criticality: 'C', onboard_date: '2023-06-10', sqe_owner: 'Priya N.', status: 'Probation', doc_url: null, created_at: '2023-06-10' },
    ],
    technical_reviews: [
      { id: 'tr1', display_id: 'TR-001', supplier_id: acme, review_type: 'PPAP', planned_date: '2026-05-01', actual_date: '2026-05-03', status: 'Closed', reviewer: 'Priya N.', key_findings: 'Minor dimensional drift', action_items: 'Retool fixture', target_closure: '2026-05-15', actual_closure: '2026-05-12', doc_url: 'https://example.com/docs/tr-001-report.pdf', created_at: '2026-05-01' },
      { id: 'tr2', display_id: 'TR-002', supplier_id: globex, review_type: 'Design Review', planned_date: '2026-06-01', actual_date: null, status: 'Overdue', reviewer: 'Sam O.', key_findings: '', action_items: '', target_closure: '2026-06-20', actual_closure: null, doc_url: null, created_at: '2026-06-01' },
    ],
    quality_complaints: [
      { id: 'qc1', display_id: 'QC-001', date_raised: '2026-06-05', supplier_id: acme, part_no: 'A-1029', defect_description: 'Surface scratches', qty_rcvd: 500, qty_rej: 12, severity: 'Minor', root_cause: 'Handling', corrective_action: 'Add protective film', target_close: '2026-06-20', actual_close: '2026-06-18', status: 'Closed', doc_url: 'https://example.com/docs/qc-001-8d.pdf', created_at: '2026-06-05' },
      { id: 'qc2', display_id: 'QC-002', date_raised: '2026-07-10', supplier_id: globex, part_no: 'G-552', defect_description: 'Solder bridge', qty_rcvd: 200, qty_rej: 4, severity: 'Critical', root_cause: 'Reflow profile', corrective_action: 'Adjust profile', target_close: '2026-07-25', actual_close: null, status: 'Open', doc_url: null, created_at: '2026-07-10' },
    ],
    monthly_ppm: [
      { id: 'ppm1', supplier_id: acme, month: '2026-06', qty_received: 12000, qty_rejected: 18, target_ppm: 2000, doc_url: null, created_at: '2026-06-01' },
      { id: 'ppm2', supplier_id: globex, month: '2026-06', qty_received: 8000, qty_rejected: 60, target_ppm: 3000, doc_url: null, created_at: '2026-06-01' },
      { id: 'ppm3', supplier_id: initech, month: '2026-06', qty_received: 4000, qty_rejected: 80, target_ppm: 5000, doc_url: null, created_at: '2026-06-01' },
    ],
    delivery_performance: [
      { id: 'otd1', supplier_id: acme, month: '2026-06', orders_due: 40, orders_on_time: 39, target_otd: 98, doc_url: null, created_at: '2026-06-01' },
      { id: 'otd2', supplier_id: globex, month: '2026-06', orders_due: 30, orders_on_time: 25, target_otd: 95, doc_url: null, created_at: '2026-06-01' },
      { id: 'otd3', supplier_id: initech, month: '2026-06', orders_due: 20, orders_on_time: 14, target_otd: 90, doc_url: null, created_at: '2026-06-01' },
    ],
    supplier_audits: [
      { id: 'au1', display_id: 'AU-001', supplier_id: acme, audit_type: 'System Audit (IATF 16949)', planned_date: '2026-04-01', actual_date: '2026-04-03', auditor: 'Priya N.', score: 94, major_ncs: 0, minor_ncs: 2, capa_due: '2026-05-01', capa_status: 'Closed', next_audit_due: '2027-04-01', doc_url: 'https://example.com/docs/au-001-report.pdf', created_at: '2026-04-01' },
      { id: 'au2', display_id: 'AU-002', supplier_id: initech, audit_type: 'Process Audit', planned_date: '2026-05-01', actual_date: '2026-05-02', auditor: 'Sam O.', score: 68, major_ncs: 3, minor_ncs: 5, capa_due: '2026-06-01', capa_status: 'Open', next_audit_due: '2026-11-01', doc_url: null, created_at: '2026-05-01' },
    ],
    apqp_parts: [
      { id: 'apqp1', display_id: 'APQP-001', supplier_name: 'Acme Corp', part_name: 'Bracket Assy', part_no: 'A-1029', project_name: 'Model Y Refresh', plant: 'Plant 3', kickoff_plan: '2026-01-01', kickoff_actual: '2026-01-02', off_tool_plan: '2026-03-01', off_tool_actual: '2026-03-05', ppap_plan: '2026-05-01', ppap_actual: '2026-05-03', run_at_rate_plan: '2026-06-01', run_at_rate_actual: '2026-06-01', sop_plan: '2026-07-01', sop_actual: '2026-07-01', status: 'Complete', doc_url: 'https://example.com/docs/apqp-001-checklist.pdf', created_at: '2026-01-01' },
      { id: 'apqp2', display_id: 'APQP-002', supplier_name: 'Initech Plastics', part_name: 'Housing Cover', part_no: 'I-330', project_name: 'Gen 4 Platform', plant: 'Plant 1', kickoff_plan: '2026-02-01', kickoff_actual: '2026-02-10', off_tool_plan: '2026-04-01', off_tool_actual: null, ppap_plan: '2026-06-01', ppap_actual: null, run_at_rate_plan: '2026-07-01', run_at_rate_actual: null, sop_plan: '2026-08-01', sop_actual: null, status: 'At Risk', doc_url: null, created_at: '2026-02-01' },
    ],
  };
}
