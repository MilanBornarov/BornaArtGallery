import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiLogin, apiLogout, apiRefreshToken, apiRegister, setAccessToken } from '../services/api';

interface AuthUser {
  email: string;
  role: 'USER' | 'ADMIN';
  userId: number;
}

interface AuthContextType {
  user: AuthUser | null;
  authReady: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function toUser(data: { email: string; role: 'USER' | 'ADMIN'; userId: number }) {
  return {
    email: data.email,
    role: data.role,
    userId: data.userId,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      try {
        const response = await apiRefreshToken();
        if (!active) return;
        setAccessToken(response.data.accessToken);
        setUser(toUser(response.data));
      } catch {
        if (!active) return;
        setAccessToken(null);
        setUser(null);
      } finally {
        if (active) {
          setAuthReady(true);
        }
      }
    };

    const handleAuthExpired = () => {
      setAccessToken(null);
      setUser(null);
      setAuthReady(true);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    void bootstrap();

    return () => {
      active = false;
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    setAccessToken(response.data.accessToken);
    const nextUser = toUser(response.data);
    setUser(nextUser);
    return nextUser;
  };

  const register = async (email: string, password: string) => {
    const response = await apiRegister(email, password);
    setAccessToken(response.data.accessToken);
    const nextUser = toUser(response.data);
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const value = useMemo(() => ({
    user,
    authReady,
    login,
    register,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isLoggedIn: user !== null,
  }), [user, authReady]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
