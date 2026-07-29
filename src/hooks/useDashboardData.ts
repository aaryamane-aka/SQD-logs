import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { DashboardData } from '../lib/compute';
import type { RecordType } from '../lib/types';
import { DATA_TAB_TYPES } from '../lib/schema';

const EMPTY: DashboardData = {
  suppliers: [],
  technical_reviews: [],
  quality_complaints: [],
  monthly_ppm: [],
  delivery_performance: [],
  supplier_audits: [],
  apqp_parts: [],
};

const ORDER_COLUMN: Record<RecordType, string> = {
  suppliers: 'created_at',
  technical_reviews: 'created_at',
  quality_complaints: 'created_at',
  monthly_ppm: 'month',
  delivery_performance: 'month',
  supplier_audits: 'created_at',
  apqp_parts: 'created_at',
};

// Central data layer: fetches all 7 record types (RLS scopes rows to the
// signed-in user automatically) and exposes typed CRUD for the active tab.
export function useDashboardData() {
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all(
        DATA_TAB_TYPES.map((type) => supabase.from(type).select('*').order(ORDER_COLUMN[type], { ascending: true }))
      );
      const firstError = results.find((r) => r.error);
      if (firstError?.error) throw firstError.error;
      const next = { ...EMPTY };
      DATA_TAB_TYPES.forEach((type, i) => {
        (next as any)[type] = results[i].data || [];
      });
      setData(next);
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function insert(type: RecordType, values: Record<string, unknown>) {
    const { error } = await supabase.from(type).insert(values);
    if (error) throw error;
    await refresh();
  }

  async function update(type: RecordType, id: string, values: Record<string, unknown>) {
    const { error } = await supabase.from(type).update(values).eq('id', id);
    if (error) throw error;
    await refresh();
  }

  async function remove(type: RecordType, id: string) {
    const { error } = await supabase.from(type).delete().eq('id', id);
    if (error) throw error;
    await refresh();
  }

  return { data, loading, error, refresh, insert, update, remove };
}
