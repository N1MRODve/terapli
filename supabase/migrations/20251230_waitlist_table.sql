-- ============================================================================
-- TABLA: WAITLIST - Lista de espera para lanzamiento
-- ============================================================================
-- Almacena emails de usuarios interesados en el lanzamiento de Terapli
-- ============================================================================

-- Crear tabla waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  source text DEFAULT 'landing_page',
  created_at timestamp with time zone DEFAULT now(),
  notified_at timestamp with time zone,
  converted_at timestamp with time zone,
  notes text
);

-- Comentarios
COMMENT ON TABLE public.waitlist IS 'Lista de espera de usuarios interesados en Terapli';
COMMENT ON COLUMN public.waitlist.email IS 'Email del interesado';
COMMENT ON COLUMN public.waitlist.source IS 'Origen del registro (landing_page, referral, etc.)';
COMMENT ON COLUMN public.waitlist.notified_at IS 'Fecha cuando se le notificó del lanzamiento';
COMMENT ON COLUMN public.waitlist.converted_at IS 'Fecha cuando se convirtió en usuario';

-- Habilitar RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Política: Solo insertar (cualquier usuario anónimo puede registrarse)
CREATE POLICY "permitir_insercion_anonima"
ON public.waitlist FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política: Solo admin puede ver la lista
CREATE POLICY "admin_ve_waitlist"
ON public.waitlist FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol IN ('admin', 'coordinadora')
  )
);

-- Política: Solo admin puede actualizar
CREATE POLICY "admin_actualiza_waitlist"
ON public.waitlist FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol = 'admin'
  )
);

-- Política: Solo admin puede eliminar
CREATE POLICY "admin_elimina_waitlist"
ON public.waitlist FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND rol = 'admin'
  )
);

-- Índice para búsqueda por email
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);

-- Índice para filtrar por fecha
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
SELECT '✅ Tabla waitlist creada correctamente' as status;
