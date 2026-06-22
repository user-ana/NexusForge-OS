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
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  getSession,
  supabase,
  type AppUser,
  type UserRole,
} from "@/lib/supabase";

// ═══════════════════════════════════════════════
// NexusForge OS — Auth Context
// ═══════════════════════════════════════════════

interface AuthContextType {
  user: AppUser | null;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from Supabase on mount
  useEffect(() => {
    getSession().then(({ user }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const meta = session.user.user_metadata ?? {};
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            username: meta.username ?? session.user.email?.split("@")[0] ?? "",
            role: (meta.role as UserRole) ?? "estudiante",
            specialty: meta.specialty ?? "",
            created_at: session.user.created_at,
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      setIsLoading(true);
      try {
        const result = await supabaseSignIn(email, password);
        if (result.error) {
          return result.error;
        }
        setUser(result.user);
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
        const result = await supabaseSignUp(email, password, username, role, specialty);
        if (result.error) {
          return result.error;
        }
        setUser(result.user);
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
      await supabaseSignOut();
      setUser(null);
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
