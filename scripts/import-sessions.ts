/**
 * Script de importación de sesiones desde Excel
 *
 * Uso:
 *   npx tsx scripts/import-sessions.ts --dry-run    # Ver qué se importaría
 *   npx tsx scripts/import-sessions.ts              # Importar realmente
 *   npx tsx scripts/import-sessions.ts --file=/ruta/al/archivo.xlsx
 */

import XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://pcbchuaezokqppwsbnty.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Archivo Excel por defecto
const DEFAULT_EXCEL_PATH = '/Users/dieterlorenzo/Downloads/Lista de Sesiones Dic 28 2025.xlsx'

// ============================================================================
// TIPOS
// ============================================================================

interface ExcelRow {
  profesional: string
  paciente: string
  dni: string | null
  comunicacion: string
  tipo: string
  fecha: string
  precio: string
  comision_centro: string
  comision_profesional: string
  bonos: string | null
  estado: string | null
  metodo_pago: string | null
  fecha_pago: string | null
}

interface ParsedSession {
  paciente_nombre: string
  paciente_dni: string | null
  terapeuta_nombre: string
  fecha_cita: string  // YYYY-MM-DD
  hora_inicio: string // HH:MM
  hora_fin: string    // HH:MM
  modalidad: 'presencial' | 'online'
  estado: 'pendiente' | 'confirmada' | 'realizada'
  precio: number
  tipo_sesion: string
  bono_info: {
    nombre: string
    monto: number
    sesion_actual: number
    sesion_total: number
  } | null
  metodo_pago: string | null
}

interface ImportResult {
  pacientes_creados: number
  pacientes_existentes: number
  citas_creadas: number
  citas_duplicadas: number
  errores: string[]
  warnings: string[]
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Parsea precio en formato español "35,00" a número
 */
function parsePrice(priceStr: string): number {
  if (!priceStr || priceStr.trim() === '') return 0
  return parseFloat(priceStr.replace(',', '.'))
}

/**
 * Parsea fecha "2025-12-01 18:00" a fecha y hora separados
 */
function parseDateTime(dateStr: string): { fecha: string; hora: string } {
  const [fecha, hora] = dateStr.split(' ')
  return {
    fecha: fecha || '',
    hora: hora || '00:00'
  }
}

/**
 * Calcula hora de fin basada en el tipo de sesión
 */
function calcularHoraFin(horaInicio: string, tipoSesion: string): string {
  const [hours, minutes] = horaInicio.split(':').map(Number)

  // Extraer duración del tipo de sesión si está entre paréntesis
  const duracionMatch = tipoSesion.match(/\((\d+)\)/)
  let duracionMinutos = 50 // Por defecto 50 minutos

  if (duracionMatch) {
    duracionMinutos = parseInt(duracionMatch[1])
  } else if (tipoSesion.toLowerCase().includes('pareja')) {
    duracionMinutos = 60
  }

  // La base de datos requiere mínimo 30 minutos
  if (duracionMinutos < 30) {
    duracionMinutos = 30
  }

  const totalMinutos = (hours || 0) * 60 + (minutes || 0) + duracionMinutos
  const newHours = Math.floor(totalMinutos / 60)
  const newMinutes = totalMinutos % 60

  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
}

/**
 * Parsea información del bono desde string como "Semanal 160 (3/4)"
 */
function parseBono(bonoStr: string | null): ParsedSession['bono_info'] {
  if (!bonoStr || bonoStr.trim() === '') return null

  // Patrón: "Nombre Monto (X/Y)" ej: "Semanal 160 (3/4)"
  const match = bonoStr.match(/^(.+?)\s+(\d+)?\s*\((\d+)\/(\d+)\)$/i)

  if (match) {
    return {
      nombre: match[1].trim(),
      monto: match[2] ? parseInt(match[2]) : 0,
      sesion_actual: parseInt(match[3]),
      sesion_total: parseInt(match[4])
    }
  }

  // Patrón alternativo: "Nombre (X/Y)" sin monto
  const altMatch = bonoStr.match(/^(.+?)\s*\((\d+)\/(\d+)\)$/i)
  if (altMatch) {
    return {
      nombre: altMatch[1].trim(),
      monto: 0,
      sesion_actual: parseInt(altMatch[2]),
      sesion_total: parseInt(altMatch[3])
    }
  }

  return null
}

/**
 * Mapea estado del Excel a estado de la base de datos
 */
function mapEstado(estado: string | null): 'pendiente' | 'confirmada' | 'realizada' {
  if (!estado) return 'pendiente'

  const estadoLower = estado.toLowerCase().trim()
  if (estadoLower === 'pagada' || estadoLower === 'completada') return 'realizada'
  if (estadoLower === 'confirmada') return 'confirmada'
  return 'pendiente'
}

/**
 * Mapea modalidad
 */
function mapModalidad(comunicacion: string): 'presencial' | 'online' {
  return comunicacion.toLowerCase().includes('online') ? 'online' : 'presencial'
}

/**
 * Mapea método de pago
 */
function mapMetodoPago(metodo: string | null): string | null {
  if (!metodo) return null

  const metodoLower = metodo.toLowerCase().trim()
  if (metodoLower === 'efectivo') return 'efectivo'
  if (metodoLower === 'bizum') return 'bizum'
  if (metodoLower === 'transferencia bancaria' || metodoLower === 'transferencia') return 'transferencia'
  if (metodoLower === 'tarjeta') return 'tarjeta'
  if (metodoLower === 'gratuita') return null // Sesión gratuita, no hay pago

  return metodo
}

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Lee el archivo Excel y devuelve las filas parseadas
 */
function readExcelFile(filePath: string): ExcelRow[] {
  console.log(`📂 Leyendo archivo: ${filePath}`)

  const workbook = XLSX.readFile(filePath)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName!]

  // Convertir a JSON
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

  // Encontrar la fila de encabezados
  const headerRow = rawData.find(row =>
    row.some((cell: any) =>
      typeof cell === 'string' && cell.toLowerCase().includes('profesional')
    )
  )

  if (!headerRow) {
    throw new Error('No se encontró la fila de encabezados en el Excel')
  }

  const headerIndex = rawData.indexOf(headerRow)
  const dataRows = rawData.slice(headerIndex + 1)

  // Mapear columnas
  const columnMap: { [key: string]: number } = {}
  headerRow.forEach((cell: any, index: number) => {
    if (typeof cell === 'string') {
      const key = cell.toLowerCase().trim()
      if (key.includes('profesional')) columnMap['profesional'] = index
      if (key.includes('paciente') && !key.includes('dni')) columnMap['paciente'] = index
      if (key.includes('dni')) columnMap['dni'] = index
      if (key.includes('comunic')) columnMap['comunicacion'] = index
      if (key === 'tipo') columnMap['tipo'] = index
      if (key.includes('fecha') && !key.includes('pago')) columnMap['fecha'] = index
      if (key.includes('precio')) columnMap['precio'] = index
      if (key.includes('comisión centro') || key.includes('comision centro')) columnMap['comision_centro'] = index
      if (key.includes('comisión profesional') || key.includes('comision profesional')) columnMap['comision_profesional'] = index
      if (key.includes('bonos') || key.includes('bono')) columnMap['bonos'] = index
      if (key === 'estado') columnMap['estado'] = index
      if (key.includes('método') || key.includes('metodo')) columnMap['metodo_pago'] = index
      if (key.includes('fecha') && key.includes('pago')) columnMap['fecha_pago'] = index
    }
  })

  console.log(`📋 Columnas detectadas:`, Object.keys(columnMap))

  const rows: ExcelRow[] = []

  for (const row of dataRows) {
    // Ignorar filas de totales o vacías
    const profesional = row[columnMap['profesional']]
    if (!profesional ||
        typeof profesional !== 'string' ||
        profesional.toLowerCase().includes('total') ||
        profesional.toLowerCase().includes('n. sesiones')) {
      continue
    }

    const paciente = row[columnMap['paciente']]
    if (!paciente || typeof paciente !== 'string') continue

    // Parsear fecha - puede venir como número de Excel o string
    let fechaStr = row[columnMap['fecha']]
    if (typeof fechaStr === 'number') {
      // Convertir fecha de Excel a string
      const date = XLSX.SSF.parse_date_code(fechaStr)
      const dateObj = new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0)
      fechaStr = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')} ${String(date.H || 0).padStart(2, '0')}:${String(date.M || 0).padStart(2, '0')}`
    }

    rows.push({
      profesional: String(profesional).trim(),
      paciente: String(paciente).trim(),
      dni: row[columnMap['dni']] ? String(row[columnMap['dni']]).trim() : null,
      comunicacion: String(row[columnMap['comunicacion']] || 'Presencial').trim(),
      tipo: String(row[columnMap['tipo']] || '').trim(),
      fecha: String(fechaStr || '').trim(),
      precio: String(row[columnMap['precio']] || '0').trim(),
      comision_centro: String(row[columnMap['comision_centro']] || '0').trim(),
      comision_profesional: String(row[columnMap['comision_profesional']] || '0').trim(),
      bonos: row[columnMap['bonos']] ? String(row[columnMap['bonos']]).trim() : null,
      estado: row[columnMap['estado']] ? String(row[columnMap['estado']]).trim() : null,
      metodo_pago: row[columnMap['metodo_pago']] ? String(row[columnMap['metodo_pago']]).trim() : null,
      fecha_pago: row[columnMap['fecha_pago']] ? String(row[columnMap['fecha_pago']]).trim() : null
    })
  }

  console.log(`✅ Leídas ${rows.length} filas del Excel`)
  return rows
}

/**
 * Convierte filas del Excel a sesiones parseadas
 */
function parseRows(rows: ExcelRow[]): ParsedSession[] {
  const sessions: ParsedSession[] = []

  for (const row of rows) {
    const { fecha, hora } = parseDateTime(row.fecha)

    if (!fecha) {
      console.warn(`⚠️ Fila sin fecha válida: ${row.paciente}`)
      continue
    }

    sessions.push({
      paciente_nombre: row.paciente,
      paciente_dni: row.dni,
      terapeuta_nombre: row.profesional,
      fecha_cita: fecha,
      hora_inicio: hora,
      hora_fin: calcularHoraFin(hora, row.tipo),
      modalidad: mapModalidad(row.comunicacion),
      estado: mapEstado(row.estado),
      precio: parsePrice(row.precio),
      tipo_sesion: row.tipo,
      bono_info: parseBono(row.bonos),
      metodo_pago: mapMetodoPago(row.metodo_pago)
    })
  }

  return sessions
}

/**
 * Importa las sesiones a Supabase
 */
async function importToSupabase(
  sessions: ParsedSession[],
  dryRun: boolean = false
): Promise<ImportResult> {
  const result: ImportResult = {
    pacientes_creados: 0,
    pacientes_existentes: 0,
    citas_creadas: 0,
    citas_duplicadas: 0,
    errores: [],
    warnings: []
  }

  if (!SUPABASE_SERVICE_KEY) {
    result.errores.push('SUPABASE_SERVICE_ROLE_KEY no configurada. Define la variable de entorno.')
    return result
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Obtener terapeuta Karem Peña
  const { data: terapeutas, error: tError } = await supabase
    .from('terapeutas')
    .select('id, nombre_completo, email')
    .ilike('nombre_completo', '%Karem%')

  if (tError || !terapeutas?.length) {
    result.errores.push(`No se encontró la terapeuta "Karem Peña". Error: ${tError?.message}`)
    return result
  }

  const terapeuta = terapeutas[0]
  console.log(`👩‍⚕️ Terapeuta encontrada: ${terapeuta.nombre_completo} (${terapeuta.id})`)

  // Obtener todos los pacientes existentes
  const { data: pacientesExistentes } = await supabase
    .from('pacientes')
    .select('id, nombre_completo, email, documento_identidad')

  const pacienteMap = new Map<string, string>()
  pacientesExistentes?.forEach(p => {
    // Mapear por nombre normalizado
    const nombreNorm = p.nombre_completo?.toLowerCase().trim() || ''
    if (nombreNorm) pacienteMap.set(nombreNorm, p.id)
  })

  console.log(`📋 ${pacienteMap.size} pacientes existentes en la base de datos`)

  // Procesar cada sesión
  for (const session of sessions) {
    const nombreNorm = session.paciente_nombre.toLowerCase().trim()

    // Buscar o crear paciente
    let pacienteId = pacienteMap.get(nombreNorm)

    if (!pacienteId) {
      // Crear paciente nuevo
      if (dryRun) {
        console.log(`  [DRY-RUN] Crearía paciente: ${session.paciente_nombre}`)
        result.pacientes_creados++
        pacienteId = 'dry-run-id'
      } else {
        const { data: newPaciente, error: pError } = await supabase
          .from('pacientes')
          .insert({
            nombre_completo: session.paciente_nombre,
            documento_identidad: session.paciente_dni,
            terapeuta_id: terapeuta.id
          })
          .select('id')
          .single()

        if (pError) {
          result.errores.push(`Error creando paciente ${session.paciente_nombre}: ${pError.message}`)
          continue
        }

        pacienteId = newPaciente.id
        pacienteMap.set(nombreNorm, pacienteId)
        result.pacientes_creados++
        console.log(`  ✅ Paciente creado: ${session.paciente_nombre}`)
      }
    } else {
      result.pacientes_existentes++
    }

    // Verificar si la cita ya existe
    const { data: citaExistente } = await supabase
      .from('citas')
      .select('id')
      .eq('paciente_id', pacienteId)
      .eq('fecha_cita', session.fecha_cita)
      .eq('hora_inicio', session.hora_inicio + ':00')
      .maybeSingle()

    if (citaExistente) {
      result.citas_duplicadas++
      result.warnings.push(`Cita duplicada: ${session.paciente_nombre} el ${session.fecha_cita} a las ${session.hora_inicio}`)
      continue
    }

    // Crear la cita
    if (dryRun) {
      console.log(`  [DRY-RUN] Crearía cita: ${session.paciente_nombre} - ${session.fecha_cita} ${session.hora_inicio}`)
      result.citas_creadas++
    } else {
      const { error: cError } = await supabase
        .from('citas')
        .insert({
          paciente_id: pacienteId,
          terapeuta_id: terapeuta.id,
          fecha_cita: session.fecha_cita,
          hora_inicio: session.hora_inicio + ':00',
          hora_fin: session.hora_fin + ':00',
          modalidad: session.modalidad,
          estado: session.estado,
          observaciones: session.tipo_sesion ? `Tipo: ${session.tipo_sesion}` : null,
          metadata: {
            importado: true,
            fecha_importacion: new Date().toISOString(),
            precio_original: session.precio,
            bono_info: session.bono_info,
            metodo_pago: session.metodo_pago
          }
        })

      if (cError) {
        result.errores.push(`Error creando cita para ${session.paciente_nombre}: ${cError.message}`)
        continue
      }

      result.citas_creadas++
    }
  }

  return result
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 Iniciando importación de sesiones desde Excel\n')

  // Parsear argumentos
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const fileArg = args.find(a => a.startsWith('--file='))
  const filePath = fileArg ? fileArg.split('=')[1] : DEFAULT_EXCEL_PATH

  if (dryRun) {
    console.log('⚠️  MODO DRY-RUN: No se realizarán cambios en la base de datos\n')
  }

  try {
    // 1. Leer Excel
    const rows = readExcelFile(filePath!)

    // 2. Parsear filas
    const sessions = parseRows(rows)
    console.log(`\n📊 Sesiones parseadas: ${sessions.length}`)

    // Mostrar resumen de datos
    const pacientesUnicos = new Set(sessions.map(s => s.paciente_nombre))
    console.log(`👥 Pacientes únicos: ${pacientesUnicos.size}`)
    console.log(`📅 Rango de fechas: ${sessions[0]?.fecha_cita} a ${sessions[sessions.length - 1]?.fecha_cita}`)

    // Mostrar primeras 5 sesiones como ejemplo
    console.log('\n📋 Primeras 5 sesiones:')
    sessions.slice(0, 5).forEach(s => {
      console.log(`  - ${s.paciente_nombre} | ${s.fecha_cita} ${s.hora_inicio} | ${s.modalidad} | ${s.estado}`)
    })

    // 3. Importar a Supabase
    console.log('\n📤 Importando a Supabase...\n')
    const result = await importToSupabase(sessions, dryRun)

    // 4. Mostrar resultado
    console.log('\n' + '='.repeat(50))
    console.log('📊 RESULTADO DE LA IMPORTACIÓN')
    console.log('='.repeat(50))
    console.log(`✅ Pacientes creados: ${result.pacientes_creados}`)
    console.log(`📋 Pacientes existentes: ${result.pacientes_existentes}`)
    console.log(`✅ Citas creadas: ${result.citas_creadas}`)
    console.log(`⏭️  Citas duplicadas (ignoradas): ${result.citas_duplicadas}`)

    if (result.errores.length > 0) {
      console.log(`\n❌ Errores (${result.errores.length}):`)
      result.errores.forEach(e => console.log(`  - ${e}`))
    }

    if (result.warnings.length > 0 && result.warnings.length <= 10) {
      console.log(`\n⚠️  Advertencias (${result.warnings.length}):`)
      result.warnings.forEach(w => console.log(`  - ${w}`))
    } else if (result.warnings.length > 10) {
      console.log(`\n⚠️  ${result.warnings.length} advertencias (mostrando primeras 10):`)
      result.warnings.slice(0, 10).forEach(w => console.log(`  - ${w}`))
    }

    console.log('\n' + '='.repeat(50))

    if (dryRun) {
      console.log('\n💡 Para ejecutar la importación real, ejecuta sin --dry-run')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

main()
