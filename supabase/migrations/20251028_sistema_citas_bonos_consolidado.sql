-- =============================================================================
-- SISTEMA DE GESTIÓN DE CITAS Y BONOS - CONSOLIDADO Y ROBUSTO
-- =============================================================================
-- Fecha: 2025-10-28
-- Objetivo: Sistema completo para gestionar citas con descuento automático
--           de sesiones de bonos, evitando duplicaciones y garantizando 
--           trazabilidad completa.
--
-- Características:
-- ✅ Descuento automático al marcar cita como 'completada'
-- ✅ Prevención de doble descuento (idempotencia)
-- ✅ Trazabilidad completa con tabla de movimientos
-- ✅ Seguridad con RLS y validación de roles
-- ✅ Funciones RPC para frontend
-- ✅ Manejo robusto de errores y edge cases
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. TABLA DE TRAZABILIDAD - Logging de movimientos de bonos
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.movimientos_bonos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    bono_id uuid NOT NULL REFERENCES public.bonos(id) ON DELETE CASCADE,
    cita_id uuid REFERENCES public.citas(id) ON DELETE SET NULL,
    paciente_id uuid NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    terapeuta_id uuid REFERENCES public.terapeutas(id) ON DELETE SET NULL,
    
    -- Datos del movimiento
    tipo_movimiento text NOT NULL CHECK (tipo_movimiento IN ('descuento', 'reembolso', 'ajuste', 'creacion', 'cancelacion')),
    sesiones_antes integer NOT NULL,
    sesiones_despues integer NOT NULL,
    sesiones_modificadas integer GENERATED ALWAYS AS (sesiones_antes - sesiones_despues) STORED,
    
    -- Contexto
    motivo text,
    metadata jsonb DEFAULT '{}',
    
    -- Auditoría
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    
    -- Constraints
    CONSTRAINT check_sesiones_validas CHECK (sesiones_antes >= 0 AND sesiones_despues >= 0)
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_movimientos_bonos_bono_id ON public.movimientos_bonos(bono_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_bonos_cita_id ON public.movimientos_bonos(cita_id) WHERE cita_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_movimientos_bonos_paciente_id ON public.movimientos_bonos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_bonos_fecha ON public.movimientos_bonos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_movimientos_bonos_tipo ON public.movimientos_bonos(tipo_movimiento);

COMMENT ON TABLE public.movimientos_bonos IS 'Registro completo de todos los movimientos y cambios en bonos para trazabilidad';
COMMENT ON COLUMN public.movimientos_bonos.tipo_movimiento IS 'Tipo de movimiento: descuento (uso de sesión), reembolso, ajuste manual, creación, cancelación';
COMMENT ON COLUMN public.movimientos_bonos.sesiones_modificadas IS 'Diferencia calculada automáticamente (positivo = descuento, negativo = reembolso)';

-- =============================================================================
-- 2. FUNCIÓN PRINCIPAL - Actualizar bono por cita
-- =============================================================================

CREATE OR REPLACE FUNCTION public.actualizar_bono_por_cita(p_cita_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_cita record;
    v_bono record;
    v_sesiones_antes integer;
    v_sesiones_despues integer;
    v_resultado jsonb;
    v_user_id uuid;
BEGIN
    -- Obtener ID del usuario actual
    v_user_id := auth.uid();
    
    -- Validar que el usuario esté autenticado
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'No autenticado';
    END IF;
    
    -- Obtener información de la cita con lock
    SELECT 
        c.id,
        c.bono_id,
        c.estado,
        c.sesion_descontada,
        c.consumo_registrado,
        c.paciente_id,
        c.terapeuta_id,
        c.fecha_cita,
        c.descontar_de_bono
    INTO v_cita
    FROM public.citas c
    WHERE c.id = p_cita_id
    FOR UPDATE;
    
    -- Validar que la cita existe
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'cita_no_encontrada',
            'message', 'La cita no existe'
        );
    END IF;
    
    -- Validar que tiene bono asociado
    IF v_cita.bono_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'sin_bono',
            'message', 'La cita no tiene un bono asociado'
        );
    END IF;
    
    -- Validar que la cita está marcada como completada
    IF v_cita.estado::text != 'completada' AND v_cita.estado::text != 'realizada' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'estado_invalido',
            'message', 'La cita debe estar en estado completada o realizada',
            'estado_actual', v_cita.estado
        );
    END IF;
    
    -- IDEMPOTENCIA: Verificar si ya se descontó
    IF v_cita.sesion_descontada = true OR v_cita.consumo_registrado = true THEN
        RETURN jsonb_build_object(
            'success', true,
            'warning', 'ya_descontada',
            'message', 'La sesión ya fue descontada previamente',
            'cita_id', p_cita_id,
            'bono_id', v_cita.bono_id
        );
    END IF;
    
    -- Obtener información del bono con lock
    SELECT 
        b.id,
        b.sesiones_restantes,
        b.sesiones_totales,
        b.estado,
        b.paciente_id
    INTO v_bono
    FROM public.bonos b
    WHERE b.id = v_cita.bono_id
    FOR UPDATE;
    
    -- Validar que el bono existe
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'bono_no_encontrado',
            'message', 'El bono asociado no existe'
        );
    END IF;
    
    -- Validar que el bono está activo
    IF v_bono.estado::text != 'activo' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'bono_no_activo',
            'message', 'El bono no está activo',
            'estado_bono', v_bono.estado
        );
    END IF;
    
    -- Validar que el bono tiene sesiones disponibles
    IF v_bono.sesiones_restantes <= 0 THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'sin_sesiones',
            'message', 'El bono no tiene sesiones disponibles',
            'sesiones_restantes', v_bono.sesiones_restantes
        );
    END IF;
    
    -- Validar que el paciente del bono coincide con el de la cita
    IF v_bono.paciente_id != v_cita.paciente_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'paciente_no_coincide',
            'message', 'El bono pertenece a otro paciente'
        );
    END IF;
    
    -- Guardar sesiones antes del descuento
    v_sesiones_antes := v_bono.sesiones_restantes;
    
    -- DESCUENTO: Actualizar el bono
    UPDATE public.bonos
    SET 
        sesiones_restantes = GREATEST(sesiones_restantes - 1, 0),
        estado = CASE 
            WHEN sesiones_restantes - 1 <= 0 THEN 'completado'::estado_bono
            ELSE estado
        END,
        updated_at = now()
    WHERE id = v_cita.bono_id
    RETURNING sesiones_restantes INTO v_sesiones_despues;
    
    -- Marcar la cita como descontada
    UPDATE public.citas
    SET 
        sesion_descontada = true,
        consumo_registrado = true,
        descontar_de_bono = true,
        updated_at = now()
    WHERE id = p_cita_id;
    
    -- TRAZABILIDAD: Registrar el movimiento
    INSERT INTO public.movimientos_bonos (
        bono_id,
        cita_id,
        paciente_id,
        terapeuta_id,
        tipo_movimiento,
        sesiones_antes,
        sesiones_despues,
        motivo,
        created_by,
        metadata
    ) VALUES (
        v_cita.bono_id,
        p_cita_id,
        v_cita.paciente_id,
        v_cita.terapeuta_id,
        'descuento',
        v_sesiones_antes,
        v_sesiones_despues,
        'Descuento automático por cita completada',
        v_user_id,
        jsonb_build_object(
            'fecha_cita', v_cita.fecha_cita,
            'estado_bono_resultante', CASE 
                WHEN v_sesiones_despues <= 0 THEN 'completado'
                ELSE 'activo'
            END
        )
    );
    
    -- Construir resultado exitoso
    v_resultado := jsonb_build_object(
        'success', true,
        'message', 'Sesión descontada correctamente',
        'cita_id', p_cita_id,
        'bono_id', v_cita.bono_id,
        'sesiones_antes', v_sesiones_antes,
        'sesiones_despues', v_sesiones_despues,
        'sesiones_totales', v_bono.sesiones_totales,
        'bono_completado', v_sesiones_despues <= 0
    );
    
    -- ALERTAS: Agregar advertencias si quedan pocas sesiones
    IF v_sesiones_despues > 0 AND v_sesiones_despues <= 2 THEN
        v_resultado := v_resultado || jsonb_build_object(
            'alerta', true,
            'tipo_alerta', CASE 
                WHEN v_sesiones_despues = 1 THEN 'ultima_sesion'
                ELSE 'pocas_sesiones'
            END,
            'mensaje_alerta', CASE 
                WHEN v_sesiones_despues = 1 THEN '⚠️ Última sesión del bono - Considerar renovación'
                ELSE '⚠️ Quedan solo ' || v_sesiones_despues || ' sesiones - Informar al paciente'
            END
        );
    ELSIF v_sesiones_despues = 0 THEN
        v_resultado := v_resultado || jsonb_build_object(
            'alerta', true,
            'tipo_alerta', 'bono_agotado',
            'mensaje_alerta', '✅ Bono completado - Todas las sesiones consumidas'
        );
    END IF;
    
    -- Log de la operación
    RAISE NOTICE '✅ Sesión descontada: Bono % - Cita % - Sesiones: % → %', 
                 v_cita.bono_id, p_cita_id, v_sesiones_antes, v_sesiones_despues;
    
    RETURN v_resultado;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error al actualizar bono: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'error', 'error_interno',
            'message', SQLERRM
        );
END;
$$;

COMMENT ON FUNCTION public.actualizar_bono_por_cita(uuid) IS 
'Función principal para descontar una sesión del bono cuando una cita se completa. 
Incluye validaciones completas, prevención de doble descuento, y registro de trazabilidad.';

-- =============================================================================
-- 3. TRIGGER AUTOMÁTICO - Ejecutar al completar cita
-- =============================================================================

CREATE OR REPLACE FUNCTION public.trigger_actualizar_bono_por_cita()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_resultado jsonb;
BEGIN
    -- Solo ejecutar si:
    -- 1. El estado cambió a completada/realizada
    -- 2. Tiene bono asociado
    -- 3. No se ha descontado previamente
    IF (NEW.estado::text IN ('completada', 'realizada'))
       AND (OLD.estado IS NULL OR OLD.estado::text NOT IN ('completada', 'realizada'))
       AND NEW.bono_id IS NOT NULL
       AND NEW.sesion_descontada = false
       AND NEW.consumo_registrado = false THEN
        
        -- Ejecutar la función de descuento
        SELECT public.actualizar_bono_por_cita(NEW.id) INTO v_resultado;
        
        -- Si la función actualizó los campos, usar esos valores
        -- (la función ya los actualizó en la BD, pero el trigger puede necesitarlos)
        IF (v_resultado->>'success')::boolean THEN
            NEW.sesion_descontada := true;
            NEW.consumo_registrado := true;
            NEW.descontar_de_bono := true;
            
            RAISE NOTICE 'Trigger: %', v_resultado->>'message';
        ELSE
            RAISE WARNING 'Trigger: Error al descontar - %', v_resultado->>'message';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Eliminar triggers antiguos que puedan causar conflictos
DROP TRIGGER IF EXISTS trigger_descontar_sesion_bono ON public.citas;
DROP TRIGGER IF EXISTS tr_bono_sesion_usada ON public.citas;
DROP TRIGGER IF EXISTS trg_consumir_sesion_por_cita ON public.citas;
DROP TRIGGER IF EXISTS trigger_actualizar_sesiones ON public.citas;
DROP TRIGGER IF EXISTS trg_actualizar_bono_por_cita ON public.citas;

-- Crear el nuevo trigger consolidado
CREATE TRIGGER trg_actualizar_bono_por_cita
    BEFORE UPDATE OF estado
    ON public.citas
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_actualizar_bono_por_cita();

COMMENT ON TRIGGER trg_actualizar_bono_por_cita ON public.citas IS
'Trigger que descuenta automáticamente una sesión del bono cuando la cita se marca como completada o realizada';

-- =============================================================================
-- 4. FUNCIONES RPC PARA FRONTEND
-- =============================================================================

-- Función para marcar cita como completada y descontar sesión
CREATE OR REPLACE FUNCTION public.completar_cita(p_cita_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_user_role text;
    v_resultado jsonb;
BEGIN
    -- Validar autenticación
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'no_autenticado',
            'message', 'Usuario no autenticado'
        );
    END IF;
    
    -- Validar rol (solo terapeutas y coordinadoras)
    SELECT role INTO v_user_role
    FROM public.profiles
    WHERE id = v_user_id;
    
    IF v_user_role NOT IN ('terapeuta', 'coordinadora') THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'sin_permisos',
            'message', 'Solo terapeutas y coordinadoras pueden completar citas'
        );
    END IF;
    
    -- Marcar la cita como completada
    UPDATE public.citas
    SET 
        estado = 'completada'::estado_cita,
        updated_at = now()
    WHERE id = p_cita_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'cita_no_encontrada',
            'message', 'La cita no existe'
        );
    END IF;
    
    -- El trigger se encargará del descuento automático
    -- Retornar éxito
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Cita marcada como completada',
        'cita_id', p_cita_id
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'error_interno',
            'message', SQLERRM
        );
END;
$$;

COMMENT ON FUNCTION public.completar_cita(uuid) IS 
'Marca una cita como completada. El trigger se encarga automáticamente del descuento de sesión del bono.';

-- Función para obtener historial de movimientos de un bono
CREATE OR REPLACE FUNCTION public.obtener_historial_bono(p_bono_id uuid)
RETURNS TABLE (
    id uuid,
    tipo_movimiento text,
    sesiones_antes integer,
    sesiones_despues integer,
    sesiones_modificadas integer,
    motivo text,
    fecha timestamptz,
    cita_id uuid,
    metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.tipo_movimiento,
        m.sesiones_antes,
        m.sesiones_despues,
        m.sesiones_modificadas,
        m.motivo,
        m.created_at,
        m.cita_id,
        m.metadata
    FROM public.movimientos_bonos m
    WHERE m.bono_id = p_bono_id
    ORDER BY m.created_at DESC;
END;
$$;

COMMENT ON FUNCTION public.obtener_historial_bono(uuid) IS 
'Obtiene el historial completo de movimientos de un bono para trazabilidad';

-- Función para verificar estado de bono y citas asociadas
CREATE OR REPLACE FUNCTION public.verificar_bono_citas(p_bono_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_bono record;
    v_citas_completadas integer;
    v_citas_pendientes integer;
    v_resultado jsonb;
BEGIN
    -- Obtener información del bono
    SELECT 
        id,
        sesiones_totales,
        sesiones_restantes,
        estado,
        paciente_id
    INTO v_bono
    FROM public.bonos
    WHERE id = p_bono_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'bono_no_encontrado',
            'message', 'El bono no existe'
        );
    END IF;
    
    -- Contar citas asociadas
    SELECT 
        COUNT(*) FILTER (WHERE estado IN ('completada', 'realizada') AND sesion_descontada = true),
        COUNT(*) FILTER (WHERE estado IN ('pendiente', 'confirmada'))
    INTO v_citas_completadas, v_citas_pendientes
    FROM public.citas
    WHERE bono_id = p_bono_id;
    
    -- Construir resultado
    v_resultado := jsonb_build_object(
        'success', true,
        'bono', jsonb_build_object(
            'id', v_bono.id,
            'sesiones_totales', v_bono.sesiones_totales,
            'sesiones_restantes', v_bono.sesiones_restantes,
            'sesiones_usadas', v_bono.sesiones_totales - v_bono.sesiones_restantes,
            'estado', v_bono.estado,
            'paciente_id', v_bono.paciente_id
        ),
        'citas', jsonb_build_object(
            'completadas', v_citas_completadas,
            'pendientes', v_citas_pendientes,
            'total', v_citas_completadas + v_citas_pendientes
        )
    );
    
    -- Agregar alerta si hay inconsistencias
    IF (v_bono.sesiones_totales - v_bono.sesiones_restantes) != v_citas_completadas THEN
        v_resultado := v_resultado || jsonb_build_object(
            'alerta', true,
            'mensaje_alerta', 'Posible inconsistencia: sesiones usadas no coinciden con citas completadas'
        );
    END IF;
    
    RETURN v_resultado;
END;
$$;

COMMENT ON FUNCTION public.verificar_bono_citas(uuid) IS 
'Verifica el estado de un bono y sus citas asociadas para detectar inconsistencias';

-- =============================================================================
-- 5. POLÍTICAS DE SEGURIDAD (RLS)
-- =============================================================================

-- Habilitar RLS en movimientos_bonos
ALTER TABLE public.movimientos_bonos ENABLE ROW LEVEL SECURITY;

-- Política: Ver movimientos solo de bonos del propio terapeuta o siendo coordinadora
DROP POLICY IF EXISTS select_movimientos_bonos ON public.movimientos_bonos;
CREATE POLICY select_movimientos_bonos ON public.movimientos_bonos
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND (
                -- Coordinadoras pueden ver todo
                p.role = 'coordinadora'
                -- Terapeutas solo sus propios movimientos
                OR (p.role = 'terapeuta' AND terapeuta_id = p.terapeuta_id)
            )
        )
    );

-- Política: No se pueden crear movimientos manualmente (solo via funciones)
DROP POLICY IF EXISTS insert_movimientos_bonos ON public.movimientos_bonos;
CREATE POLICY insert_movimientos_bonos ON public.movimientos_bonos
    FOR INSERT
    WITH CHECK (false);  -- Solo funciones SECURITY DEFINER pueden insertar

-- No permitir UPDATE ni DELETE de movimientos (inmutabilidad)
DROP POLICY IF EXISTS no_update_movimientos_bonos ON public.movimientos_bonos;
CREATE POLICY no_update_movimientos_bonos ON public.movimientos_bonos
    FOR UPDATE
    USING (false);

DROP POLICY IF EXISTS no_delete_movimientos_bonos ON public.movimientos_bonos;
CREATE POLICY no_delete_movimientos_bonos ON public.movimientos_bonos
    FOR DELETE
    USING (false);

-- =============================================================================
-- 6. PERMISOS Y GRANTS
-- =============================================================================

-- Permisos para funciones
GRANT EXECUTE ON FUNCTION public.actualizar_bono_por_cita(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.completar_cita(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_historial_bono(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_bono_citas(uuid) TO authenticated;

-- Permisos para tabla de movimientos
GRANT SELECT ON public.movimientos_bonos TO authenticated;
-- No dar INSERT, UPDATE, DELETE (solo via funciones SECURITY DEFINER)

-- =============================================================================
-- 7. FUNCIÓN DE VERIFICACIÓN E INSTALACIÓN
-- =============================================================================

CREATE OR REPLACE FUNCTION public.verificar_sistema_citas_bonos()
RETURNS TABLE (
    componente text,
    estado text,
    detalles text
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    
    -- Verificar tabla movimientos_bonos
    SELECT 
        'Tabla movimientos_bonos'::text,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'movimientos_bonos'
        ) THEN '✅ Existe' ELSE '❌ No existe' END,
        'Tabla de trazabilidad de movimientos de bonos'::text
    
    UNION ALL
    
    -- Verificar función actualizar_bono_por_cita
    SELECT 
        'Función actualizar_bono_por_cita()'::text,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'actualizar_bono_por_cita'
        ) THEN '✅ Existe' ELSE '❌ No existe' END,
        'Función principal de descuento de sesiones'::text
    
    UNION ALL
    
    -- Verificar trigger
    SELECT 
        'Trigger trg_actualizar_bono_por_cita'::text,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_trigger t
            JOIN pg_class c ON t.tgrelid = c.oid
            WHERE c.relname = 'citas' AND t.tgname = 'trg_actualizar_bono_por_cita'
        ) THEN '✅ Activo' ELSE '❌ No existe' END,
        'Trigger automático para descuento al completar cita'::text
    
    UNION ALL
    
    -- Verificar función RPC completar_cita
    SELECT 
        'Función completar_cita()'::text,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'completar_cita'
        ) THEN '✅ Existe' ELSE '❌ No existe' END,
        'RPC para marcar citas como completadas desde frontend'::text
    
    UNION ALL
    
    -- Verificar columna consumo_registrado
    SELECT 
        'Columna citas.consumo_registrado'::text,
        CASE WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'citas' 
            AND column_name = 'consumo_registrado'
        ) THEN '✅ Existe' ELSE '❌ No existe' END,
        'Columna para prevenir doble descuento'::text
    
    UNION ALL
    
    -- Verificar RLS en movimientos_bonos
    SELECT 
        'RLS movimientos_bonos'::text,
        CASE WHEN EXISTS (
            SELECT 1 FROM pg_class c
            JOIN pg_namespace n ON c.relnamespace = n.oid
            WHERE n.nspname = 'public' AND c.relname = 'movimientos_bonos' 
            AND c.relrowsecurity = true
        ) THEN '✅ Habilitado' ELSE '❌ Deshabilitado' END,
        'Seguridad a nivel de fila para movimientos'::text;
END;
$$;

COMMENT ON FUNCTION public.verificar_sistema_citas_bonos() IS 
'Verifica que todos los componentes del sistema de citas y bonos estén correctamente instalados';

-- =============================================================================
-- 8. MENSAJE FINAL
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ SISTEMA DE CITAS Y BONOS CONSOLIDADO INSTALADO';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Componentes instalados:';
    RAISE NOTICE '   • Tabla movimientos_bonos (trazabilidad completa)';
    RAISE NOTICE '   • Función actualizar_bono_por_cita() (descuento robusto)';
    RAISE NOTICE '   • Trigger automático (descuento al completar cita)';
    RAISE NOTICE '   • Función completar_cita() (RPC para frontend)';
    RAISE NOTICE '   • Función obtener_historial_bono() (consulta movimientos)';
    RAISE NOTICE '   • Función verificar_bono_citas() (detección inconsistencias)';
    RAISE NOTICE '   • Políticas RLS (seguridad y permisos)';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Para verificar la instalación, ejecuta:';
    RAISE NOTICE '   SELECT * FROM public.verificar_sistema_citas_bonos();';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Uso desde el frontend:';
    RAISE NOTICE '   // Marcar cita como completada y descontar sesión';
    RAISE NOTICE '   const { data, error } = await supabase.rpc(''completar_cita'', {';
    RAISE NOTICE '     p_cita_id: ''uuid-de-la-cita''';
    RAISE NOTICE '   });';
    RAISE NOTICE '';
    RAISE NOTICE '   // Ver historial de un bono';
    RAISE NOTICE '   const { data, error } = await supabase.rpc(''obtener_historial_bono'', {';
    RAISE NOTICE '     p_bono_id: ''uuid-del-bono''';
    RAISE NOTICE '   });';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Características:';
    RAISE NOTICE '   ✓ Descuento automático al completar citas';
    RAISE NOTICE '   ✓ Prevención de doble descuento (idempotencia)';
    RAISE NOTICE '   ✓ Trazabilidad completa con movimientos_bonos';
    RAISE NOTICE '   ✓ Validaciones exhaustivas de seguridad';
    RAISE NOTICE '   ✓ Alertas automáticas (pocas sesiones, bono agotado)';
    RAISE NOTICE '   ✓ Manejo robusto de errores y edge cases';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;

COMMIT;
