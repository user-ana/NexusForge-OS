// ═══════════════════════════════════════════════
// NexusForge OS — Supabase Client (MOCK)
// ═══════════════════════════════════════════════
// TODO: Activar Supabase — Instalar @supabase/supabase-js y descomentar
//
// import { createClient } from '@supabase/supabase-js';
//
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
//
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = "maestro" | "estudiante";

export interface MockUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  specialty: string;
  created_at: string;
}

export interface AuthResponse {
  user: MockUser | null;
  error: string | null;
}

/**
 * Simulates network latency for mock operations.
 */
function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock sign in with email and password.
 * Any email/password combination will succeed.
 *
 * TODO: Activar Supabase — Reemplazar con:
 *   const { data, error } = await supabase.auth.signInWithPassword({ email, password });
 */
export async function signIn(
  email: string,
  _password: string
): Promise<AuthResponse> {
  await delay(600);

  const user: MockUser = {
    id: "mock-user-001",
    email,
    username: email.split("@")[0],
    role: "estudiante",
    specialty: "Full Stack",
    created_at: new Date().toISOString(),
  };

  return { user, error: null };
}

/**
 * Mock sign up with email, password, and username.
 *
 * TODO: Activar Supabase — Reemplazar con:
 *   const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
 */
export async function signUp(
  email: string,
  _password: string,
  username: string,
  role: UserRole,
  specialty: string
): Promise<AuthResponse> {
  await delay(800);

  const user: MockUser = {
    id: "mock-user-" + Math.random().toString(36).substring(2, 8),
    email,
    username,
    role,
    specialty,
    created_at: new Date().toISOString(),
  };

  return { user, error: null };
}

/**
 * Mock sign out.
 *
 * TODO: Activar Supabase — Reemplazar con:
 *   await supabase.auth.signOut();
 */
export async function signOut(): Promise<{ error: string | null }> {
  await delay(300);
  return { error: null };
}

/**
 * Mock get session — returns null (no active session).
 *
 * TODO: Activar Supabase — Reemplazar con:
 *   const { data: { session } } = await supabase.auth.getSession();
 */
export async function getSession(): Promise<{
  user: MockUser | null;
}> {
  await delay(200);
  return { user: null };
}
