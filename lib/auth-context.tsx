import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signInWithGoogle: async () => {
        const redirectTo = Linking.createURL('auth/callback');
        console.log('[auth] redirectTo →', redirectTo);

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error) return { error };
        if (!data?.url) return { error: new Error('No OAuth URL returned from Supabase') };
        console.log('[auth] opening OAuth URL →', data.url);

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        console.log('[auth] WebBrowser result →', JSON.stringify(result));
        if (result.type !== 'success') {
          return { error: new Error(`OAuth flow ${result.type}`) };
        }

        const { queryParams } = Linking.parse(result.url);
        const authError = queryParams?.error_description ?? queryParams?.error;
        if (typeof authError === 'string') return { error: new Error(authError) };
        const code = typeof queryParams?.code === 'string' ? queryParams.code : undefined;
        if (!code) return { error: new Error('No authorization code in redirect') };

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        return { error: exchangeError };
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
