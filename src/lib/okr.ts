import type { KeyResult, Objective, OkrMonthlyEntry } from './types';
import { fmtMonth } from './compute';

export interface OkrCell {
  actual: string | null;
  score: number | null;
}

export interface OkrGridRow {
  keyResult: KeyResult;
  cellsByMonth: Record<string, OkrCell>;
}

export interface OkrGridObjective {
  objective: Objective;
  rows: OkrGridRow[];
}

export interface OkrGrid {
  objectives: OkrGridObjective[];
  months: string[];
  totalsByMonth: Record<string, number | null>;
}

// Verified against the source OKR report's own numbers (Jan 2026: 3.32, Feb
// 2026: 3.53) — a weighted average over key results, renormalized to only
// the KRs that have a score entry for that month (so a KR with no data yet
// that month doesn't drag the total down to zero). Objective-level weight is
// a display/grouping rollup only and doesn't feed into this calculation —
// the same "renormalize over available components" pattern already used for
// the per-supplier overallScore in compute.ts's buildScorecard.
export function computeTotalForMonth(keyResults: KeyResult[], entries: OkrMonthlyEntry[], month: string): number | null {
  let weightedSum = 0;
  let weightUsed = 0;
  keyResults.forEach((kr) => {
    const entry = entries.find((e) => e.key_result_id === kr.id && e.month === month);
    if (entry && entry.score != null && kr.weight_pct != null) {
      weightedSum += kr.weight_pct * entry.score;
      weightUsed += kr.weight_pct;
    }
  });
  return weightUsed > 0 ? weightedSum / weightUsed : null;
}

export function buildOkrGrid(
  objectives: Objective[],
  keyResults: KeyResult[],
  entries: OkrMonthlyEntry[],
  extraMonths: string[] = []
): OkrGrid {
  const monthSet = new Set<string>(extraMonths);
  entries.forEach((e) => monthSet.add(e.month));
  const months = Array.from(monthSet).sort();

  const sortedObjectives = [...objectives].sort((a, b) => a.sort_order - b.sort_order);
  const grid: OkrGridObjective[] = sortedObjectives.map((objective) => {
    const krs = keyResults.filter((k) => k.objective_id === objective.id).sort((a, b) => a.sort_order - b.sort_order);
    const rows: OkrGridRow[] = krs.map((keyResult) => {
      const cellsByMonth: Record<string, OkrCell> = {};
      months.forEach((m) => {
        const entry = entries.find((e) => e.key_result_id === keyResult.id && e.month === m);
        cellsByMonth[m] = { actual: entry?.actual ?? null, score: entry?.score ?? null };
      });
      return { keyResult, cellsByMonth };
    });
    return { objective, rows };
  });

  const totalsByMonth: Record<string, number | null> = {};
  months.forEach((m) => {
    totalsByMonth[m] = computeTotalForMonth(keyResults, entries, m);
  });

  return { objectives: grid, months, totalsByMonth };
}

export function formatMonthLabel(month: string): string {
  return fmtMonth(month);
}

export function formatScore(score: number | null | undefined): string {
  return score == null ? '—' : score.toFixed(2);
}

export interface OkrSlideObjective {
  title: string;
  weightPct: number | null;
  rows: { title: string; weightPct: number | null; score: number | null }[];
}

export interface OkrSlideData {
  monthLabel: string;
  objectives: OkrSlideObjective[];
  totalScore: number | null;
}

// Builds the compact per-month OKR summary consumed by the Monthly Report's
// slide model (both the in-app preview and the .pptx export). Returns null
// when there's nothing to show for that month, so callers can skip the slide
// entirely rather than rendering an empty one.
export function buildOkrSlideData(objectives: Objective[], keyResults: KeyResult[], entries: OkrMonthlyEntry[], month: string): OkrSlideData | null {
  if (!month) return null;
  const hasAnyEntry = entries.some((e) => e.month === month);
  if (!hasAnyEntry) return null;

  const sortedObjectives = [...objectives].sort((a, b) => a.sort_order - b.sort_order);
  const slideObjectives: OkrSlideObjective[] = sortedObjectives
    .map((objective) => {
      const krs = keyResults.filter((k) => k.objective_id === objective.id).sort((a, b) => a.sort_order - b.sort_order);
      const rows = krs.map((kr) => ({
        title: kr.title,
        weightPct: kr.weight_pct,
        score: entries.find((e) => e.key_result_id === kr.id && e.month === month)?.score ?? null,
      }));
      return { title: objective.title, weightPct: objective.weight_pct, rows };
    })
    .filter((o) => o.rows.length > 0);

  return {
    monthLabel: formatMonthLabel(month),
    objectives: slideObjectives,
    totalScore: computeTotalForMonth(keyResults, entries, month),
  };
}
