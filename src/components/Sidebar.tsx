import { TABLIST, type TabKey } from '../lib/schema';
import type { Profile, Supplier } from '../lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    tabs.splice(1, 0, { key: 'okr', label: 'OKR' });
    tabs.push({ key: 'users', label: 'Users' });
  }

  return (
    <div className="flex w-[230px] shrink-0 flex-col gap-1 bg-brand-sidebar px-4 py-6 text-[#dbe4f5]">
      <div className="mb-5 px-2 text-[15px] font-bold leading-tight text-white">
        SQD Supplier OKR
        <br />
        Dashboard
      </div>
      {tabs.map((t) => (
        <div
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={cn(
            'cursor-pointer rounded-md px-3 py-2.5 text-[13.5px] font-medium text-[#c3d0e8]',
            t.key === activeTab && 'bg-brand-sidebarActive text-white'
          )}
        >
          {t.label}
        </div>
      ))}

      <div className="mt-auto border-t border-[#26365c] pt-4">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-[#8ea3c9]">Signed in as</div>
        <div className="text-[12.5px] leading-relaxed break-words">
          {profile.email}
          <br />
          {profile.user_role === 'internal' ? 'Internal SQD' : boundSupplier ? `Supplier — ${boundSupplier.name}` : 'Supplier — unassigned'}
        </div>
        <Button
          variant="outline"
          className="mt-2.5 w-full border-[#2c4372] bg-transparent text-[#dbe4f5] hover:bg-brand-sidebarActive hover:text-white"
          onClick={onSignOut}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
