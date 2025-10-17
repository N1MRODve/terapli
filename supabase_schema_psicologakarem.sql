-- #############################################################################
-- #                                                                           #
-- #          SCRIPT DE ESTRUCTURA DE BASE DE DATOS PARA PSICOLOGAKAREM          #
-- #                                                                           #
-- #############################################################################
-- # Creado por: Gemini
-- # Fecha: 2025-10-17
-- # Versión: 1.0
-- #############################################################################

-- #############################################################################
-- # SECCIÓN 1: TIPOS ENUMERADOS (ENUMS)
-- #############################################################################
-- Se crean los tipos personalizados para estandarizar valores en las tablas.

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'coordinadora',
    'psicologa',
    'paciente'
);

CREATE TYPE public.modalidad_sesion AS ENUM (
    'online',
    'presencial'
);

CREATE TYPE public.estado_sesion AS ENUM (
    'pendiente',
    'confirmada',
    'realizada',
    'cancelada'
);

CREATE TYPE public.estado_bono AS ENUM (
    'activo',
    'pausado',
    'agotado',
    'cerrado'
);

CREATE TYPE public.estado_pago AS ENUM (
    'pendiente',
    'pagado',
    'fallido',
    'devuelto'
);

CREATE TYPE public.tipo_recurso AS ENUM (
    'pdf',
    'audio',
    'video',
    'link'
);


-- #############################################################################
-- # SECCIÓN 2: FUNCIONES AUXILIARES
-- #############################################################################
-- Funciones para obtener información del usuario actual, útiles para RLS.

-- Obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
DECLARE
    user_role public.user_role;
BEGIN
    SELECT rol INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar si el usuario es parte del staff (admin, coordinadora, psicologa)
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN (
        SELECT current_user_role() IN ('admin', 'coordinadora', 'psicologa')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar si el usuario es admin o coordinadora
CREATE OR REPLACE FUNCTION public.is_admin_or_coord()
RETURNS boolean AS $$
BEGIN
    RETURN (
        SELECT current_user_role() IN ('admin', 'coordinadora')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- #############################################################################
-- # SECCIÓN 3: TABLAS
-- #############################################################################

-- -----------------------------------------------------------------------------
-- Tabla: profiles
-- Almacena perfiles de usuario, extendiendo auth.users.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email text NOT NULL UNIQUE,
    nombre text,
    telefono text,
    rol user_role NOT NULL DEFAULT 'paciente',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.profiles IS 'Tabla de perfiles que extiende auth.users.';

-- -----------------------------------------------------------------------------
-- Tabla: psicologas
-- Datos específicos de las profesionales.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.psicologas (
    id uuid PRIMARY KEY REFERENCES public.profiles ON DELETE CASCADE,
    num_colegiada text UNIQUE,
    bio text,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.psicologas IS 'Datos profesionales de las psicólogas.';

-- -----------------------------------------------------------------------------
-- Tabla: pacientes
-- Datos específicos de los pacientes.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pacientes (
    id uuid PRIMARY KEY REFERENCES public.profiles ON DELETE CASCADE,
    psicologa_id uuid REFERENCES public.psicologas ON DELETE SET NULL,
    area_de_acompanamiento text,
    frecuencia text, -- semanal/quincenal/mensual
    activo boolean NOT NULL DEFAULT true,
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.pacientes IS 'Datos específicos de los pacientes y su terapia.';

-- -----------------------------------------------------------------------------
-- Tabla: bonos
-- Bonos de sesiones para los pacientes.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bonos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id uuid NOT NULL REFERENCES public.pacientes ON DELETE CASCADE,
    total_sesiones smallint NOT NULL CHECK (total_sesiones > 0),
    sesiones_restantes smallint NOT NULL CHECK (sesiones_restantes >= 0),
    precio_total numeric(10, 2),
    estado estado_bono NOT NULL DEFAULT 'activo',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.bonos IS 'Bonos de sesiones contratados por los pacientes.';

-- -----------------------------------------------------------------------------
-- Tabla: sesiones
-- Registro de cada sesión terapéutica.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sesiones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id uuid NOT NULL REFERENCES public.pacientes ON DELETE CASCADE,
    psicologa_id uuid REFERENCES public.psicologas ON DELETE SET NULL,
    bono_id uuid REFERENCES public.bonos ON DELETE CASCADE,
    fecha timestamptz NOT NULL,
    duracion_min integer NOT NULL DEFAULT 50,
    modalidad modalidad_sesion NOT NULL DEFAULT 'online',
    estado estado_sesion NOT NULL DEFAULT 'pendiente',
    ubicacion text,
    nota_terapeuta text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.sesiones IS 'Registro de las sesiones de terapia.';

-- -----------------------------------------------------------------------------
-- Tabla: recursos
-- Material compartido entre psicóloga y paciente.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recursos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id uuid NOT NULL REFERENCES public.pacientes ON DELETE CASCADE,
    psicologa_id uuid NOT NULL REFERENCES public.psicologas ON DELETE SET NULL,
    titulo text NOT NULL,
    descripcion text,
    tipo tipo_recurso NOT NULL,
    storage_path text, -- path en Supabase Storage bucket 'recursos'
    metadata jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.recursos IS 'Recursos y material de apoyo para pacientes.';

-- -----------------------------------------------------------------------------
-- Tabla: mensajes
-- Mensajería interna (simplificada).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mensajes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    autor_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    receptor_id uuid NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
    contenido text NOT NULL,
    leido boolean NOT NULL DEFAULT false,
    archivado boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.mensajes IS 'Mensajería entre usuarios de la plataforma.';

-- -----------------------------------------------------------------------------
-- Tabla: pagos
-- Registro de transacciones económicas.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pagos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id uuid NOT NULL REFERENCES public.pacientes ON DELETE CASCADE,
    bono_id uuid REFERENCES public.bonos ON DELETE SET NULL,
    monto numeric(10, 2) NOT NULL,
    metodo text, -- stripe, bizum, transferencia
    estado estado_pago NOT NULL DEFAULT 'pendiente',
    gateway_id text, -- ID de la transacción en la pasarela de pago
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.pagos IS 'Registro de pagos y transacciones.';

-- -----------------------------------------------------------------------------
-- Tabla: notas_terapeuticas
-- Notas confidenciales de la psicóloga sobre el paciente.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notas_terapeuticas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id uuid NOT NULL REFERENCES public.pacientes ON DELETE CASCADE,
    psicologa_id uuid NOT NULL REFERENCES public.psicologas ON DELETE CASCADE,
    contenido text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.notas_terapeuticas IS 'Notas confidenciales del terapeuta sobre el paciente.';

-- -----------------------------------------------------------------------------
-- Tabla: logs_evento
-- Tabla de auditoría para eventos importantes.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.logs_evento (
    id bigserial PRIMARY KEY,
    actor_id uuid REFERENCES public.profiles ON DELETE SET NULL,
    tipo text NOT NULL,
    detalle jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.logs_evento IS 'Log de eventos para auditoría y trazabilidad.';


-- #############################################################################
-- # SECCIÓN 4: ÍNDICES
-- #############################################################################
-- Creación de índices para mejorar el rendimiento de las consultas.

CREATE INDEX IF NOT EXISTS idx_pacientes_psicologa_id ON public.pacientes(psicologa_id);
CREATE INDEX IF NOT EXISTS idx_bonos_paciente_id ON public.bonos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_paciente_id ON public.sesiones(paciente_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_psicologa_id ON public.sesiones(psicologa_id);
CREATE INDEX IF NOT EXISTS idx_sesiones_bono_id ON public.sesiones(bono_id);
CREATE INDEX IF NOT EXISTS idx_recursos_paciente_id ON public.recursos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_recursos_psicologa_id ON public.recursos(psicologa_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_autor_id ON public.mensajes(autor_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_receptor_id ON public.mensajes(receptor_id);
CREATE INDEX IF NOT EXISTS idx_pagos_paciente_id ON public.pagos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_pagos_bono_id ON public.pagos(bono_id);
CREATE INDEX IF NOT EXISTS idx_notas_terapeuticas_paciente_id ON public.notas_terapeuticas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_notas_terapeuticas_psicologa_id ON public.notas_terapeuticas(psicologa_id);
CREATE INDEX IF NOT EXISTS idx_logs_evento_actor_id ON public.logs_evento(actor_id);


-- #############################################################################
-- # SECCIÓN 5: TRIGGERS Y FUNCIONES DE TRIGGER
-- #############################################################################

-- -----------------------------------------------------------------------------
-- Trigger: Sincronizar `profiles` con `auth.users`
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (new.id, new.email);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Trigger: Actualizar `updated_at`
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    new.updated_at = now();
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at a las tablas correspondientes
DO $$
DECLARE
    t_name TEXT;
BEGIN
    FOR t_name IN SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('CREATE TRIGGER set_updated_at_trigger BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t_name);
    END LOOP;
END;
$$;

-- -----------------------------------------------------------------------------
-- Trigger: Descontar sesión de bono al marcarla como "realizada"
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrementar_bono_al_realizar()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actuar si el estado cambia A "realizada" y hay un bono asociado
    IF new.estado = 'realizada' AND old.estado <> 'realizada' AND new.bono_id IS NOT NULL THEN
        UPDATE public.bonos
        SET sesiones_restantes = sesiones_restantes - 1
        WHERE id = new.bono_id AND sesiones_restantes > 0;

        -- Opcional: Marcar el bono como "agotado" si las sesiones llegan a 0
        IF (SELECT sesiones_restantes FROM public.bonos WHERE id = new.bono_id) = 0 THEN
            UPDATE public.bonos
            SET estado = 'agotado'
            WHERE id = new.bono_id;
        END IF;
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_sesion_realizada
    AFTER UPDATE ON public.sesiones
    FOR EACH ROW EXECUTE FUNCTION public.decrementar_bono_al_realizar();


-- #############################################################################
-- # SECCIÓN 6: ROW LEVEL SECURITY (RLS)
-- #############################################################################
-- Habilitar RLS en todas las tablas y añadir políticas permisivas para desarrollo.

DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        -- Habilitar RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_name);
        
        -- Crear política permisiva para desarrollo
        EXECUTE format('
            CREATE POLICY "Allow ALL for development"
            ON public.%I
            FOR ALL
            USING (true)
            WITH CHECK (true);
        ', table_name);
    END LOOP;
END;
$$;

-- #############################################################################
-- #                                                                           #
-- #                         FIN DEL SCRIPT DE ESTRUCTURA                        #
-- #                                                                           #
-- #############################################################################
