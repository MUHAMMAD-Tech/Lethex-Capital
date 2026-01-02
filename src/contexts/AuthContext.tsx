// src/contexts/AuthContext.tsx - YANGILANG
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@/types/types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  // Agar role bo'lmasa, default qiymat berish
  if (data && !data.role) {
    data.role = 'user';
  }
  
  return data;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileRole: (userId: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  // Yangi funksiya: Profile role ni yangilash
  const updateProfileRole = async (userId: string, role: UserRole) => {
    try {
      console.log(`Profile role yangilanmoqda: ${userId} -> ${role}`);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (error) {
        console.error('Role yangilash xatosi:', error);
        throw error;
      }
      
      console.log(`Role muvaffaqiyatli yangilandi: ${userId} -> ${role}`);
      
      // Profile ni yangilash
      await refreshProfile();
      
      return;
    } catch (error) {
      console.error('Role yangilash xatosi:', error);
      throw error;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      }
      setLoading(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const email = `${username}@miaoda.com`;
      console.log(`SignIn urinilmoqda: ${email}`);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('SignIn xatosi:', error.message);
        throw error;
      }
      
      console.log('SignIn muvaffaqiyatli');
      return { error: null };
    } catch (error) {
      console.error('SignIn catch xatosi:', error);
      return { error: error as Error };
    }
  };

  const signUp = async (username: string, password: string) => {
    try {
      const email = `${username}@miaoda.com`;
      console.log(`SignUp urinilmoqda: ${email}`);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('SignUp xatosi:', error.message);
        throw error;
      }
      
      console.log('SignUp muvaffaqiyatli');
      return { error: null };
    } catch (error) {
      console.error('SignUp catch xatosi:', error);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    console.log('SignOut bajarilmoqda');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    console.log('SignOut muvaffaqiyatli');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      refreshProfile,
      updateProfileRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}