-- #############################################################################
-- # FIX: Recrear función obtener_estadisticas_bono
-- #############################################################################
-- # Fecha: 27 de octubre de 2025
-- # Propósito: Eliminar y recrear la función con la firma correcta
-- #############################################################################

-- Eliminar la función existente con todas sus variantes
DROP FUNCTION IF EXISTS public.obtener_estadisticas_bono(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.obtener_estadisticas_bono(p_bono_id uuid) CASCADE;

-- Recrear la función con la firma correcta y columnas reales
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_bono(p_bono_id uuid)
RETURNS TABLE (
    bono_id uuid,
    paciente_id uuid,
    total_sesiones integer,
    sesiones_restantes integer,
    sesiones_usadas integer,
    porcentaje_usado numeric,
    citas_realizadas integer,
    citas_pendientes integer,
    estado text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as bono_id,
        b.paciente_id,
        b.sesiones_totales::integer as total_sesiones,
        b.sesiones_restantes::integer as sesiones_restantes,
        (b.sesiones_totales - b.sesiones_restantes)::integer as sesiones_usadas,
        ROUND(((b.sesiones_totales - b.sesiones_restantes)::numeric / NULLIF(b.sesiones_totales, 0)) * 100, 2) as porcentaje_usado,
        CAST(COUNT(c.id) FILTER (WHERE c.estado = 'realizada') AS integer) as citas_realizadas,
        CAST(COUNT(c.id) FILTER (WHERE c.estado IN ('pendiente', 'confirmada')) AS integer) as citas_pendientes,
        b.estado::text
    FROM public.bonos b
    LEFT JOIN public.citas c ON c.bono_id = b.id
    WHERE b.id = p_bono_id
    GROUP BY b.id, b.paciente_id, b.sesiones_totales, b.sesiones_restantes, b.estado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.obtener_estadisticas_bono(uuid) IS 
'Devuelve estadísticas detalladas de uso de un bono específico';

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION public.obtener_estadisticas_bono(uuid) TO authenticated;

-- Log de éxito
DO $$
BEGIN
    RAISE NOTICE '✅ Función obtener_estadisticas_bono recreada correctamente';
END $$;
