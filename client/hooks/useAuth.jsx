import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);
const storageKey = "political-soch-admin";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem(storageKey, JSON.stringify(session));
      return;
    }

    localStorage.removeItem(storageKey);
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      login: async (payload) => {
        const response = await authService.login(payload);
        setSession(response.data);
        return response;
      },
      logout: () => setSession(null),
      refreshSession: async () => {
        const response = await authService.getProfile();
        setSession((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            user: response.data
          };
        });
        return response;
      }
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

