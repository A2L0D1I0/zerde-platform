import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { api } from '@/api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  register: (data: Partial<User> & { password?: string; org_token?: string; bio?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('zerde_token') || null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zerde_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('zerde_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.role || 'student';
      } catch {
        return 'student';
      }
    }
    return 'student';
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return !!localStorage.getItem('zerde_token');
  });

  // Sync token & user to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('zerde_token', token);
    } else {
      localStorage.removeItem('zerde_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('zerde_user', JSON.stringify(user));
      localStorage.setItem('zerde_role', user.role);
      setRole(user.role);
    } else {
      localStorage.removeItem('zerde_user');
      localStorage.removeItem('zerde_role');
    }
  }, [user]);

  // Live session verification with backend database on mount
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('zerde_token');
      if (!savedToken) {
        setIsLoading(false);
        setUser(null);
        setToken(null);
        return;
      }

      try {
        const response: any = await api.get('/auth/me');
        if (response?.user) {
          setUser(response.user);
          setRole(response.user.role || 'student');
        } else {
          logout();
        }
      } catch (err: any) {
        console.warn('[Auth] Session invalid or user deleted from DB. Logging out.');
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  // Handle unauthorized 401 events
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('zerde:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('zerde:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password = '', targetRole: UserRole = 'student') => {
    try {
      const response: any = await api.post('/auth/login', { email, password, role: targetRole });
      if (response?.token && response?.user) {
        setToken(response.token);
        setUser(response.user);
        // Strictly determine role from backend response (Zero-Fake)
        setRole(response.user.role || 'student');
        return;
      }
      throw new Error('Invalid login response from server');
    } catch (apiError: any) {
      console.warn('[Auth] Login failed:', apiError);
      throw apiError;
    }
  };

  const register = async (userData: Partial<User> & { password?: string; org_token?: string; bio?: string }) => {
    try {
      const response: any = await api.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        role: userData.role,
        bio: userData.bio,
        org_token: userData.org_token,
        grade: userData.grade,
        school: userData.school,
        language: (userData.language || 'kz').toLowerCase(),
        theme: userData.theme || 'dark',
      });
      if (response?.token && response?.user) {
        setToken(response.token);
        setUser(response.user);
        setRole(response.user.role || 'student');
        return;
      }
      throw new Error('Registration failed');
    } catch (apiError: any) {
      console.warn('[Auth] API register error:', apiError);
      throw apiError;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole('student');
    try {
      localStorage.clear();
    } catch (e) {
      // ignore
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
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
