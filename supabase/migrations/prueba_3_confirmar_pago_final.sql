-- ============================================================================
-- PRUEBA 3: Confirmar pago con función simplificada
-- ============================================================================

-- Ejecutar la función corregida
SELECT public.confirmar_pago_bono(
    '596991a0-e65a-4cdd-b0b8-b05cb65abaf5'::uuid,
    'transferencia'
);

-- Verificar el resultado completo
SELECT 
    id,
    estado,
    pagado,
    fecha_pago,
    metodo_pago,
    pagado_por,
    sesiones_totales,
    sesiones_restantes,
    monto_total
FROM bonos
WHERE id = '596991a0-e65a-4cdd-b0b8-b05cb65abaf5';
