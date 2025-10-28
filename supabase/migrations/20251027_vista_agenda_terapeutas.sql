-- ============================================================================
-- VISTA CONSOLIDADA: vista_agenda_terapeutas
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Propósito: Vista optimizada que consolida toda la información necesaria
--            para la agenda de terapeutas, incluyendo datos de pacientes,
--            bonos y sesiones restantes.
--
-- Beneficios:
-- - Consultas más rápidas (un solo SELECT en lugar de múltiples joins)
-- - Código frontend más limpio
-- - Performance mejorado con índices en la vista
-- ============================================================================

-- Eliminar vista si existe (para poder recrearla)
DROP VIEW IF EXISTS public.vista_agenda_terapeutas CASCADE;

-- Crear vista consolidada
CREATE OR REPLACE VIEW public.vista_agenda_terapeutas AS
SELECT 
    -- Información de la cita
    c.id as cita_id,
    c.fecha_cita,
    c.hora_inicio,
    c.hora_fin,
    c.duracion_minutos,
    c.modalidad,
    c.estado,
    c.ubicacion,
    c.enlace_videollamada,
    c.observaciones,
    c.notas_terapeuta,
    c.descontar_de_bono,
    c.sesion_descontada,
    c.recordatorio_enviado,
    c.metadata as cita_metadata,
    c.created_at as cita_created_at,
    c.updated_at as cita_updated_at,
    
    -- Información del paciente
    p.id as paciente_id,
    p.email as paciente_email,
    p.telefono as paciente_telefono,
    p.activo as paciente_activo,
    p.area_de_acompanamiento as paciente_area,
    p.frecuencia as paciente_frecuencia,
    COALESCE(
        p.metadata->>'nombre_completo',
        p.metadata->>'nombre',
        p.email
    ) as paciente_nombre,
    
    -- Información del terapeuta
    t.id as terapeuta_id,
    t.nombre_completo as terapeuta_nombre,
    t.email as terapeuta_email,
    t.telefono as terapeuta_telefono,
    t.especialidad as terapeuta_especialidad,
    t.activo as terapeuta_activo,
    
    -- Información del bono (si existe)
    b.id as bono_id,
    b.tipo_bono,
    b.sesiones_totales as bono_sesiones_totales,
    b.sesiones_restantes as bono_sesiones_restantes,
    b.estado as bono_estado,
    b.fecha_expiracion as bono_fecha_expiracion,
    b.precio_total as bono_precio_total,
    b.precio_por_sesion as bono_precio_por_sesion,
    
    -- Campos calculados útiles
    CASE 
        WHEN c.fecha_cita < CURRENT_DATE THEN 'pasada'
        WHEN c.fecha_cita = CURRENT_DATE THEN 'hoy'
        WHEN c.fecha_cita = CURRENT_DATE + INTERVAL '1 day' THEN 'manana'
        ELSE 'futura'
    END as clasificacion_temporal,
    
    -- Días restantes hasta la cita
    (c.fecha_cita - CURRENT_DATE)::integer as dias_restantes,
    
    -- Información de si el bono está por agotarse
    CASE 
        WHEN b.sesiones_restantes IS NULL THEN NULL
        WHEN b.sesiones_restantes = 0 THEN 'agotado'
        WHEN b.sesiones_restantes = 1 THEN 'ultima_sesion'
        WHEN b.sesiones_restantes <= 2 THEN 'por_agotar'
        ELSE 'activo'
    END as alerta_bono

FROM public.citas c
INNER JOIN public.pacientes p ON p.id = c.paciente_id
INNER JOIN public.terapeutas t ON t.id = c.terapeuta_id
LEFT JOIN public.bonos b ON b.id = c.bono_id;

-- Comentarios
COMMENT ON VIEW public.vista_agenda_terapeutas IS 
'Vista consolidada de la agenda de terapeutas con toda la información necesaria para renderizar el calendario y gestionar citas. Incluye datos de pacientes, terapeutas, bonos y campos calculados útiles.';

-- Índices para optimizar consultas sobre la vista
-- Nota: Las vistas materialized permiten índices, pero las vistas normales no.
-- Sin embargo, los índices en las tablas base ya optimizan las consultas.

-- Verificar que los índices existan en las tablas base
CREATE INDEX IF NOT EXISTS idx_citas_fecha_terapeuta 
    ON public.citas(fecha_cita, terapeuta_id) 
    WHERE estado != 'cancelada';

CREATE INDEX IF NOT EXISTS idx_citas_fecha_estado 
    ON public.citas(fecha_cita, estado);

-- ============================================================================
-- GRANTS Y PERMISOS
-- ============================================================================

-- Otorgar permisos de lectura a usuarios autenticados
GRANT SELECT ON public.vista_agenda_terapeutas TO authenticated;

-- ============================================================================
-- FUNCIONES AUXILIARES PARA LA VISTA
-- ============================================================================

-- Función: Obtener citas de un terapeuta desde la vista
CREATE OR REPLACE FUNCTION public.get_citas_terapeuta_vista(
    p_terapeuta_id uuid,
    p_fecha_inicio date DEFAULT NULL,
    p_fecha_fin date DEFAULT NULL,
    p_incluir_canceladas boolean DEFAULT false
)
RETURNS SETOF public.vista_agenda_terapeutas AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.vista_agenda_terapeutas
    WHERE terapeuta_id = p_terapeuta_id
      AND (p_fecha_inicio IS NULL OR fecha_cita >= p_fecha_inicio)
      AND (p_fecha_fin IS NULL OR fecha_cita <= p_fecha_fin)
      AND (p_incluir_canceladas OR estado != 'cancelada')
    ORDER BY fecha_cita, hora_inicio;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_citas_terapeuta_vista IS 
'Obtiene las citas de un terapeuta desde la vista consolidada, con filtros opcionales de fecha y estado';

-- Función: Obtener citas del día desde la vista
CREATE OR REPLACE FUNCTION public.get_citas_dia_vista(
    p_terapeuta_id uuid,
    p_fecha date DEFAULT CURRENT_DATE
)
RETURNS SETOF public.vista_agenda_terapeutas AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.vista_agenda_terapeutas
    WHERE terapeuta_id = p_terapeuta_id
      AND fecha_cita = p_fecha
      AND estado != 'cancelada'
    ORDER BY hora_inicio;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_citas_dia_vista IS 
'Obtiene todas las citas de un terapeuta para un día específico desde la vista consolidada';

-- Función: Obtener próximas citas con alertas de bono
CREATE OR REPLACE FUNCTION public.get_proximas_citas_con_alertas(
    p_terapeuta_id uuid,
    p_limite integer DEFAULT 10
)
RETURNS SETOF public.vista_agenda_terapeutas AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.vista_agenda_terapeutas
    WHERE terapeuta_id = p_terapeuta_id
      AND fecha_cita >= CURRENT_DATE
      AND estado IN ('pendiente', 'confirmada')
      AND alerta_bono IN ('ultima_sesion', 'por_agotar', 'agotado')
    ORDER BY fecha_cita, hora_inicio
    LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_proximas_citas_con_alertas IS 
'Obtiene las próximas citas de un terapeuta que tienen alertas de bono por agotarse';

-- ============================================================================
-- VERIFICACIÓN Y TESTING
-- ============================================================================

DO $$
DECLARE
    v_count integer;
BEGIN
    -- Verificar que la vista se creó correctamente
    SELECT COUNT(*) INTO v_count
    FROM information_schema.views
    WHERE table_schema = 'public'
      AND table_name = 'vista_agenda_terapeutas';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✅ Vista vista_agenda_terapeutas creada correctamente';
    ELSE
        RAISE WARNING '⚠️ La vista vista_agenda_terapeutas no se creó';
    END IF;
    
    -- Verificar funciones auxiliares
    SELECT COUNT(*) INTO v_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
      AND routine_name LIKE 'get_%_vista';
    
    RAISE NOTICE '✅ % funciones auxiliares creadas', v_count;
    
    -- Mostrar conteo de citas en la vista (si existen)
    SELECT COUNT(*) INTO v_count FROM public.vista_agenda_terapeutas;
    RAISE NOTICE 'ℹ️ Total de citas en la vista: %', v_count;
    
END $$;

-- ============================================================================
-- NOTAS DE USO
-- ============================================================================

-- Uso desde el frontend (TypeScript):
-- 
-- const { data, error } = await supabase
--   .from('vista_agenda_terapeutas')
--   .select('*')
--   .eq('terapeuta_id', terapeutaId)
--   .gte('fecha_cita', fechaInicio)
--   .lte('fecha_cita', fechaFin)
--   .order('fecha_cita', { ascending: true })
--   .order('hora_inicio', { ascending: true })
--
-- Ventajas:
-- - Un solo select, sin joins manuales
-- - Todos los campos ya calculados (paciente_nombre, alerta_bono, etc)
-- - Performance optimizado
-- - Código más limpio y mantenible

