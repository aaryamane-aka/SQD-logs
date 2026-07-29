import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, Supplier } from '../lib/types';

interface Props {
  suppliers: Supplier[];
}

export function UsersTab({ suppliers }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('profiles').select('*').order('email');
    if (error) setError(error.message);
    setProfiles((data as Profile[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setRole(id: string, user_role: string) {
    setSavingId(id);
    const { error } = await supabase.from('profiles').update({ user_role, supplier_id: user_role === 'internal' ? null : undefined }).eq('id', id);
    if (error) setError(error.message);
    await load();
    setSavingId(null);
  }

  async function setSupplier(id: string, supplier_id: string) {
    setSavingId(id);
    const { error } = await supabase.from('profiles').update({ supplier_id: supplier_id || null }).eq('id', id);
    if (error) setError(error.message);
    await load();
    setSavingId(null);
  }

  return (
    <div>
      <div className="main-header">
        <div className="main-title">Users</div>
      </div>
      <div className="notice notice-info">
        Assign each signed-up account an Internal SQD or Supplier role. Supplier accounts also need binding to their company record before they can see any data.
      </div>
      {error && <div className="login-error">{error}</div>}
      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : profiles.length === 0 ? (
        <div className="empty-state">No accounts have signed up yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id}>
                  <td>{p.email}</td>
                  <td>
                    <select value={p.user_role} disabled={savingId === p.id} onChange={(e) => setRole(p.id, e.target.value)}>
                      <option value="supplier">Supplier</option>
                      <option value="internal">Internal</option>
                    </select>
                  </td>
                  <td>
                    {p.user_role === 'internal' ? (
                      <span style={{ color: 'var(--text-secondary)' }}>—</span>
                    ) : (
                      <select value={p.supplier_id || ''} disabled={savingId === p.id} onChange={(e) => setSupplier(p.id, e.target.value)}>
                        <option value="">Unassigned</option>
                        {suppliers.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
