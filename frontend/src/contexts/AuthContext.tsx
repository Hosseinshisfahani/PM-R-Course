'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthContextType, SignupData } from '@/types';
import { authApi, csrfApi } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get CSRF token on mount
    csrfApi.getToken().catch(() => {
      // Ignore CSRF errors in development
    });

    // Check if user is authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response);
    } catch (error: any) {
      // 403 error is expected when user is not logged in - suppress console error
      if (error.status !== 403 && error.status !== 0) {
        console.error('Auth check error:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      setUser(null);
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await authApi.signup(data);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getProfile();
      setUser(response);
    } catch (error: any) {
      if (error.status !== 403) {
        console.error('Refresh user error:', error);
      }
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    signup,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
