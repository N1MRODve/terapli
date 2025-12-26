/**
 * =============================================================================
 * ENDPOINT: POST /api/patients/import/detect-columns
 * =============================================================================
 * Detecta las columnas de un archivo Excel/CSV y genera un mapeo automático
 * sugerido basado en fuzzy matching con los campos del modelo Paciente.
 *
 * Flujo:
 * 1. Recibe archivo multipart (CSV o XLSX)
 * 2. Parsea solo el header y primeras 5 filas
 * 3. Detecta columnas con valores de ejemplo
 * 4. Genera mapeo automático usando algoritmo inteligente
 * 5. Guarda configuración temporal en BD (expira en 1 hora)
 * 6. Retorna config para que el frontend la muestre
 */

import { createServerClient } from '@supabase/ssr'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import type { DetectedColumn, ImportConfig } from '~/types/import-mapping.types'
import { autoMapColumns } from '~/server/utils/column-mapper'

const MAX_SAMPLE_ROWS = 5

export default defineEventHandler(async (event) => {
  try {
    // 1. Leer archivo multipart
    const form = await readMultipartFormData(event)

    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No se encontró ningún archivo'
      })
    }

    const fileData = form.find(item => item.name === 'file')
    if (!fileData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No se encontró el archivo en el formulario'
      })
    }

    // 2. Validar extensión
    const filename = fileData.filename || ''
    const extension = filename.split('.').pop()?.toLowerCase()

    if (!['csv', 'xlsx', 'xls'].includes(extension || '')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Formato de archivo no válido. Solo se permiten CSV y XLSX'
      })
    }

    // 3. Parsear headers y primeras filas
    let headers: string[] = []
    let sampleRows: any[] = []

    if (extension === 'csv') {
      // Parsear CSV
      const csvContent = fileData.data.toString('utf-8')
      const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true,
        preview: MAX_SAMPLE_ROWS // Solo leer primeras 5 filas
      })

      headers = parseResult.meta.fields || []
      sampleRows = parseResult.data as any[]
    } else {
      // Parsear Excel
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

      // Convertir a JSON para obtener headers y datos
      const jsonData = XLSX.utils.sheet_to_json<any[]>(worksheet, {
        header: 1,
        defval: ''
      })

      if (jsonData.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'El archivo está vacío'
        })
      }

      // Primera fila son headers
      headers = jsonData[0] as string[]

      // Convertir filas de datos a objetos
      const dataRows = jsonData.slice(1, MAX_SAMPLE_ROWS + 1)
      sampleRows = dataRows.map(row => {
        const obj: any = {}
        headers.forEach((header, index) => {
          obj[header] = row[index] || ''
        })
        return obj
      })
    }

    // 4. Validar que haya headers
    if (headers.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No se detectaron columnas en el archivo'
      })
    }

    // 5. Crear DetectedColumns con valores de ejemplo
    const detectedColumns: DetectedColumn[] = headers.map(header => {
      const sampleValues = sampleRows
        .map(row => String(row[header] || '').trim())
        .filter(val => val !== '')
        .slice(0, 5) // Máximo 5 ejemplos

      return {
        name: header,
        sampleValues,
        suggestedMapping: undefined // Se asignará en el siguiente paso
      }
    })

    // 6. Generar mapeo automático
    const mappings = autoMapColumns(headers)

    // 7. Asignar suggestedMapping a cada columna
    detectedColumns.forEach(col => {
      const mapping = mappings.find(m => m.sourceColumn === col.name)
      if (mapping && mapping.targetField !== '') {
        col.suggestedMapping = mapping.targetField
      }
    })

    // 8. Obtener cliente Supabase con contexto de usuario
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

    // 9. Verificar autenticación
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No autenticado'
      })
    }

    // 10. Crear configuración temporal
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000) // 1 hora

    const configId = crypto.randomUUID()

    const config: Omit<ImportConfig, 'createdAt' | 'expiresAt'> & {
      created_at: string
      expires_at: string
    } = {
      id: configId,
      userId: user.id,
      fileName: filename,
      detectedColumns,
      mappings,
      created_at: now.toISOString(),
      expires_at: expiresAt.toISOString()
    }

    // 11. Guardar en BD (tabla import_configs)
    const { error: insertError } = await supabaseClient
      .from('import_configs')
      .insert({
        id: config.id,
        user_id: config.userId,
        file_name: config.fileName,
        detected_columns: config.detectedColumns,
        mappings: config.mappings,
        created_at: config.created_at,
        expires_at: config.expires_at
      })

    if (insertError) {
      console.error('Error al guardar configuración de importación:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al guardar la configuración de importación'
      })
    }

    // 12. Retornar configuración
    return {
      success: true,
      config: {
        id: config.id,
        userId: config.userId,
        fileName: config.fileName,
        detectedColumns: config.detectedColumns,
        mappings: config.mappings,
        createdAt: now,
        expiresAt
      }
    }
  } catch (error: any) {
    console.error('Error en detect-columns:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Error al detectar columnas'
    })
  }
})
