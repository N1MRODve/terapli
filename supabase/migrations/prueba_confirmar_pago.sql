-- ============================================================================
-- PRUEBA: Confirmar pago del bono de Dieter Lorenzo
-- ============================================================================

-- Ejecutar la función para confirmar el pago
SELECT public.confirmar_pago_bono(
    '596991a0-e65a-4cdd-b0b8-b05cb65abaf5'::uuid,  -- ID del bono de Dieter
    'transferencia',                                  -- Método de pago
    auth.uid()                                        -- Usuario que confirma (tú)
);

-- Verificar que se actualizó correctamente
SELECT 
    id,
    paciente_id,
    estado,
    pagado,
    fecha_pago,
    metodo_pago,
    sesiones_totales,
    sesiones_restantes,
    monto_total
FROM bonos
WHERE id = '596991a0-e65a-4cdd-b0b8-b05cb65abaf5';
