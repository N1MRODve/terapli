-- ============================================================================
-- FIX: Eliminar trigger de sincronización monto/monto_total
-- ============================================================================
-- Fecha: 27 de octubre de 2025
-- Propósito: El trigger sync_monto_fields está intentando acceder a una
--            columna 'monto' que no existe, causando error al insertar bonos

-- Eliminar el trigger problemático
DROP TRIGGER IF EXISTS trg_sync_monto_fields ON public.bonos;

-- Eliminar la función asociada
DROP FUNCTION IF EXISTS sync_monto_fields();

-- Verificar que el trigger fue eliminado
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trg_sync_monto_fields'
    ) THEN
        RAISE NOTICE '✅ Trigger trg_sync_monto_fields eliminado correctamente';
    ELSE
        RAISE WARNING '⚠️  El trigger trg_sync_monto_fields todavía existe';
    END IF;
END $$;

COMMENT ON TABLE public.bonos IS 
'Tabla de bonos. Solo usa monto_total (no monto). El trigger de sincronización fue removido el 2025-10-27.';
