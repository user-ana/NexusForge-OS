"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  signIn as mockSignIn,
  signUp as mockSignUp,
  signOut as mockSignOut,
  type MockUser,
  type UserRole,
} from "@/lib/supabase";

// ═══════════════════════════════════════════════
// NexusForge OS — Auth Context
// ═══════════════════════════════════════════════

interface AuthContextType {
  user: MockUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (
    email: string,
    password: string,
    username: string,
    role: UserRole,
    specialty: string
  ) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "nexusforge_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      // Invalid data, ignore
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      setIsLoading(true);
      try {
        const result = await mockSignIn(email, password);
        if (result.error) {
          return result.error;
        }
        setUser(result.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      role: UserRole,
      specialty: string
    ): Promise<string | null> => {
      setIsLoading(true);
      try {
        const result = await mockSignUp(email, password, username, role, specialty);
        if (result.error) {
          return result.error;
        }
        setUser(result.user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result.user));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await mockSignOut();
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
