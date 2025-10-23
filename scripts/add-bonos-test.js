/**
 * Script simplificado para agregar bonos de prueba al paciente existente
 * Basado en los precios reales de /como-empezar
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan las credenciales de Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addBonosData() {
  console.log('🎫 Agregando bonos de prueba...\n')

  try {
    // 1. Buscar el paciente test por email
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, rol')
      .eq('email', 'paciente@test.com')
      .single()

    if (profileError || !profiles) {
      console.error('❌ No se encontró el usuario paciente@test.com')
      console.log('💡 Verifica que el usuario exista en Supabase Authentication')
      return
    }

    console.log('✅ Profile encontrado:', profiles.email, '- Rol:', profiles.rol)

    // Verificar si existe el registro en pacientes
    const { data: pacienteExistente, error: pacienteCheckError } = await supabase
      .from('pacientes')
      .select('id')
      .eq('id', profiles.id)
      .single()

    let pacienteId

    if (pacienteCheckError || !pacienteExistente) {
      console.log('\n� Creando registro de paciente...')
      const { data: newPaciente, error: newPacienteError } = await supabase
        .from('pacientes')
        .insert({
          id: profiles.id,
          area_de_acompanamiento: 'Ansiedad, Desarrollo personal',
          frecuencia: 'semanal',
          activo: true
        })
        .select()
        .single()

      if (newPacienteError) {
        console.error('❌ Error creando paciente:', newPacienteError.message)
        return
      }
      pacienteId = newPaciente.id
      console.log('✅ Registro de paciente creado')
    } else {
      pacienteId = pacienteExistente.id
      console.log('✅ Registro de paciente ya existe')
    }

    // 2. Crear bono activo - Proceso Constante (2 sesiones/mes)
    console.log('\n📦 Creando bono "Proceso Constante"...')
    const { error: bono1Error } = await supabase
      .from('bonos')
      .insert({
        paciente_id: pacienteId,
        total_sesiones: 8, // 4 meses x 2 sesiones
        sesiones_restantes: 5,
        precio_total: 400.00, // 8 sesiones x 50€
        estado: 'activo',
        metadata: {
          nombre_bono: 'Proceso Constante',
          precio_por_sesion: 50,
          modalidad: '2 sesiones al mes'
        }
      })

    if (bono1Error) {
      console.error('❌ Error creando bono 1:', bono1Error.message)
    } else {
      console.log('✅ Bono activo creado: 8 sesiones (5 restantes) - 400€')
    }

    // 3. Crear bono anterior completado - Encuentro Puntual
    console.log('\n📦 Creando bono anterior "Encuentro Puntual"...')
    const { error: bono2Error } = await supabase
      .from('bonos')
      .insert({
        paciente_id: pacienteId,
        total_sesiones: 4,
        sesiones_restantes: 0,
        precio_total: 240.00, // 4 sesiones x 60€
        estado: 'agotado',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 2 meses atrás
        metadata: {
          nombre_bono: 'Encuentro Puntual',
          precio_por_sesion: 60,
          modalidad: 'Sesiones individuales'
        }
      })

    if (bono2Error) {
      console.error('❌ Error creando bono 2:', bono2Error.message)
    } else {
      console.log('✅ Bono anterior creado: 4 sesiones (agotado) - 240€')
    }

    // 4. Crear bono pausado - Proceso Profundo
    console.log('\n📦 Creando bono "Proceso Profundo" (pausado)...')
    const { error: bono3Error } = await supabase
      .from('bonos')
      .insert({
        paciente_id: pacienteId,
        total_sesiones: 12, // 3 meses x 4 sesiones
        sesiones_restantes: 8,
        precio_total: 480.00, // 12 sesiones x 40€
        estado: 'pausado',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 mes atrás
        metadata: {
          nombre_bono: 'Proceso Profundo',
          precio_por_sesion: 40,
          modalidad: '4 sesiones al mes'
        }
      })

    if (bono3Error) {
      console.error('❌ Error creando bono 3:', bono3Error.message)
    } else {
      console.log('✅ Bono pausado creado: 12 sesiones (8 restantes) - 480€')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ ¡Bonos agregados exitosamente!')
    console.log('='.repeat(60))
    console.log('\n📊 Resumen:')
    console.log('   • Bono activo: Proceso Constante (8 sesiones, 5 restantes)')
    console.log('   • Bono anterior: Encuentro Puntual (4 sesiones, agotado)')
    console.log('   • Bono pausado: Proceso Profundo (12 sesiones, 8 restantes)')
    console.log('\n🌐 Ve a: http://localhost:3000/paciente/bono')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ Error general:', error.message)
  }
}

addBonosData()
