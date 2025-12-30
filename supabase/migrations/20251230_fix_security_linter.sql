-- ============================================================================
-- MIGRACIÓN: Corrección de Problemas de Seguridad (Linter)
-- ============================================================================
-- Fecha: 30 de diciembre de 2025
-- Objetivo: Corregir errores del linter de seguridad de Supabase
-- ============================================================================

-- ============================================================================
-- PASO 1: Habilitar RLS en tabla consulta_usuarios
-- ============================================================================

ALTER TABLE IF EXISTS public.consulta_usuarios ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 2: Recrear vistas sin SECURITY DEFINER (usar SECURITY INVOKER)
-- ============================================================================

-- 2.1 Vista: vista_citas_completas
DROP VIEW IF EXISTS public.vista_citas_completas;
CREATE VIEW public.vista_citas_completas
WITH (security_invoker = true)
AS
SELECT
    c.*,
    p.nombre_completo as paciente_nombre,
    p.email as paciente_email,
    p.telefono as paciente_telefono,
    t.nombre_completo as terapeuta_nombre,
    t.email as terapeuta_email,
    b.tipo as bono_tipo,
    b.sesiones_restantes as bono_sesiones_restantes
FROM public.citas c
LEFT JOIN public.pacientes p ON c.paciente_id = p.id
LEFT JOIN public.terapeutas t ON c.terapeuta_id = t.id
LEFT JOIN public.bonos b ON c.bono_id = b.id;

COMMENT ON VIEW public.vista_citas_completas IS 'Vista completa de citas con datos de paciente, terapeuta y bono';

-- 2.2 Vista: vista_agenda_terapeutas
DROP VIEW IF EXISTS public.vista_agenda_terapeutas;
CREATE VIEW public.vista_agenda_terapeutas
WITH (security_invoker = true)
AS
SELECT
    c.id,
    c.fecha_cita,
    c.hora_inicio,
    c.hora_fin,
    c.estado,
    c.modalidad,
    c.terapeuta_id,
    c.paciente_id,
    p.nombre_completo as paciente_nombre,
    p.telefono as paciente_telefono,
    c.notas_terapeuta,
    c.created_at,
    c.updated_at
FROM public.citas c
LEFT JOIN public.pacientes p ON c.paciente_id = p.id;

COMMENT ON VIEW public.vista_agenda_terapeutas IS 'Vista de agenda para terapeutas';

-- 2.3 Vista: vista_dashboard_bonos
DROP VIEW IF EXISTS public.vista_dashboard_bonos;
CREATE VIEW public.vista_dashboard_bonos
WITH (security_invoker = true)
AS
SELECT
    b.id,
    b.paciente_id,
    b.tipo,
    b.sesiones_totales,
    b.sesiones_restantes,
    b.estado,
    b.monto_total,
    b.pagado,
    b.created_at as fecha_compra,
    p.nombre_completo as paciente_nombre,
    p.terapeuta_id,
    t.nombre_completo as terapeuta_nombre
FROM public.bonos b
LEFT JOIN public.pacientes p ON b.paciente_id = p.id
LEFT JOIN public.terapeutas t ON p.terapeuta_id = t.id;

COMMENT ON VIEW public.vista_dashboard_bonos IS 'Vista de bonos para dashboard';

-- 2.4 Vista: vista_resumen_financiero_terapeuta
DROP VIEW IF EXISTS public.vista_resumen_financiero_terapeuta;
CREATE VIEW public.vista_resumen_financiero_terapeuta
WITH (security_invoker = true)
AS
SELECT
    t.id as terapeuta_id,
    t.nombre_completo as terapeuta_nombre,
    t.precio_sesion_base,

    -- Sesiones de esta semana
    COUNT(c.id) FILTER (
        WHERE c.fecha_cita >= date_trunc('week', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('week', CURRENT_DATE) + interval '7 days'
    ) as sesiones_semana,

    -- Ingresos esta semana (pagados) - 100% para el terapeuta
    COALESCE(SUM(c.precio_sesion) FILTER (
        WHERE c.estado_pago = 'pagado'
        AND c.fecha_cita >= date_trunc('week', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('week', CURRENT_DATE) + interval '7 days'
    ), 0) as ingresos_semana_cobrados,

    -- Ingresos esta semana (pendientes)
    COALESCE(SUM(c.precio_sesion) FILTER (
        WHERE c.estado_pago = 'pendiente'
        AND c.estado IN ('confirmada', 'realizada')
        AND c.fecha_cita >= date_trunc('week', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('week', CURRENT_DATE) + interval '7 days'
    ), 0) as ingresos_semana_pendientes,

    -- Sesiones de este mes
    COUNT(c.id) FILTER (
        WHERE c.fecha_cita >= date_trunc('month', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('month', CURRENT_DATE) + interval '1 month'
    ) as sesiones_mes,

    -- Ingresos este mes (pagados) - 100% para el terapeuta
    COALESCE(SUM(c.precio_sesion) FILTER (
        WHERE c.estado_pago = 'pagado'
        AND c.fecha_cita >= date_trunc('month', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('month', CURRENT_DATE) + interval '1 month'
    ), 0) as ingresos_mes_cobrados,

    -- Ingresos este mes (pendientes)
    COALESCE(SUM(c.precio_sesion) FILTER (
        WHERE c.estado_pago = 'pendiente'
        AND c.estado IN ('confirmada', 'realizada')
        AND c.fecha_cita >= date_trunc('month', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('month', CURRENT_DATE) + interval '1 month'
    ), 0) as ingresos_mes_pendientes,

    -- Sesiones bonificadas este mes (cubiertas por bonos)
    COUNT(c.id) FILTER (
        WHERE c.estado_pago = 'bonificado'
        AND c.fecha_cita >= date_trunc('month', CURRENT_DATE)
        AND c.fecha_cita < date_trunc('month', CURRENT_DATE) + interval '1 month'
    ) as sesiones_bonificadas_mes

FROM public.terapeutas t
LEFT JOIN public.citas c ON t.id = c.terapeuta_id
GROUP BY t.id, t.nombre_completo, t.precio_sesion_base;

COMMENT ON VIEW public.vista_resumen_financiero_terapeuta IS 'Resumen financiero agregado por terapeuta - Sin comisiones';

-- 2.5 Vista: vista_pagos_por_bono
DROP VIEW IF EXISTS public.vista_pagos_por_bono;
CREATE VIEW public.vista_pagos_por_bono
WITH (security_invoker = true)
AS
SELECT
    b.id as bono_id,
    b.paciente_id,
    b.tipo,
    b.monto_total,
    b.pagado,
    b.sesiones_totales,
    b.sesiones_restantes,
    p.nombre_completo as paciente_nombre,
    p.terapeuta_id,
    t.nombre_completo as terapeuta_nombre
FROM public.bonos b
LEFT JOIN public.pacientes p ON b.paciente_id = p.id
LEFT JOIN public.terapeutas t ON p.terapeuta_id = t.id;

COMMENT ON VIEW public.vista_pagos_por_bono IS 'Vista de pagos agrupados por bono';

-- 2.6 Vista: vista_sesiones_psicologa
DROP VIEW IF EXISTS public.vista_sesiones_psicologa;
CREATE VIEW public.vista_sesiones_psicologa
WITH (security_invoker = true)
AS
SELECT
    c.id,
    c.fecha_cita,
    c.hora_inicio,
    c.hora_fin,
    c.estado,
    c.modalidad,
    c.precio_sesion,
    c.estado_pago,
    c.terapeuta_id,
    c.paciente_id,
    p.nombre_completo as paciente_nombre,
    t.nombre_completo as terapeuta_nombre
FROM public.citas c
LEFT JOIN public.pacientes p ON c.paciente_id = p.id
LEFT JOIN public.terapeutas t ON c.terapeuta_id = t.id;

COMMENT ON VIEW public.vista_sesiones_psicologa IS 'Vista de sesiones para psicologas/terapeutas';

-- 2.7 Vista: psicologas
DROP VIEW IF EXISTS public.psicologas;
CREATE VIEW public.psicologas
WITH (security_invoker = true)
AS
SELECT
    t.id,
    t.nombre_completo,
    t.email,
    t.telefono,
    t.especialidad,
    t.activo,
    t.created_at
FROM public.terapeutas t
WHERE t.activo = true;

COMMENT ON VIEW public.psicologas IS 'Vista de terapeutas/psicologas activas';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
    rls_status BOOLEAN;
    view_count INTEGER;
BEGIN
    -- Verificar RLS en consulta_usuarios
    SELECT relrowsecurity INTO rls_status
    FROM pg_class
    WHERE relname = 'consulta_usuarios' AND relnamespace = 'public'::regnamespace;

    IF rls_status THEN
        RAISE NOTICE '✅ RLS habilitado en consulta_usuarios';
    ELSE
        RAISE NOTICE '⚠️ RLS NO habilitado en consulta_usuarios';
    END IF;

    -- Contar vistas recreadas
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name IN (
        'vista_citas_completas',
        'vista_agenda_terapeutas',
        'vista_dashboard_bonos',
        'vista_resumen_financiero_terapeuta',
        'vista_pagos_por_bono',
        'vista_sesiones_psicologa',
        'psicologas'
    );

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ CORRECCIONES DE SEGURIDAD APLICADAS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '• RLS habilitado en consulta_usuarios';
    RAISE NOTICE '• % vistas recreadas con SECURITY INVOKER', view_count;
    RAISE NOTICE '========================================';
END $$;
