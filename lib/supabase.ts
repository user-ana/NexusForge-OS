// ═══════════════════════════════════════════════
// NexusForge OS — Supabase Client (Mock & Real Router)
// ═══════════════════════════════════════════════

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

// ── Cookie Helpers (Para integrarse con Middleware) ────────────────

function setMockCookie(user: AppUser | null) {
  if (typeof document === "undefined") return;
  if (user) {
    document.cookie = `nf_mock_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=86400; SameSite=Lax`;
  } else {
    document.cookie = "nf_mock_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

function getMockCookie(): AppUser | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^| )nf_mock_user=([^;]+)/);
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch {
      return null;
    }
  }
  return null;
}

// ── Auth Functions (Mocking based on inputs) ───────────────────────

export async function signIn(
  email: string,
  _password?: string
): Promise<AuthResponse> {
  let user: AppUser;

  if (email.trim() === "josegaldamez1991@gmail.com") {
    user = {
      id: "teacher-001",
      email: "josegaldamez1991@gmail.com",
      username: "Jose Galdamez (Maestro)",
      role: "maestro",
      specialty: "Catedrático Principal",
      created_at: new Date().toISOString(),
    };
  } else if (email.trim() === "ana_maestra@gmail.com") {
    user = {
      id: "teacher-ana",
      email: "ana_maestra@gmail.com",
      username: "Ana Maestra",
      role: "maestro",
      specialty: "Catedrática Asociada",
      created_at: new Date().toISOString(),
    };
  } else if (email.trim() === "jose@gmail.com") {
    user = {
      id: "student-jose",
      email: "jose@gmail.com",
      username: "Jose Estudiante",
      role: "estudiante",
      specialty: "Full Stack Developer",
      created_at: new Date().toISOString(),
    };
  } else if (email.trim() === "ana_estudiante@gmail.com") {
    user = {
      id: "student-ana",
      email: "ana_estudiante@gmail.com",
      username: "Ana Estudiante",
      role: "estudiante",
      specialty: "Data Scientist",
      created_at: new Date().toISOString(),
    };
  } else {
    // Para otros emails en el mock, creamos un estudiante genérico
    const username = email.split("@")[0];
    user = {
      id: "student-" + Math.random().toString(36).substring(2, 9),
      email,
      username,
      role: "estudiante",
      specialty: "Software Engineer",
      created_at: new Date().toISOString(),
    };
  }

  setMockCookie(user);
  return { user, error: null };
}

export async function signUp(
  email: string,
  _password?: string,
  username?: string,
  role?: UserRole,
  specialty?: string
): Promise<AuthResponse> {
  const user: AppUser = {
    id: "user-" + Math.random().toString(36).substring(2, 9),
    email,
    username: username || email.split("@")[0],
    role: role || "estudiante",
    specialty: specialty || "Junior Developer",
    created_at: new Date().toISOString(),
  };

  setMockCookie(user);
  return { user, error: null };
}

export async function signOut(): Promise<{ error: string | null }> {
  setMockCookie(null);
  return { error: null };
}

export async function getSession(): Promise<{ user: AppUser | null }> {
  return { user: getMockCookie() };
}

// Exportamos un objeto dummy de supabase para evitar que falle en imports del contexto
export const supabase = {
  auth: {
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Simula el callback con el usuario actual de la cookie
      const user = getMockCookie();
      if (user) {
        callback("SIGNED_IN", { user });
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  },
};
