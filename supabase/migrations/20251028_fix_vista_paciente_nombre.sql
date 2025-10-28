-- ============================================================================
-- FIX: Corregir obtención del nombre del paciente en vista_agenda_terapeutas
-- ============================================================================
-- Fecha: 28 de octubre de 2025
-- Problema: La vista mostraba el email en lugar del nombre del paciente
-- Solución: Usar p.nombre_completo en lugar de metadata

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
    COALESCE(
        NULLIF(TRIM(p.nombre_completo), ''),
        NULLIF(TRIM(p.metadata->>'nombre_completo'), ''),
        NULLIF(TRIM(p.metadata->>'nombre'), ''),
        p.email
    ) as paciente_nombre,
    p.email as paciente_email,
    p.telefono as paciente_telefono,
    t.nombre_completo as terapeuta_nombre,
    t.email as terapeuta_email,
    t.especialidad as terapeuta_especialidad,
    b.sesiones_totales as bono_sesiones_totales,
    b.sesiones_restantes as bono_sesiones_restantes,
    (b.sesiones_totales - b.sesiones_restantes) as bono_sesiones_usadas,
    b.tipo as bono_tipo,
    b.estado::text as bono_estado,
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
    c.created_at,
    c.updated_at,
    c.created_by
FROM public.citas c
INNER JOIN public.pacientes p ON c.paciente_id = p.id
INNER JOIN public.terapeutas t ON c.terapeuta_id = t.id
LEFT JOIN public.bonos b ON c.bono_id = b.id;
