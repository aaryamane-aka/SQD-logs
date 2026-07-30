import type { KeyResult, Objective, OkrMonthlyEntry } from '../lib/types';

// Seeded directly from the source OKR report's real Jan/Feb 2026 numbers
// (weights + scores), so mock mode doubles as a live check that the Total
// row matches the report's own values (Jan 3.32, Feb 3.53) — not just the
// hand computation done when the formula was verified.
export function buildMockOkrData(): { objectives: Objective[]; keyResults: KeyResult[]; monthlyEntries: OkrMonthlyEntry[] } {
  const obj1 = 'obj-1';
  const obj2 = 'obj-2';
  const obj3 = 'obj-3';
  const obj4 = 'obj-4';
  const obj5 = 'obj-5';

  const objectives: Objective[] = [
    { id: obj1, display_id: 'OBJ-001', title: 'Supplier Mass Production Quality', weight_pct: 35, sort_order: 0, created_at: '2026-01-01' },
    { id: obj2, display_id: 'OBJ-002', title: 'Quality Support for New Procurement Items', weight_pct: 60, sort_order: 1, created_at: '2026-01-01' },
    { id: obj3, display_id: 'OBJ-003', title: 'Personnel Reserves and Efficiency Enhancement', weight_pct: 4, sort_order: 2, created_at: '2026-01-01' },
    { id: obj4, display_id: 'OBJ-004', title: 'EOS', weight_pct: 1, sort_order: 3, created_at: '2026-01-01' },
    { id: obj5, display_id: 'OBJ-005', title: 'AI Assistant Adoption', weight_pct: null, sort_order: 4, created_at: '2026-01-01' },
  ];

  const kr = (id: string, objective_id: string, title: string, weight_pct: number, sort_order: number, extra?: Partial<KeyResult>): KeyResult => ({
    id,
    display_id: `KR-${String(sort_order + 1).padStart(3, '0')}`,
    objective_id,
    title,
    weight_pct,
    target_general: null,
    target_challenge: null,
    sort_order,
    created_at: '2026-01-01',
    ...extra,
  });

  const keyResults: KeyResult[] = [
    kr('kr1', obj1, 'Zero km / 3mis deduction supplier-related issues', 5, 0, {
      target_general: 'Impact on OEM performance, Zero km, 3mis deduction: 0 supplier-related issues',
    }),
    kr('kr2', obj1, 'Supplier incident count reduction', 10, 1, {
      target_general: 'Supplier incident count reduction by 8% vs 2025 baseline (35→32)',
      target_challenge: 'DMN reduction by 15% vs 2025 (35→30)',
    }),
    kr('kr3', obj1, 'Yearly audit completion (VDA, CQI, new supplier assessment)', 5, 2, {
      target_general: '100% completion on the yearly audit, VDA, CQI, new supplier assessment',
      target_challenge: '20% of audit completed ahead of time',
    }),
    kr('kr4', obj1, 'Reduce Supplier PPM', 5, 3, {
      target_general: 'Reduce Supplier PPM 8% compared to 2025',
      target_challenge: 'Improve PPM performance by 15% compared to 2025',
    }),
    kr('kr5', obj1, 'Mass appearance / batch quality issue rate', 10, 4, {
      target_general: 'Mass appearance quality issue (3pcs)/batch quality issue (5pcs): 1-2 times',
      target_challenge: 'Mass appearance/batch quality issue: 0 times',
    }),
    kr('kr6', obj2, 'New Product part Delivery Qualification Rate', 10, 5, {
      target_general: 'New Product part Delivery Qualification Rate: 99%',
      target_challenge: 'New Product part Delivery Qualification Rate: 99.3%',
    }),
    kr('kr7', obj2, 'New supplier sourcing and APQP activities', 15, 6, {
      target_general: 'New supplier sourcing and APQP activities 100% achieved',
      target_challenge: '20% of APQP activities completed ahead of time',
    }),
    kr('kr8', obj2, 'New Product part Delivery On-Time Rate', 10, 7, {
      target_general: 'New Product part Delivery On-Time Rate: 90%',
      target_challenge: 'New Product part Delivery On-Time Rate: 95%',
    }),
    kr('kr9', obj2, 'FTQ - First time PPAP approval', 5, 8, {
      target_general: 'FTQ - First time PPAP approval > 90%',
      target_challenge: 'FTQ - First time PPAP approval > 95%',
    }),
    kr('kr10', obj2, 'Run @ Rate on time & safe launch criteria', 10, 9, {
      target_general: 'Meet Run @ Rate on time & fulfill safe launch criteria',
      target_challenge: 'On time Run @ rate & zero issues in safe launch period',
    }),
    kr('kr11', obj2, 'Suppliers implementing MQS', 10, 10, {
      target_general: 'Number of suppliers implementing MQS: 5',
      target_challenge: 'Number of suppliers implementing MQS: 7',
    }),
    kr('kr12', obj3, 'Successor mechanism / backup capacity', 3, 11, {
      target_general: 'Implement successor mechanism, backup capacity ≥1',
      target_challenge: 'Backup capacity ≥1.5, quarterly development plan updates',
    }),
    kr('kr13', obj4, 'MPJ EOS average score', 1, 12, {
      target_general: 'MPJ EOS average score 9.0',
      target_challenge: 'MPJ EOS average score 9.5',
    }),
    kr('kr14', obj5, 'AI assistant work', 1, 13, {
      target_general: 'AI assistant work 1x6=6 (1 task/person)',
      target_challenge: 'AI assistant work 2x6=12 (2 tasks/person)',
    }),
  ];

  const entry = (id: string, key_result_id: string, month: string, score: number, actual: string): OkrMonthlyEntry => ({
    id,
    key_result_id,
    month,
    actual,
    score,
    created_at: `${month}-01`,
  });

  const monthlyEntries: OkrMonthlyEntry[] = [
    entry('e1', 'kr1', '2026-01', 4, '0 supplier-related issues'),
    entry('e2', 'kr2', '2026-01', 3, '3 DMNs against target of 3'),
    entry('e3', 'kr3', '2026-01', 3, '100% completion, 1 VDA6.3 + 1 CQI-9 + 1 PCPA'),
    entry('e5', 'kr5', '2026-01', 4, '0, no issue in meeting 3pcs/batch'),
    entry('e6', 'kr6', '2026-01', 4, '100%, 8 PPAP reports OK at Muncie for metallurgy'),
    entry('e7', 'kr7', '2026-01', 3, 'New sourcing activities with supplier SFL, Shanker, GNA, Highway, Rolex ongoing'),
    entry('e8', 'kr8', '2026-01', 4, '8 PPAP + 2 OTS submitted on time, 100% on-time record'),
    entry('e9', 'kr9', '2026-01', 4, '8 PPAP under approval from Muncie (interim approved thru email)'),
    entry('e10', 'kr10', '2026-01', 2, 'No run @ rate in Jan 26, 3 parts successful & 1 part failed in safe launch'),
    entry('e11', 'kr11', '2026-01', 3, '6 suppliers implemented, GNA & Highway Pune kicked off for MQS'),
    entry('e12', 'kr12', '2026-01', 3, 'Available (Amit Mane)'),
    entry('e13', 'kr13', '2026-01', 3, 'Not available'),

    entry('f1', 'kr1', '2026-02', 4, '0 supplier-related issues'),
    entry('f2', 'kr2', '2026-02', 3, '2 DMNs against target of 3'),
    entry('f3', 'kr3', '2026-02', 3, '100% completion, 2 CQI-9 + 3 PCPA + 1 PSA'),
    entry('f5', 'kr5', '2026-02', 4, 'No issues in Feb 2026'),
    entry('f6', 'kr6', '2026-02', 4, '100%, 04 parts on time'),
    entry('f7', 'kr7', '2026-02', 3, 'No run @ rate in Feb 26, new sourcing -08'),
    entry('f8', 'kr8', '2026-02', 4, '04 PPAP submitted on time with 100% on-time record'),
    entry('f9', 'kr9', '2026-02', 4, '4 parts interim approved for run rate'),
    entry('f10', 'kr10', '2026-02', 4, 'No run @ rate & no safe launch in Feb 2026'),
    entry('f11', 'kr11', '2026-02', 3, '6 suppliers implemented, GNA & Highway Pune kicked off for MQS'),
    entry('f12', 'kr12', '2026-02', 3, 'Available (Amit Mane)'),
    entry('f13', 'kr13', '2026-02', 3, 'Not available'),
  ];

  return { objectives, keyResults, monthlyEntries };
}
