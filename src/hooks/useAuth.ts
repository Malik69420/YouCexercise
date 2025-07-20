import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo mode - no user initially
      setUser(null);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // CRITICAL: Validate inputs
    if (!email || !password) {
      return { 
        data: null, 
        error: { message: 'Email and password are required' } 
      };
    }

    if (!isSupabaseConfigured) {
      // Demo mode - simulate successful login
      const mockUser = {
        id: 'demo-user',
        email: email,
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        confirmation_sent_at: new Date().toISOString(),
      } as User;
      
      setUser(mockUser);
      return { 
        data: { 
          user: mockUser,
          session: null 
        }, 
        error: null 
      };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    // CRITICAL: Validate inputs
    if (!email || !password) {
      return { 
        data: null, 
        error: { message: 'Email and password are required' } 
      };
    }

    if (password.length < 6) {
      return { 
        data: null, 
        error: { message: 'Password must be at least 6 characters long' } 
      };
    }

    if (!isSupabaseConfigured) {
      // Demo mode - simulate successful signup
      const mockUser = {
        id: 'demo-user',
        email: email,
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        confirmation_sent_at: new Date().toISOString(),
      } as User;
      
      setUser(mockUser);
      return { 
        data: { 
          user: mockUser,
          session: null 
        }, 
        error: null 
      };
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      return { error: null };
    }
    
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isConfigured: isSupabaseConfigured,
  };
};