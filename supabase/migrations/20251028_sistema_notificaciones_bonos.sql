-- =============================================================================
-- SISTEMA DE NOTIFICACIONES AUTOMÁTICAS PARA COORDINADORA
-- =============================================================================
-- Fecha: 2025-10-28
-- Objetivo: Notificar a la coordinadora cuando un bono llega a su última sesión
--
-- Características:
-- ✅ Tabla notificaciones con estructura completa
-- ✅ Notificación automática cuando sesiones_restantes = 1 o 0
-- ✅ Prevención de duplicados (no repetir en los últimos 3 días)
-- ✅ Función auxiliar para insertar notificaciones
-- ✅ Integración con actualizar_bono_por_cita()
-- ✅ RLS para coordinadora
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. TABLA DE NOTIFICACIONES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.notificaciones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Usuario destinatario (coordinadora)
    usuario_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Tipo y contenido
    tipo text NOT NULL DEFAULT 'bono' CHECK (tipo IN ('bono', 'cita', 'pago', 'sistema', 'alerta')),
    titulo text NOT NULL,
    mensaje text NOT NULL,
    
    -- Estado
    leido boolean DEFAULT false,
    leido_at timestamptz,
    
    -- Metadata adicional (paciente_id, bono_id, cita_id, etc.)
    metadata jsonb DEFAULT '{}'::jsonb,
    
    -- Auditoría
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_id ON public.notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leido ON public.notificaciones(leido) WHERE leido = false;
CREATE INDEX IF NOT EXISTS idx_notificaciones_tipo ON public.notificaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created_at ON public.notificaciones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificaciones_metadata_paciente ON public.notificaciones((metadata->>'paciente_id'));
CREATE INDEX IF NOT EXISTS idx_notificaciones_metadata_bono ON public.notificaciones((metadata->>'bono_id'));

COMMENT ON TABLE public.notificaciones IS 'Sistema de notificaciones para coordinadora y terapeutas';
COMMENT ON COLUMN public.notificaciones.tipo IS 'Categoría de la notificación: bono, cita, pago, sistema, alerta';
COMMENT ON COLUMN public.notificaciones.metadata IS 'Información adicional en JSON: paciente_id, bono_id, sesiones_restantes, etc.';

-- =============================================================================
-- 2. FUNCIÓN AUXILIAR - Crear notificación para coordinadora
-- =============================================================================

CREATE OR REPLACE FUNCTION public.crear_notificacion_bono(
    p_paciente_id uuid,
    p_bono_id uuid,
    p_sesiones_restantes integer,
    p_sesiones_totales integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_coordinadora_id uuid;
    v_paciente_nombre text;
    v_titulo text;
    v_mensaje text;
    v_existe_reciente boolean;
BEGIN
    -- Obtener ID de la coordinadora (primer usuario con rol 'coordinadora')
    SELECT p.id INTO v_coordinadora_id
    FROM public.profiles p
    WHERE p.rol = 'coordinadora' OR p.rol = 'coordinador'
    LIMIT 1;
    
    -- Si no hay coordinadora, salir silenciosamente
    IF v_coordinadora_id IS NULL THEN
        RETURN;
    END IF;
    
    -- Obtener nombre del paciente
    SELECT nombre_completo INTO v_paciente_nombre
    FROM public.pacientes
    WHERE id = p_paciente_id;
    
    -- Verificar si ya existe una notificación similar en los últimos 3 días
    SELECT EXISTS(
        SELECT 1 
        FROM public.notificaciones
        WHERE usuario_id = v_coordinadora_id
        AND tipo = 'bono'
        AND metadata->>'bono_id' = p_bono_id::text
        AND created_at > now() - interval '3 days'
    ) INTO v_existe_reciente;
    
    -- Si ya existe, no duplicar
    IF v_existe_reciente THEN
        RETURN;
    END IF;
    
    -- Construir título y mensaje según sesiones restantes
    IF p_sesiones_restantes = 0 THEN
        v_titulo := '🔴 Bono agotado - ' || COALESCE(v_paciente_nombre, 'Paciente');
        v_mensaje := 'El bono de ' || COALESCE(v_paciente_nombre, 'este paciente') || 
                     ' (' || p_sesiones_totales || ' sesiones) se ha agotado completamente. ' ||
                     'Considerar crear renovación o confirmar nuevo pago.';
    ELSIF p_sesiones_restantes = 1 THEN
        v_titulo := '⚠️ Última sesión - ' || COALESCE(v_paciente_nombre, 'Paciente');
        v_mensaje := 'El bono de ' || COALESCE(v_paciente_nombre, 'este paciente') || 
                     ' está en su última sesión (1/' || p_sesiones_totales || '). ' ||
                     'Considerar renovación próximamente.';
    ELSE
        -- Por si acaso, aunque normalmente solo se llama con 0 o 1
        RETURN;
    END IF;
    
    -- Insertar la notificación
    INSERT INTO public.notificaciones (
        usuario_id,
        tipo,
        titulo,
        mensaje,
        metadata,
        leido
    ) VALUES (
        v_coordinadora_id,
        'bono',
        v_titulo,
        v_mensaje,
        jsonb_build_object(
            'paciente_id', p_paciente_id,
            'bono_id', p_bono_id,
            'sesiones_restantes', p_sesiones_restantes,
            'sesiones_totales', p_sesiones_totales,
            'urgencia', CASE WHEN p_sesiones_restantes = 0 THEN 'alta' ELSE 'media' END
        ),
        false
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error pero no interrumpir el flujo principal
        RAISE WARNING 'Error al crear notificación de bono: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION public.crear_notificacion_bono IS 'Crea una notificación para la coordinadora cuando un bono está por agotarse (1 o 0 sesiones)';

-- =============================================================================
-- 3. ACTUALIZAR FUNCIÓN actualizar_bono_por_cita() 
-- =============================================================================
-- Modificar la función existente para incluir la lógica de notificaciones

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
            WHEN sesiones_restantes - 1 <= 0 THEN 'agotado'::text
            ELSE estado::text
        END,
        updated_at = now()
    WHERE id = v_cita.bono_id
    RETURNING sesiones_restantes INTO v_sesiones_despues;
    
    -- Registrar el movimiento en la tabla de auditoría
    INSERT INTO public.movimientos_bonos (
        bono_id,
        cita_id,
        paciente_id,
        terapeuta_id,
        tipo_movimiento,
        sesiones_antes,
        sesiones_despues,
        motivo,
        metadata,
        created_by
    ) VALUES (
        v_cita.bono_id,
        v_cita.id,
        v_cita.paciente_id,
        v_cita.terapeuta_id,
        'descuento',
        v_sesiones_antes,
        v_sesiones_despues,
        'Descuento automático por cita completada',
        jsonb_build_object(
            'fecha_cita', v_cita.fecha_cita,
            'estado_cita', v_cita.estado
        ),
        v_user_id
    );
    
    -- Marcar la cita como descontada
    UPDATE public.citas
    SET 
        sesion_descontada = true,
        consumo_registrado = true,
        updated_at = now()
    WHERE id = p_cita_id;
    
    -- 🔔 NUEVO: Crear notificación si quedan 1 o 0 sesiones
    IF v_sesiones_despues <= 1 THEN
        PERFORM public.crear_notificacion_bono(
            v_cita.paciente_id,
            v_cita.bono_id,
            v_sesiones_despues,
            v_bono.sesiones_totales
        );
    END IF;
    
    -- Construir resultado exitoso
    v_resultado := jsonb_build_object(
        'success', true,
        'message', 'Bono actualizado correctamente',
        'cita_id', p_cita_id,
        'bono_id', v_cita.bono_id,
        'sesiones_antes', v_sesiones_antes,
        'sesiones_despues', v_sesiones_despues,
        'sesiones_descontadas', v_sesiones_antes - v_sesiones_despues,
        'notificacion_enviada', (v_sesiones_despues <= 1)
    );
    
    RETURN v_resultado;
    
EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, devolver información detallada
        RETURN jsonb_build_object(
            'success', false,
            'error', 'error_interno',
            'message', SQLERRM,
            'detail', SQLSTATE
        );
END;
$$;

COMMENT ON FUNCTION public.actualizar_bono_por_cita IS 'Descuenta automáticamente una sesión del bono al completar una cita. Incluye notificación a coordinadora si quedan ≤1 sesiones.';

-- =============================================================================
-- 4. FUNCIÓN RPC - Marcar notificación como leída
-- =============================================================================

CREATE OR REPLACE FUNCTION public.marcar_notificacion_leida(p_notificacion_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_updated boolean;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'no_autenticado'
        );
    END IF;
    
    -- Actualizar solo si pertenece al usuario actual
    UPDATE public.notificaciones
    SET 
        leido = true,
        leido_at = now(),
        updated_at = now()
    WHERE id = p_notificacion_id
    AND usuario_id = v_user_id
    AND leido = false;
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'success', true,
        'updated', v_updated > 0
    );
END;
$$;

-- =============================================================================
-- 5. FUNCIÓN RPC - Marcar todas como leídas
-- =============================================================================

CREATE OR REPLACE FUNCTION public.marcar_todas_notificaciones_leidas()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_count integer;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'no_autenticado'
        );
    END IF;
    
    UPDATE public.notificaciones
    SET 
        leido = true,
        leido_at = now(),
        updated_at = now()
    WHERE usuario_id = v_user_id
    AND leido = false;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'success', true,
        'marcadas', v_count
    );
END;
$$;

-- =============================================================================
-- 6. RLS POLÍTICAS
-- =============================================================================

-- Habilitar RLS
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Política de lectura: Solo el usuario propietario
CREATE POLICY "Usuarios pueden ver sus propias notificaciones"
ON public.notificaciones
FOR SELECT
USING (usuario_id = auth.uid());

-- Política de actualización: Solo el usuario propietario puede marcar como leída
CREATE POLICY "Usuarios pueden actualizar sus propias notificaciones"
ON public.notificaciones
FOR UPDATE
USING (usuario_id = auth.uid())
WITH CHECK (usuario_id = auth.uid());

-- Política de inserción: Solo funciones SECURITY DEFINER
CREATE POLICY "Solo sistema puede crear notificaciones"
ON public.notificaciones
FOR INSERT
WITH CHECK (false);  -- Nadie puede insertar directamente desde el cliente

-- Política de eliminación: Usuarios pueden eliminar sus notificaciones
CREATE POLICY "Usuarios pueden eliminar sus propias notificaciones"
ON public.notificaciones
FOR DELETE
USING (usuario_id = auth.uid());

-- =============================================================================
-- 7. FUNCIÓN RPC - Obtener contador de notificaciones no leídas
-- =============================================================================

CREATE OR REPLACE FUNCTION public.contar_notificaciones_no_leidas()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_count integer;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*)::integer INTO v_count
    FROM public.notificaciones
    WHERE usuario_id = v_user_id
    AND leido = false;
    
    RETURN COALESCE(v_count, 0);
END;
$$;

COMMENT ON FUNCTION public.contar_notificaciones_no_leidas IS 'Retorna el número de notificaciones no leídas del usuario actual';

COMMIT;
