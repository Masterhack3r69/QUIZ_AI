'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIRequestError } from '@/lib/api';
import {
  setAuthToken,
  getAuthToken,
  setUser as setStoredUser,
  getUser as getStoredUser,
  clearAuth,
} from '@/lib/auth';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  verifyOTP: (email: string, code: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const storedToken = getAuthToken();
      const storedUser = getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Listen for session expiration events
  useEffect(() => {
    const handleSessionExpired = () => {
      // Clear storage
      clearAuth();
      
      // Clear state
      setToken(null);
      setUser(null);
      
      // Redirect to login with message
      router.push('/login?expired=true');
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      
      // Store token and user
      setAuthToken(response.token);
      setStoredUser(response.user);
      
      // Update state
      setToken(response.token);
      setUser(response.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  }, [router]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.register(name, email, password);
      
      // Store token and user
      setAuthToken(response.token);
      setStoredUser(response.user);
      
      // Update state
      setToken(response.token);
      setUser(response.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new Error('Registration failed. Please try again.');
    }
  }, [router]);

  const logout = useCallback(() => {
    // Clear storage
    clearAuth();
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Redirect to login
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((updatedUser: User) => {
    // Update state
    setUser(updatedUser);
    
    // Update storage
    setStoredUser(updatedUser);
  }, []);

  const verifyOTP = useCallback(async (email: string, code: string) => {
    try {
      const response = await apiClient.verifyOTP(email, code);
      
      // Store token and user
      setAuthToken(response.token);
      setStoredUser(response.user);
      
      // Update state
      setToken(response.token);
      setUser(response.user);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new Error('OTP verification failed. Please try again.');
    }
  }, []);

  const resendOTP = useCallback(async (email: string) => {
    try {
      await apiClient.resendOTP(email);
    } catch (error) {
      if (error instanceof APIRequestError) {
        throw error;
      }
      throw new Error('Failed to resend OTP. Please try again.');
    }
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateUser,
    verifyOTP,
    resendOTP,
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
