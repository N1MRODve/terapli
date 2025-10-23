import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function setup() {
  console.log('🚀 Configurando datos de prueba...\n')

  // 1. Crear usuario auth
  console.log('👤 Creando usuario...')
  let userId
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'paciente@test.com',
    password: 'Test123456!',
    email_confirm: true
  })

  if (authError?.message?.includes('already been registered')) {
    console.log('ℹ️  Usuario ya existe')
    const { data: { users } } = await supabase.auth.admin.listUsers()
    userId = users.find(u => u.email === 'paciente@test.com')?.id
  } else if (authError) {
    console.error('❌ Error:', authError.message)
    return
  } else {
    userId = authData.user.id
    console.log('✅ Usuario creado')
  }

  // 2. Profile
  console.log('\n📋 Creando profile...')
  await supabase.from('profiles').upsert({
    id: userId,
    email: 'paciente@test.com',
    nombre: 'María García López',
    telefono: '+34 600 123 456',
    rol: 'paciente'
  })
  console.log('✅ Profile listo')

  // 3. Paciente
  console.log('\n📝 Creando paciente...')
  await supabase.from('pacientes').upsert({
    id: userId,
    area_de_acompanamiento: 'Ansiedad',
    frecuencia: 'semanal',
    activo: true
  })
  console.log('✅ Paciente listo')

  // 4. Bonos
  console.log('\n🎫 Creando bonos...')
  await supabase.from('bonos').insert([
    {
      paciente_id: userId,
      total_sesiones: 8,
      sesiones_restantes: 5,
      precio_total: 400,
      estado: 'activo'
    },
    {
      paciente_id: userId,
      total_sesiones: 4,
      sesiones_restantes: 0,
      precio_total: 240,
      estado: 'agotado',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    }
  ])
  console.log('✅ Bonos creados')

  console.log('\n✨ ¡Listo! Accede con:')
  console.log('   📧 paciente@test.com')
  console.log('   🔑 Test123456!')
  console.log('   🌐 http://localhost:3000/paciente/bono\n')
}

setup()
