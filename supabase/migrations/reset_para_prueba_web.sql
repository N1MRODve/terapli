-- ============================================================================
-- RESET FINAL: Preparar bono para prueba desde la aplicación web
-- ============================================================================
-- Volver el bono de Dieter Lorenzo a estado: activo pero no pagado

UPDATE bonos
SET 
    pagado = false,
    fecha_pago = NULL,
    metodo_pago = NULL,
    pagado_por = NULL
WHERE id = '596991a0-e65a-4cdd-b0b8-b05cb65abaf5';

-- Verificar estado final
SELECT 
    id,
    estado,
    pagado,
    fecha_pago,
    metodo_pago,
    sesiones_totales,
    sesiones_restantes,
    monto_total
FROM bonos
WHERE id = '596991a0-e65a-4cdd-b0b8-b05cb65abaf5';

-- También ver todos los bonos para referencia
SELECT 
    b.id,
    p.nombre_completo as paciente,
    b.estado,
    b.pagado,
    b.sesiones_totales,
    b.sesiones_restantes,
    b.monto_total
FROM bonos b
JOIN pacientes p ON p.id = b.paciente_id
ORDER BY b.created_at DESC;
