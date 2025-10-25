-- ============================================================================
-- TEST DE POLÍTICAS RLS PARA EL USUARIO karemeyde@gmail.com
-- ============================================================================
-- Este script prueba si las políticas RLS permiten el acceso correcto
-- ============================================================================

-- Información del usuario
DO $$
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Testing RLS para: karemeyde@gmail.com';
    RAISE NOTICE 'UUID: d618017c-ea73-4d69-af50-32afb824f407';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- 1. Verificar que RLS está habilitado
-- ============================================================================
SELECT 
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS HABILITADO'
        ELSE '❌ RLS DESHABILITADO'
    END as estado_rls,
    tablename,
    schemaname
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Ver todas las políticas activas
-- ============================================================================
SELECT 
    '📋 Política: ' || policyname as politica,
    CASE cmd
        WHEN 'SELECT' THEN '👁️  Lectura (SELECT)'
        WHEN 'UPDATE' THEN '✏️  Actualización (UPDATE)'
        WHEN 'INSERT' THEN '➕ Inserción (INSERT)'
        WHEN 'DELETE' THEN '🗑️  Eliminación (DELETE)'
        ELSE cmd::text
    END as operacion,
    CASE 
        WHEN permissive = 'PERMISSIVE' THEN '✅ Permisivo'
        ELSE '⚠️ Restrictivo'
    END as tipo
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- 3. Probar SELECT como usuario autenticado (la app usa esta consulta)
-- ============================================================================
-- Esta consulta debería funcionar si las políticas RLS están bien configuradas
SELECT 
    '✅ TEST SELECT propio perfil' as test,
    id,
    email,
    nombre,
    rol
FROM public.profiles
WHERE id = 'd618017c-ea73-4d69-af50-32afb824f407'::uuid;

-- 4. Verificar que el perfil existe
-- ============================================================================
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ El perfil EXISTE'
        ELSE '❌ El perfil NO EXISTE'
    END as estado,
    COUNT(*) as cantidad
FROM public.profiles
WHERE id = 'd618017c-ea73-4d69-af50-32afb824f407'::uuid;

-- 5. Ver detalles completos del perfil
-- ============================================================================
SELECT 
    '📝 Detalles del perfil' as seccion,
    p.*
FROM public.profiles p
WHERE p.email = 'karemeyde@gmail.com';

-- 6. Verificar si hay múltiples perfiles (no debería haber)
-- ============================================================================
SELECT 
    CASE 
        WHEN COUNT(*) = 1 THEN '✅ Un solo perfil (correcto)'
        WHEN COUNT(*) = 0 THEN '❌ Sin perfil (error)'
        ELSE '⚠️ Múltiples perfiles (error)'
    END as estado,
    COUNT(*) as total_perfiles
FROM public.profiles
WHERE email = 'karemeyde@gmail.com';

-- 7. Verificar coincidencia entre auth.users y profiles
-- ============================================================================
SELECT 
    'Comparación auth.users vs profiles' as seccion,
    u.id as auth_user_id,
    u.email as auth_email,
    u.created_at as auth_created,
    p.id as profile_id,
    p.email as profile_email,
    p.nombre as profile_nombre,
    p.rol as profile_rol,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ Sincronizado'
        ELSE '❌ Falta perfil'
    END as estado
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'karemeyde@gmail.com';

-- 8. Test de la función get_user_role
-- ============================================================================
SELECT 
    '🔍 Test función get_user_role' as test,
    public.get_user_role('d618017c-ea73-4d69-af50-32afb824f407'::uuid) as rol_obtenido,
    (
        SELECT rol FROM public.profiles 
        WHERE id = 'd618017c-ea73-4d69-af50-32afb824f407'::uuid
    ) as rol_esperado,
    CASE 
        WHEN public.get_user_role('d618017c-ea73-4d69-af50-32afb824f407'::uuid) = 
             (SELECT rol FROM public.profiles WHERE id = 'd618017c-ea73-4d69-af50-32afb824f407'::uuid)
        THEN '✅ Función correcta'
        ELSE '❌ Función incorrecta'
    END as estado;

-- 9. Test de la función has_role
-- ============================================================================
SELECT 
    '🔍 Test función has_role' as test,
    public.has_role('d618017c-ea73-4d69-af50-32afb824f407'::uuid, 'psicologa'::user_role) as es_psicologa,
    public.has_role('d618017c-ea73-4d69-af50-32afb824f407'::uuid, 'paciente'::user_role) as es_paciente,
    CASE 
        WHEN public.has_role('d618017c-ea73-4d69-af50-32afb824f407'::uuid, 'psicologa'::user_role) = true
        THEN '✅ Rol correcto'
        ELSE '❌ Rol incorrecto'
    END as estado;

-- ============================================================================
-- DIAGNÓSTICO FINAL
-- ============================================================================

DO $$
DECLARE
    perfil_existe boolean;
    rls_habilitado boolean;
    politicas_count integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '📊 DIAGNÓSTICO FINAL';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    -- Verificar perfil
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = 'd618017c-ea73-4d69-af50-32afb824f407'::uuid
    ) INTO perfil_existe;
    
    -- Verificar RLS
    SELECT rowsecurity FROM pg_tables 
    WHERE tablename = 'profiles' 
    INTO rls_habilitado;
    
    -- Contar políticas
    SELECT COUNT(*) FROM pg_policies 
    WHERE tablename = 'profiles'
    INTO politicas_count;
    
    RAISE NOTICE '';
    IF perfil_existe THEN
        RAISE NOTICE '✅ Perfil existe para karemeyde@gmail.com';
    ELSE
        RAISE NOTICE '❌ Perfil NO existe - EJECUTAR: crear_perfil_karem.sql';
    END IF;
    
    IF rls_habilitado THEN
        RAISE NOTICE '✅ RLS está habilitado';
    ELSE
        RAISE NOTICE '❌ RLS está deshabilitado';
    END IF;
    
    RAISE NOTICE '📋 Políticas RLS configuradas: %', politicas_count;
    
    IF politicas_count >= 3 THEN
        RAISE NOTICE '✅ Número de políticas correcto (mínimo 3)';
    ELSE
        RAISE NOTICE '⚠️ Pocas políticas - EJECUTAR: 20251025_fix_profiles_rls.sql';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    
    IF perfil_existe AND rls_habilitado AND politicas_count >= 3 THEN
        RAISE NOTICE '🎉 TODO CORRECTO - El login debería funcionar';
    ELSE
        RAISE NOTICE '⚠️ HAY PROBLEMAS - Revisar los scripts de corrección';
    END IF;
    
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
END $$;

-- ============================================================================
-- INSTRUCCIONES
-- ============================================================================
/*

📖 CÓMO INTERPRETAR LOS RESULTADOS:

✅ Verde con ✅ = TODO BIEN
⚠️ Amarillo con ⚠️ = ADVERTENCIA  
❌ Rojo con ❌ = ERROR

SI VES ERRORES:
1. ❌ El perfil NO EXISTE → Ejecutar: crear_perfil_karem.sql
2. ❌ RLS deshabilitado → Ejecutar: 20251025_fix_profiles_rls.sql
3. ⚠️ Pocas políticas → Ejecutar: 20251025_fix_profiles_rls.sql

SI TODO ESTÁ BIEN (✅):
- Cierra sesión en la app
- Limpia caché del navegador (Ctrl+Shift+R)
- Inicia sesión nuevamente
- El error 500 debería desaparecer

*/
