import { create } from 'zustand';
import { supabase, getCurrentUser } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Auth functions
  loadUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  
  loadUser: async () => {
    set({ loading: true, error: null });
    
    try {
      const user = await getCurrentUser();
      set({ user, loading: false });
    } catch (error: any) {
      console.error('Error loading user:', error);
      set({ 
        error: error.message || 'Failed to load user',
        loading: false,
        user: null
      });
    }
  },
  
  signIn: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const user = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      set({ 
        user: user.data.user,
        loading: false
      });
    } catch (error: any) {
      console.error('Error signing in:', error);
      set({ 
        error: error.message || 'Failed to sign in',
        loading: false
      });
      throw error;
    }
  },
  
  signUp: async (email, password) => {
    set({ loading: true, error: null });
    
    try {
      const user = await supabase.auth.signUp({
        email,
        password
      });
      
      set({ 
        user: user.data.user,
        loading: false
      });
    } catch (error: any) {
      console.error('Error signing up:', error);
      set({ 
        error: error.message || 'Failed to sign up',
        loading: false
      });
      throw error;
    }
  },
  
  signOut: async () => {
    set({ loading: true, error: null });
    
    try {
      await supabase.auth.signOut();
      set({ 
        user: null,
        loading: false
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      set({ 
        error: error.message || 'Failed to sign out',
        loading: false
      });
      throw error;
    }
  }
}));