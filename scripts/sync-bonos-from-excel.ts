/**
 * Script para sincronizar bonos y pagos desde el Excel a Teraplí
 *
 * Este script:
 * 1. Lee el Excel de sesiones
 * 2. Identifica pacientes con bonos
 * 3. Crea/actualiza bonos en la BD
 * 4. Actualiza información de pagos
 *
 * Uso:
 *   SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/sync-bonos-from-excel.ts --dry-run
 *   SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/sync-bonos-from-excel.ts
 */

import XLSX from 'xlsx'
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

const EXCEL_PATH = '/Users/dieterlorenzo/Downloads/Lista de Sesiones Dic 28 2025.xlsx'
const DRY_RUN = process.argv.includes('--dry-run')

interface ExcelSession {
  paciente: string
  dni: string | null
  tipo_sesion: string
  fecha: string
  precio: number
  bono_info: string | null
  estado: string | null
  metodo_pago: string | null
}

interface ParsedBono {
  nombre: string
  precio_total: number
  sesiones_totales: number
  sesion_actual: number
}

interface PacienteBono {
  paciente_nombre: string
  paciente_id: string | null
  bono: ParsedBono | null
  sesiones: ExcelSession[]
  total_pagado: number
  total_pendiente: number
  metodos_pago: Set<string>
}

function parseBono(bonoStr: string | null): ParsedBono | null {
  if (!bonoStr) return null

  // Formatos de Eholo:
  // "Semanal 160 (3/4)" - precio 160, sesión 3 de 4
  // "Quincenal (40) (2/2)" - precio 40 entre paréntesis, sesión 2 de 2
  // "Encuentro Semanal (4/4)" - sin precio explícito
  // "Quincenal 80 (1/2)" - precio 80

  let nombre = ''
  let precio_total = 0
  let sesion_actual = 0
  let sesiones_totales = 0

  // Extraer sesión actual y total (siempre al final en formato X/Y)
  const sesionMatch = bonoStr.match(/\((\d+)\/(\d+)\)\s*$/)
  if (sesionMatch) {
    sesion_actual = parseInt(sesionMatch[1])
    sesiones_totales = parseInt(sesionMatch[2])
  } else {
    return null // Si no tiene formato de sesiones, no es un bono válido
  }

  // Extraer precio - buscar números antes del paréntesis de sesiones
  // "Semanal 160 (3/4)" -> 160
  // "Quincenal (40) (2/2)" -> 40
  // "Quincenal 80 (1/2)" -> 80
  const sinSesiones = bonoStr.replace(/\(\d+\/\d+\)\s*$/, '').trim()

  // Buscar número en paréntesis primero: "Quincenal (40)"
  const precioEnParentesis = sinSesiones.match(/\((\d+)\)/)
  if (precioEnParentesis) {
    precio_total = parseInt(precioEnParentesis[1])
  } else {
    // Buscar número suelto: "Semanal 160" o "Quincenal 80"
    const precioSuelto = sinSesiones.match(/(\d+)\s*$/)
    if (precioSuelto) {
      precio_total = parseInt(precioSuelto[1])
    }
  }

  // Extraer nombre/tipo
  if (bonoStr.toLowerCase().includes('semanal')) {
    nombre = 'Bono Semanal'
  } else if (bonoStr.toLowerCase().includes('quincenal')) {
    nombre = 'Bono Quincenal'
  } else if (bonoStr.toLowerCase().includes('encuentro')) {
    nombre = 'Bono Encuentro'
  } else {
    nombre = 'Bono'
  }

  // Añadir número de sesiones al nombre
  nombre += ` ${sesiones_totales} Sesiones`

  return {
    nombre,
    precio_total,
    sesiones_totales,
    sesion_actual
  }
}

async function readExcelSessions(): Promise<Map<string, PacienteBono>> {
  console.log('📖 Leyendo archivo Excel...\n')

  const workbook = XLSX.readFile(EXCEL_PATH)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(sheet) as any[]

  const pacientes = new Map<string, PacienteBono>()

  for (const row of data) {
    const paciente = row['Paciente']?.toString().trim()
    if (!paciente || paciente === '77') continue // Ignorar filas inválidas

    const session: ExcelSession = {
      paciente,
      dni: row['DNI']?.toString().trim() || null,
      tipo_sesion: row['Tipo']?.toString().trim() || '',
      fecha: row['Fecha']?.toString().trim() || '',
      precio: parseFloat((row['Precio']?.toString() || '0').replace(',', '.')),
      bono_info: row['Bonos']?.toString().trim() || null,
      estado: row['Estado']?.toString().trim() || null,
      metodo_pago: row['Método de Pago']?.toString().trim() || null
    }

    if (!pacientes.has(paciente)) {
      pacientes.set(paciente, {
        paciente_nombre: paciente,
        paciente_id: null,
        bono: null,
        sesiones: [],
        total_pagado: 0,
        total_pendiente: 0,
        metodos_pago: new Set()
      })
    }

    const p = pacientes.get(paciente)!
    p.sesiones.push(session)

    // Parsear bono (usar el último que tenga info)
    if (session.bono_info) {
      const bono = parseBono(session.bono_info)
      if (bono) p.bono = bono
    }

    // Calcular pagos
    if (session.estado?.toLowerCase().includes('pagad')) {
      p.total_pagado += session.precio
    } else {
      p.total_pendiente += session.precio
    }

    if (session.metodo_pago) {
      p.metodos_pago.add(session.metodo_pago)
    }
  }

  console.log(`   Encontrados ${pacientes.size} pacientes únicos\n`)
  return pacientes
}

async function findPacienteId(nombre: string): Promise<string | null> {
  // Buscar por nombre exacto
  const { data: exact } = await supabase
    .from('pacientes')
    .select('id')
    .ilike('nombre_completo', nombre)
    .limit(1)

  if (exact && exact.length > 0) return exact[0].id

  // Buscar por nombre parcial
  const { data: partial } = await supabase
    .from('pacientes')
    .select('id, nombre_completo')
    .or(`nombre_completo.ilike.%${nombre.split(' ')[0]}%`)
    .limit(5)

  if (partial && partial.length > 0) {
    // Buscar el que más coincida
    for (const p of partial) {
      const nombreBD = p.nombre_completo.toLowerCase()
      const nombreExcel = nombre.toLowerCase()
      if (nombreBD.includes(nombreExcel) || nombreExcel.includes(nombreBD)) {
        return p.id
      }
    }
  }

  return null
}

async function syncBonos() {
  console.log('🔄 Sincronizando bonos desde Excel...\n')
  if (DRY_RUN) console.log('⚠️  MODO DRY-RUN: No se harán cambios\n')

  const pacientesExcel = await readExcelSessions()

  // Estadísticas
  let bonosCreados = 0
  let bonosActualizados = 0
  let pacientesSinMatch = 0
  let errores: string[] = []

  // Primero, buscar IDs de pacientes
  console.log('🔍 Buscando pacientes en base de datos...\n')

  for (const [nombre, data] of pacientesExcel) {
    const id = await findPacienteId(nombre)
    data.paciente_id = id
    if (!id) {
      pacientesSinMatch++
      console.log(`   ⚠️  No encontrado: ${nombre}`)
    }
  }

  console.log(`\n   ✅ Pacientes encontrados: ${pacientesExcel.size - pacientesSinMatch}`)
  console.log(`   ⚠️  Pacientes sin match: ${pacientesSinMatch}\n`)

  // Procesar pacientes con bonos
  console.log('='.repeat(80))
  console.log('🎫 PROCESANDO BONOS')
  console.log('='.repeat(80))

  for (const [nombre, data] of pacientesExcel) {
    if (!data.bono || !data.paciente_id) continue

    console.log(`\n👤 ${nombre}`)
    console.log(`   📦 ${data.bono.nombre}: ${data.bono.sesion_actual}/${data.bono.sesiones_totales} sesiones`)
    console.log(`   💰 Precio bono: ${data.bono.precio_total}€`)
    console.log(`   💵 Total pagado: ${data.total_pagado}€ | Pendiente: ${data.total_pendiente}€`)

    if (DRY_RUN) {
      console.log(`   ℹ️  [DRY-RUN] Se crearía/actualizaría bono`)
      continue
    }

    // Verificar si ya existe un bono activo para este paciente
    const { data: bonoExistente } = await supabase
      .from('bonos')
      .select('*')
      .eq('paciente_id', data.paciente_id)
      .eq('estado', 'activo')
      .limit(1)

    if (bonoExistente && bonoExistente.length > 0) {
      // Actualizar bono existente
      const bono = bonoExistente[0]
      const sesionesRestantes = data.bono.sesiones_totales - data.bono.sesion_actual

      const { error } = await supabase
        .from('bonos')
        .update({
          sesiones_restantes: sesionesRestantes,
          monto_total: data.bono.precio_total,
          pagado: data.total_pagado >= data.bono.precio_total,
          metadata: {
            ...bono.metadata,
            sincronizado_excel: new Date().toISOString(),
            metodos_pago: Array.from(data.metodos_pago)
          }
        })
        .eq('id', bono.id)

      if (error) {
        errores.push(`Error actualizando bono de ${nombre}: ${error.message}`)
        console.log(`   ❌ Error: ${error.message}`)
      } else {
        bonosActualizados++
        console.log(`   ✅ Bono actualizado (${sesionesRestantes} sesiones restantes)`)
      }
    } else {
      // Crear nuevo bono
      const sesionesRestantes = data.bono.sesiones_totales - data.bono.sesion_actual

      // Obtener terapeuta_id del paciente
      const { data: paciente } = await supabase
        .from('pacientes')
        .select('terapeuta_id')
        .eq('id', data.paciente_id)
        .single()

      // Determinar tipo de bono basado en frecuencia
      let tipoBono = 'personalizado'
      if (data.bono.nombre.toLowerCase().includes('semanal')) {
        tipoBono = 'semanal'
      } else if (data.bono.nombre.toLowerCase().includes('quincenal')) {
        tipoBono = 'quincenal'
      } else if (data.bono.sesiones_totales === 5) {
        tipoBono = '5_sesiones'
      } else if (data.bono.sesiones_totales === 10) {
        tipoBono = '10_sesiones'
      }

      const { error } = await supabase
        .from('bonos')
        .insert({
          paciente_id: data.paciente_id,
          terapeuta_id: paciente?.terapeuta_id,
          tipo: tipoBono,
          sesiones_totales: data.bono.sesiones_totales,
          sesiones_restantes: sesionesRestantes,
          monto_total: data.bono.precio_total,
          pagado: data.total_pagado >= data.bono.precio_total,
          estado: sesionesRestantes > 0 ? 'activo' : 'completado',
          fecha_inicio: new Date().toISOString().split('T')[0],
          metadata: {
            origen: 'excel_import',
            sincronizado: new Date().toISOString(),
            metodos_pago: Array.from(data.metodos_pago),
            nombre_bono_original: data.bono.nombre,
            precio_por_sesion: data.bono.precio_total / data.bono.sesiones_totales
          }
        })

      if (error) {
        errores.push(`Error creando bono de ${nombre}: ${error.message}`)
        console.log(`   ❌ Error: ${error.message}`)
      } else {
        bonosCreados++
        console.log(`   ✅ Bono creado (${sesionesRestantes} sesiones restantes)`)
      }
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(80))
  console.log('📊 RESUMEN DE SINCRONIZACIÓN')
  console.log('='.repeat(80))

  console.log(`\n   🎫 Bonos creados: ${bonosCreados}`)
  console.log(`   🔄 Bonos actualizados: ${bonosActualizados}`)
  console.log(`   ⚠️  Pacientes sin match: ${pacientesSinMatch}`)
  console.log(`   ❌ Errores: ${errores.length}`)

  if (errores.length > 0) {
    console.log('\n   Detalles de errores:')
    for (const err of errores) {
      console.log(`      - ${err}`)
    }
  }

  // Mostrar pacientes con bonos en Excel que no tienen paciente_id
  console.log('\n' + '='.repeat(80))
  console.log('⚠️  PACIENTES CON BONOS SIN MATCH EN BD')
  console.log('='.repeat(80))

  for (const [nombre, data] of pacientesExcel) {
    if (data.bono && !data.paciente_id) {
      console.log(`\n   👤 ${nombre}`)
      console.log(`      📦 ${data.bono.nombre}: ${data.bono.sesion_actual}/${data.bono.sesiones_totales}`)
      console.log(`      💰 ${data.bono.precio_total}€`)
      console.log(`      📅 ${data.sesiones.length} sesiones en Excel`)
    }
  }

  // Exportar reporte
  console.log('\n📁 Exportando reporte...')

  const reportData = Array.from(pacientesExcel.values()).map(p => ({
    'Paciente': p.paciente_nombre,
    'ID en BD': p.paciente_id || 'NO ENCONTRADO',
    'Tiene Bono': p.bono ? 'Sí' : 'No',
    'Tipo Bono': p.bono?.nombre || '',
    'Sesiones Usadas': p.bono?.sesion_actual || 0,
    'Sesiones Totales': p.bono?.sesiones_totales || 0,
    'Precio Bono': p.bono?.precio_total || 0,
    'Total Sesiones Excel': p.sesiones.length,
    'Total Pagado': p.total_pagado,
    'Total Pendiente': p.total_pendiente,
    'Métodos de Pago': Array.from(p.metodos_pago).join(', ')
  }))

  const ws = XLSX.utils.json_to_sheet(reportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sincronización Bonos')

  const outputPath = '/Users/dieterlorenzo/Downloads/Sync_Bonos_Report.xlsx'
  XLSX.writeFile(wb, outputPath)

  console.log(`\n✅ Reporte exportado a: ${outputPath}`)
}

syncBonos().catch(console.error)
