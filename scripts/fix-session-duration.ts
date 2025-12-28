/**
 * Script para corregir la duración de las sesiones importadas
 * Las sesiones tienen duración incorrecta (30-35 min) y deben ser 60 minutos
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

async function fixDurations() {
  console.log('🔧 Corrigiendo duración de sesiones importadas...\n')

  // Buscar todas las citas de diciembre 2025 que fueron importadas
  // (tienen metadata con source: 'excel_import')
  const { data: citas, error } = await supabase
    .from('citas')
    .select('id, fecha_cita, hora_inicio, hora_fin, duracion_minutos, metadata')
    .gte('fecha_cita', '2025-12-01')
    .lte('fecha_cita', '2025-12-31')
    .order('fecha_cita', { ascending: true })

  if (error) {
    console.error('❌ Error al obtener citas:', error)
    return
  }

  console.log(`📊 Encontradas ${citas?.length || 0} citas en diciembre 2025\n`)

  if (!citas || citas.length === 0) {
    console.log('No hay citas que corregir')
    return
  }

  // Filtrar las que tienen duración incorrecta
  const citasACorregir = citas.filter(c => c.duracion_minutos < 60)
  console.log(`🔍 ${citasACorregir.length} citas con duración menor a 60 minutos\n`)

  if (citasACorregir.length === 0) {
    console.log('✅ Todas las citas ya tienen duración correcta')
    return
  }

  let corregidas = 0
  let errores = 0

  for (const cita of citasACorregir) {
    // Calcular nueva hora_fin (hora_inicio + 60 minutos)
    const [horaStr, minStr] = cita.hora_inicio.split(':')
    const hora = parseInt(horaStr)
    const minutos = parseInt(minStr)

    const inicioEnMinutos = hora * 60 + minutos
    const finEnMinutos = inicioEnMinutos + 60

    const nuevaHoraFin = `${Math.floor(finEnMinutos / 60).toString().padStart(2, '0')}:${(finEnMinutos % 60).toString().padStart(2, '0')}:00`

    // Solo actualizamos hora_fin - duracion_minutos es columna generada automáticamente
    const { error: updateError } = await supabase
      .from('citas')
      .update({
        hora_fin: nuevaHoraFin
      })
      .eq('id', cita.id)

    if (updateError) {
      console.error(`❌ Error actualizando cita ${cita.id}:`, updateError.message)
      errores++
    } else {
      console.log(`✅ Cita ${cita.fecha_cita} ${cita.hora_inicio}: ${cita.duracion_minutos}min → 60min (fin: ${nuevaHoraFin})`)
      corregidas++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`📊 RESUMEN:`)
  console.log(`   ✅ Corregidas: ${corregidas}`)
  console.log(`   ❌ Errores: ${errores}`)
  console.log('='.repeat(60))
}

fixDurations().catch(console.error)
