import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase/client.js';
import { traduzirErroAuth } from '../utils/authErrors.js';

const AuthContext = createContext(undefined);

async function buscarProfile(user) {
  const metadata = user.user_metadata ?? {};
  const base = {
    nome: metadata.nome ?? '',
    empresa: metadata.empresa ?? '',
    cargo: metadata.cargo ?? '',
    papel: metadata.papel || 'geral',
    ativo: true,
  };

  const { data, error } = await supabase
    .from('profiles')
    .select('nome, empresa, cargo, papel, ativo')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.warn('Não foi possível carregar o perfil da tabela "profiles" — usando os dados do cadastro.', error.message);
    return base;
  }

  return {
    nome: data?.nome || base.nome,
    empresa: data?.empresa || base.empresa,
    cargo: data?.cargo || base.cargo,
    papel: data?.papel || base.papel,
    ativo: data?.ativo ?? base.ativo,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) setProfile(await buscarProfile(session.user));
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setProfile(session?.user ? await buscarProfile(session.user) : null);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { ok: false, mensagem: traduzirErroAuth(error) } : { ok: true };
  };

  const signUp = async ({ email, password, nome, empresa, cargo, papel }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome, empresa, cargo, papel } },
    });
    if (error) return { ok: false, mensagem: traduzirErroAuth(error) };
    return { ok: true, precisaConfirmarEmail: !data.session };
  };

  const signOut = () => supabase.auth.signOut();

  const value = {
    configured: supabaseConfigured,
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user),
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
