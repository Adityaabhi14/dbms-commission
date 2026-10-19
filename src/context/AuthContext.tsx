import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, UserRole } from '../types';
import { api } from '../services/apiClient';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  loginAsClient: (memberId?: string) => Promise<void>;
  loginAsOwner: () => Promise<void>;
  loginWithCredentials: (email: string, pass: string, targetRole: 'client' | 'owner') => Promise<boolean>;
  registerClient: (name: string, email: string, phone: string, password?: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Restore authenticated session from valid JWT on mount
  useEffect(() => {
    const existingToken = localStorage.getItem('apd_token');
    if (existingToken && existingToken !== 'demo-owner-token') {
      api.auth.getMe()
        .then(res => {
          if (res.success && res.data) {
            const u = res.data;
            setUser({
              id: u.id,
              name: u.fullName || u.name,
              email: u.email,
              phone: u.phone,
              role: (u.role.toLowerCase() as UserRole) || 'client',
              memberId: u.memberId
            });
          }
        })
        .catch(() => {
          // Token expired or invalid
          api.setToken(null);
          setUser(null);
        });
    }
  }, []);

  const loginAsClient = async (memberId = 'APD-M-1001') => {
    try {
      const res = await api.auth.login({
        email: 'aarav.patel@example.com',
        password: 'password123',
        role: 'CLIENT'
      });
      if (res.success && res.data) {
        api.setToken(res.data.token);
        const u = res.data.user;
        setUser({
          id: u.id,
          name: u.fullName || u.name || 'Aarav Patel',
          email: u.email,
          phone: u.phone || '+91 98765 43210',
          role: 'client',
          memberId: u.memberId || memberId
        });
        return;
      }
    } catch {
      // Fallback in case of server restart during quick demo
    }
    setUser({
      id: 'USR-C-101',
      name: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      phone: '+91 98765 43210',
      role: 'client',
      memberId: memberId
    });
  };

  const loginAsOwner = async () => {
    try {
      const res = await api.auth.login({
        email: 'director@apdmusicclass.com',
        password: 'directorSecure2026',
        role: 'OWNER'
      });
      if (res.success && res.data) {
        api.setToken(res.data.token);
        const u = res.data.user;
        setUser({
          id: u.id,
          name: u.fullName || u.name || 'Dr. Alok Prasad',
          email: u.email,
          phone: u.phone,
          role: 'owner'
        });
        return;
      }
    } catch {
      // Fallback
    }
    setUser({
      id: 'USR-O-001',
      name: 'Dr. Alok Prasad',
      email: 'owner@apdmusicclass.com',
      role: 'owner'
    });
  };

  const loginWithCredentials = async (
    email: string,
    pass: string,
    targetRole: 'client' | 'owner'
  ): Promise<boolean> => {
    const res = await api.auth.login({
      email,
      password: pass,
      role: targetRole === 'owner' ? 'OWNER' : 'CLIENT'
    });

    if (res.success && res.data) {
      api.setToken(res.data.token);
      const u = res.data.user;
      setUser({
        id: u.id,
        name: u.fullName || u.name,
        email: u.email,
        phone: u.phone,
        role: (u.role.toLowerCase() as UserRole) || targetRole,
        memberId: u.memberId
      });
      return true;
    }
    return false;
  };

  const registerClient = async (
    name: string,
    email: string,
    phone: string,
    password = 'password123'
  ): Promise<boolean> => {
    const res = await api.auth.register({
      fullName: name,
      email,
      phone,
      password,
      confirmPassword: password
    });

    if (res.success && res.data) {
      api.setToken(res.data.token);
      const u = res.data.user;
      setUser({
        id: u.id,
        name: u.fullName || name,
        email: u.email,
        phone: u.phone || phone,
        role: 'client',
        memberId: u.memberId || 'APD-M-1099'
      });
      return true;
    }
    return false;
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await api.auth.changePassword({ currentPassword, newPassword });
    return {
      success: res.success,
      message: res.data?.message || 'Password updated successfully'
    };
  };

  const forgotPassword = async (email: string) => {
    const res = await api.auth.forgotPassword(email);
    return {
      success: res.success,
      message: res.data?.message || 'Password reset instructions have been dispatched.'
    };
  };

  const resetPassword = async (token: string, newPassword: string) => {
    const res = await api.auth.resetPassword({ token, newPassword });
    return {
      success: res.success,
      message: res.data?.message || 'Password reset successfully.'
    };
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    api.setToken(null);
    setUser(null);
  };

  const role: UserRole = user ? user.role : 'guest';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loginAsClient,
        loginAsOwner,
        loginWithCredentials,
        registerClient,
        changePassword,
        forgotPassword,
        resetPassword,
        logout
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
