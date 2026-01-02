<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  XMarkIcon,
  CheckCircleIcon,
  PhoneIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  VideoCameraIcon,
  TicketIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import type { PaymentMethod } from '~/components/Payment/PaymentMethodSelector.vue'

const props = defineProps<{
  citaId: string | null
}>()

const emit = defineEmits(['close', 'cita-actualizada', 'cita-eliminada', 'actualizado', 'eliminado'])

// Estados de UI
const confirmando = ref(false)
const marcandoRealizada = ref(false)
const mostrarModalPago = ref(false)
const modoEdicionPago = ref(false)
const mostrarModalNuevoBono = ref(false)
const bonoParaEditar = ref<any>(null) // Bono a editar (null = crear nuevo)
const seccionBonoAbierta = ref(true) // Abierto por defecto
const seccionObservacionesAbierta = ref(false)
const modoEdicion = ref(false)
const cargando = ref(false)
const mostrarConfirmacionDeshacer = ref(false)
const deshaciendoPago = ref(false)
const consumiendoSesion = ref(false)
const asignandoBono = ref(false)

// Datos
const cita = ref<any>(null)
const paciente = ref<any>(null)
const bono = ref<any>(null)
const bonoActivoPaciente = ref<any>(null) // Bono activo del paciente (si no tiene asignado a la cita)

// Router para navegación
const router = useRouter()

// Composable de pagos
const { undoPayment } = usePayments()
const { success: toastSuccess, error: toastError } = useToast()

const formEdicion = ref({
  fecha_cita: '',
  hora_inicio: '',
  hora_fin: '',
  modalidad: '',
  observaciones: '',
  estado: ''
})

// Composables
const supabase = useSupabaseClient()

// Constante de precio por defecto
const PRECIO_SESION_DEFAULT = 70

// Cargar preferencias de secciones colapsables desde localStorage
onMounted(() => {
  const savedObs = localStorage.getItem('modal-seccion-observaciones')
  seccionObservacionesAbierta.value = savedObs === 'true'
})

// Guardar preferencias cuando cambian
watch(seccionBonoAbierta, (val) => {
  localStorage.setItem('modal-seccion-bono', String(val))
})
watch(seccionObservacionesAbierta, (val) => {
  localStorage.setItem('modal-seccion-observaciones', String(val))
})

// Cargar datos completos de la cita
const cargarCita = async () => {
  if (!props.citaId) return

  try {
    cargando.value = true

    const { data: citaData, error: citaError } = await supabase
      .from('citas')
      .select(`
        *,
        paciente:pacientes(
          id,
          nombre_completo,
          email,
          telefono,
          frecuencia
        )
      `)
      .eq('id', props.citaId)
      .single()

    if (citaError) throw citaError
    cita.value = citaData
    paciente.value = citaData.paciente

    // Si tiene bono asignado, cargar información completa
    if (citaData.bono_id) {
      const { data: bonoData, error: bonoError } = await supabase
        .from('bonos')
        .select(`
          id,
          tipo,
          sesiones_totales,
          sesiones_restantes,
          monto_total,
          precio_por_sesion,
          fecha_inicio,
          fecha_fin,
          estado,
          pagado,
          created_at,
          updated_at
        `)
        .eq('id', citaData.bono_id)
        .single()

      if (!bonoError) {
        bono.value = bonoData

        // Calcular número de sesión
        const { data: citasAnteriores } = await supabase
          .from('citas')
          .select('id, fecha_cita, hora_inicio')
          .eq('bono_id', citaData.bono_id)
          .eq('sesion_descontada', true)
          .order('fecha_cita', { ascending: true })
          .order('hora_inicio', { ascending: true })

        if (citasAnteriores) {
          const indice = citasAnteriores.findIndex(c => c.id === props.citaId)
          if (indice !== -1) {
            bono.value.numero_sesion = indice + 1
          }
        }
      }
    } else {
      bono.value = null
    }

    // Si no tiene bono asignado, buscar bono activo del paciente
    if (!citaData.bono_id && citaData.paciente?.id) {
      const { data: bonoActivo } = await supabase
        .from('bonos')
        .select(`
          id,
          tipo,
          sesiones_totales,
          sesiones_restantes,
          monto_total,
          precio_por_sesion,
          fecha_inicio,
          fecha_fin,
          estado,
          pagado,
          created_at,
          updated_at
        `)
        .eq('paciente_id', citaData.paciente.id)
        .in('estado', ['activo', 'pendiente'])
        .gt('sesiones_restantes', 0)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      bonoActivoPaciente.value = bonoActivo
    } else {
      bonoActivoPaciente.value = null
    }

    // Inicializar formularios
    formEdicion.value = {
      fecha_cita: citaData.fecha_cita,
      hora_inicio: citaData.hora_inicio?.substring(0, 5) || '',
      hora_fin: citaData.hora_fin?.substring(0, 5) || '',
      modalidad: citaData.modalidad,
      observaciones: citaData.observaciones || '',
      estado: citaData.estado
    }

    mostrarModalPago.value = false
    modoEdicionPago.value = false

  } catch (error) {
    console.error('Error al cargar cita:', error)
  } finally {
    cargando.value = false
  }
}

// Watch para cargar cuando cambia el ID
watch(() => props.citaId, (newId) => {
  if (newId) {
    cargarCita()
  } else {
    cita.value = null
    paciente.value = null
    bono.value = null
    bonoActivoPaciente.value = null
  }
}, { immediate: true })

// Computed: Fecha formateada corta
const fechaCorta = computed(() => {
  if (!cita.value?.fecha_cita) return ''
  const fecha = new Date(cita.value.fecha_cita + 'T00:00:00')
  const hoy = new Date()
  const manana = new Date(hoy)
  manana.setDate(manana.getDate() + 1)

  if (fecha.toDateString() === hoy.toDateString()) return 'Hoy'
  if (fecha.toDateString() === manana.toDateString()) return 'Mañana'

  return fecha.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
})

// Computed: Horario formateado
const horarioFormateado = computed(() => {
  if (!cita.value) return ''
  const inicio = cita.value.hora_inicio?.substring(0, 5) || ''
  const fin = cita.value.hora_fin?.substring(0, 5) || ''
  return `${inicio} - ${fin}`
})

// Computed: Duración en minutos
const duracionMinutos = computed(() => {
  if (!cita.value?.hora_inicio || !cita.value?.hora_fin) return 60
  const [hi, mi] = cita.value.hora_inicio.split(':').map(Number)
  const [hf, mf] = cita.value.hora_fin.split(':').map(Number)
  return (hf * 60 + mf) - (hi * 60 + mi)
})

// Computed: Modalidad formateada
const modalidadFormateada = computed(() => {
  const modalidades: Record<string, string> = {
    presencial: 'Presencial',
    virtual: 'Online',
    telefonica: 'Telefónica'
  }
  return modalidades[cita.value?.modalidad] || cita.value?.modalidad || '-'
})

// Computed: Estado de la cita
const estadoCita = computed(() => cita.value?.estado || 'pendiente')

// Computed: Clase del badge de estado
const claseEstadoBadge = computed(() => {
  const clases: Record<string, string> = {
    pendiente: 'bg-amber-100 text-amber-700',
    confirmada: 'bg-emerald-100 text-emerald-700',
    realizada: 'bg-blue-100 text-blue-700',
    cancelada: 'bg-gray-100 text-gray-500'
  }
  return clases[estadoCita.value] || 'bg-gray-100 text-gray-600'
})

// Computed: Label del estado
const estadoLabel = computed(() => {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    realizada: 'Realizada',
    cancelada: 'Cancelada'
  }
  return labels[estadoCita.value] || estadoCita.value
})

// Computed: Estado de pago
const estadoPago = computed(() => cita.value?.estado_pago || 'pendiente')

// Computed: Puede confirmar cita
const puedeConfirmar = computed(() => cita.value?.estado === 'pendiente')

// Computed: Puede registrar pago
const puedeRegistrarPago = computed(() => {
  if (!cita.value) return false
  const estadoCitaVal = cita.value.estado
  const estadoPagoVal = cita.value.estado_pago
  return (estadoCitaVal === 'confirmada' || estadoCitaVal === 'realizada') &&
         (estadoPagoVal === 'pendiente' || !estadoPagoVal)
})

// Computed: Puede marcar como realizada (solo si está confirmada y no cancelada)
const puedeMarcarRealizada = computed(() => {
  if (!cita.value) return false
  const estado = cita.value.estado
  return estado === 'confirmada' || estado === 'pendiente'
})

// Computed: Puede consumir sesión del bono
const puedeConsumirSesion = computed(() => {
  if (!bono.value) return false
  if (cita.value?.sesion_descontada) return false // Ya consumida
  if (bono.value.sesiones_restantes <= 0) return false // Sin sesiones
  // Solo si la cita está realizada o confirmada
  return cita.value?.estado === 'realizada' || cita.value?.estado === 'confirmada'
})

// Computed: Puede asignar bono a la cita
const puedeAsignarBono = computed(() => {
  if (bono.value) return false // Ya tiene bono
  if (!bonoActivoPaciente.value) return false // No hay bono disponible
  return bonoActivoPaciente.value.sesiones_restantes > 0
})

// Computed: Bono a mostrar (el asignado o el activo del paciente)
const bonoMostrar = computed(() => bono.value || bonoActivoPaciente.value)

// Computed: Sesiones usadas del bono
const sesionesUsadas = computed(() => {
  if (!bonoMostrar.value) return 0
  return bonoMostrar.value.sesiones_totales - bonoMostrar.value.sesiones_restantes
})

// Computed: Progreso del bono
const progresoBono = computed(() => {
  if (!bonoMostrar.value) return 0
  return (sesionesUsadas.value / bonoMostrar.value.sesiones_totales) * 100
})

// Computed: Fecha de vencimiento formateada
const fechaVencimientoBono = computed(() => {
  if (!bonoMostrar.value?.fecha_fin) return null
  const fecha = new Date(bonoMostrar.value.fecha_fin)
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
})

// Computed: Bono próximo a vencer
const bonoProximoVencer = computed(() => {
  if (!bonoMostrar.value?.fecha_fin) return false
  const fecha = new Date(bonoMostrar.value.fecha_fin)
  const hoy = new Date()
  const diasRestantes = Math.floor((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  return diasRestantes <= 7 && diasRestantes >= 0
})

// Computed: Bono vencido
const bonoVencido = computed(() => {
  if (!bonoMostrar.value?.fecha_fin) return false
  const fecha = new Date(bonoMostrar.value.fecha_fin)
  return fecha < new Date()
})

// Computed: Tipo de bono formateado
const tipoBonoFormateado = computed(() => {
  if (!bonoMostrar.value?.tipo) return 'Bono'
  const tipos: Record<string, string> = {
    semanal: 'Semanal',
    quincenal: 'Quincenal',
    mensual: 'Mensual',
    otro: 'Personalizado'
  }
  return tipos[bonoMostrar.value.tipo] || bonoMostrar.value.tipo
})

// Computed: Precio de la sesion (usa precio del bono si existe)
const precioSesion = computed(() => {
  // PRIORIDAD 1: Si la cita tiene precio_sesion asignado, usar ese
  if (cita.value?.precio_sesion) {
    return cita.value.precio_sesion
  }

  // PRIORIDAD 2: Si tiene bono con precio_por_sesion, usar ese
  if (bonoMostrar.value?.precio_por_sesion) {
    return bonoMostrar.value.precio_por_sesion
  }

  // PRIORIDAD 3: Si tiene bono, calcular precio por sesión del bono
  if (bonoMostrar.value && bonoMostrar.value.monto_total && bonoMostrar.value.sesiones_totales) {
    return Math.round((bonoMostrar.value.monto_total / bonoMostrar.value.sesiones_totales) * 100) / 100
  }

  // PRIORIDAD 4: Precio por defecto
  return 50
})

// Computed: Información detallada del bono para mostrar
const infoBono = computed(() => {
  if (!bonoMostrar.value) return null

  const sesionesUsadasCalc = bonoMostrar.value.sesiones_totales - bonoMostrar.value.sesiones_restantes
  const numeroSesionActual = sesionesUsadasCalc + 1 // La siguiente sesión

  return {
    tipo: bonoMostrar.value.tipo || 'Bono',
    sesionesRestantes: bonoMostrar.value.sesiones_restantes,
    sesionesTotales: bonoMostrar.value.sesiones_totales,
    sesionesUsadas: sesionesUsadasCalc,
    numeroSesionActual: cita.value?.sesion_descontada ? sesionesUsadasCalc : numeroSesionActual,
    montoTotal: bonoMostrar.value.monto_total,
    precioPorSesion: bonoMostrar.value.precio_por_sesion || (bonoMostrar.value.monto_total / bonoMostrar.value.sesiones_totales),
    pagado: bonoMostrar.value.pagado,
    estado: bonoMostrar.value.estado,
    fechaInicio: bonoMostrar.value.fecha_inicio,
    fechaFin: bonoMostrar.value.fecha_fin,
    esAsignado: !!bono.value, // true si el bono está asignado a esta cita
    sesionDescontada: cita.value?.sesion_descontada
  }
})

// Computed: Iniciales del paciente
const inicialesPaciente = computed(() => {
  if (!paciente.value?.nombre_completo) return '?'
  const partes = paciente.value.nombre_completo.split(' ')
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase()
  }
  return partes[0].substring(0, 2).toUpperCase()
})

// Computed: Info del bono para el modal de pago
const bonoInfoParaPago = computed(() => {
  if (!bono.value) return null
  return {
    id: bono.value.id,
    nombre: bono.value.tipo || 'Bono',
    sesionesRestantes: bono.value.sesiones_restantes,
    sesionesTotales: bono.value.sesiones_totales,
    numeroSesion: bono.value.numero_sesion
  }
})

// Acciones
const cerrar = () => {
  modoEdicion.value = false
  mostrarModalPago.value = false
  modoEdicionPago.value = false
  mostrarConfirmacionDeshacer.value = false
  emit('close')
}

const llamarPaciente = () => {
  if (paciente.value?.telefono) {
    window.open(`tel:${paciente.value.telefono}`, '_self')
  }
}

const activarModoEdicion = () => {
  modoEdicion.value = true
}

const confirmarCitaRapido = async () => {
  if (!props.citaId || confirmando.value || !puedeConfirmar.value) return

  confirmando.value = true

  try {
    const { error } = await supabase
      .from('citas')
      .update({
        estado: 'confirmada',
        updated_at: new Date().toISOString()
      })
      .eq('id', props.citaId)

    if (error) throw error

    if (cita.value) {
      cita.value.estado = 'confirmada'
    }

    emit('cita-actualizada')
    emit('actualizado')
  } catch (error: any) {
    console.error('Error al confirmar cita:', error)
    toastError(`Error al confirmar: ${error.message}`)
  } finally {
    confirmando.value = false
  }
}

// Marcar cita como realizada
const marcarComoRealizada = async () => {
  if (!props.citaId || marcandoRealizada.value || !puedeMarcarRealizada.value) return

  marcandoRealizada.value = true

  try {
    const updateData: Record<string, any> = {
      estado: 'realizada',
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('citas')
      .update(updateData)
      .eq('id', props.citaId)

    if (error) throw error

    if (cita.value) {
      cita.value.estado = 'realizada'
    }

    toastSuccess('Sesión marcada como realizada')
    emit('cita-actualizada')
    emit('actualizado')
  } catch (error: any) {
    console.error('Error al marcar como realizada:', error)
    toastError(`Error: ${error.message}`)
  } finally {
    marcandoRealizada.value = false
  }
}

// Consumir sesión del bono
const consumirSesionBono = async () => {
  if (!props.citaId || !bono.value || consumiendoSesion.value) return

  consumiendoSesion.value = true

  try {
    // Actualizar la cita para marcar sesión como descontada
    const { error: citaError } = await supabase
      .from('citas')
      .update({
        sesion_descontada: true,
        descontar_de_bono: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', props.citaId)

    if (citaError) throw citaError

    // Actualizar sesiones restantes del bono
    const nuevasSesionesRestantes = bono.value.sesiones_restantes - 1
    const nuevoEstado = nuevasSesionesRestantes <= 0 ? 'agotado' : bono.value.estado

    const { error: bonoError } = await supabase
      .from('bonos')
      .update({
        sesiones_restantes: nuevasSesionesRestantes,
        estado: nuevoEstado,
        updated_at: new Date().toISOString()
      })
      .eq('id', bono.value.id)

    if (bonoError) throw bonoError

    // Actualizar estado local
    cita.value.sesion_descontada = true
    bono.value.sesiones_restantes = nuevasSesionesRestantes
    bono.value.estado = nuevoEstado

    toastSuccess('Sesión consumida del bono')
    emit('cita-actualizada')
    emit('actualizado')
  } catch (error: any) {
    console.error('Error al consumir sesión:', error)
    toastError(`Error: ${error.message}`)
  } finally {
    consumiendoSesion.value = false
  }
}

// Asignar bono activo a la cita
const asignarBonoACita = async () => {
  if (!props.citaId || !bonoActivoPaciente.value || asignandoBono.value) return

  asignandoBono.value = true

  try {
    const { error } = await supabase
      .from('citas')
      .update({
        bono_id: bonoActivoPaciente.value.id,
        descontar_de_bono: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', props.citaId)

    if (error) throw error

    // Actualizar estado local
    cita.value.bono_id = bonoActivoPaciente.value.id
    bono.value = bonoActivoPaciente.value
    bonoActivoPaciente.value = null

    toastSuccess('Bono asignado a la cita')
    emit('cita-actualizada')
    emit('actualizado')
  } catch (error: any) {
    console.error('Error al asignar bono:', error)
    toastError(`Error: ${error.message}`)
  } finally {
    asignandoBono.value = false
  }
}

// Abrir modal para crear nuevo bono (sin salir de la pantalla)
const abrirModalNuevoBono = () => {
  if (paciente.value?.id) {
    bonoParaEditar.value = null // Modo creación
    mostrarModalNuevoBono.value = true
  }
}

// Abrir modal para editar bono existente
const abrirModalEditarBono = () => {
  if (bonoMostrar.value) {
    bonoParaEditar.value = bonoMostrar.value // Modo edición
    mostrarModalNuevoBono.value = true
  }
}

// Manejar bono creado desde el modal
const handleBonoCreado = async (nuevoBono: any) => {
  mostrarModalNuevoBono.value = false

  try {
    // Calcular precio por sesión del bono
    const precioSesion = nuevoBono.monto_total && nuevoBono.sesiones_totales
      ? Number(nuevoBono.monto_total) / Number(nuevoBono.sesiones_totales)
      : PRECIO_SESION_DEFAULT

    // Asignar automáticamente el bono a la cita actual y actualizar precio
    if (props.citaId && cita.value) {
      const { error: errorAsignar } = await supabase
        .from('citas')
        .update({
          bono_id: nuevoBono.id,
          descontar_de_bono: true,
          precio_sesion: precioSesion,
          updated_at: new Date().toISOString()
        })
        .eq('id', props.citaId)

      if (errorAsignar) {
        console.error('Error al asignar bono a cita:', errorAsignar)
        toastError('Bono creado pero no se pudo asignar a la cita')
      } else {
        // Actualizar estado local
        cita.value.bono_id = nuevoBono.id
        cita.value.precio_sesion = precioSesion
        bono.value = nuevoBono
        toastSuccess(`Bono creado y asignado (${precioSesion.toFixed(0)}€/sesión)`)
      }
    } else {
      toastSuccess('Bono creado correctamente')
    }

    // Recargar datos completos de la cita
    if (props.citaId) {
      await cargarCita(props.citaId)
    }

    // Emitir evento para que el padre pueda refrescar
    emit('cita-actualizada')
    emit('actualizado')
  } catch (err: any) {
    console.error('Error en handleBonoCreado:', err)
    toastError('Error al procesar el bono')
  }
}

// Manejar bono actualizado desde el modal
const handleBonoActualizado = async (bonoActualizado: any) => {
  mostrarModalNuevoBono.value = false
  bonoParaEditar.value = null
  toastSuccess('Bono actualizado correctamente')

  // Actualizar precio de la cita si cambió el monto del bono
  if (props.citaId && cita.value && bonoActualizado) {
    const precioSesion = bonoActualizado.monto_total && bonoActualizado.sesiones_totales
      ? Number(bonoActualizado.monto_total) / Number(bonoActualizado.sesiones_totales)
      : PRECIO_SESION_DEFAULT

    // Actualizar precio de la cita en la BD
    await supabase
      .from('citas')
      .update({
        precio_sesion: precioSesion,
        updated_at: new Date().toISOString()
      })
      .eq('id', props.citaId)

    // Actualizar estado local
    cita.value.precio_sesion = precioSesion
  }

  // Recargar datos
  if (props.citaId) {
    await cargarCita(props.citaId)
  }

  emit('cita-actualizada')
  emit('actualizado')
}

// Navegar a gestión de bonos del paciente (solo para ver detalles completos)
const irAGestionBonos = () => {
  if (paciente.value?.id) {
    console.log('[ModalDetallesCita] Navegando a bonos del paciente:', paciente.value.id)
    cerrar()
    navigateTo(`/terapeuta/pacientes/${paciente.value.id}/bonos`)
  } else {
    console.error('[ModalDetallesCita] ERROR: No se encontró ID del paciente')
  }
}

// Abrir modal de pago (nuevo)
const abrirModalPago = () => {
  modoEdicionPago.value = false
  mostrarModalPago.value = true
}

// Abrir modal de pago (edición de método)
const abrirCambiarMetodo = () => {
  modoEdicionPago.value = true
  mostrarModalPago.value = true
}

// Manejar confirmación de pago desde el modal
const handlePagoConfirmado = (metodo: PaymentMethod) => {
  if (cita.value) {
    cita.value.estado_pago = 'pagado'
    cita.value.metodo_pago = metodo
    cita.value.fecha_pago = new Date().toISOString()
  }
  mostrarModalPago.value = false
  modoEdicionPago.value = false
  emit('cita-actualizada')
  emit('actualizado')
}

// Cancelar modal de pago
const cancelarModalPago = () => {
  mostrarModalPago.value = false
  modoEdicionPago.value = false
}

// Deshacer pago
const handleDeshacerPago = async () => {
  if (!props.citaId || deshaciendoPago.value) return

  deshaciendoPago.value = true

  try {
    const result = await undoPayment(props.citaId)

    if (result.success) {
      if (cita.value) {
        cita.value.estado_pago = 'pendiente'
        cita.value.metodo_pago = null
        cita.value.fecha_pago = null
      }
      toastSuccess('Pago deshecho')
      mostrarConfirmacionDeshacer.value = false
      emit('cita-actualizada')
      emit('actualizado')
    } else {
      toastError(result.error || 'Error al deshacer pago')
    }
  } catch (error: any) {
    console.error('Error al deshacer pago:', error)
    toastError('Error inesperado')
  } finally {
    deshaciendoPago.value = false
  }
}

const cancelarEdicion = () => {
  modoEdicion.value = false
  if (cita.value) {
    formEdicion.value = {
      fecha_cita: cita.value.fecha_cita,
      hora_inicio: cita.value.hora_inicio?.substring(0, 5) || '',
      hora_fin: cita.value.hora_fin?.substring(0, 5) || '',
      modalidad: cita.value.modalidad,
      observaciones: cita.value.observaciones || '',
      estado: cita.value.estado
    }
  }
}

const guardarCambios = async () => {
  if (!props.citaId) return

  try {
    cargando.value = true

    const horaInicioMinutes = parseInt(formEdicion.value.hora_inicio.split(':')[0]) * 60 + parseInt(formEdicion.value.hora_inicio.split(':')[1])
    const horaFinMinutes = parseInt(formEdicion.value.hora_fin.split(':')[0]) * 60 + parseInt(formEdicion.value.hora_fin.split(':')[1])

    if (horaFinMinutes <= horaInicioMinutes) {
      toastError('La hora de fin debe ser posterior a la hora de inicio')
      cargando.value = false
      return
    }

    const { error } = await supabase
      .from('citas')
      .update({
        fecha_cita: formEdicion.value.fecha_cita,
        hora_inicio: formEdicion.value.hora_inicio + ':00',
        hora_fin: formEdicion.value.hora_fin + ':00',
        modalidad: formEdicion.value.modalidad,
        observaciones: formEdicion.value.observaciones,
        estado: formEdicion.value.estado,
        updated_at: new Date().toISOString()
      })
      .eq('id', props.citaId)

    if (error) throw error

    modoEdicion.value = false
    await cargarCita()
    toastSuccess('Cambios guardados')
    emit('cita-actualizada')
    emit('actualizado')
  } catch (error: any) {
    console.error('Error al actualizar cita:', error)
    toastError(`Error al actualizar: ${error.message}`)
  } finally {
    cargando.value = false
  }
}

// Auto-calcular hora_fin cuando cambia hora_inicio
watch(() => formEdicion.value.hora_inicio, (newHora) => {
  if (modoEdicion.value && newHora) {
    const [hours, minutes] = newHora.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + 60
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    formEdicion.value.hora_fin = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="citaId"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
        @click.self="cerrar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            class="bg-white rounded-xl shadow-xl w-full max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col"
            @click.stop
          >
            <!-- HEADER -->
            <div class="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-white gap-2">
              <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div
                  class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs sm:text-sm font-semibold text-gray-600 flex-shrink-0"
                >
                  {{ inicialesPaciente }}
                </div>
                <div class="min-w-0">
                  <h2 id="modal-title" class="text-sm sm:text-base font-semibold text-gray-900 truncate">
                    Sesión - {{ paciente?.nombre_completo || 'Cargando...' }}
                  </h2>
                  <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', claseEstadoBadge]">
                    {{ estadoLabel }}
                  </span>
                </div>
              </div>
              <button
                @click="cerrar"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                aria-label="Cerrar modal"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Loading -->
            <div v-if="cargando" class="flex-1 flex items-center justify-center p-12">
              <div class="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
            </div>

            <!-- CONTENIDO -->
            <div v-else-if="cita" class="flex-1 overflow-y-auto">

              <!-- MODO VISTA -->
              <template v-if="!modoEdicion">

                <!-- Acciones rápidas -->
                <div class="px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-100 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <button
                    v-if="puedeMarcarRealizada"
                    @click="marcarComoRealizada"
                    :disabled="marcandoRealizada"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircleIcon class="w-4 h-4" />
                    {{ marcandoRealizada ? 'Marcando...' : 'Marcar realizada' }}
                  </button>
                  <button
                    @click="activarModoEdicion"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <PencilIcon class="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    v-if="paciente?.telefono"
                    @click="llamarPaciente"
                    class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <PhoneIcon class="w-4 h-4" />
                    Llamar
                  </button>
                </div>

                <!-- Info de la cita -->
                <div class="px-5 py-4 border-b border-gray-100">
                  <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-1.5 text-gray-600">
                        <CalendarDaysIcon class="w-4 h-4 text-gray-400" />
                        <span>{{ fechaCorta }}</span>
                      </div>
                      <div class="flex items-center gap-1.5 text-gray-600">
                        <ClockIcon class="w-4 h-4 text-gray-400" />
                        <span>{{ horarioFormateado }}</span>
                      </div>
                      <div class="flex items-center gap-1.5 text-gray-600">
                        <component
                          :is="cita.modalidad === 'virtual' ? VideoCameraIcon : MapPinIcon"
                          class="w-4 h-4 text-gray-400"
                        />
                        <span>{{ modalidadFormateada }}</span>
                      </div>
                    </div>
                    <span class="text-gray-500">{{ duracionMinutos }} min</span>
                  </div>
                </div>

                <!-- SECCIÓN DE PAGO -->
                <div class="mx-5 my-4">
                  <PaymentStatusBadge
                    :estado-pago="estadoPago"
                    :metodo-pago="cita.metodo_pago"
                    :fecha-pago="cita.fecha_pago"
                    :cantidad="precioSesion"
                    :show-actions="puedeRegistrarPago || estadoPago === 'pagado'"
                    @registrar="abrirModalPago"
                    @cambiar="abrirCambiarMetodo"
                    @deshacer="mostrarConfirmacionDeshacer = true"
                  />

                  <p
                    v-if="estadoPago === 'pendiente' && !puedeRegistrarPago && cita.estado === 'pendiente'"
                    class="mt-2 text-xs text-amber-600 text-center"
                  >
                    Confirma la cita primero para poder registrar el pago
                  </p>

                  <!-- Confirmación de deshacer pago -->
                  <div
                    v-if="mostrarConfirmacionDeshacer"
                    class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p class="text-sm text-red-800 mb-3">
                      ¿Estás seguro de deshacer este pago?
                    </p>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        class="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        :disabled="deshaciendoPago"
                        @click="mostrarConfirmacionDeshacer = false"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        class="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        :disabled="deshaciendoPago"
                        @click="handleDeshacerPago"
                      >
                        {{ deshaciendoPago ? 'Deshaciendo...' : 'Sí, deshacer' }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Modal de pago rápido -->
                <PaymentQuickModal
                  v-if="mostrarModalPago"
                  :cita-id="cita.id"
                  :paciente-nombre="paciente?.nombre_completo || 'Paciente'"
                  :cantidad="precioSesion"
                  :tipo-transaccion="bono ? 'sesion_bono' : 'sesion_unica'"
                  :bono-info="bonoInfoParaPago"
                  :hora-inicio="cita.hora_inicio?.substring(0, 5)"
                  :metodo-pago-actual="cita.metodo_pago"
                  :modo-edicion="modoEdicionPago"
                  @confirm="handlePagoConfirmado"
                  @cancel="cancelarModalPago"
                />

                <!-- SECCIÓN DE BONO MEJORADA -->
                <div class="mx-5 mb-3">
                  <!-- Header de la sección -->
                  <button
                    @click="seccionBonoAbierta = !seccionBonoAbierta"
                    class="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors"
                    :class="bonoMostrar
                      ? 'bg-purple-50 hover:bg-purple-100'
                      : 'bg-gray-50 hover:bg-gray-100'"
                  >
                    <div class="flex items-center gap-2">
                      <TicketIcon class="w-4 h-4" :class="bonoMostrar ? 'text-purple-500' : 'text-gray-400'" />
                      <span class="text-sm font-medium" :class="bonoMostrar ? 'text-purple-700' : 'text-gray-700'">
                        {{ bonoMostrar ? 'Bono del paciente' : 'Sin bono asignado' }}
                      </span>
                      <template v-if="bonoMostrar">
                        <span class="text-xs px-1.5 py-0.5 rounded" :class="bono ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'">
                          {{ bono ? 'Asignado' : 'Disponible' }}
                        </span>
                      </template>
                    </div>
                    <div class="flex items-center gap-2">
                      <span v-if="bonoMostrar" class="text-xs text-gray-500">
                        {{ sesionesUsadas }}/{{ bonoMostrar.sesiones_totales }}
                      </span>
                      <component :is="seccionBonoAbierta ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4 text-gray-400" />
                    </div>
                  </button>

                  <!-- Contenido expandido -->
                  <Transition
                    enter-active-class="transition-all duration-200"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-96"
                    leave-active-class="transition-all duration-150"
                    leave-from-class="opacity-100 max-h-96"
                    leave-to-class="opacity-0 max-h-0"
                  >
                    <div v-if="seccionBonoAbierta" class="mt-2 overflow-hidden">
                      <!-- Si tiene bono (asignado o disponible) -->
                      <div v-if="bonoMostrar && infoBono" class="p-4 bg-white border border-gray-100 rounded-lg space-y-3">
                        <!-- Info del bono con tipo y estado de pago -->
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-semibold text-purple-700">{{ tipoBonoFormateado }}</span>
                            <span
                              v-if="infoBono.pagado"
                              class="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium"
                            >Pagado</span>
                            <span
                              v-else
                              class="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full font-medium"
                            >Pago pendiente</span>
                          </div>
                          <div v-if="fechaVencimientoBono" class="text-xs font-medium" :class="bonoVencido ? 'text-red-600' : (bonoProximoVencer ? 'text-amber-600' : 'text-gray-500')">
                            {{ bonoVencido ? 'Vencido' : `Vence ${fechaVencimientoBono}` }}
                          </div>
                        </div>

                        <!-- Información económica del bono -->
                        <div class="grid grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-lg">
                          <div>
                            <p class="text-xs text-gray-500">Valor del bono</p>
                            <p class="text-sm font-semibold text-gray-900">{{ infoBono.montoTotal?.toFixed(2) || '0.00' }}€</p>
                          </div>
                          <div>
                            <p class="text-xs text-gray-500">Precio por sesión</p>
                            <p class="text-sm font-semibold text-gray-900">{{ infoBono.precioPorSesion?.toFixed(2) || '0.00' }}€</p>
                          </div>
                        </div>

                        <!-- Barra de progreso con indicador de sesión actual -->
                        <div>
                          <div class="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                            <span class="font-medium">Sesiones del bono</span>
                            <span class="font-semibold text-purple-700">{{ infoBono.sesionesUsadas }} de {{ infoBono.sesionesTotales }} usadas</span>
                          </div>
                          <div class="flex gap-1">
                            <template v-for="i in infoBono.sesionesTotales" :key="i">
                              <div
                                class="flex-1 h-3 rounded transition-all"
                                :class="[
                                  i <= infoBono.sesionesUsadas ? 'bg-purple-600' : 'bg-purple-100',
                                  i === infoBono.numeroSesionActual && !infoBono.sesionDescontada ? 'ring-2 ring-purple-400 ring-offset-1' : ''
                                ]"
                                :title="`Sesión ${i}${i <= infoBono.sesionesUsadas ? ' (usada)' : i === infoBono.numeroSesionActual ? ' (esta cita)' : ' (disponible)'}`"
                              ></div>
                            </template>
                          </div>
                          <p class="text-xs text-gray-500 mt-1.5">
                            {{ infoBono.sesionesRestantes }} sesiones restantes
                          </p>
                        </div>

                        <!-- Mensaje informativo sobre esta sesión -->
                        <div v-if="infoBono.esAsignado" class="p-2.5 rounded-lg" :class="cita.sesion_descontada ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'">
                          <div class="flex items-start gap-2">
                            <CheckCircleIcon v-if="cita.sesion_descontada" class="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <ExclamationTriangleIcon v-else class="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p class="text-xs font-medium" :class="cita.sesion_descontada ? 'text-green-800' : 'text-amber-800'">
                                <template v-if="cita.sesion_descontada">
                                  Sesión {{ infoBono.sesionesUsadas }}/{{ infoBono.sesionesTotales }} del bono (ya descontada)
                                </template>
                                <template v-else>
                                  Esta será la sesión {{ infoBono.numeroSesionActual }}/{{ infoBono.sesionesTotales }} del bono
                                </template>
                              </p>
                              <p v-if="!cita.sesion_descontada" class="text-xs text-amber-700 mt-0.5">
                                Se descontará cuando confirmes o marques como realizada
                              </p>
                            </div>
                          </div>
                        </div>

                        <!-- Alertas importantes -->
                        <div v-if="bonoMostrar.sesiones_restantes === 1 && !cita.sesion_descontada" class="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                          <ExclamationTriangleIcon class="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <span class="text-xs text-orange-700 font-medium">¡Última sesión disponible del bono!</span>
                        </div>

                        <div v-if="bonoVencido" class="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <ExclamationTriangleIcon class="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span class="text-xs text-red-700 font-medium">Este bono ha vencido</span>
                        </div>

                        <!-- Acciones del bono -->
                        <div class="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <!-- Asignar bono (si no está asignado pero hay disponible) -->
                          <button
                            v-if="puedeAsignarBono"
                            @click="asignarBonoACita"
                            :disabled="asignandoBono"
                            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <PlusIcon class="w-4 h-4" />
                            {{ asignandoBono ? 'Asignando...' : 'Asignar a esta cita' }}
                          </button>

                          <!-- Consumir sesión -->
                          <button
                            v-if="puedeConsumirSesion"
                            @click="consumirSesionBono"
                            :disabled="consumiendoSesion"
                            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <CheckCircleIcon class="w-4 h-4" />
                            {{ consumiendoSesion ? 'Consumiendo...' : 'Consumir sesión' }}
                          </button>

                          <!-- Editar bono -->
                          <button
                            @click="abrirModalEditarBono"
                            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <PencilIcon class="w-4 h-4" />
                            <span class="hidden sm:inline">Editar</span>
                          </button>

                          <!-- Ver detalles -->
                          <button
                            @click="irAGestionBonos"
                            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ArrowTopRightOnSquareIcon class="w-4 h-4" />
                            <span class="hidden sm:inline">Ver más</span>
                          </button>
                        </div>
                      </div>

                      <!-- Si no tiene bono -->
                      <div v-else class="p-4 bg-gray-50 border border-gray-100 rounded-lg text-center">
                        <p class="text-sm text-gray-500 mb-3">Este paciente no tiene bono activo</p>
                        <button
                          @click="abrirModalNuevoBono"
                          class="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <PlusIcon class="w-4 h-4" />
                          Crear bono
                        </button>
                      </div>
                    </div>
                  </Transition>
                </div>

                <!-- SECCIÓN DE OBSERVACIONES -->
                <div v-if="cita.observaciones" class="mx-5 mb-4">
                  <button
                    @click="seccionObservacionesAbierta = !seccionObservacionesAbierta"
                    class="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span class="text-sm font-medium text-gray-700">Observaciones</span>
                    <component :is="seccionObservacionesAbierta ? ChevronUpIcon : ChevronDownIcon" class="w-4 h-4 text-gray-400" />
                  </button>

                  <Transition
                    enter-active-class="transition-all duration-200"
                    enter-from-class="opacity-0 max-h-0"
                    enter-to-class="opacity-100 max-h-60"
                    leave-active-class="transition-all duration-150"
                    leave-from-class="opacity-100 max-h-60"
                    leave-to-class="opacity-0 max-h-0"
                  >
                    <div v-if="seccionObservacionesAbierta" class="mt-2 px-4 py-3 bg-gray-50 rounded-lg overflow-hidden">
                      <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ cita.observaciones }}</p>
                    </div>
                  </Transition>
                </div>

                <!-- FOOTER -->
                <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>ID: {{ cita.id.substring(0, 8) }}...</span>
                  <div class="flex items-center gap-3">
                    <button class="hover:text-gray-600 transition-colors">Ver historial</button>
                    <span>|</span>
                    <button class="hover:text-red-500 transition-colors">Cancelar cita</button>
                  </div>
                </div>

                <!-- Botón de confirmación -->
                <div v-if="puedeConfirmar" class="px-5 pb-4">
                  <button
                    @click="confirmarCitaRapido"
                    :disabled="confirmando"
                    class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg v-if="confirmando" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <CheckCircleIcon v-else class="w-5 h-5" />
                    {{ confirmando ? 'Confirmando...' : 'Confirmar cita' }}
                  </button>
                </div>

              </template>

              <!-- MODO EDICIÓN -->
              <template v-else>
                <form @submit.prevent="guardarCambios" class="p-5 space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      v-model="formEdicion.fecha_cita"
                      type="date"
                      required
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Inicio</label>
                      <input
                        v-model="formEdicion.hora_inicio"
                        type="time"
                        required
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Fin</label>
                      <input
                        v-model="formEdicion.hora_fin"
                        type="time"
                        required
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                      <select
                        v-model="formEdicion.modalidad"
                        required
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      >
                        <option value="presencial">Presencial</option>
                        <option value="virtual">Virtual</option>
                        <option value="telefonica">Telefónica</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                      <select
                        v-model="formEdicion.estado"
                        required
                        class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="realizada">Realizada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                    <textarea
                      v-model="formEdicion.observaciones"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 resize-none"
                      placeholder="Notas adicionales..."
                    ></textarea>
                  </div>

                  <div class="flex gap-3 pt-2">
                    <button
                      type="button"
                      @click="cancelarEdicion"
                      class="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      :disabled="cargando"
                      class="flex-1 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {{ cargando ? 'Guardando...' : 'Guardar' }}
                    </button>
                  </div>
                </form>
              </template>

            </div>

            <!-- Sin datos -->
            <div v-else class="flex-1 flex items-center justify-center p-12 text-center">
              <div>
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XMarkIcon class="w-6 h-6 text-gray-400" />
                </div>
                <p class="text-gray-600 font-medium">No se encontraron datos</p>
                <p class="text-gray-400 text-sm mt-1">ID: {{ citaId?.substring(0, 8) }}...</p>
              </div>
            </div>

          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Modal para crear/editar bono (inline, sin salir de la pantalla) -->
    <ModalNuevoBono
      v-if="paciente"
      :mostrar="mostrarModalNuevoBono"
      :paciente-id="paciente.id"
      :paciente-nombre="paciente.nombre_completo || 'Paciente'"
      :bono-existente="bonoParaEditar"
      @close="mostrarModalNuevoBono = false; bonoParaEditar = null"
      @created="handleBonoCreado"
      @updated="handleBonoActualizado"
    />
  </Teleport>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
