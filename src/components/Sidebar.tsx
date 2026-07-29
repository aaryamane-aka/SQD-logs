import { TABLIST, type TabKey } from '../lib/schema';
import type { Profile, Supplier } from '../lib/types';

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  profile: Profile;
  suppliers: Supplier[];
  onSignOut: () => void;
}

export function Sidebar({ activeTab, onTabChange, profile, suppliers, onSignOut }: Props) {
  const boundSupplier = profile.supplier_id ? suppliers.find((s) => s.id === profile.supplier_id) : null;

  const tabs = [...TABLIST];
  if (profile.user_role === 'internal') {
    tabs.push({ key: 'users', label: 'Users' });
  }

  return (
    <div className="sidebar">
      <div className="sidebar-title">SQD Supplier
        <br />
        Dashboard
      </div>
      {tabs.map((t) => (
        <div
          key={t.key}
          className={`sidebar-tab${t.key === activeTab ? ' active' : ''}`}
          onClick={() => onTabChange(t.key)}
        >
          {t.label}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="sidebar-label">Signed in as</div>
        <div className="sidebar-user">
          {profile.email}
          <br />
          {profile.user_role === 'internal' ? 'Internal SQD' : boundSupplier ? `Supplier — ${boundSupplier.name}` : 'Supplier — unassigned'}
        </div>
        <button className="sidebar-signout" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
}
