import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  register: (data: any) => Promise<any>;
  verifyEmail: (userId: string, code: string, email?: string, signupToken?: string) => Promise<void>;
  resendVerification: (userId: string, email?: string, signupToken?: string) => Promise<any>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('splitsmart_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem('splitsmart_auth_token');
      if (!storedToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await api.getCurrentUser();
      setUser(data.user);
    } catch (e) {
      console.warn('Session expired or invalid, logging out:', e);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    const data = await api.login(credentials);
    localStorage.setItem('splitsmart_auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (payload: any) => {
    return await api.register(payload);
  };

  const verifyEmail = async (userId: string, code: string, email?: string, signupToken?: string) => {
    const data = await api.verifyEmail({ userId, code, email, signupToken });
    localStorage.setItem('splitsmart_auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const resendVerification = async (userId: string, email?: string, signupToken?: string) => {
    return await api.resendVerification({ userId, email, signupToken });
  };

  const demoLogin = async () => {
    const data = await api.demoLogin();
    localStorage.setItem('splitsmart_auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('splitsmart_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyEmail,
        resendVerification,
        demoLogin,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
