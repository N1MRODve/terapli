-- ============================================================================
-- CREAR VISTA: Sesiones con información de pago de bonos
-- ============================================================================
-- Esta vista facilita a los terapeutas ver el estado de pago de cada sesión

-- Primero, eliminar la vista si existe
DROP VIEW IF EXISTS public.vista_sesiones_terapeuta CASCADE;

-- Crear vista con información completa de sesiones y estado de pago
CREATE OR REPLACE VIEW public.vista_sesiones_terapeuta AS
SELECT 
    s.id,
    s.paciente_id,
    s.terapeuta_id,
    s.bono_id,
    s.fecha,
    s.hora_inicio,
    s.hora_fin,
    s.estado,
    s.modalidad,
    s.notas_terapeuta,
    s.created_at,
    s.updated_at,
    
    -- Información del paciente
    p.nombre_completo as paciente_nombre,
    p.email as paciente_email,
    p.telefono as paciente_telefono,
    
    -- Información del terapeuta
    t.nombre as terapeuta_nombre,
    
    -- Información del bono y estado de pago
    b.sesiones_totales as bono_sesiones_totales,
    b.sesiones_restantes as bono_sesiones_restantes,
    b.monto_total as bono_monto_total,
    b.tipo_bono,
    b.estado as bono_estado,
    b.pagado as bono_pagado,
    b.fecha_pago as bono_fecha_pago,
    b.metodo_pago as bono_metodo_pago,
    
    -- Cálculo del precio por sesión
    CASE 
        WHEN b.sesiones_totales > 0 THEN 
            ROUND(b.monto_total / b.sesiones_totales, 2)
        ELSE 
            45.00  -- Precio por defecto si no hay bono
    END as precio_sesion,
    
    -- Cálculo del monto para el terapeuta (70% del precio)
    CASE 
        WHEN b.sesiones_totales > 0 THEN 
            ROUND((b.monto_total / b.sesiones_totales) * 0.7, 2)
        ELSE 
            31.50  -- 70% del precio por defecto
    END as monto_terapeuta,
    
    -- Indicador si el bono está pagado
    COALESCE(b.pagado, false) as esta_pagado,
    
    -- Categorización financiera
    CASE 
        -- Si no tiene bono, es pago individual (no gestionado aquí)
        WHEN s.bono_id IS NULL THEN 'sin_bono'
        -- Si tiene bono y está pagado, es ingreso confirmado
        WHEN b.pagado = true THEN 'confirmado'
        -- Si tiene bono pero no está pagado, es ingreso pendiente
        WHEN b.pagado = false THEN 'pendiente'
        ELSE 'sin_bono'
    END as categoria_financiera

FROM sesiones s
LEFT JOIN pacientes p ON s.paciente_id = p.id
LEFT JOIN terapeutas t ON s.terapeuta_id = t.id
LEFT JOIN bonos b ON s.bono_id = b.id;

-- Comentario de la vista
COMMENT ON VIEW public.vista_sesiones_terapeuta IS 
    'Vista que combina sesiones con información de pago de bonos para facilitar el cálculo de métricas financieras del terapeuta';

-- Dar permisos de lectura a terapeutas y coordinadoras
GRANT SELECT ON public.vista_sesiones_terapeuta TO authenticated;

-- Agregar política RLS (heredará de las tablas base, pero la especificamos explícitamente)
ALTER VIEW public.vista_sesiones_terapeuta SET (security_barrier = true);

-- Nota: Las vistas en PostgreSQL heredan automáticamente las políticas RLS de las tablas base
-- pero podemos crear políticas adicionales si es necesario
