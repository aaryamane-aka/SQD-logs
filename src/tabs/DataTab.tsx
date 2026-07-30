import { useState } from 'react';
import { DataTable, type DataTableRow } from '../components/DataTable';
import { RecordModal } from '../components/RecordModal';
import { Button } from '@/components/ui/button';
import { ROLE_PERMS, SCHEMAS, SUPPLIER_EDITABLE_FIELDS } from '../lib/schema';
import { getColumnDefs, getEnrichedRows } from '../lib/tableColumns';
import type { DashboardData } from '../lib/compute';
import type { Profile, RecordType, Supplier } from '../lib/types';

interface Props {
  type: RecordType;
  data: DashboardData;
  profile: Profile;
  suppliers: Supplier[];
  onInsert: (type: RecordType, values: Record<string, unknown>) => Promise<void>;
  onUpdate: (type: RecordType, id: string, values: Record<string, unknown>) => Promise<void>;
  onDelete: (type: RecordType, id: string) => Promise<void>;
}

type ModalState = { mode: 'add' | 'edit'; id: string | null; values: Record<string, unknown> } | null;

export function DataTab({ type, data, profile, suppliers, onInsert, onUpdate, onDelete }: Props) {
  const [modal, setModal] = useState<ModalState>(null);
  const schema = SCHEMAS[type];
  const isInternal = profile.user_role === 'internal';
  const perms = ROLE_PERMS[type];
  const canAdd = isInternal || perms.add;
  const canEdit = isInternal || perms.edit;
  const canDelete = isInternal || perms.del;
  const needsSuppliersFirst = type !== 'suppliers' && suppliers.length === 0;

  const enriched = getEnrichedRows(type, data, suppliers);
  const columns = getColumnDefs(type);

  function defaultValues(): Record<string, unknown> {
    const v: Record<string, unknown> = {};
    schema.fields.forEach((f) => {
      v[f.key] = '';
    });
    if (!isInternal) {
      if (type === 'apqp_parts' && 'supplier_name' in v) {
        const mine = suppliers.find((s) => s.id === profile.supplier_id);
        v.supplier_name = mine ? mine.name : '';
      } else if ('supplier_id' in v) {
        v.supplier_id = profile.supplier_id || '';
      }
    }
    return v;
  }

  function openAdd() {
    setModal({ mode: 'add', id: null, values: defaultValues() });
  }

  function openEdit(id: string) {
    const raw = (data[type] as any[]).find((r) => r.id === id);
    if (!raw) return;
    const values: Record<string, unknown> = {};
    schema.fields.forEach((f) => {
      values[f.key] = raw[f.key] ?? '';
    });
    setModal({ mode: 'edit', id, values });
  }

  async function handleSave(values: Record<string, unknown>) {
    if (!modal) return;
    if (modal.mode === 'add') await onInsert(type, values);
    else await onUpdate(type, modal.id as string, values);
    setModal(null);
  }

  function modalFields(mode: 'add' | 'edit') {
    const restricted = SUPPLIER_EDITABLE_FIELDS[type];
    if (mode === 'edit' && !isInternal && restricted) {
      return schema.fields.filter((f) => restricted.includes(f.key));
    }
    return schema.fields;
  }

  function handleDelete(id: string) {
    if (typeof window !== 'undefined' && window.confirm && !window.confirm('Delete this record?')) return;
    onDelete(type, id);
  }

  const rows: DataTableRow[] = enriched.map((r) => ({
    id: r.id,
    cells: columns.map((c) => c.get(r)),
    canEdit,
    canDelete,
    onEdit: () => openEdit(r.id),
    onDelete: () => handleDelete(r.id),
  }));

  return (
    <div>
      <div className="main-header">
        <div className="main-title">{SCHEMAS_LABEL(type)}</div>
        {canAdd && !needsSuppliersFirst && <Button onClick={openAdd}>Add {schema.label}</Button>}
      </div>

      {needsSuppliersFirst && (
        <div className="notice notice-warning">Add at least one supplier in the Suppliers tab before logging data here.</div>
      )}

      <DataTable columns={columns.map((c) => c.label)} rows={rows} emptyMessage='No records yet. Click "Add" above to log the first one.' />

      {modal && (
        <RecordModal
          title={(modal.mode === 'add' ? 'Add ' : 'Edit ') + schema.label}
          fields={modalFields(modal.mode)}
          initialValues={modal.values}
          suppliers={suppliers}
          onSave={handleSave}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}

function SCHEMAS_LABEL(type: RecordType) {
  const labels: Record<RecordType, string> = {
    suppliers: 'Suppliers',
    technical_reviews: 'Technical Reviews',
    quality_complaints: 'Quality Complaints',
    monthly_ppm: 'Monthly PPM',
    delivery_performance: 'Delivery Performance',
    supplier_audits: 'Supplier Audits',
    apqp_parts: 'APQP Parts',
  };
  return labels[type];
}
