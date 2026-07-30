import { useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export function Login() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        const err = await signIn(email, password);
        if (err) setError(err);
      } else {
        const err = await signUp(email, password);
        if (err) setError(err);
        else setInfo('Account created. If email confirmation is enabled on your Supabase project, check your inbox before signing in.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm p-9">
        <CardContent className="p-0">
          <div className="mb-1 text-xl font-bold">SQD Supplier OKR Dashboard</div>
          <div className="mb-5 text-sm text-muted-foreground">{mode === 'signin' ? 'Sign in to continue' : 'Create an account'}</div>
          {error && <div className="mb-3.5 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-[12.5px] text-destructive">{error}</div>}
          {info && <div className="mb-3.5 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-[13.5px] text-primary">{info}</div>}
          <form onSubmit={onSubmit}>
            <div className="mb-3.5 flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div className="mb-3.5 flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>
          <div className="mt-4 text-center text-[12.5px] text-muted-foreground">
            {mode === 'signin' ? (
              <>
                New here?{' '}
                <button type="button" className="font-semibold text-primary" onClick={() => setMode('signup')}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" className="font-semibold text-primary" onClick={() => setMode('signin')}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
