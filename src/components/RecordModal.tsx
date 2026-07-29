import { useState } from 'react';
import type { FieldDef } from '../lib/schema';
import type { Supplier } from '../lib/types';

interface Props {
  title: string;
  fields: FieldDef[];
  initialValues: Record<string, unknown>;
  suppliers: Supplier[];
  onSave: (values: Record<string, unknown>) => Promise<void> | void;
  onCancel: () => void;
}

export function RecordModal({ title, fields, initialValues, suppliers, onSave, onCancel }: Props) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const clean = { ...values };
      fields.forEach((f) => {
        if (f.type === 'number') {
          clean[f.key] = clean[f.key] === '' || clean[f.key] == null ? 0 : parseFloat(String(clean[f.key]));
        }
      });
      await onSave(clean);
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">{title}</div>
        {error && <div className="login-error">{error}</div>}
        <div className="modal-grid">
          {fields.map((f) => (
            <div key={f.key} className={`field${f.type === 'textarea' ? ' span-2' : ''}`}>
              <label>{f.label}</label>
              {f.type === 'select' && (
                <select value={(values[f.key] as string) ?? ''} onChange={(e) => setField(f.key, e.target.value)}>
                  <option value="">Select…</option>
                  {(f.options || []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              )}
              {f.type === 'supplier' && (
                <select value={(values[f.key] as string) ?? ''} onChange={(e) => setField(f.key, e.target.value)}>
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
              {f.type === 'textarea' && (
                <textarea value={(values[f.key] as string) ?? ''} onChange={(e) => setField(f.key, e.target.value)} />
              )}
              {(f.type === 'text' || f.type === 'date' || f.type === 'month' || f.type === 'number') && (
                <input
                  type={f.type}
                  value={(values[f.key] as string | number) ?? ''}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
