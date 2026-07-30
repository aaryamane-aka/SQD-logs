import { useState } from 'react';
import type { KeyResult, Objective, OkrMonthlyEntry } from '../lib/types';
import { buildMockOkrData } from './okrMockData';

let counter = 2000;
const uid = () => `mock-okr-${(counter++).toString(36)}`;

function nextDisplayId(prefix: string, list: { display_id: string }[]) {
  let max = 0;
  list.forEach((r) => {
    const m = /(\d+)$/.exec(r.display_id || '');
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

// Local in-memory stand-in for useOkrData, used only in VITE_MOCK_MODE.
export function useMockOkrData() {
  const [state, setState] = useState(() => buildMockOkrData());

  async function insertObjective(values: Record<string, unknown>) {
    setState((s) => ({
      ...s,
      objectives: [
        ...s.objectives,
        { id: uid(), display_id: nextDisplayId('OBJ', s.objectives), created_at: new Date().toISOString(), ...values } as Objective,
      ],
    }));
  }
  async function updateObjective(id: string, values: Record<string, unknown>) {
    setState((s) => ({ ...s, objectives: s.objectives.map((o) => (o.id === id ? { ...o, ...values } : o)) }));
  }
  async function removeObjective(id: string) {
    setState((s) => ({
      ...s,
      objectives: s.objectives.filter((o) => o.id !== id),
      keyResults: s.keyResults.filter((k) => k.objective_id !== id),
    }));
  }

  async function insertKeyResult(values: Record<string, unknown>) {
    setState((s) => ({
      ...s,
      keyResults: [
        ...s.keyResults,
        { id: uid(), display_id: nextDisplayId('KR', s.keyResults), created_at: new Date().toISOString(), ...values } as KeyResult,
      ],
    }));
  }
  async function updateKeyResult(id: string, values: Record<string, unknown>) {
    setState((s) => ({ ...s, keyResults: s.keyResults.map((k) => (k.id === id ? { ...k, ...values } : k)) }));
  }
  async function removeKeyResult(id: string) {
    setState((s) => ({
      ...s,
      keyResults: s.keyResults.filter((k) => k.id !== id),
      monthlyEntries: s.monthlyEntries.filter((e) => e.key_result_id !== id),
    }));
  }

  async function upsertMonthlyEntry(keyResultId: string, month: string, values: { actual: string | null; score: number | null }) {
    setState((s) => {
      const existing = s.monthlyEntries.find((e) => e.key_result_id === keyResultId && e.month === month);
      if (existing) {
        return {
          ...s,
          monthlyEntries: s.monthlyEntries.map((e) => (e === existing ? { ...e, ...values } : e)),
        };
      }
      const newEntry: OkrMonthlyEntry = { id: uid(), key_result_id: keyResultId, month, created_at: new Date().toISOString(), ...values };
      return { ...s, monthlyEntries: [...s.monthlyEntries, newEntry] };
    });
  }

  return {
    objectives: state.objectives,
    keyResults: state.keyResults,
    monthlyEntries: state.monthlyEntries,
    loading: false,
    error: null as string | null,
    refresh: async () => {},
    insertObjective,
    updateObjective,
    removeObjective,
    insertKeyResult,
    updateKeyResult,
    removeKeyResult,
    upsertMonthlyEntry,
  };
}
