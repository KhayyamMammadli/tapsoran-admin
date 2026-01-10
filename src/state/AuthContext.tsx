import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../types";

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

const LS_TOKEN = "tapsoran_admin_token";
const LS_USER = "tapsoran_admin_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(LS_TOKEN));
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(LS_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

if (res.data?.user?.role !== "SUPER_ADMIN") {
  throw new Error("Bu hesab SUPER_ADMIN deyil. Admin panelə giriş qadağandır.");
}

setToken(res.data.token);
setUser(res.data.user);
localStorage.setItem(LS_TOKEN, res.data.token);
localStorage.setItem(LS_USER, JSON.stringify(res.data.user));

// Set header immediately to avoid the first request after login returning 401
api.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    delete api.defaults.headers.common.Authorization;
  };

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider missing");
  return v;
}
