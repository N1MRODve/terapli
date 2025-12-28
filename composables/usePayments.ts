/**
 * usePayments.ts
 * Composable centralizado para gestión de pagos de sesiones
 * Reutiliza infraestructura existente: fn_registrar_pago_sesion RPC
 */

import type { PaymentMethod } from '~/components/Payment/PaymentMethodSelector.vue'

// Tipos
export interface PagoCita {
  id: string
  paciente_id: string
  paciente_nombre: string
  fecha_cita: string
  hora_inicio: string
  hora_fin: string
  precio_sesion: number | null
  estado_pago: 'pendiente' | 'pagado' | 'bonificado' | 'cancelado' | null
  metodo_pago: PaymentMethod | null
  fecha_pago: string | null
  bono_id: string | null
  estado: string
}

export interface ResumenMetodo {
  total: number
  cantidad: number
}

export interface ResumenPagosDia {
  fecha: string
  total: number
  cantidadPagos: number
  porMetodo: Record<PaymentMethod, ResumenMetodo>
  pagos: PagoCita[]
  pendientes: PagoCita[]
}

export interface PaymentResult {
  success: boolean
  error?: string
  data?: any
}

export function usePayments() {
  const supabase = useSupabaseClient()
  const { userProfile } = useSupabase()

  // Estado reactivo
  const pagosDia = ref<PagoCita[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed: resumen del día
  const resumenDia = computed<ResumenPagosDia>(() => {
    const hoy = new Date().toISOString().split('T')[0]
    const pagados = pagosDia.value.filter(p => p.estado_pago === 'pagado')
    const pendientes = pagosDia.value.filter(p => p.estado_pago === 'pendiente' || !p.estado_pago)

    const porMetodo: Record<PaymentMethod, ResumenMetodo> = {
      efectivo: { total: 0, cantidad: 0 },
      transferencia: { total: 0, cantidad: 0 },
      bizum: { total: 0, cantidad: 0 },
      tarjeta: { total: 0, cantidad: 0 },
      stripe: { total: 0, cantidad: 0 }
    }

    pagados.forEach(pago => {
      if (pago.metodo_pago && porMetodo[pago.metodo_pago]) {
        porMetodo[pago.metodo_pago].total += pago.precio_sesion || 0
        porMetodo[pago.metodo_pago].cantidad += 1
      }
    })

    return {
      fecha: hoy,
      total: pagados.reduce((sum, p) => sum + (p.precio_sesion || 0), 0),
      cantidadPagos: pagados.length,
      porMetodo,
      pagos: pagados,
      pendientes
    }
  })

  /**
   * Obtiene los pagos/citas de un día específico
   */
  async function getPaymentsOfDay(fecha?: string): Promise<PagoCita[]> {
    const terapeutaId = userProfile.value?.terapeuta_id || userProfile.value?.id
    if (!terapeutaId) {
      console.warn('[usePayments] No hay terapeuta_id disponible')
      return []
    }

    const fechaConsulta = fecha || new Date().toISOString().split('T')[0]

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('citas')
        .select(`
          id,
          fecha_cita,
          hora_inicio,
          hora_fin,
          precio_sesion,
          estado_pago,
          metodo_pago,
          fecha_pago,
          bono_id,
          estado,
          paciente:pacientes(id, nombre_completo)
        `)
        .eq('terapeuta_id', terapeutaId)
        .eq('fecha_cita', fechaConsulta)
        .in('estado', ['confirmada', 'realizada'])
        .order('hora_inicio', { ascending: true })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      // Transformar datos
      const pagos: PagoCita[] = (data || []).map((cita: any) => ({
        id: cita.id,
        paciente_id: cita.paciente?.id || '',
        paciente_nombre: cita.paciente?.nombre_completo || 'Sin nombre',
        fecha_cita: cita.fecha_cita,
        hora_inicio: cita.hora_inicio,
        hora_fin: cita.hora_fin,
        precio_sesion: cita.precio_sesion,
        estado_pago: cita.estado_pago,
        metodo_pago: cita.metodo_pago,
        fecha_pago: cita.fecha_pago,
        bono_id: cita.bono_id,
        estado: cita.estado
      }))

      pagosDia.value = pagos
      return pagos
    } catch (err: any) {
      error.value = err.message
      console.error('[usePayments] Error obteniendo pagos:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Registra un pago para una cita (usa RPC existente con fallback)
   */
  async function createPayment(
    citaId: string,
    metodo: PaymentMethod,
    monto?: number,
    notas?: string
  ): Promise<PaymentResult> {
    loading.value = true
    error.value = null

    try {
      // Intentar usar la función RPC existente
      const { data: rpcData, error: rpcError } = await supabase.rpc('fn_registrar_pago_sesion', {
        p_cita_id: citaId,
        p_metodo_pago: metodo,
        p_monto: monto || null,
        p_notas: notas || null
      })

      // Si la RPC funciona, éxito
      if (!rpcError) {
        // Actualizar estado local
        await refreshPaymentsForToday()
        return { success: true, data: rpcData }
      }

      // Fallback: actualizar directamente si la RPC falla
      console.warn('[usePayments] RPC falló, usando fallback:', rpcError.message)

      const updateData: Record<string, any> = {
        estado_pago: 'pagado',
        metodo_pago: metodo,
        fecha_pago: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (monto !== undefined) {
        updateData.precio_sesion = monto
      }

      if (notas) {
        updateData.notas_pago = notas
      }

      const { error: updateError } = await supabase
        .from('citas')
        .update(updateData)
        .eq('id', citaId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      await refreshPaymentsForToday()
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      console.error('[usePayments] Error registrando pago:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza el método de pago de una cita
   */
  async function updatePaymentMethod(
    citaId: string,
    nuevoMetodo: PaymentMethod
  ): Promise<PaymentResult> {
    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('citas')
        .update({
          metodo_pago: nuevoMetodo,
          updated_at: new Date().toISOString()
        })
        .eq('id', citaId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      await refreshPaymentsForToday()
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      console.error('[usePayments] Error actualizando método:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Deshace un pago (vuelve a estado pendiente)
   */
  async function undoPayment(citaId: string): Promise<PaymentResult> {
    loading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase
        .from('citas')
        .update({
          estado_pago: 'pendiente',
          metodo_pago: null,
          fecha_pago: null,
          notas_pago: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', citaId)

      if (updateError) {
        throw new Error(updateError.message)
      }

      await refreshPaymentsForToday()
      return { success: true }
    } catch (err: any) {
      error.value = err.message
      console.error('[usePayments] Error deshaciendo pago:', err)
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Calcula el resumen de pagos (helper estático)
   */
  function getPaymentSummary(pagos: PagoCita[]): {
    total: number
    porMetodo: Record<PaymentMethod, ResumenMetodo>
  } {
    const porMetodo: Record<PaymentMethod, ResumenMetodo> = {
      efectivo: { total: 0, cantidad: 0 },
      transferencia: { total: 0, cantidad: 0 },
      bizum: { total: 0, cantidad: 0 },
      tarjeta: { total: 0, cantidad: 0 },
      stripe: { total: 0, cantidad: 0 }
    }

    const pagados = pagos.filter(p => p.estado_pago === 'pagado')

    pagados.forEach(pago => {
      if (pago.metodo_pago && porMetodo[pago.metodo_pago]) {
        porMetodo[pago.metodo_pago].total += pago.precio_sesion || 0
        porMetodo[pago.metodo_pago].cantidad += 1
      }
    })

    return {
      total: pagados.reduce((sum, p) => sum + (p.precio_sesion || 0), 0),
      porMetodo
    }
  }

  /**
   * Refresca los pagos del día actual
   */
  async function refreshPaymentsForToday(): Promise<void> {
    await getPaymentsOfDay()
  }

  /**
   * Helper: Formatea el método de pago para mostrar
   */
  function formatPaymentMethod(metodo: PaymentMethod | null): string {
    const labels: Record<PaymentMethod, string> = {
      efectivo: '💵 Efectivo',
      transferencia: '🏦 Transferencia',
      bizum: '📱 Bizum',
      tarjeta: '💳 Tarjeta',
      stripe: '⚡ Stripe'
    }
    return metodo ? labels[metodo] : 'No especificado'
  }

  /**
   * Helper: Formatea fecha de pago
   */
  function formatPaymentDate(fechaPago: string | null): string {
    if (!fechaPago) return ''

    const fecha = new Date(fechaPago)
    const hoy = new Date()
    const ayer = new Date(hoy)
    ayer.setDate(ayer.getDate() - 1)

    const fechaStr = fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    const horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

    if (fecha.toDateString() === hoy.toDateString()) {
      return `Hoy a las ${horaStr}`
    } else if (fecha.toDateString() === ayer.toDateString()) {
      return `Ayer a las ${horaStr}`
    }

    return `${fechaStr} a las ${horaStr}`
  }

  return {
    // Estado
    pagosDia,
    loading,
    error,
    resumenDia,

    // Métodos CRUD
    getPaymentsOfDay,
    createPayment,
    updatePaymentMethod,
    undoPayment,
    refreshPaymentsForToday,

    // Helpers
    getPaymentSummary,
    formatPaymentMethod,
    formatPaymentDate
  }
}
