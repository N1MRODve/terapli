-- ============================================================================
-- MIGRACIÓN: Soporte para citas en horario excepcional
-- ============================================================================
-- Fecha: 4 de enero de 2026
-- Problema: A veces la terapeuta agenda citas fuera de su horario habitual
--           como casos especiales. Estas citas no deben contar para la
--           tasa de ocupación.
-- Solución:
--   1. Añadir campo es_horario_excepcional a citas
--   2. Añadir campo motivo_excepcional para documentar la razón
--   3. Actualizar vista para incluir estos campos
-- ============================================================================

-- Paso 1: Añadir columna es_horario_excepcional a citas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'citas'
        AND column_name = 'es_horario_excepcional'
    ) THEN
        ALTER TABLE public.citas ADD COLUMN es_horario_excepcional BOOLEAN DEFAULT false;
        COMMENT ON COLUMN public.citas.es_horario_excepcional IS
            'Indica si la cita está fuera del horario habitual del terapeuta. No cuenta para ocupación.';
        RAISE NOTICE '✅ Columna es_horario_excepcional agregada a citas';
    ELSE
        RAISE NOTICE 'ℹ️ Columna es_horario_excepcional ya existe';
    END IF;
END $$;

-- Paso 2: Añadir columna motivo_excepcional para documentar la razón
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'citas'
        AND column_name = 'motivo_excepcional'
    ) THEN
        ALTER TABLE public.citas ADD COLUMN motivo_excepcional TEXT;
        COMMENT ON COLUMN public.citas.motivo_excepcional IS
            'Razón por la cual la cita se agendó fuera del horario habitual';
        RAISE NOTICE '✅ Columna motivo_excepcional agregada a citas';
    ELSE
        RAISE NOTICE 'ℹ️ Columna motivo_excepcional ya existe';
    END IF;
END $$;

-- Paso 3: Actualizar la vista vista_agenda_terapeutas para incluir los nuevos campos
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
    -- Campos de horario excepcional
    COALESCE(c.es_horario_excepcional, false) as es_horario_excepcional,
    c.motivo_excepcional,
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
    b.pagado as bono_pagado,
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
    -- Estado de pago calculado
    CASE
        WHEN b.id IS NOT NULL AND b.pagado = true THEN 'cobrado'
        WHEN b.id IS NOT NULL AND b.pagado = false THEN 'por_cobrar_bono'
        WHEN b.id IS NULL AND c.estado_pago = 'pagado' THEN 'cobrado'
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
- es_horario_excepcional: indica si la cita está fuera del horario habitual (no cuenta para ocupación)
- motivo_excepcional: razón de la cita excepcional
- bono_pagado: indica si el bono asociado está pagado
- estado_financiero: clasificación automática de cobrado/por_cobrar';

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Migración completada:';
    RAISE NOTICE '   - Campo es_horario_excepcional añadido a citas';
    RAISE NOTICE '   - Campo motivo_excepcional añadido a citas';
    RAISE NOTICE '   - Vista vista_agenda_terapeutas actualizada';
END $$;
