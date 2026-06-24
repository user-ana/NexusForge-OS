import { createBrowserClient } from "@supabase/ssr";

export type UserRole = "maestro" | "estudiante";

export interface AppUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  specialty: string;
  created_at: string;
}

export interface AuthResponse {
  user: AppUser | null;
  error: string | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);


function formatUserSimple(authUser: any): AppUser {
  const meta = authUser.user_metadata ?? {};
  return {
    id: authUser.id,
    email: authUser.email || "",
    username: meta.username || authUser.email?.split("@")[0] || "",
    role: (meta.role as UserRole) || "estudiante",
    specialty: meta.specialty || "",
    created_at: authUser.created_at || new Date().toISOString(),
  };
}

export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { user: null, error: error.message };
  if (data.user) return { user: formatUserSimple(data.user), error: null };
  return { user: null, error: "No se pudo iniciar sesión" };
}

export async function signUp(
  email: string,
  password: string,
  username?: string,
  role?: UserRole,
  specialty?: string
): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, role: role || "estudiante", specialty: specialty || "" },
    },
  });

  if (error) return { user: null, error: error.message };
  if (data.user) return { user: formatUserSimple(data.user), error: null };
  return { user: null, error: "No se pudo crear la cuenta" };
}

export async function signOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message || null };
}

export async function getSession(): Promise<{ user: AppUser | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { user: null };
  return { user: formatUserSimple(session.user) };
}
