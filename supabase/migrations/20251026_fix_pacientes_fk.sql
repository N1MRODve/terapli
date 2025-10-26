-- Fix: Remover foreign key de pacientes.id -> profiles.id
-- Fecha: 2025-10-26
-- Problema: No podemos crear pacientes sin primero crear su perfil
-- Solución: Hacer que pacientes.id sea independiente hasta que el paciente cree su cuenta

BEGIN;

-- 1. Remover la constraint de foreign key
ALTER TABLE public.pacientes 
DROP CONSTRAINT IF EXISTS pacientes_id_fkey;

-- 2. Agregar un valor default para la columna id si no existe
ALTER TABLE public.pacientes 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Agregar una columna opcional para vincular con profiles cuando exista
-- Solo se llenará cuando el paciente cree su cuenta
ALTER TABLE public.pacientes 
ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 4. Crear índice para profile_id para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_pacientes_profile_id ON public.pacientes(profile_id);

-- 5. Comentario explicativo
COMMENT ON COLUMN public.pacientes.profile_id IS 
'UUID del perfil en profiles. NULL hasta que el paciente cree su cuenta de usuario.';

COMMENT ON TABLE public.pacientes IS 
'Pacientes del sistema. Pueden existir sin cuenta de usuario (profile_id NULL) y vincular después.';

COMMIT;

-- Verificar el resultado
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'pacientes'
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, kcu.column_name;

-- Mostrar las columnas
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'pacientes'
ORDER BY ordinal_position;
