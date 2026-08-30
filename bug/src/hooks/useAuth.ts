import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ProfileRow } from '../types';

interface AuthState {
  user: any | null;
  profile: ProfileRow | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  // Fetch profile for current user
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as ProfileRow;
  }, []);

  // Initialize auth state
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            loading: false,
            error: null,
          });
        } else {
          setState({ user: null, profile: null, loading: false, error: null });
        }
      } catch (err: any) {
        setState({ user: null, profile: null, loading: false, error: err.message });
      }
    };

    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          setState({
            user: session.user,
            profile,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, profile: null, loading: false, error: null });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // User state stays the same, just token refreshed
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Sign up
  const signUp = async (email: string, password: string, name: string, companyName?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error: error.message };
    }

    // If company name provided, create company and link profile
    if (companyName && data.user) {
      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ name: companyName })
        .select()
        .single();

      if (!companyError && company) {
        // Update profile with company and admin role
        await supabase
          .from('profiles')
          .update({
            company_id: company.id,
            role: 'admin',
            avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          })
          .eq('id', data.user.id);
      }
    }

    setState(prev => ({ ...prev, loading: false }));
    return { error: null };
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error: error.message };
    }

    // Profile will be fetched by onAuthStateChange
    setState(prev => ({ ...prev, loading: false }));
    return { error: null };
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setState({ user: null, profile: null, loading: false, error: null });
  };

  // Reset password
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    return { error: error?.message || null };
  };

  // Update profile
  const updateProfile = async (updates: Partial<ProfileRow>) => {
    if (!state.user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', state.user.id);

    if (error) {
      return { error: error.message };
    }

    // Refresh profile
    const profile = await fetchProfile(state.user.id);
    setState(prev => ({ ...prev, profile }));
    return { error: null };
  };

  return {
    user: state.user,
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    isAdmin: state.profile?.role === 'admin',
    isManager: state.profile?.role === 'manager' || state.profile?.role === 'admin',
  };
}
