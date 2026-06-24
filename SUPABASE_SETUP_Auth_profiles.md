# ═══════════════════════════════════════════════
# NexusForge OS — Guía de Configuración de Supabase
# ═══════════════════════════════════════════════

Esta guía detalla todos los pasos necesarios para configurar tu proyecto de Supabase para que funcione con NexusForge OS.

---

## 1. Crear un Proyecto en Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto (o usa uno existente)
3. Espera a que el proyecto se inicialice (puede tardar 1-2 minutos)

---

## 2. Obtener Credenciales del Proyecto

1. En el Dashboard de Supabase, ve a **Settings** → **API**
2. Copia los siguientes valores y pégalos en tu archivo `.env.local`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` o `publishable` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY` (opcional, para servidor)

---

## 3. Habilitar Confirmación por Correo Electrónico y Configurar URLs

1. Ve a **Authentication** → **Providers** → **Email**
2. Activa la opción **Confirm email**
3. (Opcional) Personaliza el correo de confirmación en **Email templates**
4. **IMPORTANTE**: Configura las URLs de redirección para desarrollo y producción:
   - Ve a **Authentication** → **URL Configuration**
   - **Site URL**:
     - En **desarrollo local**: Establece `http://localhost:3000`
     - En **producción (despliegue)**: Cambia el Site URL a tu dominio de producción, ej. `https://nexus-forge-os.vercel.app`
   - **Redirect URLs**: Agrega las siguientes URLs (puedes mantener las de desarrollo junto con las de producción):
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/**`
     - `https://nexus-forge-os.vercel.app/auth/callback`
     - `https://nexus-forge-os.vercel.app/**`


---

## 4. Crear la Tabla de Perfiles de Usuarios

Ve a **SQL Editor** → **New query** y ejecuta el siguiente SQL:

```sql
-- ═══════════════════════════════════════════════
# Tabla: profiles
# Almacena información adicional de los usuarios
-- ═══════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('maestro', 'estudiante')) DEFAULT 'estudiante',
    specialty TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (si hay) para evitar errores
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden insertar su propio perfil" ON public.profiles;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Política: Los usuarios pueden insertar su propio perfil (solo en creación)
CREATE POLICY "Usuarios pueden insertar su propio perfil"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════════
# Trigger: Crear perfil automáticamente al registrar usuario
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, role, specialty)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'estudiante'),
        COALESCE(NEW.raw_user_meta_data->>'specialty', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger existente (si hay) para evitar errores
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear el trigger que se ejecuta al crear un nuevo usuario
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══════════════════════════════════════════════
# Trigger: Actualizar updated_at automáticamente
-- ═══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Eliminar trigger existente (si hay) para evitar errores
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ═══════════════════════════════════════════════
# (Opcional) Crear un índice para búsquedas por username
-- ═══════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
```

---

## 5. Verificar la Configuración

### 5.1 Verificar la Tabla `profiles`
1. Ve a **Table Editor** en el dashboard de Supabase
2. Deberías ver la tabla `profiles` listada
3. Haz clic en `profiles` para abrirla y verificar que las columnas existen:
   - `id` (UUID, Primary Key)
   - `username` (text, unique)
   - `role` (text)
   - `specialty` (text)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

### 5.2 Verificar las Políticas RLS
1. Ve a **Authentication** → **Policies** (o en **Table Editor**, selecciona la tabla `profiles` y haz clic en **Policies**)
2. Deberías ver 3 políticas:
   - "Usuarios pueden ver su propio perfil" (SELECT)
   - "Usuarios pueden actualizar su propio perfil" (UPDATE)
   - "Usuarios pueden insertar su propio perfil" (INSERT)

### 5.3 Prueba el Flujo Completo
1. Asegúrate de que tu servidor Next.js esté corriendo en `http://localhost:3000`
2. Ve a la página de registro y crea un usuario nuevo
3. Revisa tu correo electrónico para el enlace de confirmación
4. Haz clic en el enlace de confirmación (debería redirigirte a `/auth/callback` y luego a `/dashboard`)
5. Después de confirmar, ve a **Table Editor** → `profiles` y verifica que se creó un registro para tu usuario

---

## 6. (Opcional) Configurar Storage para Archivos

Si planeas usar Storage para íconos de proyectos o avatares:

1. Ve a **Storage** → **New bucket**
2. Crea un bucket llamado `avatars` (para fotos de perfil)
3. Crea un bucket llamado `projects` (para recursos de proyectos)
4. Configura políticas RLS para cada bucket según tus necesidades

---

## Resumen de Cambios en Supabase

✅ Proyecto creado  
✅ Credenciales obtenidas y configuradas en `.env.local`  
✅ Confirmación por correo electrónico habilitada  
✅ Tabla `profiles` creada con RLS  
✅ Triggers para creación automática de perfiles configurados
