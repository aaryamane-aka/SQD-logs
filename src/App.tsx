import { AuthProvider, useAuth } from './auth/AuthContext';
import { Login } from './components/Login';
import { Shell } from './Shell';
import { isSupabaseConfigured } from './lib/supabase';
import { MockShell } from './mock/MockShell';

const isMockMode = import.meta.env.VITE_MOCK_MODE === 'true';

function AppInner() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="login-wrap">
        <div style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>Loading…</div>
      </div>
    );
  }

  return session ? <Shell /> : <Login />;
}

function NotConfigured() {
  return (
    <div className="login-wrap">
      <div className="login-card" style={{ maxWidth: 480 }}>
        <div className="login-title">Supabase isn't connected yet</div>
        <div className="login-sub">
          Create a <code>.env</code> file in the <code>app</code> folder (copy <code>.env.example</code>) with your Supabase project's
          URL and anon key, run the SQL migration at <code>supabase/migrations/0001_init.sql</code> in the Supabase SQL Editor, then
          restart the dev server.
        </div>
      </div>
    </div>
  );
}

function App() {
  if (isMockMode) return <MockShell />;
  if (!isSupabaseConfigured) return <NotConfigured />;
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;
