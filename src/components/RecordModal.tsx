import { useState } from 'react';
import type { FieldDef } from '../lib/schema';
import type { Supplier } from '../lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Props {
  title: string;
  fields: FieldDef[];
  initialValues: Record<string, unknown>;
  suppliers: Supplier[];
  objectives?: { id: string; title: string }[];
  onSave: (values: Record<string, unknown>) => Promise<void> | void;
  onCancel: () => void;
}

export function RecordModal({ title, fields, initialValues, suppliers, objectives, onSave, onCancel }: Props) {
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
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {error && <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        <div className="grid grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className={`flex flex-col gap-1.5 ${f.type === 'textarea' ? 'col-span-2' : ''}`}>
              <Label>{f.label}</Label>
              {f.type === 'select' && (
                <Select value={(values[f.key] as string) || undefined} onValueChange={(v) => setField(f.key, v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {(f.options || []).map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {f.type === 'supplier' && (
                <Select value={(values[f.key] as string) || undefined} onValueChange={(v) => setField(f.key, v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {f.type === 'objective' && (
                <Select value={(values[f.key] as string) || undefined} onValueChange={(v) => setField(f.key, v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    {(objectives || []).map((o) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {f.type === 'textarea' && (
                <Textarea value={(values[f.key] as string) ?? ''} onChange={(e) => setField(f.key, e.target.value)} />
              )}
              {(f.type === 'text' || f.type === 'date' || f.type === 'month' || f.type === 'number' || f.type === 'url') && (
                <Input
                  type={f.type}
                  placeholder={f.type === 'url' ? 'https://…' : undefined}
                  value={(values[f.key] as string | number) ?? ''}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
