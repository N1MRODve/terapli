-- ============================================================================
-- RESET: Volver el bono a estado no pagado para probar de nuevo
-- ============================================================================

UPDATE bonos
SET 
    pagado = false,
    fecha_pago = NULL,
    metodo_pago = NULL,
    pagado_por = NULL
WHERE id = '596991a0-e65a-4cdd-b0b8-b05cb65abaf5';

-- Verificar el estado
SELECT 
    id,
    estado,
    pagado,
    fecha_pago,
    metodo_pago,
    sesiones_totales,
    sesiones_restantes
FROM bonos
WHERE id = '596991a0-e65a-4cdd-b0b8-b05cb65abaf5';
