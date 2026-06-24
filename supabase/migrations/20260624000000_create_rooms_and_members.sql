-- ═══════════════════════════════════════════════
-- Tabla: rooms
-- Almacena la información de las aulas creadas por los maestros
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    access_code TEXT UNIQUE NOT NULL,
    teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    icon_letter TEXT NOT NULL,
    color TEXT NOT NULL,
    icon_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════
-- Tabla: room_members
-- Relación de estudiantes inscritos en las aulas (rooms)
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.room_members (
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (room_id, student_id)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════
-- Políticas de Seguridad (RLS) para rooms
-- ═══════════════════════════════════════════════

DROP POLICY IF EXISTS "Profesores pueden crear aulas" ON public.rooms;
DROP POLICY IF EXISTS "Profesores pueden actualizar sus propias aulas" ON public.rooms;
DROP POLICY IF EXISTS "Profesores pueden eliminar sus propias aulas" ON public.rooms;
DROP POLICY IF EXISTS "Usuarios pueden ver aulas en las que participan" ON public.rooms;

-- Los profesores con rol 'maestro' pueden crear aulas (rooms)
CREATE POLICY "Profesores pueden crear aulas"
    ON public.rooms
    FOR INSERT
    WITH CHECK (
        auth.uid() = teacher_id 
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'maestro'
        )
    );

-- Solo el profesor creador puede actualizar el aula
CREATE POLICY "Profesores pueden actualizar sus propias aulas"
    ON public.rooms
    FOR UPDATE
    USING (auth.uid() = teacher_id);

-- Solo el profesor creador puede eliminar el aula
CREATE POLICY "Profesores pueden eliminar sus propias aulas"
    ON public.rooms
    FOR DELETE
    USING (auth.uid() = teacher_id);

-- Todos los usuarios autenticados pueden ver/buscar aulas (necesario para buscar por código de acceso antes de unirse)
CREATE POLICY "Usuarios pueden ver aulas"
    ON public.rooms
    FOR SELECT
    USING (
        auth.role() = 'authenticated'
    );

-- ═══════════════════════════════════════════════
-- Políticas de Seguridad (RLS) para room_members
-- ═══════════════════════════════════════════════

DROP POLICY IF EXISTS "Ver miembros de aulas participantes" ON public.room_members;
DROP POLICY IF EXISTS "Alumnos pueden unirse a aulas" ON public.room_members;
DROP POLICY IF EXISTS "Profesores y alumnos pueden salir o borrar miembros" ON public.room_members;

-- Los usuarios pueden ver la membresía si son el estudiante mismo o un profesor (maestro)
CREATE POLICY "Ver miembros de aulas participantes"
    ON public.room_members
    FOR SELECT
    USING (
        student_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'maestro'
        )
    );

-- Los estudiantes pueden unirse (insertar en room_members) si tienen rol 'estudiante' y son ellos mismos
CREATE POLICY "Alumnos pueden unirse a aulas"
    ON public.room_members
    FOR INSERT
    WITH CHECK (
        student_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'estudiante'
        )
    );

-- Un estudiante puede salirse, o un profesor puede eliminar a un alumno
CREATE POLICY "Profesores y alumnos pueden salir o borrar miembros"
    ON public.room_members
    FOR DELETE
    USING (
        student_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'maestro'
        )
    );

-- ═══════════════════════════════════════════════
-- Corrección: Permitir a usuarios autenticados ver perfiles
-- (Necesario para que el maestro y compañeros vean los datos del perfil de otros miembros)
-- ═══════════════════════════════════════════════

DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden ver perfiles" ON public.profiles;

CREATE POLICY "Usuarios pueden ver perfiles"
    ON public.profiles
    FOR SELECT
    USING (auth.role() = 'authenticated');
