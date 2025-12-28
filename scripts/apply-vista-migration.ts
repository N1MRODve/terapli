/**
 * Aplica la migración de vista_agenda_terapeutas con metadata
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pcbchuaezokqppwsbnty.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Falta SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
})

async function applyMigration() {
  console.log('🔧 Aplicando migración de vista_agenda_terapeutas...\n')

  // SQL para recrear la vista con metadata
  const sql = `
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

    GRANT SELECT ON public.vista_agenda_terapeutas TO authenticated;
  `

  const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    // Si exec_sql no existe, probemos con otra forma
    console.log('⚠️ exec_sql no disponible, intentando verificar vista existente...')

    // Verificar si la vista ya existe con metadata
    const { data, error: testError } = await supabase
      .from('vista_agenda_terapeutas')
      .select('cita_metadata')
      .limit(1)

    if (testError && testError.message.includes('cita_metadata')) {
      console.log('❌ La vista NO tiene el campo cita_metadata')
      console.log('📝 Debes ejecutar la migración manualmente en Supabase Dashboard:')
      console.log('   1. Ve a SQL Editor en tu proyecto Supabase')
      console.log('   2. Ejecuta el contenido de: supabase/migrations/20251228_fix_vista_con_metadata.sql')
      return
    }

    if (!testError) {
      console.log('✅ La vista ya tiene el campo cita_metadata')
    } else {
      console.log('⚠️ Error al verificar vista:', testError.message)
    }
  } else {
    console.log('✅ Migración aplicada correctamente')
  }

  // Verificar que funciona
  const { data: test, error: verifyError } = await supabase
    .from('vista_agenda_terapeutas')
    .select('cita_id, paciente_nombre, cita_metadata')
    .limit(3)

  if (verifyError) {
    console.log('⚠️ Error verificando vista:', verifyError.message)
  } else {
    console.log('\n📊 Muestra de datos (3 primeras citas):')
    test?.forEach(c => {
      console.log(`   - ${c.paciente_nombre}: metadata = ${JSON.stringify(c.cita_metadata || {})}`)
    })
  }
}

applyMigration().catch(console.error)
