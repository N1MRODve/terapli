-- ============================================================================
-- VERIFICACIÓN: Estructura de sesiones y bonos para métricas financieras
-- ============================================================================
-- Este archivo verifica qué columnas están disponibles para calcular
-- las métricas financieras en el panel del terapeuta

-- 1. Ver estructura de la tabla sesiones
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'sesiones'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ver estructura de la tabla bonos
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'bonos'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Ver una sesión de ejemplo con su bono relacionado
SELECT 
    s.id as sesion_id,
    s.fecha,
    s.estado,
    s.bono_id,
    b.monto_total as bono_monto_total,
    b.sesiones_totales as bono_sesiones_totales,
    b.pagado as bono_pagado,
    b.fecha_pago as bono_fecha_pago,
    b.metodo_pago as bono_metodo_pago
FROM sesiones s
LEFT JOIN bonos b ON s.bono_id = b.id
LIMIT 5;
