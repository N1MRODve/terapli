/**
 * =============================================================================
 * ENDPOINT: POST /api/patients/import/execute
 * =============================================================================
 * Ejecuta la importación real de pacientes usando el mapeo confirmado.
 *
 * Flujo:
 * 1. Recupera configuración de BD (con mapeo validado)
 * 2. Lee archivo completo (se debe reenviar el archivo)
 * 3. Aplica mapeo: transforma cada fila a campos Teraplí
 * 4. Valida cada fila mapeada
 * 5. Detecta duplicados en BD
 * 6. Inserta/actualiza pacientes según acción elegida
 * 7. Marca perfiles incompletos
 * 8. Limpia configuración temporal
 * 9. Retorna resultados con perfiles incompletos
 */

import { createServerClient } from '@supabase/ssr'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type {
  ColumnMapping,
  PacienteField,
  ImportResultWithProfiles,
  IncompletePatientProfile
} from '~/types/import-mapping.types'

// Campos requeridos para perfil completo
const PROFILE_COMPLETE_FIELDS: PacienteField[] = [
  'nombre_completo',
  'email',
  'telefono',
  'documento_identidad'
]

// Límites
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_ROWS = 5000

export default defineEventHandler(async (event) => {
  try {
    // 1. Leer formulario multipart
    const form = await readMultipartFormData(event)

    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No se encontraron datos en el formulario'
      })
    }

    // Extraer campos
    const fileData = form.find(item => item.name === 'file')
    const configIdField = form.find(item => item.name === 'configId')
    const actionField = form.find(item => item.name === 'action')

    if (!fileData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No se encontró el archivo'
      })
    }

    if (!configIdField) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No se encontró el ID de configuración'
      })
    }

    const configId = configIdField.data.toString('utf-8')
    const action = actionField?.data.toString('utf-8') || 'skip' // 'update' o 'skip'

    // Validar tamaño del archivo
    if (fileData.data.length > MAX_FILE_SIZE) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El archivo excede el tamaño máximo de 10MB'
      })
    }

    // 2. Obtener cliente Supabase
    const runtimeConfig = useRuntimeConfig()
    const supabaseUrl = runtimeConfig.supabaseUrl || process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = runtimeConfig.supabaseKey || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error de configuración: faltan las credenciales de Supabase'
      })
    }

    const supabaseClient = await createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get: (name) => getCookie(event, name),
          set: (name, value, options) => setCookie(event, name, value, options),
          remove: (name, options) => deleteCookie(event, name, options)
        }
      }
    )

    // 3. Verificar autenticación
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No autenticado'
      })
    }

    // 4. Verificar rol (debe ser psicologa o admin)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No se pudo verificar el rol del usuario'
      })
    }

    const allowedRoles = ['psicologa', 'admin', 'coordinadora']
    if (!allowedRoles.includes(profile.rol)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No tienes permisos para importar pacientes'
      })
    }

    // 5. Recuperar configuración de BD
    console.log('[Import Execute] Buscando config:', configId, 'para usuario:', user.id)

    const { data: config, error: configError } = await supabaseClient
      .from('import_configs')
      .select('*')
      .eq('id', configId)
      .eq('user_id', user.id)
      .single()

    if (configError) {
      console.error('[Import Execute] Error al buscar config:', configError)
    }

    // Intentar obtener mappings del FormData como fallback
    const mappingsField = form.find(item => item.name === 'mappings')
    let mappings: ColumnMapping[] = []

    if (config) {
      // Verificar que no haya expirado
      if (new Date(config.expires_at) < new Date()) {
        throw createError({
          statusCode: 410,
          statusMessage: 'La configuración de importación ha expirado. Por favor, vuelve a subir el archivo.'
        })
      }
      mappings = config.mappings as ColumnMapping[]
      console.log('[Import Execute] Mappings desde BD:', mappings.length, 'campos')
    } else if (mappingsField) {
      // Fallback: usar mappings del FormData
      try {
        mappings = JSON.parse(mappingsField.data.toString('utf-8'))
        console.log('[Import Execute] Mappings desde FormData:', mappings.length, 'campos')
      } catch (e) {
        console.error('[Import Execute] Error parseando mappings del FormData:', e)
      }
    }

    if (!mappings || mappings.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Configuración de importación no encontrada o expirada. Por favor, vuelve a subir el archivo.'
      })
    }

    // 6. Parsear archivo completo
    const filename = fileData.filename || config?.file_name || 'import.xlsx'
    const extension = filename.split('.').pop()?.toLowerCase()

    let rows: Record<string, any>[] = []

    if (extension === 'csv') {
      const csvContent = fileData.data.toString('utf-8')
      const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true
      })
      rows = parseResult.data as Record<string, any>[]
    } else {
      const workbook = XLSX.read(fileData.data, { type: 'buffer' })
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName) {
        throw createError({
          statusCode: 400,
          statusMessage: 'El archivo Excel no tiene hojas'
        })
      }
      const worksheet = workbook.Sheets[firstSheetName]
      if (!worksheet) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No se pudo leer la hoja del archivo Excel'
        })
      }
      rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' })
    }

    // Validar límite de filas
    if (rows.length > MAX_ROWS) {
      throw createError({
        statusCode: 400,
        statusMessage: `El archivo excede el límite de ${MAX_ROWS} filas`
      })
    }

    // 7. Aplicar mapeo a cada fila
    const mappedRows = rows.map((row, index) => {
      const mapped: Partial<Record<PacienteField, any>> = {}

      for (const mapping of mappings) {
        if (mapping.targetField) {
          const value = row[mapping.sourceColumn]
          mapped[mapping.targetField] = value !== undefined ? String(value).trim() : ''
        }
      }

      return {
        rowNumber: index + 2, // +2 porque index es 0-based y hay header
        originalRow: row,
        mappedRow: mapped
      }
    })

    // 8. Obtener pacientes existentes para detectar duplicados
    const { data: existingPatients, error: existingError } = await supabaseClient
      .from('pacientes')
      .select('id, email, telefono, nombre_completo')

    if (existingError) {
      console.error('Error al obtener pacientes existentes:', existingError)
    }

    const existingByEmail = new Map<string, any>()
    const existingByPhone = new Map<string, any>()

    ;(existingPatients || []).forEach(p => {
      if (p.email) existingByEmail.set(p.email.toLowerCase(), p)
      if (p.telefono) existingByPhone.set(normalizePhone(p.telefono), p)
    })

    // 9. Validar y procesar cada fila
    const results: ImportResultWithProfiles = {
      total: mappedRows.length,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      incompleteProfiles: []
    }

    const toCreate: any[] = []
    const toUpdate: { id: string; data: any }[] = []

    for (const { rowNumber, mappedRow } of mappedRows) {
      // Validar campos obligatorios
      const nombre = mappedRow.nombre_completo?.trim()
      const email = mappedRow.email?.trim()
      const telefono = mappedRow.telefono?.trim()

      if (!nombre) {
        results.errors.push({
          row: rowNumber,
          error: 'El nombre completo es obligatorio'
        })
        continue
      }

      if (!email && !telefono) {
        results.errors.push({
          row: rowNumber,
          error: 'Debe proporcionar al menos email o teléfono'
        })
        continue
      }

      // Validar formato email
      if (email && !isValidEmail(email)) {
        results.errors.push({
          row: rowNumber,
          error: `Email inválido: ${email}`
        })
        continue
      }

      // Validar formato teléfono
      if (telefono && !isValidPhone(telefono)) {
        results.errors.push({
          row: rowNumber,
          error: `Teléfono inválido: ${telefono}`
        })
        continue
      }

      // Detectar duplicados
      let existingPatient = null
      let matchedBy: 'email' | 'phone' | null = null

      if (email) {
        existingPatient = existingByEmail.get(email.toLowerCase())
        if (existingPatient) matchedBy = 'email'
      }

      if (!existingPatient && telefono) {
        existingPatient = existingByPhone.get(normalizePhone(telefono))
        if (existingPatient) matchedBy = 'phone'
      }

      // Preparar datos del paciente
      const patientData = buildPatientData(mappedRow, user.id, profile.rol)

      // Determinar campos faltantes para perfil completo
      const missingFields = getMissingProfileFields(patientData)
      const isProfileComplete = missingFields.length === 0

      patientData.perfil_completo = isProfileComplete
      patientData.campos_faltantes = missingFields.length > 0 ? missingFields : null

      if (existingPatient) {
        // Paciente existente
        if (action === 'update') {
          toUpdate.push({
            id: existingPatient.id,
            data: patientData
          })
        } else {
          results.skipped++
        }
      } else {
        // Nuevo paciente
        toCreate.push(patientData)

        // Registrar perfil incompleto si aplica
        if (!isProfileComplete) {
          results.incompleteProfiles.push({
            rowNumber,
            nombre_completo: nombre,
            missingFields: missingFields as PacienteField[]
          })
        }
      }
    }

    // 10. Insertar nuevos pacientes en lotes
    if (toCreate.length > 0) {
      const batchSize = 100
      for (let i = 0; i < toCreate.length; i += batchSize) {
        const batch = toCreate.slice(i, i + batchSize)
        const { data: created, error: createError } = await supabaseClient
          .from('pacientes')
          .insert(batch)
          .select('id, nombre_completo')

        if (createError) {
          console.error('Error al insertar pacientes:', createError)
          // Agregar errores al resultado
          batch.forEach((_, idx) => {
            results.errors.push({
              row: i + idx + 2,
              error: 'Error al guardar en base de datos'
            })
          })
        } else if (created && created.length > 0) {
          results.created += created.length

          // Actualizar IDs en perfiles incompletos
          for (const p of created) {
            const profile = results.incompleteProfiles.find(
              ip => ip.nombre_completo === p.nombre_completo && !ip.patientId
            )
            if (profile) {
              profile.patientId = p.id
            }
          }
        }
      }
    }

    // 11. Actualizar pacientes existentes
    for (const { id, data } of toUpdate) {
      const { error: updateError } = await supabaseClient
        .from('pacientes')
        .update(data)
        .eq('id', id)

      if (updateError) {
        console.error('Error al actualizar paciente:', updateError)
        results.errors.push({
          row: 0, // No sabemos la fila exacta
          error: `Error al actualizar paciente existente`
        })
      } else {
        results.updated++
      }
    }

    // 12. Limpiar configuración temporal
    await supabaseClient
      .from('import_configs')
      .delete()
      .eq('id', configId)

    // 13. Retornar resultados
    return {
      success: results.errors.length === 0,
      results
    }
  } catch (error: any) {
    console.error('Error en execute:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Error al ejecutar importación'
    })
  }
})

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s\-()]{9,}$/
  return phoneRegex.test(phone)
}

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '')
}

function getMissingProfileFields(data: any): string[] {
  const missing: string[] = []

  if (!data.email?.trim()) missing.push('email')
  if (!data.telefono?.trim()) missing.push('telefono')
  if (!data.documento_identidad?.trim()) missing.push('documento_identidad')

  return missing
}

function buildPatientData(
  mappedRow: Partial<Record<PacienteField, any>>,
  userId: string,
  userRole: string
): any {
  // Parsear campo activo
  let activoValue = true
  const activoRaw = mappedRow.activo?.toString().toLowerCase().trim()
  if (activoRaw) {
    const falseValues = ['false', 'no', '0', 'inactivo', 'finalizado']
    activoValue = !falseValues.includes(activoRaw)
  }

  // Construir objeto base
  const data: any = {
    nombre_completo: mappedRow.nombre_completo?.trim() || null,
    email: mappedRow.email?.trim()?.toLowerCase() || null,
    telefono: mappedRow.telefono?.trim() || null,
    area_de_acompanamiento: mappedRow.area_de_acompanamiento?.trim() || null,
    frecuencia: mappedRow.frecuencia?.trim() || null,
    activo: activoValue,
    documento_identidad: mappedRow.documento_identidad?.trim() || null,
    direccion: mappedRow.direccion?.trim() || null,
    contacto_emergencia: mappedRow.contacto_emergencia?.trim() || null,
    derivacion: mappedRow.derivacion?.trim() || null,
    medicacion: mappedRow.medicacion?.trim() || null,
    orientacion_diagnostica: mappedRow.orientacion_diagnostica?.trim() || null
  }

  // Parsear fecha de nacimiento si existe
  if (mappedRow.fecha_nacimiento) {
    const fechaNac = parseDate(mappedRow.fecha_nacimiento)
    if (fechaNac) {
      data.fecha_nacimiento = fechaNac
    }
  }

  // Parsear inicio de tratamiento si existe
  if (mappedRow.inicio_tratamiento) {
    const inicioTrat = parseDate(mappedRow.inicio_tratamiento)
    if (inicioTrat) {
      data.inicio_tratamiento = inicioTrat
    }
  }

  // Parsear campos numéricos
  if (mappedRow.precio_sesion) {
    const precio = parseFloat(mappedRow.precio_sesion)
    if (!isNaN(precio)) {
      data.precio_sesion = precio
    }
  }

  if (mappedRow.comision) {
    const comision = parseFloat(mappedRow.comision)
    if (!isNaN(comision)) {
      data.comision = comision
    }
  }

  // Guardar notas en metadata
  if (mappedRow.notas?.trim()) {
    data.metadata = { notas: mappedRow.notas.trim() }
  }

  // Asignar terapeuta si corresponde
  if (userRole === 'psicologa') {
    data.terapeuta_id = userId
  }

  return data
}

function parseDate(value: any): string | null {
  if (!value) return null

  const str = String(value).trim()
  if (!str) return null

  // Helper para formatear fecha
  const formatDate = (d: Date): string | null => {
    if (isNaN(d.getTime())) return null
    const iso = d.toISOString()
    return iso.substring(0, 10) // YYYY-MM-DD
  }

  // Intentar formatos comunes primero
  // DD/MM/YYYY
  const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
  if (ddmmyyyy && ddmmyyyy[1] && ddmmyyyy[2] && ddmmyyyy[3]) {
    const day = parseInt(ddmmyyyy[1], 10)
    const month = parseInt(ddmmyyyy[2], 10)
    const year = parseInt(ddmmyyyy[3], 10)
    const result = formatDate(new Date(year, month - 1, day))
    if (result) return result
  }

  // YYYY-MM-DD (formato ISO)
  const yyyymmdd = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)
  if (yyyymmdd && yyyymmdd[1] && yyyymmdd[2] && yyyymmdd[3]) {
    const year = parseInt(yyyymmdd[1], 10)
    const month = parseInt(yyyymmdd[2], 10)
    const day = parseInt(yyyymmdd[3], 10)
    const result = formatDate(new Date(year, month - 1, day))
    if (result) return result
  }

  // Intentar parsear como fecha genérica (último recurso)
  return formatDate(new Date(str))
}
