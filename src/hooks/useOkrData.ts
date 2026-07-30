import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { KeyResult, Objective, OkrMonthlyEntry } from '../lib/types';

export function useOkrData() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [monthlyEntries, setMonthlyEntries] = useState<OkrMonthlyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [objRes, krRes, entryRes] = await Promise.all([
        supabase.from('objectives').select('*').order('sort_order', { ascending: true }),
        supabase.from('key_results').select('*').order('sort_order', { ascending: true }),
        supabase.from('okr_monthly_entries').select('*').order('month', { ascending: true }),
      ]);
      const firstError = objRes.error || krRes.error || entryRes.error;
      if (firstError) throw firstError;
      setObjectives((objRes.data as Objective[]) || []);
      setKeyResults((krRes.data as KeyResult[]) || []);
      setMonthlyEntries((entryRes.data as OkrMonthlyEntry[]) || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load OKR data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function insertObjective(values: Record<string, unknown>) {
    const { error } = await supabase.from('objectives').insert(values);
    if (error) throw error;
    await refresh();
  }
  async function updateObjective(id: string, values: Record<string, unknown>) {
    const { error } = await supabase.from('objectives').update(values).eq('id', id);
    if (error) throw error;
    await refresh();
  }
  async function removeObjective(id: string) {
    const { error } = await supabase.from('objectives').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  }

  async function insertKeyResult(values: Record<string, unknown>) {
    const { error } = await supabase.from('key_results').insert(values);
    if (error) throw error;
    await refresh();
  }
  async function updateKeyResult(id: string, values: Record<string, unknown>) {
    const { error } = await supabase.from('key_results').update(values).eq('id', id);
    if (error) throw error;
    await refresh();
  }
  async function removeKeyResult(id: string) {
    const { error } = await supabase.from('key_results').delete().eq('id', id);
    if (error) throw error;
    await refresh();
  }

  async function upsertMonthlyEntry(keyResultId: string, month: string, values: { actual: string | null; score: number | null }) {
    const { error } = await supabase
      .from('okr_monthly_entries')
      .upsert({ key_result_id: keyResultId, month, ...values }, { onConflict: 'key_result_id,month' });
    if (error) throw error;
    await refresh();
  }

  return {
    objectives,
    keyResults,
    monthlyEntries,
    loading,
    error,
    refresh,
    insertObjective,
    updateObjective,
    removeObjective,
    insertKeyResult,
    updateKeyResult,
    removeKeyResult,
    upsertMonthlyEntry,
  };
}
