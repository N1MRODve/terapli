import { createServerClient } from '@supabase/ssr'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const format = (query.format as string) || 'csv'
    const scope = (query.scope as string) || 'all'
    const fields = query.fields ? (query.fields as string).split(',') : [
      'nombre_completo',
      'email',
      'telefono',
      'area_de_acompanamiento',
      'frecuencia',
      'activo'
    ]

    if (!['csv', 'xlsx'].includes(format)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Formato no válido. Use csv o xlsx'
      })
    }

    // Get runtime config for Supabase credentials
    const config = useRuntimeConfig()
    const supabaseUrl = config.supabaseUrl || config.public.supabaseUrl
    const supabaseKey = config.supabaseKey || config.public.supabaseKey

    if (!supabaseUrl || !supabaseKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configuración de Supabase no disponible'
      })
    }

    // Get Supabase client with user context
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
        statusMessage: 'No tienes permisos para exportar pacientes'
      })
    }

    // Build query based on scope
    let patientsQuery = supabaseClient
      .from('pacientes')
      .select('*')

    if (isTerapeuta) {
      patientsQuery = patientsQuery.eq('terapeuta_id', user.id)
    }

    // Apply filters if scope is 'filtered'
    if (scope === 'filtered') {
      const filters = query.filters ? JSON.parse(query.filters as string) : {}

      if (filters.estado) {
        if (filters.estado === 'activo') {
          patientsQuery = patientsQuery.eq('activo', true)
        } else if (filters.estado === 'finalizado') {
          patientsQuery = patientsQuery.eq('activo', false)
        }
      }

      if (filters.area) {
        patientsQuery = patientsQuery.eq('area_de_acompanamiento', filters.area)
      }
    }

    // Apply selected IDs if scope is 'selected'
    if (scope === 'selected') {
      const selectedIds = query.selectedIds ? (query.selectedIds as string).split(',') : []
      if (selectedIds.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'No se seleccionaron pacientes para exportar'
        })
      }
      patientsQuery = patientsQuery.in('id', selectedIds)
    }

    const { data: patients, error: patientsError } = await patientsQuery

    if (patientsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al obtener pacientes'
      })
    }

    if (!patients || patients.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No se encontraron pacientes para exportar'
      })
    }

    // Build export data based on selected fields
    const exportData = patients.map(patient => {
      const row: any = {}

      if (fields.includes('nombre_completo')) {
        row['Nombre Completo'] = patient.nombre_completo || ''
      }
      if (fields.includes('email')) {
        row['Email'] = patient.email || ''
      }
      if (fields.includes('telefono')) {
        row['Teléfono'] = patient.telefono || ''
      }
      if (fields.includes('area_de_acompanamiento')) {
        row['Área de Acompañamiento'] = patient.area_de_acompanamiento || ''
      }
      if (fields.includes('frecuencia')) {
        row['Frecuencia'] = patient.frecuencia || ''
      }
      if (fields.includes('activo')) {
        const enPausa = patient.metadata?.en_pausa || false
        row['Estado'] = patient.activo ? (enPausa ? 'En pausa' : 'Activo') : 'Finalizado'
      }
      if (fields.includes('created_at')) {
        row['Fecha de Registro'] = patient.created_at ?
          new Date(patient.created_at).toLocaleDateString('es-ES') : ''
      }

      return row
    })

    // Generate file based on format
    if (format === 'csv') {
      const csv = Papa.unparse(exportData, {
        quotes: true,
        delimiter: ',',
        header: true
      })

      setResponseHeaders(event, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pacientes_${new Date().toISOString().split('T')[0]}.csv"`
      })

      return csv
    } else {
      // XLSX
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(
          key.length,
          ...exportData.map(row => String(row[key] || '').length)
        ) + 2
      }))
      ws['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, ws, 'Pacientes')

      const xlsxBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

      setResponseHeaders(event, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="pacientes_${new Date().toISOString().split('T')[0]}.xlsx"`
      })

      return xlsxBuffer
    }
  } catch (error: any) {
    console.error('Error in export:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Error al exportar pacientes'
    })
  }
})
