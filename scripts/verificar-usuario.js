/**
 * Verificar usuario creado
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

async function verificar() {
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  console.log('\n🔍 Verificando usuario karem@psicokarem.com...\n')
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'karem@psicokarem.com')
      .single()
    
    if (error) {
      console.error('❌ Error:', error.message)
      
      // Intentar listar todos los usuarios
      console.log('\n📋 Listando todos los usuarios...\n')
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, email, nombre, rol')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (allProfiles && allProfiles.length > 0) {
        console.log('Usuarios encontrados:')
        allProfiles.forEach(p => {
          console.log(`  - ${p.email} (${p.rol}) - ${p.nombre || 'sin nombre'}`)
        })
      }
      return
    }
    
    if (profile) {
      console.log('✅ Usuario encontrado:')
      console.log(`   ID: ${profile.id}`)
      console.log(`   Email: ${profile.email}`)
      console.log(`   Nombre: ${profile.nombre || '(no especificado)'}`)
      console.log(`   Rol: ${profile.rol}`)
      console.log(`   Teléfono: ${profile.telefono || '(no especificado)'}`)
      console.log(`   Creado: ${new Date(profile.created_at).toLocaleString()}`)
      
      if (profile.rol !== 'psicologa' && profile.rol !== 'admin') {
        console.log('\n⚠️  El rol no es correcto. Actualizando...')
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ rol: 'psicologa' })
          .eq('id', profile.id)
        
        if (updateError) {
          console.error('❌ Error al actualizar:', updateError.message)
        } else {
          console.log('✅ Rol actualizado a "psicologa"')
        }
      }
      
      console.log('\n' + '='.repeat(70))
      console.log('📝 Credenciales de acceso:')
      console.log('   Email: karem@psicokarem.com')
      console.log('   Contraseña: KaremPsico2024!')
      console.log('\n🌐 Accede al panel en:')
      console.log('   http://localhost:3000/terapeuta/login')
      console.log('=' .repeat(70) + '\n')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message || error)
  }
}

verificar()
