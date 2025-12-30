-- ============================================================================
-- MIGRACIÓN: Corregir search_path de funciones
-- ============================================================================
-- Fecha: 30 de diciembre de 2025
-- Objetivo: Añadir search_path fijo a todas las funciones para seguridad
-- ============================================================================

DO $$
DECLARE
    func_record RECORD;
    alter_sql TEXT;
BEGIN
    -- Lista de funciones a actualizar (nombre, argumentos)
    FOR func_record IN
        SELECT p.proname as name,
               pg_get_function_identity_arguments(p.oid) as args,
               p.oid
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.proname IN (
            'cleanup_expired_import_configs',
            'update_import_configs_updated_at',
            'get_my_terapeuta_id',
            'is_terapeuta',
            'calculate_perfil_completo',
            'update_paciente_perfil_completo',
            'fn_registrar_pago_sesion',
            'update_updated_at_column',
            'is_staff',
            'fn_set_precio_cita',
            'fn_crear_bono_desde_plantilla',
            'fn_asignar_bono_masivo',
            'fn_facturas_updated_at',
            'fn_obtener_proximo_numero_factura',
            'fn_crear_factura',
            'fn_anular_factura',
            'fn_auto_completar_citas_pasadas',
            'fn_cron_auto_completar_citas',
            'fn_obtener_citas_sin_completar',
            'fn_obtener_precio_sesion',
            'fn_sync_sesiones_bono',
            'fn_actualizar_precios_citas_paciente',
            'fn_crear_bono_migracion',
            'get_user_consulta_id',
            'user_has_role_in_consulta',
            'user_has_any_role_in_consulta'
        )
        -- Solo funciones que NO tienen search_path configurado
        AND (p.proconfig IS NULL OR NOT ('search_path=public' = ANY(p.proconfig)))
    LOOP
        -- Construir y ejecutar ALTER FUNCTION
        IF func_record.args = '' THEN
            alter_sql := format('ALTER FUNCTION public.%I() SET search_path = public', func_record.name);
        ELSE
            alter_sql := format('ALTER FUNCTION public.%I(%s) SET search_path = public', func_record.name, func_record.args);
        END IF;

        EXECUTE alter_sql;
        RAISE NOTICE 'Actualizada: %', func_record.name;
    END LOOP;
END $$;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
    total_funcs INTEGER;
    fixed_funcs INTEGER;
BEGIN
    -- Contar funciones totales en public
    SELECT COUNT(*) INTO total_funcs
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';

    -- Contar funciones con search_path fijo
    SELECT COUNT(*) INTO fixed_funcs
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proconfig IS NOT NULL
    AND 'search_path=public' = ANY(p.proconfig);

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SEARCH_PATH CORREGIDO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Funciones con search_path fijo: %', fixed_funcs;
    RAISE NOTICE '========================================';
END $$;
