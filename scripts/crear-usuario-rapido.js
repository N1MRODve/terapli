/**
 * Script rápido para crear un usuario terapeuta
 * Con credenciales predefinidas para pruebas
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

// Credenciales del usuario a crear
const USUARIO = {
  email: 'karem@psicokarem.com',
  password: 'KaremPsico2024!',
  nombre: 'Karem Peña',
  telefono: '+34 600 000 000',
  rol: 'psicologa'
}

async function crearUsuario() {
  console.log('\n🔐 Creando usuario terapeuta...\n')
  
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Faltan variables de entorno')
    process.exit(1)
  }
  
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  try {
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email, rol')
      .eq('email', USUARIO.email)
      .single()
    
    if (existingUser) {
      console.log('⚠️  El usuario ya existe:')
      console.log(`   Email: ${existingUser.email}`)
      console.log(`   Rol: ${existingUser.rol}`)
      console.log('\n✅ Puedes usar estas credenciales para iniciar sesión:')
      console.log(`   Email: ${USUARIO.email}`)
      console.log(`   Contraseña: ${USUARIO.password}`)
      console.log('\n🌐 Accede en: http://localhost:3000/terapeuta/login\n')
      return
    }
    
    // Crear usuario
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: USUARIO.email,
      password: USUARIO.password,
      email_confirm: true,
      user_metadata: {
        nombre: USUARIO.nombre
      }
    })
    
    if (authError) {
      console.error('❌ Error:', authError.message)
      return
    }
    
    console.log('✅ Usuario creado en Auth')
    console.log(`   ID: ${authData.user.id}\n`)
    
    // Esperar para que se cree el perfil
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Actualizar perfil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        nombre: USUARIO.nombre,
        telefono: USUARIO.telefono,
        rol: USUARIO.rol,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)
    
    if (updateError) {
      console.log('⚠️  Intentando crear perfil...\n')
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: USUARIO.email,
          nombre: USUARIO.nombre,
          telefono: USUARIO.telefono,
          rol: USUARIO.rol
        })
      
      if (insertError) {
        console.error('❌ Error al crear perfil:', insertError.message)
        return
      }
    }
    
    console.log('✅ Perfil configurado\n')
    
    // Verificar
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    
    console.log('✅ Verificación:')
    console.log(`   Nombre: ${profile.nombre}`)
    console.log(`   Email: ${profile.email}`)
    console.log(`   Rol: ${profile.rol}`)
    console.log(`   Teléfono: ${profile.telefono}\n`)
    
    console.log('=' .repeat(70))
    console.log('🎉 ¡Usuario creado exitosamente!\n')
    console.log('📝 Credenciales de acceso:')
    console.log(`   Email: ${USUARIO.email}`)
    console.log(`   Contraseña: ${USUARIO.password}\n`)
    console.log('🌐 Accede al panel en:')
    console.log('   http://localhost:3000/terapeuta/login\n')
    console.log('=' .repeat(70) + '\n')
    
  } catch (error) {
    console.error('❌ Error:', error.message || error)
  }
}

crearUsuario()
