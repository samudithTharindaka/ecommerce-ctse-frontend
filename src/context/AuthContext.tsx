import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import {
  readStoredAuth,
  setUnauthorizedHandler,
  writeStoredAuth,
  type StoredAuth,
} from "../api/client";

type AuthContextValue = {
  user: StoredAuth | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredAuth | null>(() => readStoredAuth());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    writeStoredAuth(null);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  useEffect(() => {
    setUnauthorizedHandler(() => logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = readStoredAuth();
      if (!stored?.token) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const v = await authApi.validateToken();
        if (!cancelled) {
          if (!v.valid) {
            writeStoredAuth(null);
            setUser(null);
          } else {
            setUser(stored);
          }
        }
      } catch {
        if (!cancelled) {
          writeStoredAuth(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await authApi.login({ username, password });
    const next: StoredAuth = {
      token: res.token,
      userId: res.userId,
      username: res.username,
      email: res.email,
      roles: res.roles ?? [],
    };
    writeStoredAuth(next);
    setUser(next);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const res = await authApi.register({ username, email, password });
      const next: StoredAuth = {
        token: res.token,
        userId: res.userId,
        username: res.username,
        email: res.email,
        roles: res.roles ?? [],
      };
      writeStoredAuth(next);
      setUser(next);
    },
    []
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
