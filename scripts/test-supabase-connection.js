/**
 * Script de diagnóstico para verificar la conexión con Supabase
 * y el acceso a la tabla profiles
 * 
 * Uso:
 * node scripts/test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n🔍 Diagnóstico de Conexión Supabase\n')
console.log('━'.repeat(50))

// Verificar variables de entorno
console.log('\n📝 Variables de entorno:')
console.log('✓ SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ NO configurada')
console.log('✓ SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ NO configurada')
console.log('✓ SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Configurada' : '❌ NO configurada')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ ERROR: Faltan variables de entorno necesarias')
  process.exit(1)
}

// Crear cliente con ANON KEY (como lo hace la app)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)

// Crear cliente con SERVICE ROLE KEY (acceso sin restricciones)
const supabaseService = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

console.log('\n━'.repeat(50))
console.log('\n1️⃣  Probando conexión básica...\n')

try {
  const { data, error } = await supabaseAnon.from('profiles').select('count', { count: 'exact', head: true })
  
  if (error) {
    console.error('❌ Error al conectar con la tabla profiles:')
    console.error('   Código:', error.code)
    console.error('   Mensaje:', error.message)
    console.error('   Detalles:', error.details)
    console.error('   Hint:', error.hint)
  } else {
    console.log('✅ Conexión exitosa con tabla profiles')
    console.log(`   Total de perfiles: ${data || 0}`)
  }
} catch (err) {
  console.error('❌ Error de conexión:', err.message)
}

console.log('\n━'.repeat(50))
console.log('\n2️⃣  Verificando estructura de la tabla profiles...\n')

if (supabaseService) {
  try {
    // Obtener todos los perfiles (con SERVICE ROLE)
    const { data: profiles, error } = await supabaseService
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('❌ Error al obtener perfiles:', error.message)
    } else {
      console.log(`✅ Se encontraron ${profiles.length} perfiles (mostrando últimos 5):\n`)
      
      profiles.forEach((profile, index) => {
        console.log(`   ${index + 1}. ${profile.email}`)
        console.log(`      - Nombre: ${profile.nombre || 'N/A'}`)
        console.log(`      - Rol: ${profile.rol}`)
        console.log(`      - ID: ${profile.id}`)
        console.log(`      - Creado: ${new Date(profile.created_at).toLocaleString('es-ES')}`)
        console.log()
      })
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
} else {
  console.log('⚠️  No se puede verificar sin SERVICE_ROLE_KEY')
}

console.log('━'.repeat(50))
console.log('\n3️⃣  Probando acceso con usuario específico...\n')

const testUserId = 'd618017c-ea73-4d69-af50-32afb824f407'
console.log(`   Usuario de prueba: ${testUserId}\n`)

try {
  // Probar con ANON KEY (simula lo que hace la app)
  const { data: profile, error } = await supabaseAnon
    .from('profiles')
    .select('rol, nombre, email')
    .eq('id', testUserId)
    .single()
  
  if (error) {
    console.error('❌ Error con ANON KEY:')
    console.error('   Código:', error.code)
    console.error('   Mensaje:', error.message)
    console.error('   Detalles:', error.details)
    
    // Verificar si es problema de RLS
    if (error.code === '42501' || error.message?.includes('permission denied')) {
      console.error('\n   ⚠️  Problema de permisos RLS detectado')
      console.error('   Las políticas RLS están bloqueando el acceso')
    } else if (error.code === 'PGRST116') {
      console.error('\n   ⚠️  No se encontró el perfil')
      console.error('   El usuario no existe en la tabla profiles')
    }
  } else if (!profile) {
    console.log('⚠️  No se encontró perfil para este usuario')
  } else {
    console.log('✅ Perfil obtenido exitosamente:')
    console.log('   Email:', profile.email)
    console.log('   Nombre:', profile.nombre)
    console.log('   Rol:', profile.rol)
  }
} catch (err) {
  console.error('❌ Error:', err.message)
}

// Probar con SERVICE ROLE KEY
if (supabaseService) {
  console.log('\n   Probando con SERVICE_ROLE_KEY...\n')
  
  try {
    const { data: profile, error } = await supabaseService
      .from('profiles')
      .select('rol, nombre, email')
      .eq('id', testUserId)
      .single()
    
    if (error) {
      console.error('❌ Error con SERVICE_ROLE_KEY:', error.message)
    } else if (!profile) {
      console.log('⚠️  No se encontró perfil (SERVICE_ROLE_KEY)')
      console.log('   El usuario NO existe en la tabla profiles')
      console.log('   Necesitas crear el perfil manualmente')
    } else {
      console.log('✅ Perfil existe en la base de datos:')
      console.log('   Email:', profile.email)
      console.log('   Nombre:', profile.nombre)
      console.log('   Rol:', profile.rol)
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
  }
}

console.log('\n━'.repeat(50))
console.log('\n4️⃣  Verificando políticas RLS...\n')

if (supabaseService) {
  try {
    const { data: policies, error } = await supabaseService.rpc('exec_sql', {
      query: `
        SELECT 
          policyname,
          cmd,
          permissive,
          roles,
          qual::text as using_clause,
          with_check::text as check_clause
        FROM pg_policies 
        WHERE tablename = 'profiles'
        ORDER BY policyname;
      `
    })
    
    if (error) {
      console.log('⚠️  No se pudo verificar políticas automáticamente')
      console.log('   Verifica manualmente en SQL Editor de Supabase')
    } else {
      console.log(`✅ Se encontraron ${policies?.length || 0} políticas RLS`)
    }
  } catch (err) {
    console.log('⚠️  No se pudo verificar políticas:', err.message)
  }
} else {
  console.log('⚠️  No se puede verificar sin SERVICE_ROLE_KEY')
}

console.log('\n━'.repeat(50))
console.log('\n📋 RESUMEN Y RECOMENDACIONES:\n')

console.log('1. ✅ Si ves errores arriba, ejecuta el script de migración:')
console.log('   📄 supabase/migrations/20251025_fix_profiles_rls.sql')
console.log('\n2. 🔐 Si el error es de permisos (42501), las políticas RLS están bloqueando')
console.log('   Verifica que las políticas permitan SELECT para authenticated users')
console.log('\n3. 📝 Si el perfil no existe (PGRST116), créalo manualmente:')
console.log(`   INSERT INTO profiles (id, email, nombre, rol)`)
console.log(`   VALUES ('${testUserId}', 'karemeyde@gmail.com', 'Karem', 'psicologa');`)
console.log('\n4. 📖 Para más información, consulta:')
console.log('   📄 SOLUCION_ERROR_500_PERFIL.md')

console.log('\n━'.repeat(50))
console.log()
