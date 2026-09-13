import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../lib/api";
import { getErrorMessage } from "../lib/apiClient";
import { tokenStorage } from "../lib/tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!tokenStorage.getAccess()) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.me();
        setUser(res.data);
      } catch {
        tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    tokenStorage.setTokens(res.data.access_token, res.data.refresh_token);
    const me = await authApi.me();
    setUser(me.data);
    return me.data;
  };

  const register = async (fullName, email, password) => {
    await authApi.register({ full_name: fullName, email, password });
    return login(email, password);
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { getErrorMessage };
