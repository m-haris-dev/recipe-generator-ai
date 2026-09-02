import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  auth,
  getAuthErrorMessage,
  logOut,
  refreshCurrentUser,
  resendVerificationEmail,
  signInWithEmail,
  signUpWithEmail,
} from "../firebase/auth";

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isVerified: boolean;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  refreshVerification: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    try {
      await signUpWithEmail(email, password);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      return await signInWithEmail(email, password);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logOut();
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }, []);

  const resendVerification = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error("Pehle login karein.");
    }
    try {
      await resendVerificationEmail(auth.currentUser);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }, []);

  const refreshVerification = useCallback(async () => {
    if (!auth.currentUser) return false;
    try {
      const user = await refreshCurrentUser(auth.currentUser);
      setCurrentUser(user);
      return Boolean(user?.emailVerified);
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      isVerified: Boolean(currentUser?.emailVerified),
      signup,
      login,
      logout,
      resendVerification,
      refreshVerification,
    }),
    [
      currentUser,
      loading,
      signup,
      login,
      logout,
      resendVerification,
      refreshVerification,
    ],
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
