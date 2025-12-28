/**
 * Script para corregir estados de citas según la fecha real
 *
 * Problema: Citas futuras están mostrando como "realizada"
 * Solución: Actualizar estados basándose en fecha_cita vs fecha actual
 *
 * Estados correctos:
 * - fecha_cita < hoy && estado != 'cancelada' → 'realizada' o 'completada'
 * - fecha_cita >= hoy → 'pendiente' o 'confirmada' (no 'realizada')
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

const DRY_RUN = process.argv.includes('--dry-run')

async function fixCitasEstados() {
  console.log('🔧 Corrigiendo estados de citas según fecha real...\n')
  if (DRY_RUN) console.log('⚠️  MODO DRY-RUN: No se harán cambios\n')

  const hoy = new Date().toISOString().split('T')[0]
  console.log('📅 Fecha de hoy: ' + hoy + '\n')

  // 1. Buscar citas FUTURAS que tienen estado 'realizada' o 'completada'
  console.log('🔍 Buscando citas futuras con estado incorrecto...\n')

  const { data: citasFuturasIncorrectas, error: errorFuturas } = await supabase
    .from('citas')
    .select('id, fecha_cita, hora_inicio, estado, paciente_id')
    .gt('fecha_cita', hoy)
    .eq('estado', 'realizada')
    .order('fecha_cita', { ascending: true })

  if (errorFuturas) {
    console.error('❌ Error buscando citas futuras:', errorFuturas.message)
    return
  }

  const numFuturas = citasFuturasIncorrectas ? citasFuturasIncorrectas.length : 0
  console.log('   Encontradas ' + numFuturas + ' citas futuras con estado incorrecto\n')

  // 2. Buscar citas PASADAS que tienen estado 'pendiente' o 'confirmada'
  const { data: citasPasadasIncorrectas, error: errorPasadas } = await supabase
    .from('citas')
    .select('id, fecha_cita, hora_inicio, estado, paciente_id')
    .lt('fecha_cita', hoy)
    .in('estado', ['pendiente', 'confirmada'])
    .order('fecha_cita', { ascending: true })

  if (errorPasadas) {
    console.error('❌ Error buscando citas pasadas:', errorPasadas.message)
    return
  }

  const numPasadas = citasPasadasIncorrectas ? citasPasadasIncorrectas.length : 0
  console.log('   Encontradas ' + numPasadas + ' citas pasadas con estado incorrecto\n')

  let corregidas = 0
  let errores = 0

  // Corregir citas futuras: de 'realizada' → 'confirmada'
  if (citasFuturasIncorrectas && citasFuturasIncorrectas.length > 0) {
    console.log('============================================================')
    console.log('📆 CORRIGIENDO CITAS FUTURAS (realizada → confirmada)')
    console.log('============================================================')

    for (const cita of citasFuturasIncorrectas) {
      console.log('\n   ' + cita.fecha_cita + ' ' + cita.hora_inicio + ': ' + cita.estado + ' → confirmada')

      if (!DRY_RUN) {
        const { error: updateError } = await supabase
          .from('citas')
          .update({ estado: 'confirmada' })
          .eq('id', cita.id)

        if (updateError) {
          console.log('   ❌ Error: ' + updateError.message)
          errores++
        } else {
          console.log('   ✅ Corregida')
          corregidas++
        }
      }
    }
  }

  // Corregir citas pasadas: de 'pendiente'/'confirmada' → 'realizada'
  if (citasPasadasIncorrectas && citasPasadasIncorrectas.length > 0) {
    console.log('\n============================================================')
    console.log('📆 CORRIGIENDO CITAS PASADAS (pendiente/confirmada → realizada)')
    console.log('============================================================')

    for (const cita of citasPasadasIncorrectas) {
      console.log('\n   ' + cita.fecha_cita + ' ' + cita.hora_inicio + ': ' + cita.estado + ' → realizada')

      if (!DRY_RUN) {
        const { error: updateError } = await supabase
          .from('citas')
          .update({ estado: 'realizada' })
          .eq('id', cita.id)

        if (updateError) {
          console.log('   ❌ Error: ' + updateError.message)
          errores++
        } else {
          console.log('   ✅ Corregida')
          corregidas++
        }
      }
    }
  }

  // Resumen
  console.log('\n============================================================')
  console.log('📊 RESUMEN')
  console.log('============================================================')
  console.log('\n   📅 Citas futuras incorrectas: ' + numFuturas)
  console.log('   📅 Citas pasadas incorrectas: ' + numPasadas)
  console.log('   ✅ Corregidas: ' + corregidas)
  console.log('   ❌ Errores: ' + errores)

  if (DRY_RUN) {
    console.log('\n⚠️  MODO DRY-RUN: No se hicieron cambios. Ejecuta sin --dry-run para aplicar.')
  }
}

fixCitasEstados().catch(console.error)
