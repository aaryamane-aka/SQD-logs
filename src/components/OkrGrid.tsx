import { Fragment, useState } from 'react';
import type { OkrGrid as OkrGridData } from '../lib/okr';
import { formatMonthLabel, formatScore } from '../lib/okr';

interface Props {
  grid: OkrGridData;
  canEdit: boolean;
  onSaveCell: (keyResultId: string, month: string, values: { actual: string | null; score: number | null }) => Promise<void>;
}

interface EditingCell {
  keyResultId: string;
  month: string;
}

export function OkrGrid({ grid, canEdit, onSaveCell }: Props) {
  const [editing, setEditing] = useState<EditingCell | null>(null);
  const [draftActual, setDraftActual] = useState('');
  const [draftScore, setDraftScore] = useState('');
  const [saving, setSaving] = useState(false);

  if (grid.months.length === 0) {
    return <div className="empty-state">No months yet — pick a month above to start entering data.</div>;
  }

  function startEdit(keyResultId: string, month: string, current: { actual: string | null; score: number | null }) {
    if (!canEdit) return;
    setEditing({ keyResultId, month });
    setDraftActual(current.actual || '');
    setDraftScore(current.score == null ? '' : String(current.score));
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    try {
      await onSaveCell(editing.keyResultId, editing.month, {
        actual: draftActual.trim() === '' ? null : draftActual,
        score: draftScore.trim() === '' ? null : parseFloat(draftScore),
      });
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="table-wrap" style={{ overflowX: 'auto' }}>
      <table style={{ minWidth: 720 }}>
        <thead>
          <tr>
            <th style={{ minWidth: 220 }}>Key Result</th>
            <th>Weight</th>
            {grid.months.map((m) => (
              <th key={m} style={{ minWidth: 140 }}>
                {formatMonthLabel(m)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.objectives.map(({ objective, rows }) => (
            <Fragment key={objective.id}>
              <tr style={{ background: 'var(--bg)' }}>
                <td colSpan={2 + grid.months.length} style={{ fontWeight: 700 }}>
                  {objective.title}
                  {objective.weight_pct != null && (
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> — {objective.weight_pct}%</span>
                  )}
                </td>
              </tr>
              {rows.map(({ keyResult, cellsByMonth }) => (
                <tr key={keyResult.id}>
                  <td title={keyResult.target_general || undefined}>{keyResult.title}</td>
                  <td className="mono">{keyResult.weight_pct != null ? `${keyResult.weight_pct}%` : '—'}</td>
                  {grid.months.map((m) => {
                    const cell = cellsByMonth[m];
                    const isEditing = editing?.keyResultId === keyResult.id && editing?.month === m;
                    if (isEditing) {
                      return (
                        <td key={m} style={{ whiteSpace: 'normal', minWidth: 180 }}>
                          <textarea
                            value={draftActual}
                            onChange={(e) => setDraftActual(e.target.value)}
                            placeholder="Actual…"
                            style={{ width: '100%', minHeight: 44, marginBottom: 4, fontSize: 12 }}
                          />
                          <input
                            type="number"
                            value={draftScore}
                            onChange={(e) => setDraftScore(e.target.value)}
                            placeholder="Score"
                            style={{ width: '100%', marginBottom: 4, fontSize: 12 }}
                          />
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button className="btn" style={{ padding: '2px 8px', fontSize: 11 }} onClick={() => setEditing(null)} disabled={saving}>
                              Cancel
                            </button>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '2px 8px', fontSize: 11 }}
                              onClick={saveEdit}
                              disabled={saving}
                            >
                              {saving ? '…' : 'Save'}
                            </button>
                          </div>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={m}
                        onClick={() => startEdit(keyResult.id, m, cell)}
                        style={{ cursor: canEdit ? 'pointer' : 'default', whiteSpace: 'normal', minWidth: 140 }}
                        title={cell.actual || undefined}
                      >
                        <div className="mono" style={{ fontWeight: 600 }}>
                          {formatScore(cell.score)}
                        </div>
                        {cell.actual && (
                          <div
                            style={{
                              fontSize: 11,
                              color: 'var(--text-secondary)',
                              maxWidth: 160,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {cell.actual}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Fragment>
          ))}
          <tr style={{ fontWeight: 700, borderTop: '2px solid var(--border)' }}>
            <td colSpan={2}>Total</td>
            {grid.months.map((m) => (
              <td key={m} className="mono">
                {formatScore(grid.totalsByMonth[m])}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
