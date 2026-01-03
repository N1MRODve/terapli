-- ============================================================================
-- FIX: Añadir campo bono_pagado a vista_agenda_terapeutas
-- ============================================================================
-- Fecha: 4 de enero de 2026
-- Problema: La vista no incluía el campo pagado del bono, necesario para
--           calcular correctamente las métricas financieras (cobrado vs por cobrar)
-- Solución: Añadir b.pagado as bono_pagado y campos adicionales de pago
-- ============================================================================

DROP VIEW IF EXISTS public.vista_agenda_terapeutas CASCADE;

CREATE VIEW public.vista_agenda_terapeutas AS
SELECT
    c.id as cita_id,
    p.id as paciente_id,
    t.id as terapeuta_id,
    b.id as bono_id,
    c.fecha_cita,
    c.hora_inicio,
    c.hora_fin,
    c.duracion_minutos,
    c.modalidad,
    c.estado,
    c.observaciones,
    c.notas_terapeuta,
    c.enlace_videollamada,
    c.ubicacion,
    c.descontar_de_bono,
    c.sesion_descontada,
    c.recordatorio_enviado,
    c.metadata as cita_metadata,
    -- Campos de pago de la cita
    c.estado_pago as cita_estado_pago,
    c.metodo_pago as cita_metodo_pago,
    -- Datos del paciente
    COALESCE(
        NULLIF(TRIM(p.nombre_completo), ''),
        NULLIF(TRIM(p.metadata->>'nombre_completo'), ''),
        NULLIF(TRIM(p.metadata->>'nombre'), ''),
        p.email
    ) as paciente_nombre,
    p.email as paciente_email,
    p.telefono as paciente_telefono,
    -- Datos del terapeuta
    t.nombre_completo as terapeuta_nombre,
    t.email as terapeuta_email,
    t.especialidad as terapeuta_especialidad,
    -- Datos del bono
    b.sesiones_totales as bono_sesiones_totales,
    b.sesiones_restantes as bono_sesiones_restantes,
    (b.sesiones_totales - b.sesiones_restantes) as bono_sesiones_usadas,
    b.tipo as bono_tipo,
    b.estado::text as bono_estado,
    b.pagado as bono_pagado,  -- NUEVO: Campo crítico para cálculos financieros
    b.monto_total as bono_monto_total,
    b.numero_renovacion as bono_numero_renovacion,
    -- Clasificaciones y alertas
    CASE
        WHEN c.fecha_cita < CURRENT_DATE THEN 'pasada'
        WHEN c.fecha_cita = CURRENT_DATE THEN 'hoy'
        WHEN c.fecha_cita = CURRENT_DATE + INTERVAL '1 day' THEN 'manana'
        ELSE 'futura'
    END as clasificacion_temporal,
    (c.fecha_cita - CURRENT_DATE)::integer as dias_restantes,
    CASE
        WHEN b.id IS NULL THEN 'sin_bono'
        WHEN b.estado = 'activo' AND b.sesiones_restantes > 0 THEN 'bono_activo'
        WHEN b.estado = 'activo' AND b.sesiones_restantes = 0 THEN 'bono_agotado'
        WHEN b.estado = 'agotado' THEN 'bono_agotado'
        WHEN b.estado = 'vencido' THEN 'bono_caducado'
        ELSE 'sin_bono'
    END as alerta_bono,
    -- Estado de pago calculado: determina si la sesión está cobrada o por cobrar
    CASE
        -- Si tiene bono y el bono está pagado -> cobrado
        WHEN b.id IS NOT NULL AND b.pagado = true THEN 'cobrado'
        -- Si tiene bono pero no pagado -> por cobrar (bono pendiente)
        WHEN b.id IS NOT NULL AND b.pagado = false THEN 'por_cobrar_bono'
        -- Si no tiene bono pero la cita tiene estado_pago = 'pagado' -> cobrado
        WHEN b.id IS NULL AND c.estado_pago = 'pagado' THEN 'cobrado'
        -- Si no tiene bono y no está pagado -> por cobrar (sesión suelta)
        ELSE 'por_cobrar_suelta'
    END as estado_financiero,
    c.created_at,
    c.updated_at,
    c.created_by
FROM public.citas c
INNER JOIN public.pacientes p ON c.paciente_id = p.id
INNER JOIN public.terapeutas t ON c.terapeuta_id = t.id
LEFT JOIN public.bonos b ON c.bono_id = b.id;

-- Grants
GRANT SELECT ON public.vista_agenda_terapeutas TO authenticated;

COMMENT ON VIEW public.vista_agenda_terapeutas IS
'Vista consolidada de la agenda de terapeutas. Incluye:
- Datos de cita, paciente, terapeuta y bono
- bono_pagado: indica si el bono asociado está pagado (crítico para finanzas)
- estado_financiero: clasificación automática de cobrado/por_cobrar
- Campos de metadata de citas para acceder a precio_sesion, metodo_pago, etc.';
