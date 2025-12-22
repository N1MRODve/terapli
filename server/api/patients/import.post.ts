import { createServerClient } from '@supabase/ssr'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

interface ImportRow {
  nombre_completo: string
  email?: string
  telefono?: string
  area_de_acompanamiento?: string
  frecuencia?: string
  activo?: string | boolean
  notas?: string
}

export default defineEventHandler(async (event) => {
  try {
    // Get multipart form data
    const form = await readMultipartFormData(event)

    if (!form || form.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No se encontró ningún archivo'
      })
    }

    // Get the file
    const fileData = form.find(item => item.name === 'file')
    if (!fileData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No se encontró el archivo en el formulario'
      })
    }

    // Get action (create, update, skip) for duplicates
    const actionData = form.find(item => item.name === 'action')
    const action = actionData ? actionData.data.toString() : 'update'

    // Get filename to determine format
    const filename = fileData.filename || ''
    const extension = filename.split('.').pop()?.toLowerCase()

    if (!['csv', 'xlsx', 'xls'].includes(extension || '')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Formato de archivo no válido. Solo se permiten CSV y XLSX'
      })
    }

    // Parse file
    let parsedData: ImportRow[] = []

    if (extension === 'csv') {
      const csvContent = fileData.data.toString('utf-8')
      const parseResult = Papa.parse(csvContent, {
        header: true,
        skipEmptyLines: true
      })
      parsedData = parseResult.data as ImportRow[]
    } else {
      const workbook = XLSX.read(fileData.data, { type: 'buffer' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      parsedData = XLSX.utils.sheet_to_json(worksheet) as ImportRow[]
    }

    // Validate: at least 1 row
    if (parsedData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El archivo está vacío'
      })
    }

    // Validate: max 5000 rows
    if (parsedData.length > 5000) {
      throw createError({
        statusCode: 400,
        statusMessage: 'El archivo contiene demasiadas filas. Máximo permitido: 5000'
      })
    }

    // Get Supabase client with user context
    const supabaseClient = await createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!,
      {
        cookies: {
          get: (name) => getCookie(event, name),
          set: (name, value, options) => setCookie(event, name, value, options),
          remove: (name, options) => deleteCookie(event, name, options)
        }
      }
    )

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No autenticado'
      })
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No se pudo obtener el perfil del usuario'
      })
    }

    // Determine if user is terapeuta or admin
    const isTerapeuta = profile.rol === 'psicologa'
    const isAdmin = profile.rol === 'admin'

    if (!isTerapeuta && !isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No tienes permisos para importar pacientes'
      })
    }

    // Get existing patients for duplicate detection
    let existingPatientsQuery = supabaseClient
      .from('pacientes')
      .select('id, email, telefono')

    if (isTerapeuta) {
      existingPatientsQuery = existingPatientsQuery.eq('terapeuta_id', user.id)
    }

    const { data: existingPatients, error: existingError } = await existingPatientsQuery

    if (existingError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al obtener pacientes existentes'
      })
    }

    // Process each row
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as any[]
    }

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i]
      const rowNumber = i + 2 // Excel row number (1-indexed + header)

      try {
        // Validate required fields
        if (!row.nombre_completo || row.nombre_completo.trim() === '') {
          results.errors.push({
            row: rowNumber,
            error: 'El nombre completo es obligatorio'
          })
          results.skipped++
          continue
        }

        if ((!row.email || row.email.trim() === '') && (!row.telefono || row.telefono.trim() === '')) {
          results.errors.push({
            row: rowNumber,
            error: 'Debe proporcionar al menos email o teléfono'
          })
          results.skipped++
          continue
        }

        // Check for duplicate
        let existingPatient = null
        if (row.email && row.email.trim() !== '') {
          existingPatient = existingPatients?.find(p =>
            p.email && p.email.toLowerCase() === row.email!.toLowerCase()
          )
        }

        if (!existingPatient && row.telefono && row.telefono.trim() !== '') {
          existingPatient = existingPatients?.find(p =>
            p.telefono && p.telefono === row.telefono
          )
        }

        // Prepare patient data
        const activoValue = row.activo !== undefined && row.activo !== '' ?
          ['true', 'sí', 'si', '1', 'activo'].includes(String(row.activo).toLowerCase()) :
          true

        const patientData: any = {
          nombre_completo: row.nombre_completo.trim(),
          email: row.email?.trim() || null,
          telefono: row.telefono?.trim() || null,
          area_de_acompanamiento: row.area_de_acompanamiento?.trim() || null,
          frecuencia: row.frecuencia?.trim() || null,
          activo: activoValue,
          metadata: row.notas ? { notas: row.notas } : null
        }

        // Add terapeuta_id if user is terapeuta
        if (isTerapeuta) {
          patientData.terapeuta_id = user.id
        }

        if (existingPatient) {
          // Patient exists - UPDATE or SKIP based on action
          if (action === 'update') {
            const { error: updateError } = await supabaseClient
              .from('pacientes')
              .update(patientData)
              .eq('id', existingPatient.id)

            if (updateError) {
              results.errors.push({
                row: rowNumber,
                error: `Error al actualizar: ${updateError.message}`
              })
              results.skipped++
            } else {
              results.updated++
            }
          } else {
            // Skip duplicate
            results.skipped++
          }
        } else {
          // New patient - CREATE
          const { error: insertError } = await supabaseClient
            .from('pacientes')
            .insert(patientData)

          if (insertError) {
            results.errors.push({
              row: rowNumber,
              error: `Error al crear: ${insertError.message}`
            })
            results.skipped++
          } else {
            results.created++
          }
        }
      } catch (error: any) {
        results.errors.push({
          row: rowNumber,
          error: error.message || 'Error desconocido'
        })
        results.skipped++
      }
    }

    return {
      success: true,
      results: {
        total: parsedData.length,
        created: results.created,
        updated: results.updated,
        skipped: results.skipped,
        errors: results.errors
      }
    }
  } catch (error: any) {
    console.error('Error in import:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Error al importar pacientes'
    })
  }
})
