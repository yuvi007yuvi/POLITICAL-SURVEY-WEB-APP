import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);
const sessionKey = "political-soch-mobile-session";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(sessionKey).then((raw) => {
      if (raw) {
        setSession(JSON.parse(raw));
      }
      setBootstrapping(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      session,
      bootstrapping,
      isAuthenticated: Boolean(session?.token),
      login: async (credentials) => {
        const nextSession = await authService.login(credentials);
        setSession(nextSession);
        await AsyncStorage.setItem(sessionKey, JSON.stringify(nextSession));
      },
      logout: async () => {
        setSession(null);
        await AsyncStorage.removeItem(sessionKey);
      }
    }),
    [bootstrapping, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

