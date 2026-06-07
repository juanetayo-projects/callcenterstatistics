import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AppUser } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchAppUser(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      if (session?.user) fetchAppUser(session.user.id);
      else { setAppUser(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchAppUser(userId: string) {
    const { data } = await supabase
      .from('app_users')
      .select('*, profile:profiles(*)')
      .eq('id', userId)
      .single();
    setAppUser(data);
    setLoading(false);
  }

  const isAdmin = appUser?.profile?.perfil === 'Administrador';

  return (
    <AuthContext.Provider value={{
      session,
      user: session?.user ?? null,
      appUser,
      loading,
      isAdmin,
      signOut: async () => { await supabase.auth.signOut(); },
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
