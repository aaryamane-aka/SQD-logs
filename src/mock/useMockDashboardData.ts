import { useState } from 'react';
import type { DashboardData } from '../lib/compute';
import type { RecordType } from '../lib/types';
import { buildMockData } from './mockData';

const ID_PREFIX: Partial<Record<RecordType, string>> = {
  suppliers: 'SUP',
  technical_reviews: 'TR',
  quality_complaints: 'QC',
  supplier_audits: 'AU',
  apqp_parts: 'APQP',
};

let counter = 1000;
const uid = () => `mock-${(counter++).toString(36)}`;

// Local in-memory stand-in for useDashboardData, used only in VITE_MOCK_MODE
// for UI preview/testing without a live Supabase project.
export function useMockDashboardData() {
  const [data, setData] = useState<DashboardData>(() => buildMockData());

  function nextDisplayId(type: RecordType): string | undefined {
    const prefix = ID_PREFIX[type];
    if (!prefix) return undefined;
    const list = (data as any)[type] as { display_id?: string }[];
    let max = 0;
    list.forEach((r) => {
      const m = /(\d+)$/.exec(r.display_id || '');
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return `${prefix}-${String(max + 1).padStart(3, '0')}`;
  }

  async function insert(type: RecordType, values: Record<string, unknown>) {
    const record = { id: uid(), display_id: nextDisplayId(type), created_at: new Date().toISOString(), ...values };
    setData((d) => ({ ...d, [type]: [...(d as any)[type], record] }));
  }

  async function update(type: RecordType, id: string, values: Record<string, unknown>) {
    setData((d) => ({
      ...d,
      [type]: (d as any)[type].map((r: any) => (r.id === id ? { ...r, ...values } : r)),
    }));
  }

  async function remove(type: RecordType, id: string) {
    setData((d) => ({ ...d, [type]: (d as any)[type].filter((r: any) => r.id !== id) }));
  }

  return { data, loading: false, error: null as string | null, refresh: async () => {}, insert, update, remove };
}
