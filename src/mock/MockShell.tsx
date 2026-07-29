import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { DATA_TAB_TYPES, type TabKey } from '../lib/schema';
import { OverviewTab } from '../tabs/OverviewTab';
import { DataTab } from '../tabs/DataTab';
import { ReportTab } from '../tabs/ReportTab';
import type { Profile, RecordType, UserRole } from '../lib/types';
import { useMockDashboardData } from './useMockDashboardData';

// Preview harness for local UI testing (VITE_MOCK_MODE=true) — lets you flip
// between Internal/Supplier views without a real Supabase login.
export function MockShell() {
  const [role, setRole] = useState<UserRole>('internal');
  const [mySupplierId, setMySupplierId] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const { data, insert, update, remove } = useMockDashboardData();

  const profile: Profile = { id: 'mock-user', email: 'preview@example.com', user_role: role, supplier_id: role === 'supplier' ? mySupplierId || null : null };
  const contentBlocked = role === 'supplier' && !mySupplierId;
  const visibleSuppliers = role === 'supplier' ? data.suppliers.filter((s) => s.id === mySupplierId) : data.suppliers;
  const myName = (visibleSuppliers[0]?.name || '').trim().toLowerCase();
  const scopedData =
    role === 'supplier'
      ? {
          ...data,
          suppliers: visibleSuppliers,
          technical_reviews: data.technical_reviews.filter((r) => r.supplier_id === mySupplierId),
          quality_complaints: data.quality_complaints.filter((r) => r.supplier_id === mySupplierId),
          monthly_ppm: data.monthly_ppm.filter((r) => r.supplier_id === mySupplierId),
          delivery_performance: data.delivery_performance.filter((r) => r.supplier_id === mySupplierId),
          supplier_audits: data.supplier_audits.filter((r) => r.supplier_id === mySupplierId),
          apqp_parts: data.apqp_parts.filter((r) => (r.supplier_name || '').trim().toLowerCase() === myName),
        }
      : data;

  return (
    <div>
      <div style={{ background: '#fff3cd', borderBottom: '1px solid #f0dcae', padding: '8px 16px', display: 'flex', gap: 12, alignItems: 'center', fontSize: 12.5 }}>
        <strong>Preview mode</strong> (VITE_MOCK_MODE) — local sample data, no Supabase.
        <label>
          Role:{' '}
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="internal">Internal</option>
            <option value="supplier">Supplier</option>
          </select>
        </label>
        {role === 'supplier' && (
          <label>
            I am:{' '}
            <select value={mySupplierId} onChange={(e) => setMySupplierId(e.target.value)}>
              <option value="">Select supplier</option>
              {data.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="app-shell">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} profile={profile} suppliers={data.suppliers} onSignOut={() => {}} />
        <div className="main">
          {contentBlocked ? (
            <div className="notice notice-info">Select which supplier you are in the top bar to see your data.</div>
          ) : activeTab === 'overview' ? (
            <OverviewTab data={scopedData} suppliers={visibleSuppliers} />
          ) : activeTab === 'monthly_report' ? (
            <ReportTab data={scopedData} suppliers={visibleSuppliers} />
          ) : activeTab === 'users' ? (
            <div className="empty-state">Users admin isn't available in preview mode.</div>
          ) : DATA_TAB_TYPES.includes(activeTab as RecordType) ? (
            <DataTab
              type={activeTab as RecordType}
              data={scopedData}
              profile={profile}
              suppliers={data.suppliers}
              onInsert={insert}
              onUpdate={update}
              onDelete={remove}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
