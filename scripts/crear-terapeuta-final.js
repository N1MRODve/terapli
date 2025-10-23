/**
 * Crear usuario terapeuta completo - versión mejorada
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const USUARIO = {
  email: 'karem@psicokarem.com',
  password: 'KaremPsico2024!',
  nombre: 'Karem Peña',
  telefono: '+34 600 000 000',
  rol: 'psicologa'
}

async function main() {
  console.log('\n🔐 Creador de Usuario Terapeuta - PsicoKarem\n')
  
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Faltan variables de entorno')
    process.exit(1)
  }
  
  console.log(`✅ Conectando a: ${supabaseUrl}\n`)
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  try {
    // Paso 1: Verificar si ya existe
    console.log('📋 Verificando si el usuario ya existe...')
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id, email, rol')
      .eq('email', USUARIO.email)
    
    if (existingProfiles && existingProfiles.length > 0) {
      console.log(`\n⚠️  Usuario ${USUARIO.email} ya existe`)
      console.log(`   ID: ${existingProfiles[0].id}`)
      console.log(`   Rol actual: ${existingProfiles[0].rol}`)
      
      // Actualizar el rol si es necesario
      if (existingProfiles[0].rol !== 'psicologa') {
        console.log('\n🔄 Actualizando rol a "psicologa"...')
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            rol: 'psicologa',
            nombre: USUARIO.nombre,
            telefono: USUARIO.telefono
          })
          .eq('id', existingProfiles[0].id)
        
        if (updateError) {
          console.error('❌ Error al actualizar:', updateError.message)
        } else {
          console.log('✅ Usuario actualizado correctamente')
        }
      }
      
      console.log('\n' + '='.repeat(70))
      console.log('📝 Credenciales de acceso:')
      console.log(`   Email: ${USUARIO.email}`)
      console.log(`   Contraseña: ${USUARIO.password}`)
      console.log('\n🌐 Accede al panel en:')
      console.log('   http://localhost:3000/terapeuta/login')
      console.log('=' .repeat(70) + '\n')
      return
    }
    
    // Paso 2: Crear usuario en Auth
    console.log('✨ Creando nuevo usuario en Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: USUARIO.email,
      password: USUARIO.password,
      email_confirm: true,
      user_metadata: {
        nombre: USUARIO.nombre
      }
    })
    
    if (authError) {
      console.error('❌ Error al crear usuario:', authError.message)
      
      // Si el error es que ya existe, intentar obtenerlo
      if (authError.message.includes('already registered')) {
        console.log('\n⚠️  El usuario existe en Auth pero no en profiles')
        console.log('   Esto puede pasar si el trigger no se ejecutó correctamente')
        console.log('\n💡 Por favor, ve al Dashboard de Supabase:')
        console.log('   1. Authentication > Users')
        console.log('   2. Busca el usuario y copia su UUID')
        console.log('   3. Ve a Table Editor > profiles')
        console.log('   4. Inserta una fila con:')
        console.log(`      - id: [UUID copiado]`)
        console.log(`      - email: ${USUARIO.email}`)
        console.log(`      - nombre: ${USUARIO.nombre}`)
        console.log(`      - rol: psicologa`)
      }
      return
    }
    
    const userId = authData.user.id
    console.log(`✅ Usuario creado en Auth`)
    console.log(`   UUID: ${userId}`)
    
    // Paso 3: Esperar un momento para el trigger
    console.log('\n⏳ Esperando creación automática del perfil...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Paso 4: Verificar o crear perfil
    console.log('🔍 Verificando perfil...')
    const { data: checkProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
    
    if (!checkProfile) {
      console.log('📝 Creando perfil manualmente...')
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: USUARIO.email,
          nombre: USUARIO.nombre,
          telefono: USUARIO.telefono,
          rol: USUARIO.rol
        })
      
      if (insertError) {
        console.error('❌ Error al crear perfil:', insertError.message)
        console.log('\n💡 Debes crear el perfil manualmente en Supabase')
        return
      }
      console.log('✅ Perfil creado')
    } else {
      console.log('✅ Perfil encontrado, actualizando...')
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          nombre: USUARIO.nombre,
          telefono: USUARIO.telefono,
          rol: USUARIO.rol
        })
        .eq('id', userId)
      
      if (updateError) {
        console.error('⚠️  Error al actualizar:', updateError.message)
      } else {
        console.log('✅ Perfil actualizado')
      }
    }
    
    // Paso 5: Verificación final
    console.log('\n🔍 Verificación final...')
    const { data: finalProfile } = await supabase
      .from('profiles')
      .select('id, email, nombre, rol, telefono')
      .eq('id', userId)
      .single()
    
    if (finalProfile) {
      console.log('✅ Verificación exitosa:')
      console.log(`   Email: ${finalProfile.email}`)
      console.log(`   Nombre: ${finalProfile.nombre}`)
      console.log(`   Rol: ${finalProfile.rol}`)
      console.log(`   Teléfono: ${finalProfile.telefono}`)
      
      console.log('\n' + '='.repeat(70))
      console.log('🎉 ¡Usuario terapeuta creado exitosamente!\n')
      console.log('📝 Credenciales de acceso:')
      console.log(`   Email: ${USUARIO.email}`)
      console.log(`   Contraseña: ${USUARIO.password}\n`)
      console.log('🌐 Accede al panel en:')
      console.log('   http://localhost:3000/terapeuta/login\n')
      console.log('💡 Guarda estas credenciales en un lugar seguro')
      console.log('=' .repeat(70) + '\n')
    } else {
      console.log('⚠️  No se pudo verificar el perfil')
    }
    
  } catch (error) {
    console.error('\n❌ Error inesperado:', error.message || error)
  }
}

main()
