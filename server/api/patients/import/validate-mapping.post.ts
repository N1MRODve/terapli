/**
 * =============================================================================
 * ENDPOINT: POST /api/patients/import/validate-mapping
 * =============================================================================
 * Valida que el mapeo elegido por el usuario cumpla con los requisitos mínimos
 * para importar pacientes.
 *
 * Validaciones:
 * - nombre_completo debe estar mapeado (OBLIGATORIO)
 * - Al menos email O telefono debe estar mapeado (OBLIGATORIO)
 * - Genera warnings si faltan campos para perfil completo
 *
 * Actualiza la configuración en BD con el mapeo validado.
 */

import { createServerClient } from '@supabase/ssr'
import type { ColumnMapping, MappingValidation, PacienteField } from '~/types/import-mapping.types'
import {
  hasRequiredFieldsMapped,
  getMissingRequiredFields,
  getMissingProfileFields
} from '~/server/utils/column-mapper'

export default defineEventHandler(async (event) => {
  try {
    // 1. Leer body
    const body = await readBody(event)
    const { configId, mappings } = body as {
      configId: string
      mappings: ColumnMapping[]
    }

    if (!configId || !mappings) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Faltan parámetros: configId y mappings son requeridos'
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

    // 4. Verificar que la config existe y pertenece al usuario
    const { data: existingConfig, error: configError } = await supabaseClient
      .from('import_configs')
      .select('*')
      .eq('id', configId)
      .eq('user_id', user.id)
      .single()

    if (configError || !existingConfig) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Configuración de importación no encontrada o expirada'
      })
    }

    // 5. Extraer campos mapeados
    const mappedFields = new Set(
      mappings
        .map(m => m.targetField)
        .filter(f => f !== '') as PacienteField[]
    )

    // 6. Validar campos obligatorios
    const errors: string[] = []
    const warnings: string[] = []

    const hasNombre = mappedFields.has('nombre_completo')
    const hasEmail = mappedFields.has('email')
    const hasTelefono = mappedFields.has('telefono')

    if (!hasNombre) {
      errors.push('Debes mapear al menos una columna al campo "Nombre Completo"')
    }

    if (!hasEmail && !hasTelefono) {
      errors.push('Debes mapear al menos uno de los siguientes campos: "Email" o "Teléfono"')
    }

    // 7. Generar warnings para campos de perfil completo
    if (!hasEmail) {
      warnings.push(
        'No se mapeó el campo "Email". Los pacientes importados quedarán con perfil incompleto y se mostrará una alerta.'
      )
    }

    if (!hasTelefono) {
      warnings.push(
        'No se mapeó el campo "Teléfono". Los pacientes importados quedarán con perfil incompleto.'
      )
    }

    if (!mappedFields.has('documento_identidad')) {
      warnings.push(
        'No se mapeó el campo "Documento de Identidad". Los pacientes quedarán con perfil incompleto.'
      )
    }

    // 8. Campos opcionales pero útiles
    if (!mappedFields.has('area_de_acompanamiento')) {
      warnings.push(
        'No se mapeó el campo "Área de Acompañamiento". Este campo ayuda a categorizar a los pacientes.'
      )
    }

    // 9. Obtener listas de campos faltantes
    const missingRequiredFields = getMissingRequiredFields(mappings)
    const missingProfileFields = getMissingProfileFields(mappings)

    // 10. Construir resultado de validación
    const validation: MappingValidation = {
      isValid: errors.length === 0,
      errors,
      warnings,
      requiredFieldsMapped: hasRequiredFieldsMapped(mappings),
      missingRequiredFields,
      missingProfileFields
    }

    // 11. Actualizar configuración en BD con el nuevo mapeo
    const { error: updateError } = await supabaseClient
      .from('import_configs')
      .update({
        mappings,
        updated_at: new Date().toISOString()
      })
      .eq('id', configId)

    if (updateError) {
      console.error('Error al actualizar configuración:', updateError)
      // No lanzar error, solo loguear
    }

    // 12. Retornar validación
    return {
      success: true,
      validation
    }
  } catch (error: any) {
    console.error('Error en validate-mapping:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Error al validar mapeo'
    })
  }
})
