import { useState } from 'react';
import { useAuth } from './auth/AuthContext';
import { Sidebar } from './components/Sidebar';
import { useDashboardData } from './hooks/useDashboardData';
import { useOkrData } from './hooks/useOkrData';
import type { TabKey } from './lib/schema';
import { DATA_TAB_TYPES } from './lib/schema';
import { OverviewTab } from './tabs/OverviewTab';
import { DataTab } from './tabs/DataTab';
import { ReportTab } from './tabs/ReportTab';
import { UsersTab } from './tabs/UsersTab';
import { OkrTab } from './tabs/OkrTab';
import { computeTotalForMonth } from './lib/okr';
import type { RecordType } from './lib/types';

export function Shell() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const { data, loading, error, insert, update, remove } = useDashboardData();
  const okr = useOkrData();

  if (!profile) {
    return (
      <div className="app-shell">
        <div className="main">
          <div className="empty-state">Loading your account…</div>
        </div>
      </div>
    );
  }

  const contentBlocked = profile.user_role === 'supplier' && !profile.supplier_id;

  const okrMonths = Array.from(new Set(okr.monthlyEntries.map((e) => e.month))).sort();
  const latestOkrMonth = okrMonths[okrMonths.length - 1] || null;
  const okrSummary = latestOkrMonth
    ? { month: latestOkrMonth, score: computeTotalForMonth(okr.keyResults, okr.monthlyEntries, latestOkrMonth) }
    : null;

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} profile={profile} suppliers={data.suppliers} onSignOut={signOut} />
      <div className="main">
        {error && <div className="notice notice-warning">{error}</div>}

        {contentBlocked ? (
          <div className="notice notice-info">
            Your account isn't linked to a supplier yet. Ask your internal SQD contact to assign you to a supplier record in the Users tab.{' '}
            <button className="btn-link" onClick={() => refreshProfile()}>
              I've been assigned — refresh
            </button>
          </div>
        ) : loading ? (
          <div className="empty-state">Loading dashboard data…</div>
        ) : activeTab === 'overview' ? (
          <OverviewTab
            data={data}
            suppliers={data.suppliers}
            isInternal={profile.user_role === 'internal'}
            okrSummary={okrSummary}
            onViewOkr={() => setActiveTab('okr')}
          />
        ) : activeTab === 'monthly_report' ? (
          <ReportTab
            data={data}
            suppliers={data.suppliers}
            okrObjectives={profile.user_role === 'internal' ? okr.objectives : undefined}
            okrKeyResults={profile.user_role === 'internal' ? okr.keyResults : undefined}
            okrMonthlyEntries={profile.user_role === 'internal' ? okr.monthlyEntries : undefined}
          />
        ) : activeTab === 'okr' ? (
          profile.user_role === 'internal' ? (
            <OkrTab
              objectives={okr.objectives}
              keyResults={okr.keyResults}
              monthlyEntries={okr.monthlyEntries}
              insertObjective={okr.insertObjective}
              updateObjective={okr.updateObjective}
              removeObjective={okr.removeObjective}
              insertKeyResult={okr.insertKeyResult}
              updateKeyResult={okr.updateKeyResult}
              removeKeyResult={okr.removeKeyResult}
              upsertMonthlyEntry={okr.upsertMonthlyEntry}
            />
          ) : null
        ) : activeTab === 'users' ? (
          profile.user_role === 'internal' ? (
            <UsersTab suppliers={data.suppliers} />
          ) : null
        ) : DATA_TAB_TYPES.includes(activeTab as RecordType) ? (
          <DataTab
            type={activeTab as RecordType}
            data={data}
            profile={profile}
            suppliers={data.suppliers}
            onInsert={insert}
            onUpdate={update}
            onDelete={remove}
          />
        ) : null}
      </div>
    </div>
  );
}
