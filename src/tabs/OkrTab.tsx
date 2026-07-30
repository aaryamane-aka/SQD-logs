import { useState } from 'react';
import { DataTable, type DataTableRow } from '../components/DataTable';
import { RecordModal } from '../components/RecordModal';
import { OkrGrid } from '../components/OkrGrid';
import { Button } from '@/components/ui/button';
import { OBJECTIVE_FIELDS, KEY_RESULT_FIELDS } from '../lib/okrSchema';
import { buildOkrGrid } from '../lib/okr';
import type { KeyResult, Objective, OkrMonthlyEntry } from '../lib/types';

interface Props {
  objectives: Objective[];
  keyResults: KeyResult[];
  monthlyEntries: OkrMonthlyEntry[];
  insertObjective: (values: Record<string, unknown>) => Promise<void>;
  updateObjective: (id: string, values: Record<string, unknown>) => Promise<void>;
  removeObjective: (id: string) => Promise<void>;
  insertKeyResult: (values: Record<string, unknown>) => Promise<void>;
  updateKeyResult: (id: string, values: Record<string, unknown>) => Promise<void>;
  removeKeyResult: (id: string) => Promise<void>;
  upsertMonthlyEntry: (keyResultId: string, month: string, values: { actual: string | null; score: number | null }) => Promise<void>;
}

type ObjModal = { mode: 'add' | 'edit'; id: string | null; values: Record<string, unknown> } | null;
type KrModal = { mode: 'add' | 'edit'; id: string | null; values: Record<string, unknown> } | null;

function defaultMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function OkrTab({
  objectives,
  keyResults,
  monthlyEntries,
  insertObjective,
  updateObjective,
  removeObjective,
  insertKeyResult,
  updateKeyResult,
  removeKeyResult,
  upsertMonthlyEntry,
}: Props) {
  const [objModal, setObjModal] = useState<ObjModal>(null);
  const [krModal, setKrModal] = useState<KrModal>(null);
  const [activeMonth, setActiveMonth] = useState(defaultMonth());

  const objectiveRows: DataTableRow[] = objectives.map((o) => ({
    id: o.id,
    cells: [o.display_id, o.title, o.weight_pct != null ? `${o.weight_pct}%` : '—'],
    canEdit: true,
    canDelete: true,
    onEdit: () =>
      setObjModal({ mode: 'edit', id: o.id, values: { title: o.title, weight_pct: o.weight_pct ?? '', sort_order: o.sort_order } }),
    onDelete: () => {
      if (window.confirm('Delete this objective? Its key results will also be deleted.')) removeObjective(o.id);
    },
  }));

  const keyResultRows: DataTableRow[] = keyResults.map((k) => {
    const objTitle = objectives.find((o) => o.id === k.objective_id)?.title || '—';
    return {
      id: k.id,
      cells: [k.display_id, objTitle, k.title, k.weight_pct != null ? `${k.weight_pct}%` : '—'],
      canEdit: true,
      canDelete: true,
      onEdit: () =>
        setKrModal({
          mode: 'edit',
          id: k.id,
          values: {
            objective_id: k.objective_id,
            title: k.title,
            weight_pct: k.weight_pct ?? '',
            target_general: k.target_general ?? '',
            target_challenge: k.target_challenge ?? '',
            sort_order: k.sort_order,
          },
        }),
      onDelete: () => {
        if (window.confirm('Delete this key result? Its monthly entries will also be deleted.')) removeKeyResult(k.id);
      },
    };
  });

  const grid = buildOkrGrid(objectives, keyResults, monthlyEntries, [activeMonth]);

  return (
    <div>
      <div className="main-header">
        <div className="main-title">OKR</div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="main-header" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Objectives</div>
          <Button onClick={() => setObjModal({ mode: 'add', id: null, values: { title: '', weight_pct: '', sort_order: objectives.length } })}>
            Add Objective
          </Button>
        </div>
        <DataTable columns={['ID', 'Title', 'Weight']} rows={objectiveRows} emptyMessage="No objectives yet." />
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="main-header" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Key Results</div>
          <Button
            onClick={() =>
              setKrModal({
                mode: 'add',
                id: null,
                values: { objective_id: '', title: '', weight_pct: '', target_general: '', target_challenge: '', sort_order: keyResults.length },
              })
            }
            disabled={objectives.length === 0}
          >
            Add Key Result
          </Button>
        </div>
        {objectives.length === 0 && <div className="notice notice-warning">Add at least one objective before adding key results.</div>}
        <DataTable columns={['ID', 'Objective', 'Title', 'Weight']} rows={keyResultRows} emptyMessage="No key results yet." />
      </div>

      <div>
        <div className="main-header" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Monthly Scorecard</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Show/add month</label>
            <input type="month" value={activeMonth} onChange={(e) => setActiveMonth(e.target.value)} />
          </div>
        </div>
        <OkrGrid grid={grid} canEdit={keyResults.length > 0} onSaveCell={upsertMonthlyEntry} />
      </div>

      {objModal && (
        <RecordModal
          title={(objModal.mode === 'add' ? 'Add ' : 'Edit ') + 'Objective'}
          fields={OBJECTIVE_FIELDS}
          initialValues={objModal.values}
          suppliers={[]}
          onSave={async (values) => {
            if (objModal.mode === 'add') await insertObjective(values);
            else await updateObjective(objModal.id as string, values);
            setObjModal(null);
          }}
          onCancel={() => setObjModal(null)}
        />
      )}

      {krModal && (
        <RecordModal
          title={(krModal.mode === 'add' ? 'Add ' : 'Edit ') + 'Key Result'}
          fields={KEY_RESULT_FIELDS}
          initialValues={krModal.values}
          suppliers={[]}
          objectives={objectives.map((o) => ({ id: o.id, title: o.title }))}
          onSave={async (values) => {
            if (krModal.mode === 'add') await insertKeyResult(values);
            else await updateKeyResult(krModal.id as string, values);
            setKrModal(null);
          }}
          onCancel={() => setKrModal(null)}
        />
      )}
    </div>
  );
}
