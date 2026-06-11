import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, User, AuthResponse } from '../api/auth';
import { setTokens, setOnUnauthorized } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; first_name: string; last_name: string; role?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleAuthSuccess = useCallback((data: AuthResponse) => {
    setUser(data.user);
    setTokens(data.accessToken, data.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // ignore
    }
    setUser(null);
    setTokens(null, null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      logout();
    });
  }, [logout]);

  useEffect(() => {
    const restoreSession = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.refresh(refreshToken);
        if (res.success && res.data) {
          handleAuthSuccess(res.data);
        } else {
          setTokens(null, null);
        }
      } catch {
        setTokens(null, null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, [handleAuthSuccess]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Login failed');
    }
    handleAuthSuccess(res.data);
  }, [handleAuthSuccess]);

  const register = useCallback(async (data: { email: string; password: string; first_name: string; last_name: string; role?: string }) => {
    const res = await authApi.register(data);
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Registration failed');
    }
    handleAuthSuccess(res.data);
  }, [handleAuthSuccess]);

  const isAdmin = user?.role === 'admin';
  const hasRole = useCallback((...roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
