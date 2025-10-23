-- ============================================
-- SISTEMA DE MENSAJERÍA INTERNA SEGURA
-- Psicóloga Karem - Mensajería entre Paciente y Terapeuta
-- ============================================

-- 1. Crear tabla de mensajes
create table if not exists mensajes (
  id uuid primary key default uuid_generate_v4(),
  remitente_id uuid references profiles(id) on delete cascade not null,
  destinatario_id uuid references profiles(id) on delete cascade not null,
  sesion_id uuid references sesiones(id) on delete set null,
  mensaje text not null,
  visto boolean default false,
  created_at timestamp with time zone default now(),
  
  -- Índices para mejorar rendimiento
  constraint mensajes_check check (remitente_id <> destinatario_id)
);

-- Índices para búsquedas rápidas
create index if not exists idx_mensajes_remitente on mensajes(remitente_id);
create index if not exists idx_mensajes_destinatario on mensajes(destinatario_id);
create index if not exists idx_mensajes_created_at on mensajes(created_at desc);
create index if not exists idx_mensajes_conversacion on mensajes(remitente_id, destinatario_id);

-- 2. Crear tabla de notificaciones (si no existe)
create table if not exists notificaciones (
  id uuid primary key default uuid_generate_v4(),
  usuario_id uuid references profiles(id) on delete cascade not null,
  titulo text not null,
  mensaje text,
  tipo text default 'mensaje',
  visto boolean default false,
  referencia_id uuid, -- ID del mensaje o sesión relacionada
  created_at timestamp with time zone default now()
);

-- Índices para notificaciones
create index if not exists idx_notificaciones_usuario on notificaciones(usuario_id);
create index if not exists idx_notificaciones_visto on notificaciones(visto);
create index if not exists idx_notificaciones_created_at on notificaciones(created_at desc);

-- ============================================
-- 3. POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
alter table mensajes enable row level security;
alter table notificaciones enable row level security;

-- Eliminar políticas existentes si existen
drop policy if exists "mensajes_select_participantes" on mensajes;
drop policy if exists "mensajes_insert_remitente" on mensajes;
drop policy if exists "mensajes_update_visto_destinatario" on mensajes;
drop policy if exists "notificaciones_select_owner" on notificaciones;
drop policy if exists "notificaciones_insert_any" on notificaciones;
drop policy if exists "notificaciones_update_owner" on notificaciones;

-- MENSAJES: Solo participantes (remitente o destinatario) pueden ver sus conversaciones
create policy "mensajes_select_participantes"
on mensajes for select
using (
  auth.uid() = remitente_id or auth.uid() = destinatario_id
);

-- MENSAJES: Solo el remitente puede insertar mensajes (enviados por él)
create policy "mensajes_insert_remitente"
on mensajes for insert
with check (auth.uid() = remitente_id);

-- MENSAJES: Solo el destinatario puede marcar como visto
create policy "mensajes_update_visto_destinatario"
on mensajes for update
using (auth.uid() = destinatario_id)
with check (auth.uid() = destinatario_id);

-- NOTIFICACIONES: Solo visibles por su dueño
create policy "notificaciones_select_owner"
on notificaciones for select
using (auth.uid() = usuario_id);

-- NOTIFICACIONES: Permitir inserción (controlada por trigger o app)
create policy "notificaciones_insert_any"
on notificaciones for insert
with check (true);

-- NOTIFICACIONES: Solo el dueño puede actualizar (marcar como visto)
create policy "notificaciones_update_owner"
on notificaciones for update
using (auth.uid() = usuario_id)
with check (auth.uid() = usuario_id);

-- ============================================
-- 4. TRIGGER PARA NOTIFICACIONES AUTOMÁTICAS
-- ============================================

-- Función para crear notificación cuando llega mensaje nuevo
create or replace function notify_new_message()
returns trigger as $$
declare
  remitente_nombre text;
begin
  -- Obtener nombre del remitente
  select nombre into remitente_nombre
  from profiles
  where id = NEW.remitente_id;

  -- Crear notificación para el destinatario
  insert into notificaciones (usuario_id, titulo, mensaje, tipo, referencia_id)
  values (
    NEW.destinatario_id,
    'Nuevo mensaje',
    coalesce('Mensaje de ' || remitente_nombre, 'Has recibido un mensaje en tu espacio'),
    'mensaje',
    NEW.id
  );

  return NEW;
end;
$$ language plpgsql security definer;

-- Eliminar trigger anterior si existe
drop trigger if exists trg_notify_new_message on mensajes;

-- Crear trigger
create trigger trg_notify_new_message
after insert on mensajes
for each row execute procedure notify_new_message();

-- ============================================
-- 5. FUNCIONES AUXILIARES
-- ============================================

-- Función para obtener conversaciones no leídas
create or replace function contar_mensajes_no_vistos(usuario_id uuid)
returns bigint as $$
  select count(*)
  from mensajes
  where destinatario_id = usuario_id
    and visto = false;
$$ language sql security definer;

-- Función para obtener última conversación con cada usuario
create or replace function obtener_ultimas_conversaciones(usuario_id uuid)
returns table (
  otro_usuario_id uuid,
  ultimo_mensaje text,
  ultimo_mensaje_fecha timestamp with time zone,
  mensajes_no_vistos bigint,
  otro_usuario_nombre text,
  otro_usuario_avatar text
) as $$
  select distinct on (
    case 
      when m.remitente_id = usuario_id then m.destinatario_id
      else m.remitente_id
    end
  )
  case 
    when m.remitente_id = usuario_id then m.destinatario_id
    else m.remitente_id
  end as otro_usuario_id,
  m.mensaje as ultimo_mensaje,
  m.created_at as ultimo_mensaje_fecha,
  (
    select count(*)::bigint
    from mensajes m2
    where m2.destinatario_id = usuario_id
      and m2.visto = false
      and m2.remitente_id = (
        case 
          when m.remitente_id = usuario_id then m.destinatario_id
          else m.remitente_id
        end
      )
  ) as mensajes_no_vistos,
  p.nombre as otro_usuario_nombre,
  p.avatar_url as otro_usuario_avatar
  from mensajes m
  inner join profiles p on p.id = (
    case 
      when m.remitente_id = usuario_id then m.destinatario_id
      else m.remitente_id
    end
  )
  where m.remitente_id = usuario_id or m.destinatario_id = usuario_id
  order by otro_usuario_id, m.created_at desc;
$$ language sql security definer;

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

comment on table mensajes is 'Mensajes privados entre paciente y terapeuta (comunicación asíncrona)';
comment on table notificaciones is 'Notificaciones internas para usuarios del sistema';
comment on column mensajes.sesion_id is 'Referencia opcional a sesión relacionada con el mensaje';
comment on column mensajes.visto is 'Indica si el destinatario ha leído el mensaje';
comment on function notify_new_message() is 'Crea notificación automática cuando se recibe un mensaje nuevo';
comment on function contar_mensajes_no_vistos(uuid) is 'Cuenta mensajes no leídos para un usuario';
comment on function obtener_ultimas_conversaciones(uuid) is 'Obtiene lista de conversaciones con último mensaje y contador de no leídos';
