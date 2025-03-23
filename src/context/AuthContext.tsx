
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export type UserRole = 'admin' | 'user';

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database for demo
const USERS_STORAGE_KEY = 'pact_pal_users';
const CURRENT_USER_KEY = 'pact_pal_current_user';

// Create admin user if it doesn't exist
const ensureAdminExists = () => {
  const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
  const adminExists = users.some((user: any) => user.email === 'admin@pactpal.com');
  
  if (!adminExists) {
    users.push({
      id: 'admin-1',
      email: 'admin@pactpal.com',
      password: 'admin123', // In a real app, this would be hashed
      name: 'PactPal Admin',
      role: 'admin'
    });
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    console.log('Created admin user: admin@pactpal.com / admin123');
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize users array in localStorage if it doesn't exist
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
    }
    
    // Ensure admin user exists
    ensureAdminExists();
    
    // Set up the Supabase auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session ? 'User authenticated' : 'No session');
      
      if (session) {
        // If we have a Supabase session, try to match with local user
        const localUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
        const matchedUser = localUsers.find((u: any) => u.email === session.user.email);
        
        if (matchedUser) {
          const { password: _, ...userWithoutPassword } = matchedUser;
          setUser(userWithoutPassword);
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        }
      }
    });
    
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      
      // Verify existing session with Supabase
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          console.error('Error getting session:', error);
        }
        console.log('Current Supabase session status:', data.session ? 'Active' : 'None');
      });
    }
    
    setLoading(false);
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      // First, try to authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) {
        console.error('Supabase auth error:', authError);
      } else {
        console.log('Supabase auth successful:', authData.session ? 'Session created' : 'No session');
      }
      
      // Simulate API call delay for the local auth
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      const foundUser = users.find((u: any) => 
        u.email === email && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      // Remove password before storing in state
      const { password: _, ...userWithoutPassword } = foundUser;
      
      setUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      toast.success('Login successful!');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      // First, try to sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'user'
          }
        }
      });
      
      if (authError) {
        console.error('Supabase signup error:', authError);
      } else {
        console.log('Supabase signup successful:', authData.session ? 'Session created' : 'No session');
      }
      
      // Simulate API call delay for the local auth
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const users = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
      
      // Check if user already exists
      if (users.some((u: any) => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user (all new users are regular users by default)
      const newUser = {
        id: crypto.randomUUID(),
        email,
        password, // In a real app, this would be hashed
        name,
        role: 'user' as UserRole
      };
      
      // Add to users array
      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      
      // Log in the new user
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Sign out from Supabase
    supabase.auth.signOut().then(({ error }) => {
      if (error) {
        console.error('Error signing out from Supabase:', error);
      } else {
        console.log('Signed out from Supabase successfully');
      }
    });
    
    // Clear local storage and state
    setUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    toast.info('You have been logged out');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout,
      isAuthenticated: !!user,
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
