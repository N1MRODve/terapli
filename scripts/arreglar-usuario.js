/**
 * Arreglar usuario existente
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

async function arreglarUsuario() {
  console.log('\n🔧 Arreglando usuario karem@psicokarem.com...\n')
  
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  try {
    // Listar usuarios de Auth
    console.log('📋 Obteniendo usuario de Auth...')
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error:', listError.message)
      return
    }
    
    const karemUser = authUsers.users.find(u => u.email === 'karem@psicokarem.com')
    
    if (!karemUser) {
      console.log('❌ Usuario no encontrado en Auth')
      return
    }
    
    console.log(`✅ Usuario encontrado en Auth`)
    console.log(`   UUID: ${karemUser.id}`)
    console.log(`   Email: ${karemUser.email}`)
    console.log(`   Confirmado: ${karemUser.email_confirmed_at ? 'Sí' : 'No'}`)
    
    // Confirmar el email si no está confirmado
    if (!karemUser.email_confirmed_at) {
      console.log('\n📧 Confirmando email...')
      const { error: confirmError } = await supabase.auth.admin.updateUserById(
        karemUser.id,
        { email_confirm: true }
      )
      
      if (confirmError) {
        console.error('⚠️  Error al confirmar:', confirmError.message)
      } else {
        console.log('✅ Email confirmado')
      }
    }
    
    // Verificar perfil
    console.log('\n🔍 Verificando perfil en la base de datos...')
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', karemUser.id)
    
    if (profileError) {
      console.error('❌ Error al consultar profiles:', profileError.message)
      return
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('📝 Creando perfil...')
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: karemUser.id,
          email: 'karem@psicokarem.com',
          nombre: 'Karem Peña',
          telefono: '+34 600 000 000',
          rol: 'psicologa'
        })
      
      if (insertError) {
        console.error('❌ Error al crear perfil:', insertError.message)
        return
      }
      
      console.log('✅ Perfil creado exitosamente')
    } else {
      console.log(`✅ Perfil encontrado (${profiles.length} registro(s))`)
      
      const profile = profiles[0]
      console.log(`   Nombre: ${profile.nombre || '(vacío)'}`)
      console.log(`   Rol: ${profile.rol}`)
      console.log(`   Teléfono: ${profile.telefono || '(vacío)'}`)
      
      if (profile.rol !== 'psicologa') {
        console.log('\n🔄 Actualizando rol a "psicologa"...')
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            rol: 'psicologa',
            nombre: 'Karem Peña',
            telefono: '+34 600 000 000'
          })
          .eq('id', karemUser.id)
        
        if (updateError) {
          console.error('❌ Error al actualizar:', updateError.message)
        } else {
          console.log('✅ Perfil actualizado')
        }
      }
    }
    
    // Restablecer contraseña
    console.log('\n🔑 Actualizando contraseña...')
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      karemUser.id,
      { password: 'KaremPsico2024!' }
    )
    
    if (passwordError) {
      console.error('⚠️  Error al actualizar contraseña:', passwordError.message)
    } else {
      console.log('✅ Contraseña actualizada')
    }
    
    console.log('\n' + '='.repeat(70))
    console.log('🎉 ¡Usuario arreglado correctamente!\n')
    console.log('📝 Credenciales de acceso:')
    console.log('   Email: karem@psicokarem.com')
    console.log('   Contraseña: KaremPsico2024!\n')
    console.log('🌐 Accede al panel en:')
    console.log('   http://localhost:3000/terapeuta/login\n')
    console.log('=' .repeat(70) + '\n')
    
  } catch (error) {
    console.error('❌ Error:', error.message || error)
  }
}

arreglarUsuario()
