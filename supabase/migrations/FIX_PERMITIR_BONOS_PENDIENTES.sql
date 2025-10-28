-- ============================================================================
-- FIX: Permitir usar bonos en estado 'pendiente' además de 'activo'
-- ============================================================================
-- Problema: El trigger validar_bono_cita solo permitía bonos en estado 'activo'
-- Solución: Permitir también bonos en estado 'pendiente' para que las citas 
--           creadas al registrar pacientes puedan usar el bono inicial
-- ============================================================================

-- Reemplazar la función de validación
CREATE OR REPLACE FUNCTION public.validar_bono_cita()
RETURNS TRIGGER AS $$
DECLARE
    bono_record RECORD;
BEGIN
    -- Solo validar si hay un bono_id asignado
    IF NEW.bono_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Obtener información del bono
    SELECT * INTO bono_record
    FROM public.bonos
    WHERE id = NEW.bono_id;
    
    -- Validar que el bono exista
    IF bono_record IS NULL THEN
        RAISE EXCEPTION 'El bono especificado no existe'
            USING ERRCODE = 'foreign_key_violation';
    END IF;
    
    -- Validar que el bono esté activo O pendiente (permitir ambos estados)
    IF bono_record.estado NOT IN ('activo', 'pendiente') THEN
        RAISE EXCEPTION 'El bono no está disponible. Estado actual: %', bono_record.estado
            USING ERRCODE = 'check_violation',
                  HINT = 'Solo se pueden usar bonos en estado activo o pendiente.';
    END IF;
    
    -- Validar que tenga sesiones disponibles
    IF bono_record.sesiones_restantes <= 0 THEN
        RAISE EXCEPTION 'El bono no tiene sesiones disponibles (% sesiones restantes)', 
                       bono_record.sesiones_restantes
            USING ERRCODE = 'check_violation',
                  HINT = 'El paciente debe renovar o comprar un nuevo bono.';
    END IF;
    
    -- Validar que el bono pertenezca al paciente de la cita
    IF bono_record.paciente_id != NEW.paciente_id THEN
        RAISE EXCEPTION 'El bono no pertenece al paciente de la cita'
            USING ERRCODE = 'foreign_key_violation';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Función validar_bono_cita actualizada para permitir bonos en estado pendiente';
END $$;
