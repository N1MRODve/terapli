/**
 * Script para sincronizar pagos desde el Excel a Teraplí
 *
 * Lee el Excel de sesiones y extrae información de pagos
 * para registrarlos en la tabla pagos_registros
 *
 * Uso:
 *   SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/sync-pagos-from-excel.ts --dry-run
 *   SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/sync-pagos-from-excel.ts
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

type PaymentMethod = 'efectivo' | 'transferencia' | 'bizum' | 'tarjeta' | 'stripe'

interface ExcelPago {
  paciente: string
  fecha: string
  precio: number
  estado: string
  metodo_pago: string
  bono_info: string | null
}

interface PacienteCache {
  id: string
  nombre_completo: string
  terapeuta_id: string
}

/**
 * Mapea método de pago del Excel al formato de Teraplí
 */
function mapearMetodoPago(metodo: string | null): PaymentMethod {
  if (!metodo) return 'efectivo'

  const metodoLower = metodo.toLowerCase().trim()

  if (metodoLower.includes('efectivo') || metodoLower.includes('cash')) {
    return 'efectivo'
  }
  if (metodoLower.includes('transfer')) {
    return 'transferencia'
  }
  if (metodoLower.includes('bizum')) {
    return 'bizum'
  }
  if (metodoLower.includes('tarjeta') || metodoLower.includes('card')) {
    return 'tarjeta'
  }
  if (metodoLower.includes('stripe')) {
    return 'stripe'
  }

  return 'efectivo' // Default
}

/**
 * Determina si una sesión está pagada según el estado del Excel
 */
function estaPagado(estado: string | null): boolean {
  if (!estado) return false
  const estadoLower = estado.toLowerCase().trim()
  return estadoLower.includes('pagad') ||
         estadoLower.includes('cobrad') ||
         estadoLower === 'ok' ||
         estadoLower === 'sí' ||
         estadoLower === 'si'
}

/**
 * Parsea fecha del Excel (puede ser número o string)
 */
function parsearFecha(fechaExcel: any): string | null {
  if (!fechaExcel) return null

  // Si es número (formato Excel serial)
  if (typeof fechaExcel === 'number') {
    // Excel usa días desde 1900-01-01
    const fecha = new Date((fechaExcel - 25569) * 86400 * 1000)
    return fecha.toISOString().split('T')[0]
  }

  // Si es string
  const fechaStr = String(fechaExcel).trim()

  // Formato DD/MM/YYYY
  const matchDMY = fechaStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (matchDMY) {
    const [, dia, mes, anio] = matchDMY
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
  }

  // Formato YYYY-MM-DD
  const matchISO = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (matchISO) {
    return fechaStr.substring(0, 10)
  }

  return null
}

async function syncPagos() {
  console.log('💰 Sincronizando pagos desde Excel...\n')
  if (DRY_RUN) console.log('⚠️  MODO DRY-RUN: No se harán cambios\n')

  // 1. Leer Excel
  console.log('📖 Leyendo archivo Excel...')
  const workbook = XLSX.readFile(EXCEL_PATH)
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]

  // Mostrar columnas disponibles
  const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[]
  console.log('   Columnas encontradas:', headers)

  const data = XLSX.utils.sheet_to_json(sheet) as any[]
  console.log('   Filas de datos: ' + data.length + '\n')

  // 2. Cargar caché de pacientes
  console.log('📊 Cargando pacientes de Teraplí...')
  const { data: pacientes, error: errPacientes } = await supabase
    .from('pacientes')
    .select('id, nombre_completo, terapeuta_id')

  if (errPacientes) {
    console.error('❌ Error cargando pacientes:', errPacientes.message)
    return
  }

  const pacientesCache = new Map<string, PacienteCache>()
  for (const p of pacientes || []) {
    // Indexar por nombre normalizado
    const nombreNorm = p.nombre_completo.toLowerCase().trim()
    pacientesCache.set(nombreNorm, p as PacienteCache)

    // También indexar por primer nombre + primer apellido
    const partes = nombreNorm.split(' ')
    if (partes.length >= 2) {
      pacientesCache.set(partes[0] + ' ' + partes[1], p as PacienteCache)
    }
  }
  console.log('   Pacientes cargados: ' + pacientesCache.size + '\n')

  // 3. Verificar si la tabla pagos_registros existe
  const { error: testError } = await supabase
    .from('pagos_registros')
    .select('id')
    .limit(1)

  if (testError && testError.code === '42P01') {
    console.error('❌ La tabla pagos_registros no existe')
    console.log('   Necesitas crear la tabla primero ejecutando la migración correspondiente')
    return
  }

  // 4. Procesar filas del Excel
  console.log('💳 Procesando pagos...\n')
  console.log('=' .repeat(80))

  let pagosCreados = 0
  let pagosOmitidos = 0
  let sinPaciente = 0
  let sinPago = 0
  let errores: string[] = []

  for (const row of data) {
    const nombrePaciente = row['Paciente']?.toString().trim()
    if (!nombrePaciente || nombrePaciente === '77') continue

    const estado = row['Estado']?.toString() || ''
    const metodoPagoExcel = row['Método de Pago']?.toString() || row['Metodo de Pago']?.toString() || ''
    const fechaExcel = row['Fecha']
    const precioStr = row['Precio']?.toString() || '0'
    const bonoInfo = row['Bonos']?.toString() || null

    // Verificar si está pagado
    if (!estaPagado(estado)) {
      sinPago++
      continue
    }

    // Buscar paciente
    const nombreNorm = nombrePaciente.toLowerCase().trim()
    let paciente = pacientesCache.get(nombreNorm)

    // Buscar por coincidencia parcial si no hay exacta
    if (!paciente) {
      for (const [key, value] of pacientesCache) {
        if (key.includes(nombreNorm) || nombreNorm.includes(key)) {
          paciente = value
          break
        }
      }
    }

    if (!paciente) {
      sinPaciente++
      console.log('   ⚠️  Paciente no encontrado: ' + nombrePaciente)
      continue
    }

    // Parsear datos del pago
    const fecha = parsearFecha(fechaExcel) || new Date().toISOString().split('T')[0]
    const precio = parseFloat(precioStr.replace(',', '.')) || 0
    const metodoPago = mapearMetodoPago(metodoPagoExcel)

    if (precio <= 0) {
      continue // Sin importe
    }

    // Determinar concepto
    let concepto = 'Sesión individual'
    if (bonoInfo) {
      concepto = 'Pago sesión de bono: ' + bonoInfo
    }

    console.log('\n   👤 ' + nombrePaciente)
    console.log('      📅 ' + fecha + ' | 💰 ' + precio + '€ | ' + metodoPago)

    if (DRY_RUN) {
      console.log('      ℹ️  [DRY-RUN] Se registraría este pago')
      pagosCreados++
      continue
    }

    // Verificar si ya existe este pago (evitar duplicados)
    const { data: pagoExistente } = await supabase
      .from('pagos_registros')
      .select('id')
      .eq('paciente_id', paciente.id)
      .eq('fecha_pago', fecha)
      .eq('monto', precio)
      .limit(1)

    if (pagoExistente && pagoExistente.length > 0) {
      console.log('      ⏭️  Ya existe - omitido')
      pagosOmitidos++
      continue
    }

    // Crear registro de pago
    const { error: insertError } = await supabase
      .from('pagos_registros')
      .insert({
        terapeuta_id: paciente.terapeuta_id,
        paciente_id: paciente.id,
        fecha_pago: fecha,
        monto: precio,
        metodo_pago: metodoPago,
        concepto: concepto
      })

    if (insertError) {
      errores.push('Error con ' + nombrePaciente + ': ' + insertError.message)
      console.log('      ❌ Error: ' + insertError.message)
    } else {
      pagosCreados++
      console.log('      ✅ Pago registrado')
    }
  }

  // 5. Resumen
  console.log('\n' + '=' .repeat(80))
  console.log('📊 RESUMEN DE SINCRONIZACIÓN')
  console.log('=' .repeat(80))

  console.log('\n   ✅ Pagos registrados: ' + pagosCreados)
  console.log('   ⏭️  Pagos omitidos (duplicados): ' + pagosOmitidos)
  console.log('   ⚠️  Sin paciente en BD: ' + sinPaciente)
  console.log('   ⚪ Sesiones sin pago: ' + sinPago)
  console.log('   ❌ Errores: ' + errores.length)

  if (errores.length > 0) {
    console.log('\n   Detalles de errores:')
    for (const err of errores) {
      console.log('      - ' + err)
    }
  }

  if (DRY_RUN) {
    console.log('\n⚠️  MODO DRY-RUN: No se hicieron cambios. Ejecuta sin --dry-run para aplicar.')
  }
}

syncPagos().catch(console.error)
