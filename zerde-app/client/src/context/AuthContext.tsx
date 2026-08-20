import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AppLanguage, AppTheme } from '@/types';
import { api } from '@/api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  register: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateUser: (data: Partial<User>) => void;
}

const mockStudentUser: User = {
  id: 'usr_student_01',
  email: 'azamat@zerde.kz',
  full_name: 'Азамат Темірханов',
  role: 'student',
  grade: '9 «А»',
  school: 'РФМШ Алматы',
  language: 'KZ',
  theme: 'dark',
  overallElo: 1420,
  streakDays: 12,
  eloRank: {
    level: 'Қыран',
    symbol: '🦅',
    minElo: 1300,
    maxElo: 1600,
  },
};

const mockTeacherUser: User = {
  id: 'usr_teacher_01',
  email: 'teacher@zerde.kz',
  full_name: 'Гульнара Сериковна Алимжанова',
  role: 'teacher',
  school: 'РФМШ Алматы',
  language: 'KZ',
  theme: 'dark',
  overallElo: 2150,
  streakDays: 42,
  eloRank: {
    level: 'Самғау',
    symbol: '🚀',
    minElo: 1600,
    maxElo: 3000,
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('zerde_token') || null;
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('zerde_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        // fallback
      }
    }
    return null;
  });

  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('zerde_role') as UserRole;
    return savedRole && ['student', 'teacher', 'admin'].includes(savedRole)
      ? savedRole
      : 'student';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);


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
    } else {
      localStorage.removeItem('zerde_user');
      localStorage.removeItem('zerde_role');
    }
  }, [user]);

  // Handle unauthorized 401 events
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('zerde:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('zerde:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, _password = 'password123', targetRole: UserRole = 'student') => {
    setIsLoading(true);
    try {
      // Attempt API call if server is available
      try {
        const response: any = await api.post('/auth/login', { email, password: _password });
        if (response?.token && response?.user) {
          setToken(response.token);
          setUser(response.user);
          setRole(response.user.role);
          setIsLoading(false);
          return;
        }
      } catch (apiError) {
        console.info('[Auth] Server offline or mock mode - using local session');
      }

      // Mock session fallback
      const chosenUser = targetRole === 'teacher' ? { ...mockTeacherUser, email } : { ...mockStudentUser, email };
      setToken('mock_jwt_session_' + Date.now());
      setUser(chosenUser);
      setRole(chosenUser.role);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password?: string; org_token?: string; bio?: string }) => {
    setIsLoading(true);
    try {
      try {
        const response: any = await api.post('/auth/register', {
          email: userData.email,
          password: userData.password || 'password123',
          full_name: userData.full_name,
          role: userData.role,
          bio: userData.bio,
          org_token: userData.org_token,
          grade: userData.grade,
          school: userData.school,
          language: (userData.language || 'kz').toLowerCase(),
          theme: userData.theme || 'dark'
        });
        if (response?.token && response?.user) {
          setToken(response.token);
          setUser(response.user);
          setRole(response.user.role);
          setIsLoading(false);
          return;
        }
      } catch (apiError: any) {
        console.warn('[Auth] API register error:', apiError);
        throw apiError;
      }
    } finally {
      setIsLoading(false);
    }
  };


  const logout = () => {
    setToken(null);
    setUser(null);
    setRole('student');
    localStorage.removeItem('zerde_token');
    localStorage.removeItem('zerde_user');
    localStorage.removeItem('zerde_role');
  };

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'teacher') {
      setUser(mockTeacherUser);
    } else {
      setUser(mockStudentUser);
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
        switchRole,
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
