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

export interface SupabaseRoom {
  id: string;
  name: string;
  access_code: string;
  teacher_id: string;
  icon_letter: string;
  color: string;
  icon_url?: string;
  created_at: string;
}

export function mapSupabaseRoomToMockClass(room: SupabaseRoom): any {
  return {
    id: room.id,
    name: room.name,
    accessCode: room.access_code,
    teacherId: room.teacher_id,
    createdAt: room.created_at,
    iconLetter: room.icon_letter,
    color: room.color,
    iconUrl: room.icon_url || undefined,
  };
}

export async function fetchRooms(
  userId: string,
  role: UserRole
): Promise<{ rooms: SupabaseRoom[]; error: string | null }> {
  try {
    if (role === "maestro") {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("teacher_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return { rooms: data || [], error: null };
    } else {
      const { data, error } = await supabase
        .from("room_members")
        .select(`
          room_id,
          rooms (
            id,
            name,
            access_code,
            teacher_id,
            icon_letter,
            color,
            icon_url,
            created_at
          )
        `)
        .eq("student_id", userId);

      if (error) throw error;
      
      const rooms: SupabaseRoom[] = (data || [])
        .map((item: any) => (item as any).rooms)
        .filter((room: any) => room !== null);

      return { rooms, error: null };
    }
  } catch (err: any) {
    console.error("Error al obtener aulas:", err);
    return { rooms: [], error: err.message || "Error al cargar las aulas" };
  }
}

export async function createRoom(
  name: string,
  accessCode: string,
  teacherId: string,
  iconUrl?: string
): Promise<{ room: SupabaseRoom | null; error: string | null }> {
  try {
    const uppercaseCode = accessCode.trim().toUpperCase();
    
    const colors = ["#8E76C8", "#3D4CA8", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const words = name.trim().split(/\s+/);
    const iconLetter = words.map(w => w[0]).join("").slice(0, 3).toUpperCase() || "RM";

    const { data, error } = await supabase
      .from("rooms")
      .insert({
        name: name.trim(),
        access_code: uppercaseCode,
        teacher_id: teacherId,
        icon_letter: iconLetter,
        color: randomColor,
        icon_url: iconUrl || null
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { room: null, error: "El código de acceso ya está en uso" };
      }
      throw error;
    }
    
    return { room: data, error: null };
  } catch (err: any) {
    console.error("Error al crear aula:", err);
    return { room: null, error: err.message || "Error al crear el aula" };
  }
}

export async function joinRoom(
  studentId: string,
  accessCode: string
): Promise<{ room: SupabaseRoom | null; error: string | null }> {
  try {
    const uppercaseCode = accessCode.trim().toUpperCase();

    const { data: roomData, error: roomError } = await supabase
      .from("rooms")
      .select("*")
      .eq("access_code", uppercaseCode)
      .maybeSingle();

    if (roomError) throw roomError;
    if (!roomData) {
      return { room: null, error: "Código de aula inválido" };
    }

    const { data: membershipData, error: membershipError } = await supabase
      .from("room_members")
      .select("*")
      .eq("room_id", roomData.id)
      .eq("student_id", studentId)
      .maybeSingle();

    if (membershipError) throw membershipError;
    if (membershipData) {
      return { room: null, error: "Ya estás registrado en esta aula" };
    }

    const { error: joinError } = await supabase
      .from("room_members")
      .insert({
        room_id: roomData.id,
        student_id: studentId
      });

    if (joinError) throw joinError;

    return { room: roomData, error: null };
  } catch (err: any) {
    console.error("Error al unirse al aula:", err);
    return { room: null, error: err.message || "Error al unirse al aula" };
  }
}

export interface SupabaseProfile {
  id: string;
  username: string;
  role: "estudiante" | "maestro";
  specialty: string;
  created_at: string;
}

export async function fetchRoomMembers(
  roomId: string
): Promise<{ members: SupabaseProfile[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("room_members")
      .select(`
        student_id,
        profiles (
          id,
          username,
          role,
          specialty,
          created_at
        )
      `)
      .eq("room_id", roomId);

    if (error) throw error;

    const members: SupabaseProfile[] = (data || [])
      .map((item: any) => (item as any).profiles)
      .filter((profile: any) => profile !== null);

    return { members, error: null };
  } catch (err: any) {
    console.error("Error al obtener estudiantes del aula:", err);
    return { members: [], error: err.message || "Error al cargar estudiantes del aula" };
  }
}
