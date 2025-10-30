-- ============================================================================
-- ASEGURAR: Políticas RLS para que terapeutas vean bonos de sus pacientes
-- ============================================================================

-- 1. Verificar si existe una política que permita a los terapeutas ver bonos
-- Si no existe, la crearemos

-- Primero, verificamos la política actual
DO $$
BEGIN
    -- Intentar crear la política, si ya existe no hará nada
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bonos' 
        AND policyname = 'terapeutas_ven_bonos_de_sus_pacientes'
    ) THEN
        -- Crear política para que terapeutas vean bonos de sus pacientes
        CREATE POLICY terapeutas_ven_bonos_de_sus_pacientes
        ON public.bonos
        FOR SELECT
        TO authenticated
        USING (
            -- El terapeuta puede ver bonos si:
            -- 1. Tiene sesiones con ese paciente, o
            -- 2. Es el terapeuta asignado al paciente
            EXISTS (
                SELECT 1 FROM sesiones s
                WHERE s.bono_id = bonos.id
                AND s.terapeuta_id IN (
                    SELECT id FROM terapeutas
                    WHERE email = auth.jwt() ->> 'email'
                )
            )
            OR
            EXISTS (
                SELECT 1 FROM pacientes p
                WHERE p.id = bonos.paciente_id
                AND p.terapeuta_id IN (
                    SELECT id FROM terapeutas
                    WHERE email = auth.jwt() ->> 'email'
                )
            )
        );
        
        RAISE NOTICE 'Política "terapeutas_ven_bonos_de_sus_pacientes" creada exitosamente';
    ELSE
        RAISE NOTICE 'Política "terapeutas_ven_bonos_de_sus_pacientes" ya existe';
    END IF;
END $$;

-- 2. Asegurar que RLS esté habilitado en la tabla bonos
ALTER TABLE public.bonos ENABLE ROW LEVEL SECURITY;

-- 3. Verificar las políticas actuales de bonos
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'bonos'
    AND schemaname = 'public';
