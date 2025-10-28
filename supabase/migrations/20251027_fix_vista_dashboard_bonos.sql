-- #############################################################################
-- # FIX: Actualizar vista_dashboard_bonos con nombres correctos de columnas
-- #############################################################################
-- # Fecha: 27 de octubre de 2025
-- # Propósito: Corregir referencias a columnas de la tabla bonos
-- #############################################################################

-- Recrear la vista con los nombres correctos de columnas
DROP VIEW IF EXISTS public.vista_dashboard_bonos CASCADE;

CREATE OR REPLACE VIEW public.vista_dashboard_bonos AS
SELECT 
    b.id as bono_id,
    b.paciente_id,
    COALESCE(p.metadata->>'nombre_completo', p.email) as paciente_nombre,
    b.sesiones_totales as total_sesiones,
    b.sesiones_restantes as sesiones_restantes,
    (b.sesiones_totales - b.sesiones_restantes) as sesiones_usadas,
    ROUND(((b.sesiones_totales - b.sesiones_restantes)::numeric / NULLIF(b.sesiones_totales, 0)) * 100, 2) as porcentaje_usado,
    b.tipo_bono,
    b.estado::text as estado,
    COALESCE(b.monto_total, 0) as precio_total,
    b.fecha_fin as fecha_expiracion,
    COUNT(c.id) FILTER (WHERE c.estado = 'realizada') as citas_completadas,
    COUNT(c.id) FILTER (WHERE c.estado IN ('pendiente', 'confirmada')) as citas_programadas,
    b.created_at as fecha_compra,
    b.updated_at as ultima_actualizacion
FROM public.bonos b
JOIN public.pacientes p ON p.id = b.paciente_id
LEFT JOIN public.citas c ON c.bono_id = b.id AND c.descontar_de_bono = true
GROUP BY 
    b.id, 
    b.paciente_id, 
    p.metadata, 
    p.email, 
    b.sesiones_totales, 
    b.sesiones_restantes,
    b.tipo_bono, 
    b.estado,
    b.monto_total,
    b.fecha_fin, 
    b.created_at, 
    b.updated_at;

COMMENT ON VIEW public.vista_dashboard_bonos IS 
'Vista para dashboard con estadísticas completas de bonos por paciente';

-- Otorgar permisos
GRANT SELECT ON public.vista_dashboard_bonos TO authenticated;

-- Log de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Vista vista_dashboard_bonos recreada correctamente';
END $$;
