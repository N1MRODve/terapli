/**
 * =============================================================================
 * COMPOSABLE: useFacturas
 * =============================================================================
 *
 * Gestión de facturas con cálculos fiscales españoles.
 *
 * Características:
 * - Cálculo automático de IVA/IRPF según tipo de cliente
 * - Numeración correlativa automática
 * - CRUD completo de facturas
 * - Validación de NIF/CIF español
 * - Soporte para régimen exento (servicios sanitarios)
 */

import { ref, computed } from 'vue'

// =====================================================
// TIPOS
// =====================================================

export type TipoCliente = 'particular' | 'empresa'
export type EstadoFactura = 'borrador' | 'emitida' | 'anulada'
export type RegimenIVA = 'exento' | 'general'

export interface LineaDetalle {
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
}

export interface DatosEmpresa {
  nombre: string
  nif: string
  direccion: string
}

export interface DatosFiscalesTerapeuta {
  nif: string
  razon_social: string
  direccion: string
  codigo_postal: string
  ciudad: string
  provincia: string
  regimen_iva: RegimenIVA
  numero_colegiado: string
}

export interface Factura {
  id: string
  terapeuta_id: string
  paciente_id: string | null
  numero_factura: string
  fecha_emision: string
  tipo_cliente: TipoCliente
  receptor_nombre: string
  receptor_nif: string | null
  receptor_direccion: string | null
  base_imponible: number
  porcentaje_iva: number
  importe_iva: number
  porcentaje_irpf: number
  importe_irpf: number
  total: number
  concepto: string
  lineas_detalle: LineaDetalle[]
  bono_id: string | null
  pago_id: string | null
  estado: EstadoFactura
  motivo_anulacion: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
  // Relaciones
  paciente?: {
    id: string
    nombre_completo: string
    email: string
  }
}

export interface CalculoImpuestos {
  baseImponible: number
  porcentajeIVA: number
  importeIVA: number
  porcentajeIRPF: number
  importeIRPF: number
  total: number
}

export interface CrearFacturaParams {
  pacienteId?: string
  tipoCliente: TipoCliente
  receptorNombre: string
  receptorNif?: string
  receptorDireccion?: string
  concepto: string
  baseImponible: number
  lineasDetalle?: LineaDetalle[]
  bonoId?: string
  pagoId?: string
}

export interface FiltrosFacturas {
  fechaDesde?: string
  fechaHasta?: string
  pacienteId?: string
  estado?: EstadoFactura
  busqueda?: string
}

export interface FacturaResult {
  success: boolean
  data?: Factura
  error?: string
}

export interface FacturasListResult {
  success: boolean
  data?: Factura[]
  total?: number
  error?: string
}

// =====================================================
// COMPOSABLE
// =====================================================

export function useFacturas() {
  const supabase = useSupabaseClient()
  const { userProfile } = useSupabase()

  // Estado reactivo
  const facturas = ref<Factura[]>([])
  const facturaActual = ref<Factura | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // =====================================================
  // CÁLCULOS FISCALES
  // =====================================================

  /**
   * Calcula los impuestos según tipo de cliente y régimen IVA
   */
  function calcularImpuestos(
    baseImponible: number,
    tipoCliente: TipoCliente,
    regimenIVA: RegimenIVA = 'exento'
  ): CalculoImpuestos {
    let porcentajeIVA = 0
    let importeIVA = 0
    let porcentajeIRPF = 0
    let importeIRPF = 0

    if (tipoCliente === 'empresa') {
      // Empresa: IVA 21% + IRPF -15%
      porcentajeIVA = 21
      importeIVA = redondear(baseImponible * 0.21)
      porcentajeIRPF = 15
      importeIRPF = redondear(baseImponible * 0.15)
    } else if (regimenIVA === 'general') {
      // Particular con régimen general: IVA 21%
      porcentajeIVA = 21
      importeIVA = redondear(baseImponible * 0.21)
    }
    // Si es particular y régimen exento: IVA 0% (por defecto)

    const total = redondear(baseImponible + importeIVA - importeIRPF)

    return {
      baseImponible: redondear(baseImponible),
      porcentajeIVA,
      importeIVA,
      porcentajeIRPF,
      importeIRPF,
      total
    }
  }

  /**
   * Redondea a 2 decimales
   */
  function redondear(valor: number): number {
    return Math.round(valor * 100) / 100
  }

  // =====================================================
  // VALIDACIONES
  // =====================================================

  /**
   * Valida un NIF/CIF español
   */
  function validarNIF(nif: string): boolean {
    if (!nif) return false

    // Limpiar y normalizar
    const nifLimpio = nif.toUpperCase().replace(/[^A-Z0-9]/g, '')

    if (nifLimpio.length !== 9) return false

    // DNI: 8 números + letra
    const dniRegex = /^[0-9]{8}[A-Z]$/
    if (dniRegex.test(nifLimpio)) {
      const letras = 'TRWAGMYFPDXBNJZSQVHLCKE'
      const numero = parseInt(nifLimpio.substring(0, 8))
      const letraCalculada = letras[numero % 23]
      return nifLimpio[8] === letraCalculada
    }

    // NIE: X/Y/Z + 7 números + letra
    const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/
    if (nieRegex.test(nifLimpio)) {
      let numeroStr = nifLimpio.substring(1, 8)
      if (nifLimpio[0] === 'X') numeroStr = '0' + numeroStr
      else if (nifLimpio[0] === 'Y') numeroStr = '1' + numeroStr
      else if (nifLimpio[0] === 'Z') numeroStr = '2' + numeroStr

      const letras = 'TRWAGMYFPDXBNJZSQVHLCKE'
      const numero = parseInt(numeroStr)
      const letraCalculada = letras[numero % 23]
      return nifLimpio[8] === letraCalculada
    }

    // CIF: Letra + 7 números + dígito/letra control
    const cifRegex = /^[ABCDEFGHJKLMNPQRSUVW][0-9]{7}[A-J0-9]$/
    if (cifRegex.test(nifLimpio)) {
      // Validación simplificada del CIF (verificar formato)
      return true
    }

    return false
  }

  /**
   * Formatea un NIF/CIF para mostrar
   */
  function formatearNIF(nif: string): string {
    if (!nif) return ''
    return nif.toUpperCase().replace(/[^A-Z0-9]/g, '')
  }

  // =====================================================
  // CRUD DE FACTURAS
  // =====================================================

  /**
   * Obtiene el régimen IVA del terapeuta actual
   */
  async function obtenerRegimenIVA(): Promise<RegimenIVA> {
    const terapeutaId = userProfile.value?.terapeuta_id || userProfile.value?.id
    if (!terapeutaId) return 'exento'

    try {
      const { data, error: fetchError } = await supabase
        .from('terapeutas')
        .select('datos_fiscales')
        .eq('id', terapeutaId)
        .single()

      if (fetchError || !data) return 'exento'

      return (data.datos_fiscales as DatosFiscalesTerapeuta)?.regimen_iva || 'exento'
    } catch {
      return 'exento'
    }
  }

  /**
   * Crea una nueva factura
   */
  async function crearFactura(params: CrearFacturaParams): Promise<FacturaResult> {
    const terapeutaId = userProfile.value?.terapeuta_id || userProfile.value?.id
    if (!terapeutaId) {
      return { success: false, error: 'No se encontró el terapeuta' }
    }

    loading.value = true
    error.value = null

    try {
      // Validar NIF si es empresa
      if (params.tipoCliente === 'empresa' && params.receptorNif) {
        if (!validarNIF(params.receptorNif)) {
          return { success: false, error: 'El NIF/CIF no es válido' }
        }
      }

      // Obtener régimen IVA del terapeuta
      const regimenIVA = await obtenerRegimenIVA()

      // Usar la función RPC para crear la factura
      const { data, error: rpcError } = await supabase.rpc('fn_crear_factura', {
        p_terapeuta_id: terapeutaId,
        p_paciente_id: params.pacienteId || null,
        p_tipo_cliente: params.tipoCliente,
        p_receptor_nombre: params.receptorNombre,
        p_receptor_nif: params.receptorNif ? formatearNIF(params.receptorNif) : null,
        p_receptor_direccion: params.receptorDireccion || null,
        p_concepto: params.concepto,
        p_base_imponible: params.baseImponible,
        p_aplicar_iva: params.tipoCliente === 'empresa' || regimenIVA === 'general',
        p_aplicar_irpf: params.tipoCliente === 'empresa',
        p_lineas_detalle: params.lineasDetalle || [],
        p_bono_id: params.bonoId || null,
        p_pago_id: params.pagoId || null
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      // Obtener la factura creada
      const { data: factura, error: fetchError } = await supabase
        .from('facturas')
        .select('*')
        .eq('id', data)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      return { success: true, data: factura as Factura }
    } catch (err: any) {
      error.value = err.message
      console.error('[useFacturas] Error creando factura:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene facturas con filtros
   */
  async function getFacturas(filtros: FiltrosFacturas = {}): Promise<FacturasListResult> {
    const terapeutaId = userProfile.value?.terapeuta_id || userProfile.value?.id
    if (!terapeutaId) {
      return { success: false, error: 'No se encontró el terapeuta' }
    }

    loading.value = true
    error.value = null

    try {
      let query = supabase
        .from('facturas')
        .select(`
          *,
          paciente:pacientes(id, nombre_completo, email)
        `)
        .eq('terapeuta_id', terapeutaId)
        .order('fecha_emision', { ascending: false })

      // Aplicar filtros
      if (filtros.fechaDesde) {
        query = query.gte('fecha_emision', filtros.fechaDesde)
      }
      if (filtros.fechaHasta) {
        query = query.lte('fecha_emision', filtros.fechaHasta)
      }
      if (filtros.pacienteId) {
        query = query.eq('paciente_id', filtros.pacienteId)
      }
      if (filtros.estado) {
        query = query.eq('estado', filtros.estado)
      }
      if (filtros.busqueda) {
        query = query.or(`numero_factura.ilike.%${filtros.busqueda}%,receptor_nombre.ilike.%${filtros.busqueda}%,concepto.ilike.%${filtros.busqueda}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      facturas.value = (data || []) as Factura[]
      return { success: true, data: facturas.value, total: facturas.value.length }
    } catch (err: any) {
      error.value = err.message
      console.error('[useFacturas] Error obteniendo facturas:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene una factura por ID
   */
  async function getFactura(facturaId: string): Promise<FacturaResult> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('facturas')
        .select(`
          *,
          paciente:pacientes(id, nombre_completo, email, telefono)
        `)
        .eq('id', facturaId)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      facturaActual.value = data as Factura
      return { success: true, data: facturaActual.value }
    } catch (err: any) {
      error.value = err.message
      console.error('[useFacturas] Error obteniendo factura:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Anula una factura
   */
  async function anularFactura(facturaId: string, motivo: string): Promise<FacturaResult> {
    if (!motivo || motivo.trim().length < 3) {
      return { success: false, error: 'Debe indicar un motivo de anulación' }
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase.rpc('fn_anular_factura', {
        p_factura_id: facturaId,
        p_motivo: motivo.trim()
      })

      if (rpcError) {
        throw new Error(rpcError.message)
      }

      if (!data) {
        return { success: false, error: 'No se pudo anular la factura. Puede que ya esté anulada.' }
      }

      // Actualizar estado local
      const index = facturas.value.findIndex(f => f.id === facturaId)
      if (index !== -1) {
        facturas.value[index].estado = 'anulada'
        facturas.value[index].motivo_anulacion = motivo
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      console.error('[useFacturas] Error anulando factura:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene el próximo número de factura (preview)
   */
  async function getProximoNumero(): Promise<string | null> {
    const terapeutaId = userProfile.value?.terapeuta_id || userProfile.value?.id
    if (!terapeutaId) return null

    try {
      const { data, error: fetchError } = await supabase
        .from('terapeutas')
        .select('numeracion_facturas')
        .eq('id', terapeutaId)
        .single()

      if (fetchError || !data) return null

      const config = data.numeracion_facturas as {
        prefijo: string
        ultimo_numero: number
        anio_actual: number
      } | null

      if (!config) return null

      const anioActual = new Date().getFullYear()
      const nuevoNumero = anioActual > config.anio_actual ? 1 : config.ultimo_numero + 1
      const numeroFormateado = nuevoNumero.toString().padStart(4, '0')

      return `${config.prefijo}-${anioActual}-${numeroFormateado}`
    } catch {
      return null
    }
  }

  // =====================================================
  // DATOS FISCALES DEL TERAPEUTA
  // =====================================================

  /**
   * Obtiene los datos fiscales del terapeuta
   */
  async function getDatosFiscales(): Promise<DatosFiscalesTerapeuta | null> {
    const terapeutaId = userProfile.value?.terapeuta_id || userProfile.value?.id
    if (!terapeutaId) return null

    try {
      const { data, error: fetchError } = await supabase
        .from('terapeutas')
        .select('datos_fiscales')
        .eq('id', terapeutaId)
        .single()

      if (fetchError || !data) return null

      return data.datos_fiscales as DatosFiscalesTerapeuta
    } catch {
      return null
    }
  }

  /**
   * Guarda los datos fiscales del terapeuta
   */
  async function guardarDatosFiscales(datos: DatosFiscalesTerapeuta): Promise<{ success: boolean; error?: string }> {
    const terapeutaId = userProfile.value?.terapeuta_id || userProfile.value?.id
    if (!terapeutaId) {
      return { success: false, error: 'No se encontró el terapeuta' }
    }

    // Validar NIF
    if (datos.nif && !validarNIF(datos.nif)) {
      return { success: false, error: 'El NIF no es válido' }
    }

    loading.value = true

    try {
      const { error: updateError } = await supabase
        .from('terapeutas')
        .update({
          datos_fiscales: {
            ...datos,
            nif: datos.nif ? formatearNIF(datos.nif) : ''
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', terapeutaId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      return { success: true }
    } catch (err: any) {
      console.error('[useFacturas] Error guardando datos fiscales:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // =====================================================
  // HELPERS
  // =====================================================

  /**
   * Formatea importe en euros
   */
  function formatearImporte(importe: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(importe)
  }

  /**
   * Formatea fecha para mostrar
   */
  function formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  /**
   * Obtiene el color del badge según estado
   */
  function getEstadoColor(estado: EstadoFactura): string {
    const colores: Record<EstadoFactura, string> = {
      borrador: 'bg-gray-100 text-gray-700',
      emitida: 'bg-green-100 text-green-700',
      anulada: 'bg-red-100 text-red-700'
    }
    return colores[estado] || 'bg-gray-100 text-gray-600'
  }

  /**
   * Obtiene el texto del estado
   */
  function getEstadoTexto(estado: EstadoFactura): string {
    const textos: Record<EstadoFactura, string> = {
      borrador: 'Borrador',
      emitida: 'Emitida',
      anulada: 'Anulada'
    }
    return textos[estado] || estado
  }

  // =====================================================
  // COMPUTED
  // =====================================================

  const totalFacturado = computed(() => {
    return facturas.value
      .filter(f => f.estado === 'emitida')
      .reduce((sum, f) => sum + f.total, 0)
  })

  const facturasEmitidas = computed(() => {
    return facturas.value.filter(f => f.estado === 'emitida')
  })

  const facturasAnuladas = computed(() => {
    return facturas.value.filter(f => f.estado === 'anulada')
  })

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Estado
    facturas,
    facturaActual,
    loading,
    error,

    // Computed
    totalFacturado,
    facturasEmitidas,
    facturasAnuladas,

    // Cálculos fiscales
    calcularImpuestos,
    redondear,

    // Validaciones
    validarNIF,
    formatearNIF,

    // CRUD
    crearFactura,
    getFacturas,
    getFactura,
    anularFactura,
    getProximoNumero,

    // Datos fiscales
    getDatosFiscales,
    guardarDatosFiscales,
    obtenerRegimenIVA,

    // Helpers
    formatearImporte,
    formatearFecha,
    getEstadoColor,
    getEstadoTexto
  }
}
