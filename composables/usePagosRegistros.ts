/**
 * =============================================================================
 * COMPOSABLE: usePagosRegistros
 * =============================================================================
 *
 * Gestión de pagos manuales (registros de pago no asociados a citas).
 * Permite registrar pagos de bonos, sesiones sueltas y otros conceptos.
 *
 * Características:
 * - CRUD de pagos manuales
 * - Vinculación con bonos y facturas
 * - Filtros avanzados
 * - Resumen financiero
 */

import { ref, computed } from 'vue'
import type { PaymentMethod } from '~/components/Payment/PaymentMethodSelector.vue'

// =====================================================
// TIPOS
// =====================================================

export interface PagoRegistro {
  id: string
  terapeuta_id: string
  paciente_id: string | null
  fecha_pago: string
  monto: number
  metodo_pago: PaymentMethod
  concepto: string | null
  bono_id: string | null
  factura_id: string | null
  cita_id: string | null
  created_at: string
  updated_at: string
  // Relaciones
  paciente?: {
    id: string
    nombre_completo: string
    email: string
  }
  bono?: {
    id: string
    tipo: string
    sesiones_totales: number
    monto_total: number
  }
  factura?: {
    id: string
    numero_factura: string
  }
}

export interface CrearPagoParams {
  pacienteId: string
  fechaPago?: string
  monto: number
  metodoPago: PaymentMethod
  concepto?: string
  bonoId?: string
  facturaId?: string
  citaId?: string
}

export interface FiltrosPagos {
  fechaDesde?: string
  fechaHasta?: string
  pacienteId?: string
  metodoPago?: PaymentMethod
  conFactura?: boolean
  busqueda?: string
}

export interface ResumenPagos {
  total: number
  cantidad: number
  porMetodo: Record<PaymentMethod, { total: number; cantidad: number }>
}

export interface PagoResult {
  success: boolean
  data?: PagoRegistro
  error?: string
}

export interface PagosListResult {
  success: boolean
  data?: PagoRegistro[]
  total?: number
  error?: string
}

// =====================================================
// COMPOSABLE
// =====================================================

export function usePagosRegistros() {
  const supabase = useSupabaseClient()
  const { userProfile } = useSupabase()

  // Estado reactivo
  const pagos = ref<PagoRegistro[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // =====================================================
  // CRUD
  // =====================================================

  /**
   * Crea un nuevo registro de pago
   */
  async function crearPago(params: CrearPagoParams): Promise<PagoResult> {
    const terapeutaId = userProfile.value?.terapeuta_id || userProfile.value?.id
    if (!terapeutaId) {
      return { success: false, error: 'No se encontró el terapeuta' }
    }

    if (!params.pacienteId) {
      return { success: false, error: 'Debe seleccionar un paciente' }
    }

    if (!params.monto || params.monto <= 0) {
      return { success: false, error: 'El monto debe ser mayor a 0' }
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: insertError } = await supabase
        .from('pagos_registros')
        .insert({
          terapeuta_id: terapeutaId,
          paciente_id: params.pacienteId,
          fecha_pago: params.fechaPago || new Date().toISOString().split('T')[0],
          monto: params.monto,
          metodo_pago: params.metodoPago,
          concepto: params.concepto || null,
          bono_id: params.bonoId || null,
          factura_id: params.facturaId || null,
          cita_id: params.citaId || null
        })
        .select(`
          *,
          paciente:pacientes(id, nombre_completo, email)
        `)
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      // Si hay bono, actualizar su estado de pago
      if (params.bonoId) {
        await actualizarPagoBono(params.bonoId, params.metodoPago)
      }

      // Agregar al estado local
      pagos.value.unshift(data as PagoRegistro)

      return { success: true, data: data as PagoRegistro }
    } catch (err: any) {
      error.value = err.message
      console.error('[usePagosRegistros] Error creando pago:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza el estado de pago de un bono
   */
  async function actualizarPagoBono(bonoId: string, metodoPago: PaymentMethod): Promise<void> {
    try {
      await supabase
        .from('bonos')
        .update({
          estado_pago: 'pagado',
          metodo_pago: metodoPago,
          fecha_pago: new Date().toISOString(),
          pagado: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', bonoId)
    } catch (err) {
      console.error('[usePagosRegistros] Error actualizando bono:', err)
    }
  }

  /**
   * Obtiene la lista de pagos con filtros
   */
  async function getPagos(filtros: FiltrosPagos = {}): Promise<PagosListResult> {
    const terapeutaId = userProfile.value?.terapeuta_id || userProfile.value?.id
    console.log('[usePagosRegistros] getPagos - userProfile:', userProfile.value?.email, 'terapeuta_id:', terapeutaId)

    if (!terapeutaId) {
      console.error('[usePagosRegistros] No se encontró terapeuta_id')
      return { success: false, error: 'No se encontró el terapeuta' }
    }

    loading.value = true
    error.value = null

    try {
      console.log('[usePagosRegistros] Consultando pagos_registros con terapeuta_id:', terapeutaId)
      let query = supabase
        .from('pagos_registros')
        .select(`
          *,
          paciente:pacientes(id, nombre_completo, email),
          bono:bonos(id, tipo, sesiones_totales, monto_total),
          factura:facturas(id, numero_factura)
        `)
        .eq('terapeuta_id', terapeutaId)
        .order('fecha_pago', { ascending: false })
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filtros.fechaDesde) {
        query = query.gte('fecha_pago', filtros.fechaDesde)
      }
      if (filtros.fechaHasta) {
        query = query.lte('fecha_pago', filtros.fechaHasta)
      }
      if (filtros.pacienteId) {
        query = query.eq('paciente_id', filtros.pacienteId)
      }
      if (filtros.metodoPago) {
        query = query.eq('metodo_pago', filtros.metodoPago)
      }
      if (filtros.conFactura !== undefined) {
        if (filtros.conFactura) {
          query = query.not('factura_id', 'is', null)
        } else {
          query = query.is('factura_id', null)
        }
      }
      if (filtros.busqueda) {
        query = query.or(`concepto.ilike.%${filtros.busqueda}%`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('[usePagosRegistros] Error de Supabase:', fetchError)
        throw new Error(fetchError.message)
      }

      console.log('[usePagosRegistros] Pagos obtenidos:', data?.length || 0, 'registros')
      pagos.value = (data || []) as PagoRegistro[]
      return { success: true, data: pagos.value, total: pagos.value.length }
    } catch (err: any) {
      error.value = err.message
      console.error('[usePagosRegistros] Error obteniendo pagos:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtiene un pago por ID
   */
  async function getPago(pagoId: string): Promise<PagoResult> {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('pagos_registros')
        .select(`
          *,
          paciente:pacientes(id, nombre_completo, email, telefono),
          bono:bonos(id, tipo, sesiones_totales, sesiones_restantes, monto_total, estado),
          factura:facturas(id, numero_factura, total, estado)
        `)
        .eq('id', pagoId)
        .single()

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      return { success: true, data: data as PagoRegistro }
    } catch (err: any) {
      error.value = err.message
      console.error('[usePagosRegistros] Error obteniendo pago:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza un pago existente
   */
  async function actualizarPago(pagoId: string, cambios: Partial<CrearPagoParams>): Promise<PagoResult> {
    loading.value = true
    error.value = null

    try {
      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString()
      }

      if (cambios.fechaPago) updateData.fecha_pago = cambios.fechaPago
      if (cambios.monto) updateData.monto = cambios.monto
      if (cambios.metodoPago) updateData.metodo_pago = cambios.metodoPago
      if (cambios.concepto !== undefined) updateData.concepto = cambios.concepto
      if (cambios.facturaId !== undefined) updateData.factura_id = cambios.facturaId

      const { data, error: updateError } = await supabase
        .from('pagos_registros')
        .update(updateData)
        .eq('id', pagoId)
        .select(`
          *,
          paciente:pacientes(id, nombre_completo, email)
        `)
        .single()

      if (updateError) {
        throw new Error(updateError.message)
      }

      // Actualizar en estado local
      const index = pagos.value.findIndex(p => p.id === pagoId)
      if (index !== -1) {
        pagos.value[index] = data as PagoRegistro
      }

      return { success: true, data: data as PagoRegistro }
    } catch (err: any) {
      error.value = err.message
      console.error('[usePagosRegistros] Error actualizando pago:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Elimina un pago
   */
  async function eliminarPago(pagoId: string): Promise<{ success: boolean; error?: string }> {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('pagos_registros')
        .delete()
        .eq('id', pagoId)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      // Eliminar del estado local
      pagos.value = pagos.value.filter(p => p.id !== pagoId)

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      console.error('[usePagosRegistros] Error eliminando pago:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Vincula un pago a una factura
   */
  async function vincularConFactura(pagoId: string, facturaId: string): Promise<PagoResult> {
    return actualizarPago(pagoId, { facturaId })
  }

  // =====================================================
  // BONOS PENDIENTES DE PAGO
  // =====================================================

  /**
   * Obtiene bonos pendientes de pago de un paciente
   */
  async function getBonosPendientesPago(pacienteId: string): Promise<any[]> {
    try {
      const { data, error: fetchError } = await supabase
        .from('bonos')
        .select('id, tipo, monto_total, sesiones_totales, sesiones_restantes, fecha_inicio, fecha_fin, estado')
        .eq('paciente_id', pacienteId)
        .in('estado_pago', ['pendiente', null])
        .in('estado', ['activo', 'pendiente'])
        .order('created_at', { ascending: false })

      if (fetchError) {
        console.error('[usePagosRegistros] Error obteniendo bonos:', fetchError)
        return []
      }

      return data || []
    } catch (err) {
      console.error('[usePagosRegistros] Error obteniendo bonos:', err)
      return []
    }
  }

  // =====================================================
  // RESUMEN Y ESTADÍSTICAS
  // =====================================================

  /**
   * Calcula el resumen de pagos
   */
  function calcularResumen(listaPagos?: PagoRegistro[]): ResumenPagos {
    const pagosAcalcular = listaPagos || pagos.value

    const porMetodo: Record<PaymentMethod, { total: number; cantidad: number }> = {
      efectivo: { total: 0, cantidad: 0 },
      transferencia: { total: 0, cantidad: 0 },
      bizum: { total: 0, cantidad: 0 },
      tarjeta: { total: 0, cantidad: 0 },
      stripe: { total: 0, cantidad: 0 }
    }

    pagosAcalcular.forEach(pago => {
      if (pago.metodo_pago && porMetodo[pago.metodo_pago]) {
        porMetodo[pago.metodo_pago].total += pago.monto
        porMetodo[pago.metodo_pago].cantidad += 1
      }
    })

    return {
      total: pagosAcalcular.reduce((sum, p) => sum + p.monto, 0),
      cantidad: pagosAcalcular.length,
      porMetodo
    }
  }

  /**
   * Obtiene pagos de un mes específico
   */
  async function getPagosMes(anio: number, mes: number): Promise<PagosListResult> {
    const primerDia = new Date(anio, mes - 1, 1).toISOString().split('T')[0]
    const ultimoDia = new Date(anio, mes, 0).toISOString().split('T')[0]

    return getPagos({
      fechaDesde: primerDia,
      fechaHasta: ultimoDia
    })
  }

  // =====================================================
  // HELPERS
  // =====================================================

  /**
   * Formatea el método de pago para mostrar
   */
  function formatearMetodoPago(metodo: PaymentMethod): string {
    const metodos: Record<PaymentMethod, string> = {
      efectivo: 'Efectivo',
      transferencia: 'Transferencia',
      bizum: 'Bizum',
      tarjeta: 'Tarjeta',
      stripe: 'Stripe'
    }
    return metodos[metodo] || metodo
  }

  /**
   * Formatea importe
   */
  function formatearImporte(importe: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(importe)
  }

  /**
   * Formatea fecha
   */
  function formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // =====================================================
  // COMPUTED
  // =====================================================

  const totalPagos = computed(() => {
    return pagos.value.reduce((sum, p) => sum + p.monto, 0)
  })

  const resumenActual = computed(() => calcularResumen())

  const pagosConFactura = computed(() => {
    return pagos.value.filter(p => p.factura_id)
  })

  const pagosSinFactura = computed(() => {
    return pagos.value.filter(p => !p.factura_id)
  })

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Estado
    pagos,
    loading,
    error,

    // Computed
    totalPagos,
    resumenActual,
    pagosConFactura,
    pagosSinFactura,

    // CRUD
    crearPago,
    getPagos,
    getPago,
    actualizarPago,
    eliminarPago,
    vincularConFactura,

    // Bonos
    getBonosPendientesPago,

    // Resumen
    calcularResumen,
    getPagosMes,

    // Helpers
    formatearMetodoPago,
    formatearImporte,
    formatearFecha
  }
}
