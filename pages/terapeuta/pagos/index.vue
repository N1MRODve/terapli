<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { usePagosRegistros, type PagoRegistro } from '~/composables/usePagosRegistros'
import { useFacturas, type Factura } from '~/composables/useFacturas'
import { usePacientes } from '~/composables/usePacientes'

definePageMeta({
  layout: 'terapeuta',
  middleware: ['auth']
})

// Composables
const { getPagos, loading: loadingPagos, formatearMetodoPago } = usePagosRegistros()
const { getFacturas, crearFactura, loading: loadingFacturas, formatearImporte, formatearFecha, getEstadoColor, anularFactura, calcularImpuestos } = useFacturas()
const { pacientes, loadAllPacientes } = usePacientes()
const { waitForUser, userProfile } = useSupabase()

// Estado
const activeTab = ref<'pagos' | 'facturas'>('pagos')
const pagos = ref<PagoRegistro[]>([])
const facturas = ref<Factura[]>([])
const showPagoModal = ref(false)

// Filtros
const filtros = ref({
  fechaDesde: '',
  fechaHasta: '',
  pacienteId: '',
  estado: '',
  metodoPago: ''
})

// Filtros rápidos de fecha
const filtroRapidoActivo = ref<string | null>(null)

const filtrosRapidos = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mes' },
  { id: 'trimestre', label: 'Trimestre' },
  { id: 'anio', label: 'Este año' }
]

function aplicarFiltroRapido(filtroId: string) {
  const hoy = new Date()
  let fechaDesde = ''
  let fechaHasta = hoy.toISOString().split('T')[0]

  switch (filtroId) {
    case 'hoy':
      fechaDesde = fechaHasta
      break
    case 'semana':
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1) // Lunes
      fechaDesde = inicioSemana.toISOString().split('T')[0]
      break
    case 'mes':
      fechaDesde = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
      break
    case 'trimestre':
      const mesActual = hoy.getMonth()
      const inicioTrimestre = new Date(hoy.getFullYear(), Math.floor(mesActual / 3) * 3, 1)
      fechaDesde = inicioTrimestre.toISOString().split('T')[0]
      break
    case 'anio':
      fechaDesde = new Date(hoy.getFullYear(), 0, 1).toISOString().split('T')[0]
      break
  }

  filtros.value.fechaDesde = fechaDesde
  filtros.value.fechaHasta = fechaHasta
  filtroRapidoActivo.value = filtroId
  aplicarFiltros()
}

// Paginación
const paginaPagos = ref(1)
const paginaFacturas = ref(1)
const itemsPorPagina = 20
const totalPagos = ref(0)
const totalFacturas = ref(0)

// Computed
const totalPaginasPagos = computed(() => Math.ceil(totalPagos.value / itemsPorPagina))
const totalPaginasFacturas = computed(() => Math.ceil(totalFacturas.value / itemsPorPagina))

const loading = computed(() => loadingPagos.value || loadingFacturas.value)

// Métricas de resumen
const metricasResumen = computed(() => {
  const totalCobrado = pagos.value.reduce((sum, p) => sum + p.monto, 0)
  const cantidadPagos = pagos.value.length

  // Por método de pago
  const porMetodo: Record<string, { total: number; cantidad: number }> = {}
  pagos.value.forEach(p => {
    const metodo = p.metodo_pago || 'otro'
    if (!porMetodo[metodo]) {
      porMetodo[metodo] = { total: 0, cantidad: 0 }
    }
    porMetodo[metodo].total += p.monto
    porMetodo[metodo].cantidad += 1
  })

  // Encontrar método más usado
  let metodoMasUsado = { nombre: '-', porcentaje: 0 }
  if (cantidadPagos > 0) {
    const metodosOrdenados = Object.entries(porMetodo)
      .sort(([, a], [, b]) => b.cantidad - a.cantidad)
    if (metodosOrdenados.length > 0) {
      const [nombre, datos] = metodosOrdenados[0]
      metodoMasUsado = {
        nombre: formatearMetodoPago(nombre as any),
        porcentaje: Math.round((datos.cantidad / cantidadPagos) * 100)
      }
    }
  }

  // Promedio por pago
  const promedioPorPago = cantidadPagos > 0 ? totalCobrado / cantidadPagos : 0

  return {
    totalCobrado,
    cantidadPagos,
    promedioPorPago,
    metodoMasUsado,
    porMetodo
  }
})

// Descripción del período filtrado
const descripcionPeriodo = computed(() => {
  if (!filtros.value.fechaDesde && !filtros.value.fechaHasta) {
    return 'Todos los pagos'
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  if (filtros.value.fechaDesde && filtros.value.fechaHasta) {
    return `${formatFecha(filtros.value.fechaDesde)} - ${formatFecha(filtros.value.fechaHasta)}`
  }
  if (filtros.value.fechaDesde) {
    return `Desde ${formatFecha(filtros.value.fechaDesde)}`
  }
  return `Hasta ${formatFecha(filtros.value.fechaHasta)}`
})

// Pagos huérfanos (sin paciente asociado correctamente)
const pagosHuerfanos = computed(() => {
  return pagos.value.filter(pago => {
    // Tiene paciente_id pero no se pudo resolver la relación
    return pago.paciente_id && !pago.paciente?.nombre_completo
  })
})

const tienePagosHuerfanos = computed(() => pagosHuerfanos.value.length > 0)

// Modal para asignar paciente
const showAsignarPacienteModal = ref(false)
const pagoParaAsignar = ref<PagoRegistro | null>(null)
const pacienteSeleccionado = ref('')
const asignandoPaciente = ref(false)

function abrirModalAsignarPaciente(pago: PagoRegistro) {
  pagoParaAsignar.value = pago
  pacienteSeleccionado.value = ''
  showAsignarPacienteModal.value = true
}

async function asignarPaciente() {
  if (!pagoParaAsignar.value || !pacienteSeleccionado.value) return

  asignandoPaciente.value = true
  try {
    const supabase = useSupabaseClient()
    const { error } = await supabase
      .from('pagos_registros')
      .update({ paciente_id: pacienteSeleccionado.value })
      .eq('id', pagoParaAsignar.value.id)

    if (error) throw error

    // Recargar pagos
    await cargarPagos()
    showAsignarPacienteModal.value = false
    pagoParaAsignar.value = null
    pacienteSeleccionado.value = ''
  } catch (err) {
    console.error('Error asignando paciente:', err)
    alert('Error al asignar paciente')
  } finally {
    asignandoPaciente.value = false
  }
}

// Verificar si un pago tiene problema de paciente
function tieneProblema(pago: PagoRegistro): boolean {
  return pago.paciente_id !== null && !pago.paciente?.nombre_completo
}

// Métodos
async function cargarPagos() {
  const result = await getPagos({
    fechaDesde: filtros.value.fechaDesde || undefined,
    fechaHasta: filtros.value.fechaHasta || undefined,
    pacienteId: filtros.value.pacienteId || undefined
  })
  if (result.success && result.data) {
    pagos.value = result.data
    totalPagos.value = result.total || result.data.length
  } else {
    pagos.value = []
    totalPagos.value = 0
  }
}

async function cargarFacturas() {
  const result = await getFacturas({
    fechaDesde: filtros.value.fechaDesde || undefined,
    fechaHasta: filtros.value.fechaHasta || undefined,
    pacienteId: filtros.value.pacienteId || undefined,
    estado: (filtros.value.estado as 'borrador' | 'emitida' | 'anulada') || undefined
  })
  if (result.success && result.data) {
    facturas.value = result.data
    totalFacturas.value = result.total || result.data.length
  } else {
    facturas.value = []
    totalFacturas.value = 0
  }
}

function aplicarFiltros() {
  paginaPagos.value = 1
  paginaFacturas.value = 1
  if (activeTab.value === 'pagos') {
    cargarPagos()
  } else {
    cargarFacturas()
  }
}

function limpiarFiltros() {
  filtros.value = {
    fechaDesde: '',
    fechaHasta: '',
    pacienteId: '',
    estado: '',
    metodoPago: ''
  }
  filtroRapidoActivo.value = null
  aplicarFiltros()
}

async function handleAnularFactura(factura: Factura) {
  if (!confirm(`¿Estás seguro de anular la factura ${factura.numero_factura}?`)) return

  const motivo = prompt('Motivo de anulación:')
  if (!motivo) return

  const success = await anularFactura(factura.id, motivo)
  if (success) {
    cargarFacturas()
  }
}

function descargarPDF(factura: Factura) {
  // Datos del terapeuta (usar perfil o valores por defecto)
  const terapeutaNombre = userProfile.value?.nombre_completo || 'Terapeuta'
  const terapeutaNif = userProfile.value?.nif || ''
  const terapeutaDireccion = userProfile.value?.direccion || ''
  const terapeutaCiudad = userProfile.value?.ciudad || ''
  const terapeutaCP = userProfile.value?.codigo_postal || ''
  const terapeutaTelefono = userProfile.value?.telefono || ''
  const terapeutaEmail = userProfile.value?.email || ''

  // Formatear fecha
  const fechaEmision = new Date(factura.fecha_emision).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  // Formatear importes
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  // Generar HTML del PDF
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Factura ${factura.numero_factura}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          line-height: 1.5;
          color: #333;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid #7c3aed;
        }
        .header-left h1 {
          font-size: 28px;
          color: #7c3aed;
          margin-bottom: 5px;
        }
        .header-left p {
          color: #666;
          font-size: 11px;
        }
        .header-right {
          text-align: right;
        }
        .factura-numero {
          background: #7c3aed;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .factura-fecha {
          color: #666;
          font-size: 12px;
        }
        .datos-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .datos-box {
          width: 48%;
        }
        .datos-box h3 {
          font-size: 11px;
          text-transform: uppercase;
          color: #7c3aed;
          margin-bottom: 10px;
          letter-spacing: 0.5px;
        }
        .datos-box p {
          margin-bottom: 3px;
          color: #444;
        }
        .datos-box .nombre {
          font-weight: 600;
          font-size: 14px;
          color: #222;
        }
        .concepto-section {
          background: #f8f5ff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .concepto-section h3 {
          font-size: 11px;
          text-transform: uppercase;
          color: #7c3aed;
          margin-bottom: 10px;
        }
        .concepto-section p {
          font-size: 14px;
          color: #333;
        }
        .importes-table {
          width: 100%;
          margin-bottom: 30px;
        }
        .importes-table th,
        .importes-table td {
          padding: 12px 15px;
          text-align: right;
        }
        .importes-table th {
          text-align: left;
          background: #f3f4f6;
          font-weight: 500;
          color: #666;
          font-size: 11px;
          text-transform: uppercase;
        }
        .importes-table td {
          border-bottom: 1px solid #eee;
        }
        .importes-table td:first-child {
          text-align: left;
          color: #444;
        }
        .importes-table .total-row td {
          border-bottom: none;
          border-top: 2px solid #7c3aed;
          font-weight: bold;
          font-size: 16px;
          color: #7c3aed;
          padding-top: 15px;
        }
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #888;
          font-size: 10px;
        }
        .estado-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          margin-top: 10px;
        }
        .estado-emitida {
          background: #d1fae5;
          color: #065f46;
        }
        .estado-anulada {
          background: #fee2e2;
          color: #991b1b;
        }
        .estado-borrador {
          background: #fef3c7;
          color: #92400e;
        }
        .regimen-note {
          background: #fffbeb;
          border: 1px solid #fcd34d;
          padding: 10px 15px;
          border-radius: 6px;
          font-size: 11px;
          color: #92400e;
          margin-bottom: 20px;
        }
        @media print {
          body {
            padding: 20px;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-left">
          <h1>FACTURA</h1>
          <p>Servicios de psicoterapia</p>
        </div>
        <div class="header-right">
          <div class="factura-numero">${factura.numero_factura}</div>
          <div class="factura-fecha">${fechaEmision}</div>
          <span class="estado-badge estado-${factura.estado}">${factura.estado.toUpperCase()}</span>
        </div>
      </div>

      <div class="datos-section">
        <div class="datos-box">
          <h3>Emisor</h3>
          <p class="nombre">${terapeutaNombre}</p>
          ${terapeutaNif ? `<p>NIF: ${terapeutaNif}</p>` : ''}
          ${terapeutaDireccion ? `<p>${terapeutaDireccion}</p>` : ''}
          ${terapeutaCP || terapeutaCiudad ? `<p>${terapeutaCP} ${terapeutaCiudad}</p>` : ''}
          ${terapeutaTelefono ? `<p>Tel: ${terapeutaTelefono}</p>` : ''}
          ${terapeutaEmail ? `<p>${terapeutaEmail}</p>` : ''}
        </div>
        <div class="datos-box">
          <h3>Receptor</h3>
          <p class="nombre">${factura.receptor_nombre}</p>
          ${factura.receptor_nif ? `<p>NIF/CIF: ${factura.receptor_nif}</p>` : ''}
          ${factura.receptor_direccion ? `<p>${factura.receptor_direccion}</p>` : ''}
          <p style="margin-top: 8px; color: #888; font-size: 11px;">
            Tipo: ${factura.tipo_cliente === 'particular' ? 'Particular' : 'Empresa'}
          </p>
        </div>
      </div>

      <div class="concepto-section">
        <h3>Concepto</h3>
        <p>${factura.concepto || 'Servicios de psicoterapia'}</p>
      </div>

      ${factura.porcentaje_iva === 0 ? `
        <div class="regimen-note">
          Operación exenta de IVA según el artículo 20.Uno.3º de la Ley 37/1992 del IVA (servicios sanitarios)
        </div>
      ` : ''}

      <table class="importes-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Base imponible</td>
            <td>${formatMoney(factura.base_imponible)}</td>
          </tr>
          ${factura.porcentaje_iva > 0 ? `
            <tr>
              <td>IVA (${factura.porcentaje_iva}%)</td>
              <td>${formatMoney(factura.importe_iva)}</td>
            </tr>
          ` : `
            <tr>
              <td>IVA (Exento)</td>
              <td>0,00 €</td>
            </tr>
          `}
          ${factura.porcentaje_irpf > 0 ? `
            <tr>
              <td>Retención IRPF (${factura.porcentaje_irpf}%)</td>
              <td>-${formatMoney(factura.importe_irpf)}</td>
            </tr>
          ` : ''}
          <tr class="total-row">
            <td>TOTAL</td>
            <td>${formatMoney(factura.total)}</td>
          </tr>
        </tbody>
      </table>

      ${factura.estado === 'anulada' && factura.motivo_anulacion ? `
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <strong style="color: #991b1b;">Factura anulada</strong>
          <p style="color: #991b1b; margin-top: 5px;">${factura.motivo_anulacion}</p>
        </div>
      ` : ''}

      <div class="footer">
        <p>Documento generado el ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
        <p style="margin-top: 5px;">Teraplí - Sistema de gestión para terapeutas</p>
      </div>

      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="background: #7c3aed; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; margin-right: 10px;">
          Imprimir / Guardar PDF
        </button>
        <button onclick="window.close()" style="background: #e5e7eb; color: #374151; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer;">
          Cerrar
        </button>
      </div>
    </body>
    </html>
  `

  // Abrir en nueva ventana para imprimir
  const ventana = window.open('', '_blank', 'width=800,height=600')
  if (ventana) {
    ventana.document.write(html)
    ventana.document.close()
  } else {
    alert('Por favor permite las ventanas emergentes para descargar la factura')
  }
}

function getNombrePaciente(pago: PagoRegistro): string {
  // Usar la relación del paciente que viene incluida en el pago
  if (pago.paciente?.nombre_completo) {
    return pago.paciente.nombre_completo
  }
  if (!pago.paciente_id) return 'Sin paciente'
  // Fallback: buscar en la lista de pacientes cargados
  const paciente = pacientes.value.find(p => p.id === pago.paciente_id)
  return paciente ? paciente.nombre_completo : 'Paciente no encontrado'
}

// Formato de fecha contextual (Hoy, Ayer, Lun 30 dic, o DD/MM/YYYY)
function formatearFechaContextual(fecha: string): { texto: string; subtexto?: string } {
  const fechaPago = new Date(fecha)
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(hoy.getDate() - 1)
  const hace7Dias = new Date()
  hace7Dias.setDate(hoy.getDate() - 7)

  // Normalizar fechas (sin hora)
  const fechaPagoStr = fechaPago.toISOString().split('T')[0]
  const hoyStr = hoy.toISOString().split('T')[0]
  const ayerStr = ayer.toISOString().split('T')[0]

  if (fechaPagoStr === hoyStr) {
    return { texto: 'Hoy' }
  }
  if (fechaPagoStr === ayerStr) {
    return { texto: 'Ayer' }
  }
  if (fechaPago >= hace7Dias) {
    return {
      texto: fechaPago.toLocaleDateString('es-ES', { weekday: 'short' }),
      subtexto: fechaPago.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    }
  }
  return {
    texto: fechaPago.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
}

// Iconos para métodos de pago
function getMetodoIcon(metodo: string): string {
  const iconos: Record<string, string> = {
    efectivo: '💵',
    transferencia: '🏦',
    bizum: '📱',
    tarjeta: '💳',
    stripe: '💻'
  }
  return iconos[metodo] || '💰'
}

// Info del bono
function getBonoInfo(pago: PagoRegistro): { tipo: string; sesiones: string; monto?: string } | null {
  if (!pago.bono_id || !pago.bono) return null
  const bono = pago.bono
  return {
    tipo: bono.tipo || 'Bono',
    sesiones: `${bono.sesiones_totales || '?'} ses.`,
    monto: bono.monto_total ? formatearImporte(bono.monto_total) : undefined
  }
}

// Parsear y simplificar concepto
interface ConceptoParsed {
  tipo: 'bono' | 'individual' | 'primera' | 'familiar' | 'otro'
  texto: string
  progreso?: string // Ej: "(1/2)"
  detalleCompleto: string
}

function parseConcepto(pago: PagoRegistro): ConceptoParsed {
  const concepto = pago.concepto || ''
  const detalleCompleto = concepto

  // Detectar tipo por patrones en el texto
  if (concepto.toLowerCase().includes('bono') || pago.bono_id) {
    // Extraer nombre del bono y progreso
    // Patrón: "Pago sesión de bono: Quincenal (100) (1/2)"
    const matchBono = concepto.match(/bono:?\s*([^(]+)\s*\((\d+)\)\s*(\(\d+\/\d+\))?/i)
    if (matchBono) {
      const nombreBono = matchBono[1].trim()
      const monto = matchBono[2]
      const progreso = matchBono[3] || ''
      return {
        tipo: 'bono',
        texto: `${nombreBono} ${monto}€`,
        progreso: progreso,
        detalleCompleto
      }
    }
    // Si tiene bono_id pero no parseamos bien
    if (pago.bono_id && pago.bono) {
      return {
        tipo: 'bono',
        texto: pago.bono.tipo || 'Bono',
        detalleCompleto
      }
    }
    return {
      tipo: 'bono',
      texto: concepto.replace(/pago\s*(de\s*)?sesión\s*(de\s*)?/gi, '').trim() || 'Bono',
      detalleCompleto
    }
  }

  if (concepto.toLowerCase().includes('primera') || concepto.toLowerCase().includes('inicial')) {
    return {
      tipo: 'primera',
      texto: 'Primera consulta',
      detalleCompleto
    }
  }

  if (concepto.toLowerCase().includes('familiar')) {
    return {
      tipo: 'familiar',
      texto: 'Sesión familiar',
      detalleCompleto
    }
  }

  if (concepto.toLowerCase().includes('individual') || concepto.toLowerCase().includes('sesión suelta')) {
    return {
      tipo: 'individual',
      texto: 'Sesión individual',
      detalleCompleto
    }
  }

  // Por defecto
  return {
    tipo: 'otro',
    texto: concepto || '-',
    detalleCompleto
  }
}

// Colores para badges de tipo de concepto
function getConceptoBadgeClass(tipo: ConceptoParsed['tipo']): string {
  const clases: Record<string, string> = {
    bono: 'badge-bono',
    individual: 'badge-individual',
    primera: 'badge-primera',
    familiar: 'badge-familiar',
    otro: 'badge-otro'
  }
  return clases[tipo] || 'badge-otro'
}

function getConceptoLabel(tipo: ConceptoParsed['tipo']): string {
  const labels: Record<string, string> = {
    bono: 'BONO',
    individual: 'INDIV',
    primera: '1ª',
    familiar: 'FAM',
    otro: ''
  }
  return labels[tipo] || ''
}

// Menú de acciones
const menuAbierto = ref<string | null>(null)

function toggleMenu(pagoId: string) {
  menuAbierto.value = menuAbierto.value === pagoId ? null : pagoId
}

function cerrarMenus() {
  menuAbierto.value = null
}

// Acciones de pago
function verDetallesPago(pago: PagoRegistro) {
  cerrarMenus()
  // Por ahora mostrar alerta, se puede implementar modal
  alert(`Detalles del pago:\n\nFecha: ${formatearFecha(pago.fecha_pago)}\nMonto: ${formatearImporte(pago.monto)}\nMétodo: ${formatearMetodoPago(pago.metodo_pago)}\nConcepto: ${pago.concepto || '-'}`)
}

async function eliminarPago(pago: PagoRegistro) {
  cerrarMenus()
  if (!confirm(`¿Estás seguro de eliminar este pago de ${formatearImporte(pago.monto)}?`)) return

  try {
    const supabase = useSupabaseClient()
    const { error } = await supabase
      .from('pagos_registros')
      .delete()
      .eq('id', pago.id)

    if (error) throw error
    await cargarPagos()
  } catch (err) {
    console.error('Error eliminando pago:', err)
    alert('Error al eliminar el pago')
  }
}

// =====================================================
// GENERAR FACTURA DESDE PAGO
// =====================================================

const showGenerarFacturaModal = ref(false)
const pagoParaFacturar = ref<PagoRegistro | null>(null)
const generandoFactura = ref(false)
const datosFactura = ref({
  tipoCliente: 'particular' as 'particular' | 'empresa',
  receptorNombre: '',
  receptorNif: '',
  receptorDireccion: '',
  concepto: ''
})

function abrirModalGenerarFactura(pago: PagoRegistro) {
  cerrarMenus()
  pagoParaFacturar.value = pago
  // Pre-rellenar datos
  datosFactura.value = {
    tipoCliente: 'particular',
    receptorNombre: pago.paciente?.nombre_completo || '',
    receptorNif: '',
    receptorDireccion: '',
    concepto: pago.concepto || `Sesión de psicología - ${formatearFecha(pago.fecha_pago)}`
  }
  showGenerarFacturaModal.value = true
}

// Cálculo de impuestos en tiempo real
const calculoImpuestos = computed(() => {
  if (!pagoParaFacturar.value) return null
  return calcularImpuestos(
    pagoParaFacturar.value.monto,
    datosFactura.value.tipoCliente,
    'exento' // Servicios sanitarios exentos de IVA para particulares
  )
})

async function generarFactura() {
  if (!pagoParaFacturar.value) return

  generandoFactura.value = true
  try {
    const result = await crearFactura({
      pacienteId: pagoParaFacturar.value.paciente_id || undefined,
      tipoCliente: datosFactura.value.tipoCliente,
      receptorNombre: datosFactura.value.receptorNombre,
      receptorNif: datosFactura.value.receptorNif || undefined,
      receptorDireccion: datosFactura.value.receptorDireccion || undefined,
      concepto: datosFactura.value.concepto,
      baseImponible: pagoParaFacturar.value.monto,
      pagoId: pagoParaFacturar.value.id
    })

    if (result.success) {
      showGenerarFacturaModal.value = false
      pagoParaFacturar.value = null
      await cargarFacturas()
      activeTab.value = 'facturas'
      alert('Factura generada correctamente')
    } else {
      alert(`Error: ${result.error}`)
    }
  } catch (err) {
    console.error('Error generando factura:', err)
    alert('Error al generar la factura')
  } finally {
    generandoFactura.value = false
  }
}

// =====================================================
// EXPORTAR CSV / EXCEL / INFORMES
// =====================================================

const showExportMenu = ref(false)
const showInformeModal = ref(false)
const tipoInforme = ref<'mensual' | 'trimestral' | 'anual'>('mensual')
const mesInforme = ref(new Date().getMonth() + 1)
const anioInforme = ref(new Date().getFullYear())

function exportarPagosCSV() {
  if (pagos.value.length === 0) {
    alert('No hay pagos para exportar')
    return
  }

  const headers = ['Fecha', 'Paciente', 'Concepto', 'Método', 'Monto', 'ID Pago']
  const rows = pagos.value.map(pago => [
    pago.fecha_pago,
    getNombrePaciente(pago),
    pago.concepto || '',
    formatearMetodoPago(pago.metodo_pago),
    pago.monto.toFixed(2),
    pago.id
  ])

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `pagos_${filtros.value.fechaDesde || 'todos'}_${filtros.value.fechaHasta || new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  showExportMenu.value = false
}

function exportarFacturasCSV() {
  if (facturas.value.length === 0) {
    alert('No hay facturas para exportar')
    return
  }

  const headers = ['Nº Factura', 'Fecha', 'Cliente', 'NIF', 'Base Imponible', 'IVA', 'IRPF', 'Total', 'Estado']
  const rows = facturas.value.map(f => [
    f.numero_factura,
    f.fecha_emision,
    f.receptor_nombre,
    f.receptor_nif || '',
    f.base_imponible.toFixed(2),
    f.importe_iva.toFixed(2),
    f.importe_irpf.toFixed(2),
    f.total.toFixed(2),
    f.estado
  ])

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `facturas_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  showExportMenu.value = false
}

// Exportar a formato Excel (CSV con formato mejorado para contabilidad)
function exportarExcelContable() {
  if (pagos.value.length === 0 && facturas.value.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  // Cabecera con información del período
  const periodo = descripcionPeriodo.value
  const fechaGeneracion = new Date().toLocaleDateString('es-ES')

  let csvContent = '\uFEFF' // BOM para Excel

  // Hoja de resumen
  csvContent += 'INFORME CONTABLE\n'
  csvContent += `Período;${periodo}\n`
  csvContent += `Fecha generación;${fechaGeneracion}\n`
  csvContent += `Terapeuta;${userProfile.value?.nombre_completo || ''}\n`
  csvContent += `NIF;${userProfile.value?.nif || ''}\n`
  csvContent += '\n'

  // Resumen financiero
  csvContent += 'RESUMEN FINANCIERO\n'
  csvContent += `Total cobrado;${metricasResumen.value.totalCobrado.toFixed(2)} €\n`
  csvContent += `Número de pagos;${metricasResumen.value.cantidadPagos}\n`
  csvContent += `Promedio por pago;${metricasResumen.value.promedioPorPago.toFixed(2)} €\n`

  // Desglose por método de pago
  csvContent += '\nDESGLOSE POR MÉTODO DE PAGO\n'
  csvContent += 'Método;Cantidad;Total\n'
  Object.entries(metricasResumen.value.porMetodo).forEach(([metodo, datos]) => {
    csvContent += `${formatearMetodoPago(metodo as any)};${datos.cantidad};${datos.total.toFixed(2)} €\n`
  })

  // Facturas emitidas
  if (facturas.value.length > 0) {
    const emitidas = facturas.value.filter(f => f.estado === 'emitida')
    csvContent += '\nRESUMEN FACTURAS\n'
    csvContent += `Total facturas emitidas;${emitidas.length}\n`
    csvContent += `Base imponible total;${metricasFacturas.value.totalBase.toFixed(2)} €\n`
    csvContent += `IVA repercutido;${metricasFacturas.value.totalIVA.toFixed(2)} €\n`
    csvContent += `Retenciones IRPF;${metricasFacturas.value.totalIRPF.toFixed(2)} €\n`
    csvContent += `Total facturado;${metricasFacturas.value.totalFacturado.toFixed(2)} €\n`
  }

  // Detalle de pagos
  csvContent += '\n\nDETALLE DE PAGOS\n'
  csvContent += 'Fecha;Paciente;Concepto;Método;Monto;Factura asociada\n'
  pagos.value.forEach(pago => {
    const factura = facturas.value.find(f => f.pago_id === pago.id)
    csvContent += `${pago.fecha_pago};${getNombrePaciente(pago)};${(pago.concepto || '').replace(/;/g, ',')};${formatearMetodoPago(pago.metodo_pago)};${pago.monto.toFixed(2)};${factura?.numero_factura || ''}\n`
  })

  // Detalle de facturas
  if (facturas.value.length > 0) {
    csvContent += '\n\nDETALLE DE FACTURAS\n'
    csvContent += 'Nº Factura;Fecha;Cliente;NIF;Base Imponible;% IVA;IVA;% IRPF;IRPF;Total;Estado\n'
    facturas.value.forEach(f => {
      csvContent += `${f.numero_factura};${f.fecha_emision};${f.receptor_nombre};${f.receptor_nif || ''};${f.base_imponible.toFixed(2)};${f.porcentaje_iva};${f.importe_iva.toFixed(2)};${f.porcentaje_irpf};${f.importe_irpf.toFixed(2)};${f.total.toFixed(2)};${f.estado}\n`
    })
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `informe_contable_${filtros.value.fechaDesde || 'todos'}_${filtros.value.fechaHasta || new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  showExportMenu.value = false
}

// Generar informe PDF resumen ejecutivo
function generarInformePDF(tipo: 'mensual' | 'trimestral' | 'anual' = 'mensual') {
  const terapeutaNombre = userProfile.value?.nombre_completo || 'Terapeuta'
  const terapeutaNif = userProfile.value?.nif || ''
  const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  // Calcular período según tipo
  let periodoTexto = ''
  let periodoDesde = ''
  let periodoHasta = ''

  const hoy = new Date()
  if (tipo === 'mensual') {
    const mes = mesInforme.value
    const anio = anioInforme.value
    periodoTexto = new Date(anio, mes - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    periodoDesde = new Date(anio, mes - 1, 1).toISOString().split('T')[0]
    periodoHasta = new Date(anio, mes, 0).toISOString().split('T')[0]
  } else if (tipo === 'trimestral') {
    const trimestre = Math.floor((mesInforme.value - 1) / 3) + 1
    const anio = anioInforme.value
    periodoTexto = `${trimestre}º Trimestre ${anio}`
    periodoDesde = new Date(anio, (trimestre - 1) * 3, 1).toISOString().split('T')[0]
    periodoHasta = new Date(anio, trimestre * 3, 0).toISOString().split('T')[0]
  } else {
    periodoTexto = `Año ${anioInforme.value}`
    periodoDesde = `${anioInforme.value}-01-01`
    periodoHasta = `${anioInforme.value}-12-31`
  }

  // Filtrar datos según período seleccionado
  const pagosPeriodo = pagos.value.filter(p => p.fecha_pago >= periodoDesde && p.fecha_pago <= periodoHasta)
  const facturasPeriodo = facturas.value.filter(f => f.fecha_emision >= periodoDesde && f.fecha_emision <= periodoHasta)

  // Calcular métricas del período
  const totalPagos = pagosPeriodo.reduce((sum, p) => sum + p.monto, 0)
  const cantidadPagos = pagosPeriodo.length
  const facturasEmitidas = facturasPeriodo.filter(f => f.estado === 'emitida')
  const totalFacturado = facturasEmitidas.reduce((sum, f) => sum + f.total, 0)
  const totalBase = facturasEmitidas.reduce((sum, f) => sum + f.base_imponible, 0)
  const totalIVA = facturasEmitidas.reduce((sum, f) => sum + f.importe_iva, 0)
  const totalIRPF = facturasEmitidas.reduce((sum, f) => sum + f.importe_irpf, 0)

  // Desglose por método
  const porMetodo: Record<string, { cantidad: number; total: number }> = {}
  pagosPeriodo.forEach(p => {
    const metodo = p.metodo_pago || 'otro'
    if (!porMetodo[metodo]) porMetodo[metodo] = { cantidad: 0, total: 0 }
    porMetodo[metodo].cantidad++
    porMetodo[metodo].total += p.monto
  })

  const formatMoney = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)

  // Generar HTML del informe
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Informe ${tipo} - ${periodoTexto}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 11px;
          line-height: 1.6;
          color: #333;
          padding: 30px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 3px solid #7c3aed;
          margin-bottom: 25px;
        }
        .header h1 { font-size: 22px; color: #7c3aed; margin-bottom: 5px; }
        .header p { color: #666; font-size: 12px; }
        .header-right { text-align: right; }
        .header-right .periodo {
          background: #7c3aed;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
        }
        .resumen-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .resumen-card {
          background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
          padding: 15px;
          border-radius: 10px;
          text-align: center;
        }
        .resumen-card.principal {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          color: white;
        }
        .resumen-card .valor {
          font-size: 22px;
          font-weight: bold;
          display: block;
          margin-bottom: 5px;
        }
        .resumen-card .label { font-size: 10px; text-transform: uppercase; opacity: 0.8; }
        .seccion { margin-bottom: 25px; }
        .seccion h2 {
          font-size: 14px;
          color: #7c3aed;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .tabla-simple {
          width: 100%;
          border-collapse: collapse;
        }
        .tabla-simple th, .tabla-simple td {
          padding: 8px 10px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .tabla-simple th {
          background: #f9fafb;
          font-weight: 500;
          color: #666;
          font-size: 10px;
          text-transform: uppercase;
        }
        .tabla-simple td.numero { text-align: right; font-family: monospace; }
        .tabla-simple tr:hover { background: #f5f3ff; }
        .metodos-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }
        .metodo-card {
          background: #f9fafb;
          padding: 10px;
          border-radius: 6px;
          text-align: center;
        }
        .metodo-card .emoji { font-size: 18px; }
        .metodo-card .nombre { font-size: 10px; color: #666; margin: 5px 0 3px; }
        .metodo-card .total { font-weight: 600; }
        .fiscal-box {
          background: #fffbeb;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 15px;
          margin-top: 20px;
        }
        .fiscal-box h3 { color: #92400e; font-size: 12px; margin-bottom: 10px; }
        .fiscal-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px dashed #fcd34d;
        }
        .fiscal-row:last-child { border-bottom: none; font-weight: bold; }
        .footer {
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #999;
          font-size: 9px;
        }
        .no-print { margin-top: 20px; text-align: center; }
        @media print { .no-print { display: none; } body { padding: 15px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>INFORME ${tipo.toUpperCase()}</h1>
          <p>Resumen ejecutivo de actividad financiera</p>
        </div>
        <div class="header-right">
          <div class="periodo">${periodoTexto}</div>
          <p style="margin-top: 10px; color: #666;">
            ${terapeutaNombre}<br>
            ${terapeutaNif ? `NIF: ${terapeutaNif}` : ''}
          </p>
        </div>
      </div>

      <div class="resumen-grid">
        <div class="resumen-card principal">
          <span class="valor">${formatMoney(totalPagos)}</span>
          <span class="label">Total cobrado</span>
        </div>
        <div class="resumen-card">
          <span class="valor">${cantidadPagos}</span>
          <span class="label">Pagos recibidos</span>
        </div>
        <div class="resumen-card">
          <span class="valor">${facturasEmitidas.length}</span>
          <span class="label">Facturas emitidas</span>
        </div>
        <div class="resumen-card">
          <span class="valor">${formatMoney(cantidadPagos > 0 ? totalPagos / cantidadPagos : 0)}</span>
          <span class="label">Promedio por pago</span>
        </div>
      </div>

      <div class="seccion">
        <h2>Desglose por método de pago</h2>
        <div class="metodos-grid">
          ${Object.entries(porMetodo).map(([metodo, datos]) => `
            <div class="metodo-card">
              <div class="emoji">${getMetodoIcon(metodo)}</div>
              <div class="nombre">${formatearMetodoPago(metodo as any)}</div>
              <div class="total">${formatMoney(datos.total)}</div>
              <div style="font-size: 9px; color: #888;">${datos.cantidad} pagos</div>
            </div>
          `).join('')}
        </div>
      </div>

      ${facturasEmitidas.length > 0 ? `
        <div class="fiscal-box">
          <h3>Resumen fiscal - Declaración IVA/IRPF</h3>
          <div class="fiscal-row">
            <span>Base imponible total</span>
            <span>${formatMoney(totalBase)}</span>
          </div>
          <div class="fiscal-row">
            <span>IVA repercutido (21%)</span>
            <span>${formatMoney(totalIVA)}</span>
          </div>
          <div class="fiscal-row">
            <span>Retenciones IRPF (15%)</span>
            <span>-${formatMoney(totalIRPF)}</span>
          </div>
          <div class="fiscal-row">
            <span>Total facturado</span>
            <span>${formatMoney(totalFacturado)}</span>
          </div>
        </div>
      ` : ''}

      ${pagosPeriodo.length > 0 ? `
        <div class="seccion" style="margin-top: 25px;">
          <h2>Últimos movimientos (${Math.min(10, pagosPeriodo.length)} de ${pagosPeriodo.length})</h2>
          <table class="tabla-simple">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Concepto</th>
                <th style="text-align: right;">Monto</th>
              </tr>
            </thead>
            <tbody>
              ${pagosPeriodo.slice(0, 10).map(p => `
                <tr>
                  <td>${new Date(p.fecha_pago).toLocaleDateString('es-ES')}</td>
                  <td>${getNombrePaciente(p)}</td>
                  <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${p.concepto || '-'}</td>
                  <td class="numero">${formatMoney(p.monto)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '<p style="color: #888; text-align: center; padding: 20px;">No hay movimientos en este período</p>'}

      <div class="footer">
        <p>Informe generado el ${fechaGeneracion} · Teraplí - Sistema de gestión para terapeutas</p>
        <p style="margin-top: 5px;">Este documento es un resumen informativo. Consulte con su asesor fiscal para declaraciones oficiales.</p>
      </div>

      <div class="no-print">
        <button onclick="window.print()" style="background: #7c3aed; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer; margin-right: 10px;">
          Imprimir / Guardar PDF
        </button>
        <button onclick="window.close()" style="background: #e5e7eb; color: #374151; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; cursor: pointer;">
          Cerrar
        </button>
      </div>
    </body>
    </html>
  `

  const ventana = window.open('', '_blank', 'width=850,height=700')
  if (ventana) {
    ventana.document.write(html)
    ventana.document.close()
  } else {
    alert('Por favor permite las ventanas emergentes para generar el informe')
  }
  showInformeModal.value = false
}

// Formato A3S para integración contable
function exportarFormatoContable() {
  if (facturas.value.length === 0) {
    alert('No hay facturas para exportar')
    return
  }

  // Formato estándar para software contable (similar a A3, ContaPlus, etc.)
  const emitidas = facturas.value.filter(f => f.estado === 'emitida')

  const headers = [
    'Tipo',           // E=Emitida
    'Número',
    'Fecha',
    'NIF Cliente',
    'Nombre Cliente',
    'Base Imponible',
    'Tipo IVA',
    'Cuota IVA',
    'Tipo Retención',
    'Cuota Retención',
    'Total Factura',
    'Forma Pago',
    'Cuenta Contable'
  ]

  const rows = emitidas.map(f => [
    'E',
    f.numero_factura,
    f.fecha_emision,
    f.receptor_nif || '',
    f.receptor_nombre,
    f.base_imponible.toFixed(2),
    f.porcentaje_iva.toString(),
    f.importe_iva.toFixed(2),
    f.porcentaje_irpf.toString(),
    f.importe_irpf.toFixed(2),
    f.total.toFixed(2),
    '01', // Contado
    '7050001' // Cuenta de ingresos servicios sanitarios
  ])

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `facturas_contabilidad_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  showExportMenu.value = false
}

// =====================================================
// MÉTRICAS FACTURAS
// =====================================================

const metricasFacturas = computed(() => {
  const emitidas = facturas.value.filter(f => f.estado === 'emitida')
  const totalFacturado = emitidas.reduce((sum, f) => sum + f.total, 0)
  const totalBase = emitidas.reduce((sum, f) => sum + f.base_imponible, 0)
  const totalIVA = emitidas.reduce((sum, f) => sum + f.importe_iva, 0)
  const totalIRPF = emitidas.reduce((sum, f) => sum + f.importe_irpf, 0)

  return {
    cantidad: emitidas.length,
    totalFacturado,
    totalBase,
    totalIVA,
    totalIRPF,
    anuladas: facturas.value.filter(f => f.estado === 'anulada').length
  }
})

function handlePagoCreado() {
  showPagoModal.value = false
  cargarPagos()
  cargarFacturas()
}

// Watchers
watch(activeTab, (tab) => {
  if (tab === 'pagos') {
    cargarPagos()
  } else {
    cargarFacturas()
  }
})

watch(paginaPagos, cargarPagos)
watch(paginaFacturas, cargarFacturas)

// Lifecycle
onMounted(async () => {
  // Esperar a que el usuario esté autenticado antes de cargar datos
  console.log('[Pagos] onMounted - esperando usuario...')
  await waitForUser()
  console.log('[Pagos] Usuario autenticado:', userProfile.value?.email, 'ID:', userProfile.value?.id)
  await loadAllPacientes()
  console.log('[Pagos] Pacientes cargados, cargando pagos...')
  await cargarPagos()
  console.log('[Pagos] Pagos cargados:', pagos.value.length, 'registros')
})
</script>

<template>
  <div class="pagos-page">
    <!-- Header -->
    <header class="page-header">
      <div class="header-content">
        <h1>Pagos y Facturación</h1>
        <button class="btn-primary" @click="showPagoModal = true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Pago
        </button>
      </div>
    </header>

    <!-- Tabs -->
    <div class="tabs">
      <button
        :class="['tab', { active: activeTab === 'pagos' }]"
        @click="activeTab = 'pagos'"
      >
        Pagos
        <span v-if="totalPagos > 0" class="tab-count">{{ totalPagos }}</span>
      </button>
      <button
        :class="['tab', { active: activeTab === 'facturas' }]"
        @click="activeTab = 'facturas'"
      >
        Facturas
        <span v-if="totalFacturas > 0" class="tab-count">{{ totalFacturas }}</span>
      </button>
    </div>

    <!-- Alerta de pagos huérfanos -->
    <div v-if="tienePagosHuerfanos && activeTab === 'pagos'" class="alerta-huerfanos">
      <div class="alerta-icono">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <div class="alerta-contenido">
        <p class="alerta-titulo">{{ pagosHuerfanos.length }} pago(s) requieren revisión</p>
        <p class="alerta-descripcion">
          Estos pagos tienen un paciente_id pero el paciente ya no existe o fue eliminado.
          Puedes asignar manualmente un paciente haciendo clic en "Asignar" en la fila correspondiente.
        </p>
      </div>
    </div>

    <!-- Métricas Resumen -->
    <div v-if="activeTab === 'pagos' && pagos.length > 0" class="metricas-container">
      <div class="metrica-card metrica-principal">
        <div class="metrica-icono">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 7.756a4.5 4.5 0 100 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="metrica-contenido">
          <span class="metrica-valor">{{ formatearImporte(metricasResumen.totalCobrado) }}</span>
          <span class="metrica-label">Total cobrado</span>
        </div>
      </div>
      <div class="metrica-card">
        <div class="metrica-icono metrica-icono-secundario">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </div>
        <div class="metrica-contenido">
          <span class="metrica-valor">{{ metricasResumen.cantidadPagos }}</span>
          <span class="metrica-label">Pagos</span>
        </div>
      </div>
      <div class="metrica-card">
        <div class="metrica-icono metrica-icono-secundario">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <div class="metrica-contenido">
          <span class="metrica-valor">{{ formatearImporte(metricasResumen.promedioPorPago) }}</span>
          <span class="metrica-label">Promedio</span>
        </div>
      </div>
      <div class="metrica-card">
        <div class="metrica-icono metrica-icono-secundario">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
        <div class="metrica-contenido">
          <span class="metrica-valor">{{ metricasResumen.metodoMasUsado.nombre }}</span>
          <span class="metrica-label">Método principal ({{ metricasResumen.metodoMasUsado.porcentaje }}%)</span>
        </div>
      </div>
    </div>

    <!-- Filtros Rápidos -->
    <div v-if="activeTab === 'pagos'" class="filtros-rapidos">
      <button
        v-for="filtro in filtrosRapidos"
        :key="filtro.id"
        :class="['chip-filtro', { 'chip-activo': filtroRapidoActivo === filtro.id }]"
        @click="aplicarFiltroRapido(filtro.id)"
      >
        {{ filtro.label }}
      </button>
    </div>

    <!-- Filtros Avanzados -->
    <div class="filtros">
      <div class="filtro-grupo">
        <label>Desde</label>
        <input
          type="date"
          v-model="filtros.fechaDesde"
          class="input-date"
          @change="filtroRapidoActivo = null"
        />
      </div>
      <div class="filtro-grupo">
        <label>Hasta</label>
        <input
          type="date"
          v-model="filtros.fechaHasta"
          class="input-date"
          @change="filtroRapidoActivo = null"
        />
      </div>
      <div class="filtro-grupo">
        <label>Paciente</label>
        <select v-model="filtros.pacienteId" class="input-select">
          <option value="">Todos</option>
          <option v-for="p in pacientes" :key="p.id" :value="p.id">
            {{ p.nombre_completo }}
          </option>
        </select>
      </div>
      <div v-if="activeTab === 'pagos'" class="filtro-grupo">
        <label>Método</label>
        <select v-model="filtros.metodoPago" class="input-select">
          <option value="">Todos</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="bizum">Bizum</option>
          <option value="tarjeta">Tarjeta</option>
        </select>
      </div>
      <div v-if="activeTab === 'facturas'" class="filtro-grupo">
        <label>Estado</label>
        <select v-model="filtros.estado" class="input-select">
          <option value="">Todos</option>
          <option value="emitida">Emitida</option>
          <option value="borrador">Borrador</option>
          <option value="anulada">Anulada</option>
        </select>
      </div>
      <div class="filtro-acciones">
        <button class="btn-secondary" @click="aplicarFiltros">Filtrar</button>
        <button class="btn-text" @click="limpiarFiltros">Limpiar</button>
      </div>
    </div>

    <!-- Resumen del período -->
    <div v-if="activeTab === 'pagos' && pagos.length > 0" class="resumen-periodo">
      <div class="periodo-info">
        <span class="periodo-descripcion">{{ descripcionPeriodo }}</span>
        <span class="periodo-total">{{ metricasResumen.cantidadPagos }} pagos · {{ formatearImporte(metricasResumen.totalCobrado) }}</span>
      </div>
      <div class="export-dropdown-container">
        <button class="btn-exportar" @click="showExportMenu = !showExportMenu" title="Exportar e Informes">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exportar
          <svg class="dropdown-arrow" :class="{ 'rotated': showExportMenu }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <Transition name="dropdown">
          <div v-if="showExportMenu" class="export-dropdown-menu">
            <div class="dropdown-section">
              <span class="dropdown-section-title">Exportar datos</span>
              <button @click="exportarPagosCSV" class="dropdown-item">
                <span class="dropdown-icon">📄</span>
                <span>CSV simple (pagos)</span>
              </button>
              <button @click="exportarExcelContable" class="dropdown-item">
                <span class="dropdown-icon">📊</span>
                <span>Excel contable completo</span>
              </button>
              <button @click="exportarFormatoContable" class="dropdown-item">
                <span class="dropdown-icon">🏦</span>
                <span>Formato software contable</span>
              </button>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-section">
              <span class="dropdown-section-title">Informes PDF</span>
              <button @click="showInformeModal = true; showExportMenu = false" class="dropdown-item">
                <span class="dropdown-icon">📋</span>
                <span>Generar informe...</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Resumen de Facturas con métricas -->
    <div v-if="activeTab === 'facturas' && facturas.length > 0" class="metricas-facturas">
      <div class="metrica-factura">
        <span class="metrica-factura-valor">{{ metricasFacturas.cantidad }}</span>
        <span class="metrica-factura-label">Emitidas</span>
      </div>
      <div class="metrica-factura metrica-factura-principal">
        <span class="metrica-factura-valor">{{ formatearImporte(metricasFacturas.totalFacturado) }}</span>
        <span class="metrica-factura-label">Total facturado</span>
      </div>
      <div class="metrica-factura">
        <span class="metrica-factura-valor">{{ formatearImporte(metricasFacturas.totalBase) }}</span>
        <span class="metrica-factura-label">Base imponible</span>
      </div>
      <div class="metrica-factura" v-if="metricasFacturas.totalIVA > 0">
        <span class="metrica-factura-valor">{{ formatearImporte(metricasFacturas.totalIVA) }}</span>
        <span class="metrica-factura-label">IVA repercutido</span>
      </div>
      <div class="metrica-factura" v-if="metricasFacturas.totalIRPF > 0">
        <span class="metrica-factura-valor">-{{ formatearImporte(metricasFacturas.totalIRPF) }}</span>
        <span class="metrica-factura-label">Retención IRPF</span>
      </div>
      <div class="export-dropdown-container">
        <button class="btn-exportar" @click="showExportMenu = !showExportMenu" title="Exportar e Informes">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exportar
          <svg class="dropdown-arrow" :class="{ 'rotated': showExportMenu }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <Transition name="dropdown">
          <div v-if="showExportMenu" class="export-dropdown-menu">
            <div class="dropdown-section">
              <span class="dropdown-section-title">Exportar datos</span>
              <button @click="exportarFacturasCSV" class="dropdown-item">
                <span class="dropdown-icon">📄</span>
                <span>CSV facturas</span>
              </button>
              <button @click="exportarExcelContable" class="dropdown-item">
                <span class="dropdown-icon">📊</span>
                <span>Excel contable completo</span>
              </button>
              <button @click="exportarFormatoContable" class="dropdown-item">
                <span class="dropdown-icon">🏦</span>
                <span>Formato software contable</span>
              </button>
            </div>
            <div class="dropdown-divider"></div>
            <div class="dropdown-section">
              <span class="dropdown-section-title">Informes PDF</span>
              <button @click="showInformeModal = true; showExportMenu = false" class="dropdown-item">
                <span class="dropdown-icon">📋</span>
                <span>Generar informe...</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>

    <!-- Tabla de Pagos -->
    <div v-else-if="activeTab === 'pagos'" class="table-container" @click="cerrarMenus">
      <!-- Vista de cards para móvil -->
      <div v-if="pagos.length > 0" class="pagos-cards-mobile">
        <div
          v-for="pago in pagos"
          :key="'card-' + pago.id"
          class="pago-card"
          :class="{ 'pago-card-problema': tieneProblema(pago) }"
          @click="verDetallesPago(pago)"
        >
          <div class="pago-card-header">
            <div class="pago-card-paciente">
              <span class="pago-card-nombre">{{ getNombrePaciente(pago) }}</span>
              <span v-if="tieneProblema(pago)" class="badge-problema-small">Revisar</span>
            </div>
            <span class="pago-card-monto">{{ formatearImporte(pago.monto) }}</span>
          </div>
          <div class="pago-card-body">
            <div class="pago-card-info">
              <span class="pago-card-fecha">{{ formatearFechaContextual(pago.fecha_pago).texto }}</span>
              <span class="pago-card-metodo">
                <span class="metodo-icon-small">{{ getMetodoIcon(pago.metodo_pago) }}</span>
                {{ formatearMetodoPago(pago.metodo_pago) }}
              </span>
            </div>
            <div v-if="parseConcepto(pago).tipo" class="pago-card-concepto">
              <span :class="['concepto-badge-small', getConceptoBadgeClass(parseConcepto(pago).tipo)]">
                {{ getConceptoLabel(parseConcepto(pago).tipo) }}
              </span>
              <span class="concepto-texto-small">{{ parseConcepto(pago).texto }}</span>
            </div>
          </div>
          <div class="pago-card-actions" @click.stop>
            <button
              v-if="tieneProblema(pago)"
              class="btn-card-action btn-asignar-small"
              @click.stop="abrirModalAsignarPaciente(pago)"
            >
              Asignar paciente
            </button>
            <button
              v-else
              class="btn-card-action"
              @click.stop="abrirModalGenerarFactura(pago)"
            >
              Generar factura
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla para desktop -->
      <table v-if="pagos.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Concepto</th>
            <th>Método</th>
            <th class="text-right">Monto</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pago in pagos" :key="pago.id" :class="{ 'fila-problema': tieneProblema(pago) }">
            <!-- Fecha contextual -->
            <td class="fecha-cell">
              <div class="fecha-contextual">
                <span class="fecha-texto">{{ formatearFechaContextual(pago.fecha_pago).texto }}</span>
                <span v-if="formatearFechaContextual(pago.fecha_pago).subtexto" class="fecha-subtexto">
                  {{ formatearFechaContextual(pago.fecha_pago).subtexto }}
                </span>
              </div>
            </td>
            <!-- Paciente -->
            <td>
              <span :class="{ 'paciente-problema': tieneProblema(pago) }">
                {{ getNombrePaciente(pago) }}
              </span>
              <span v-if="tieneProblema(pago)" class="badge-problema">ID huérfano</span>
            </td>
            <!-- Concepto simplificado con badge -->
            <td class="concepto-cell">
              <div class="concepto-wrapper">
                <span
                  v-if="getConceptoLabel(parseConcepto(pago).tipo)"
                  :class="['concepto-badge', getConceptoBadgeClass(parseConcepto(pago).tipo)]"
                >
                  {{ getConceptoLabel(parseConcepto(pago).tipo) }}
                </span>
                <span class="concepto-texto" :title="parseConcepto(pago).detalleCompleto">
                  {{ parseConcepto(pago).texto }}
                </span>
                <span v-if="parseConcepto(pago).progreso" class="concepto-progreso">
                  {{ parseConcepto(pago).progreso }}
                </span>
              </div>
            </td>
            <!-- Método con icono -->
            <td>
              <span class="metodo-badge">
                <span class="metodo-icon">{{ getMetodoIcon(pago.metodo_pago) }}</span>
                {{ formatearMetodoPago(pago.metodo_pago) }}
              </span>
            </td>
            <!-- Monto -->
            <td class="text-right monto">{{ formatearImporte(pago.monto) }}</td>
            <!-- Acciones con menú dropdown -->
            <td class="acciones-cell">
              <div class="acciones-wrapper">
                <button
                  v-if="tieneProblema(pago)"
                  class="btn-asignar"
                  @click.stop="abrirModalAsignarPaciente(pago)"
                  title="Asignar paciente"
                >
                  Asignar
                </button>
                <div v-else class="menu-container">
                  <button
                    class="btn-menu"
                    @click.stop="toggleMenu(pago.id)"
                    :class="{ 'menu-activo': menuAbierto === pago.id }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                    </svg>
                  </button>
                  <Transition name="menu-fade">
                    <div v-if="menuAbierto === pago.id" class="menu-dropdown" @click.stop>
                      <button class="menu-item" @click="verDetallesPago(pago)">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ver detalles
                      </button>
                      <button class="menu-item" @click="abrirModalGenerarFactura(pago)">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Generar factura
                      </button>
                      <button class="menu-item menu-item-danger" @click="eliminarPago(pago)">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </Transition>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
        <p>No hay pagos registrados</p>
        <button class="btn-primary" @click="showPagoModal = true">Registrar primer pago</button>
      </div>

      <!-- Paginación -->
      <div v-if="pagos.length > 0" class="paginacion">
        <button
          :disabled="paginaPagos === 1"
          @click="paginaPagos--"
          class="btn-pag"
        >
          Anterior
        </button>
        <span class="pag-info">Página {{ paginaPagos }}</span>
        <button
          :disabled="pagos.length < itemsPorPagina"
          @click="paginaPagos++"
          class="btn-pag"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Tabla de Facturas -->
    <div v-else class="table-container">
      <table v-if="facturas.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Nº Factura</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Concepto</th>
            <th class="text-right">Base</th>
            <th class="text-right">Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="factura in facturas" :key="factura.id">
            <td class="numero-factura">{{ factura.numero_factura }}</td>
            <td class="fecha">{{ formatearFecha(factura.fecha_emision) }}</td>
            <td>
              <div class="cliente-info">
                <span class="cliente-nombre">{{ factura.receptor_nombre }}</span>
                <span v-if="factura.receptor_nif" class="cliente-nif">{{ factura.receptor_nif }}</span>
              </div>
            </td>
            <td class="concepto">{{ factura.concepto }}</td>
            <td class="text-right">{{ formatearImporte(factura.base_imponible) }}</td>
            <td class="text-right monto">{{ formatearImporte(factura.total) }}</td>
            <td>
              <span :class="['estado-badge', getEstadoColor(factura.estado)]">
                {{ factura.estado }}
              </span>
            </td>
            <td class="acciones">
              <button
                class="btn-icon"
                title="Descargar PDF"
                @click="descargarPDF(factura)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </button>
              <button
                v-if="factura.estado === 'emitida'"
                class="btn-icon btn-danger"
                title="Anular factura"
                @click="handleAnularFactura(factura)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="empty-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p>No hay facturas emitidas</p>
        <p class="text-muted">Las facturas se generan al registrar pagos</p>
      </div>

      <!-- Paginación -->
      <div v-if="facturas.length > 0" class="paginacion">
        <button
          :disabled="paginaFacturas === 1"
          @click="paginaFacturas--"
          class="btn-pag"
        >
          Anterior
        </button>
        <span class="pag-info">Página {{ paginaFacturas }}</span>
        <button
          :disabled="facturas.length < itemsPorPagina"
          @click="paginaFacturas++"
          class="btn-pag"
        >
          Siguiente
        </button>
      </div>
    </div>

    <!-- Modal de Pago -->
    <PaymentPagoUnificadoModal
      :visible="showPagoModal"
      @close="showPagoModal = false"
      @saved="handlePagoCreado"
    />

    <!-- Modal Asignar Paciente -->
    <Teleport to="body">
      <div v-if="showAsignarPacienteModal" class="modal-overlay" @click.self="showAsignarPacienteModal = false">
        <div class="modal-asignar">
          <div class="modal-header">
            <h3>Asignar Paciente</h3>
            <button class="btn-close" @click="showAsignarPacienteModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-info">
              Este pago tiene un ID de paciente que ya no existe en el sistema.
              Selecciona un paciente para asignarlo correctamente.
            </p>
            <div v-if="pagoParaAsignar" class="pago-info-box">
              <p><strong>Fecha:</strong> {{ formatearFecha(pagoParaAsignar.fecha_pago) }}</p>
              <p><strong>Monto:</strong> {{ formatearImporte(pagoParaAsignar.monto) }}</p>
              <p><strong>Concepto:</strong> {{ pagoParaAsignar.concepto || '-' }}</p>
              <p class="id-huerfano"><strong>ID huérfano:</strong> {{ pagoParaAsignar.paciente_id }}</p>
            </div>
            <div class="form-group">
              <label for="paciente-select">Seleccionar paciente:</label>
              <select
                id="paciente-select"
                v-model="pacienteSeleccionado"
                class="input-select"
              >
                <option value="">-- Seleccionar --</option>
                <option v-for="p in pacientes" :key="p.id" :value="p.id">
                  {{ p.nombre_completo }}
                </option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showAsignarPacienteModal = false">
              Cancelar
            </button>
            <button
              class="btn-primary"
              :disabled="!pacienteSeleccionado || asignandoPaciente"
              @click="asignarPaciente"
            >
              <span v-if="asignandoPaciente">Asignando...</span>
              <span v-else>Asignar Paciente</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Generar Factura -->
    <Teleport to="body">
      <div v-if="showGenerarFacturaModal" class="modal-overlay" @click.self="showGenerarFacturaModal = false">
        <div class="modal-factura">
          <div class="modal-header">
            <h3>Generar Factura</h3>
            <button class="btn-close" @click="showGenerarFacturaModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <!-- Info del pago -->
            <div v-if="pagoParaFacturar" class="factura-pago-info">
              <div class="factura-pago-monto">
                <span class="monto-label">Monto del pago</span>
                <span class="monto-valor">{{ formatearImporte(pagoParaFacturar.monto) }}</span>
              </div>
              <div class="factura-pago-fecha">
                <span>{{ formatearFecha(pagoParaFacturar.fecha_pago) }}</span>
                <span class="metodo-badge-small">{{ getMetodoIcon(pagoParaFacturar.metodo_pago) }} {{ formatearMetodoPago(pagoParaFacturar.metodo_pago) }}</span>
              </div>
            </div>

            <!-- Tipo de cliente -->
            <div class="form-group">
              <label>Tipo de cliente</label>
              <div class="tipo-cliente-selector">
                <button
                  :class="['tipo-btn', { active: datosFactura.tipoCliente === 'particular' }]"
                  @click="datosFactura.tipoCliente = 'particular'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  Particular
                  <span class="tipo-info">Sin IVA (exento)</span>
                </button>
                <button
                  :class="['tipo-btn', { active: datosFactura.tipoCliente === 'empresa' }]"
                  @click="datosFactura.tipoCliente = 'empresa'"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                  Empresa
                  <span class="tipo-info">IVA 21% - IRPF 15%</span>
                </button>
              </div>
            </div>

            <!-- Datos del receptor -->
            <div class="form-group">
              <label for="receptor-nombre">Nombre del receptor *</label>
              <input
                id="receptor-nombre"
                v-model="datosFactura.receptorNombre"
                type="text"
                class="input-text"
                placeholder="Nombre completo o razón social"
              />
            </div>

            <div v-if="datosFactura.tipoCliente === 'empresa'" class="form-row">
              <div class="form-group">
                <label for="receptor-nif">NIF/CIF *</label>
                <input
                  id="receptor-nif"
                  v-model="datosFactura.receptorNif"
                  type="text"
                  class="input-text"
                  placeholder="B12345678"
                />
              </div>
              <div class="form-group">
                <label for="receptor-direccion">Dirección</label>
                <input
                  id="receptor-direccion"
                  v-model="datosFactura.receptorDireccion"
                  type="text"
                  class="input-text"
                  placeholder="Calle, número, ciudad"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="concepto">Concepto *</label>
              <textarea
                id="concepto"
                v-model="datosFactura.concepto"
                class="input-textarea"
                rows="2"
                placeholder="Descripción del servicio"
              ></textarea>
            </div>

            <!-- Resumen de importes -->
            <div v-if="calculoImpuestos" class="factura-resumen">
              <div class="resumen-linea">
                <span>Base imponible</span>
                <span>{{ formatearImporte(calculoImpuestos.baseImponible) }}</span>
              </div>
              <div v-if="calculoImpuestos.porcentajeIVA > 0" class="resumen-linea">
                <span>IVA ({{ calculoImpuestos.porcentajeIVA }}%)</span>
                <span>+ {{ formatearImporte(calculoImpuestos.importeIVA) }}</span>
              </div>
              <div v-if="calculoImpuestos.porcentajeIRPF > 0" class="resumen-linea">
                <span>Retención IRPF ({{ calculoImpuestos.porcentajeIRPF }}%)</span>
                <span class="text-red">- {{ formatearImporte(calculoImpuestos.importeIRPF) }}</span>
              </div>
              <div class="resumen-linea resumen-total">
                <span>Total factura</span>
                <span>{{ formatearImporte(calculoImpuestos.total) }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showGenerarFacturaModal = false">
              Cancelar
            </button>
            <button
              class="btn-primary"
              :disabled="!datosFactura.receptorNombre || !datosFactura.concepto || generandoFactura"
              @click="generarFactura"
            >
              <span v-if="generandoFactura">Generando...</span>
              <span v-else>Generar Factura</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Generar Informe -->
    <Teleport to="body">
      <div v-if="showInformeModal" class="modal-overlay" @click.self="showInformeModal = false">
        <div class="modal-content modal-informe">
          <div class="modal-header">
            <h3>Generar Informe</h3>
            <button class="btn-close" @click="showInformeModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" width="20" height="20">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p class="informe-descripcion">
              Genera un informe PDF con resumen ejecutivo de tu actividad financiera para tu contador o declaraciones fiscales.
            </p>

            <div class="informe-tipo-selector">
              <label class="informe-tipo-option" :class="{ 'selected': tipoInforme === 'mensual' }">
                <input type="radio" v-model="tipoInforme" value="mensual" />
                <div class="informe-tipo-content">
                  <span class="informe-tipo-icon">📅</span>
                  <span class="informe-tipo-label">Mensual</span>
                  <span class="informe-tipo-desc">Para contador mensual</span>
                </div>
              </label>
              <label class="informe-tipo-option" :class="{ 'selected': tipoInforme === 'trimestral' }">
                <input type="radio" v-model="tipoInforme" value="trimestral" />
                <div class="informe-tipo-content">
                  <span class="informe-tipo-icon">📊</span>
                  <span class="informe-tipo-label">Trimestral</span>
                  <span class="informe-tipo-desc">Modelo 303 IVA</span>
                </div>
              </label>
              <label class="informe-tipo-option" :class="{ 'selected': tipoInforme === 'anual' }">
                <input type="radio" v-model="tipoInforme" value="anual" />
                <div class="informe-tipo-content">
                  <span class="informe-tipo-icon">📋</span>
                  <span class="informe-tipo-label">Anual</span>
                  <span class="informe-tipo-desc">Declaración IRPF</span>
                </div>
              </label>
            </div>

            <div class="informe-periodo-selector">
              <div v-if="tipoInforme === 'mensual' || tipoInforme === 'trimestral'" class="form-group">
                <label>Mes</label>
                <select v-model="mesInforme" class="form-select">
                  <option :value="1">Enero</option>
                  <option :value="2">Febrero</option>
                  <option :value="3">Marzo</option>
                  <option :value="4">Abril</option>
                  <option :value="5">Mayo</option>
                  <option :value="6">Junio</option>
                  <option :value="7">Julio</option>
                  <option :value="8">Agosto</option>
                  <option :value="9">Septiembre</option>
                  <option :value="10">Octubre</option>
                  <option :value="11">Noviembre</option>
                  <option :value="12">Diciembre</option>
                </select>
              </div>
              <div class="form-group">
                <label>Año</label>
                <select v-model="anioInforme" class="form-select">
                  <option v-for="year in [2024, 2025, 2026]" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
            </div>

            <div class="informe-preview">
              <div class="informe-preview-header">Vista previa del informe</div>
              <div class="informe-preview-content">
                <div class="preview-item">
                  <span class="preview-label">Tipo:</span>
                  <span class="preview-value">{{ tipoInforme === 'mensual' ? 'Informe Mensual' : tipoInforme === 'trimestral' ? 'Informe Trimestral' : 'Informe Anual' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Período:</span>
                  <span class="preview-value">
                    <template v-if="tipoInforme === 'mensual'">
                      {{ new Date(anioInforme, mesInforme - 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }) }}
                    </template>
                    <template v-else-if="tipoInforme === 'trimestral'">
                      {{ Math.floor((mesInforme - 1) / 3) + 1 }}º Trimestre {{ anioInforme }}
                    </template>
                    <template v-else>
                      Año {{ anioInforme }}
                    </template>
                  </span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Incluye:</span>
                  <span class="preview-value">Resumen financiero, desglose por método, datos fiscales</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showInformeModal = false">Cancelar</button>
            <button class="btn-primary" @click="generarInformePDF(tipoInforme)">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Generar PDF
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pagos-page {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-primary .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  color: #4f46e5;
  border-bottom-color: #4f46e5;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.25rem;
  padding: 0 0.375rem;
  margin-left: 0.5rem;
  background: #e5e7eb;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
}

.tab.active .tab-count {
  background: #eef2ff;
  color: #4f46e5;
}

/* Métricas Resumen */
.metricas-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.metrica-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.metrica-principal {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border: none;
}

.metrica-principal .metrica-valor,
.metrica-principal .metrica-label {
  color: white;
}

.metrica-icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
}

.metrica-icono svg {
  width: 1.25rem;
  height: 1.25rem;
  color: white;
}

.metrica-icono-secundario {
  background: #f3f4f6;
}

.metrica-icono-secundario svg {
  color: #6b7280;
}

.metrica-contenido {
  display: flex;
  flex-direction: column;
}

.metrica-valor {
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
}

.metrica-label {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Filtros Rápidos */
.filtros-rapidos {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.chip-filtro {
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.chip-filtro:hover {
  border-color: #d1d5db;
  color: #374151;
}

.chip-activo {
  background: #4f46e5;
  border-color: #4f46e5;
  color: white;
}

.chip-activo:hover {
  background: #4338ca;
  border-color: #4338ca;
  color: white;
}

/* Resumen del período */
.resumen-periodo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.periodo-descripcion {
  font-size: 0.875rem;
  color: #6b7280;
}

.periodo-total {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

/* Filtros */
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.filtro-grupo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filtro-grupo label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
}

.input-date,
.input-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  min-width: 150px;
}

.input-date:focus,
.input-select:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.filtro-acciones {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-text {
  padding: 0.5rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
}

.btn-text:hover {
  color: #374151;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Tabla */
.table-container {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover {
  background: #f9fafb;
}

.text-right {
  text-align: right;
}

.fecha {
  color: #6b7280;
  white-space: nowrap;
}

.concepto {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.monto {
  font-weight: 600;
  color: #059669;
}

.numero-factura {
  font-family: monospace;
  font-weight: 500;
}

/* Badges */
.metodo-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

.bono-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #dbeafe;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #1d4ed8;
}

.estado-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.estado-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.estado-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.estado-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.cliente-info {
  display: flex;
  flex-direction: column;
}

.cliente-nombre {
  font-weight: 500;
}

.cliente-nif {
  font-size: 0.75rem;
  color: #6b7280;
}

.text-muted {
  color: #9ca3af;
}

/* Acciones */
.acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-icon:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

.btn-icon svg {
  width: 1rem;
  height: 1rem;
}

.btn-icon.btn-danger:hover {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.empty-icon {
  width: 3rem;
  height: 3rem;
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state p {
  margin: 0 0 0.5rem;
}

.empty-state .btn-primary {
  margin-top: 1rem;
}

/* Paginación */
.paginacion {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-pag {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-pag:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-pag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pag-info {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .pagos-page {
    padding: 0.75rem;
  }

  .header-content {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .header-content h1 {
    font-size: 1.25rem;
  }

  .btn-primary {
    justify-content: center;
    padding: 0.75rem 1rem;
    min-height: 44px;
  }

  /* Tabs responsive */
  .tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin-bottom: 1rem;
  }

  .tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    flex-shrink: 0;
    padding: 0.625rem 1rem;
    min-height: 44px;
  }

  /* Métricas grid */
  .metricas-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .metrica-card {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .metrica-icono {
    width: 2rem;
    height: 2rem;
  }

  .metrica-icono svg {
    width: 1rem;
    height: 1rem;
  }

  .metrica-valor {
    font-size: 0.9375rem;
  }

  .metrica-label {
    font-size: 0.6875rem;
  }

  /* Filtros rápidos */
  .filtros-rapidos {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 0.25rem;
    margin: 0 -0.75rem 0.75rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .filtros-rapidos::-webkit-scrollbar {
    display: none;
  }

  .chip-filtro {
    flex-shrink: 0;
    padding: 0.5rem 0.875rem;
    min-height: 36px;
  }

  /* Filtros avanzados */
  .filtros {
    flex-direction: column;
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .filtro-grupo {
    width: 100%;
  }

  .input-date,
  .input-select {
    width: 100%;
    min-height: 44px;
    font-size: 16px; /* Evita zoom en iOS */
  }

  .filtro-acciones {
    flex-direction: row;
    width: 100%;
    justify-content: stretch;
  }

  .filtro-acciones .btn-secondary {
    flex: 1;
    min-height: 44px;
  }

  .filtro-acciones .btn-text {
    min-height: 44px;
  }

  /* Resumen período */
  .resumen-periodo {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    text-align: center;
  }

  .periodo-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  /* Tabla - Vista cards en móvil */
  .table-container {
    border: none;
    border-radius: 0;
    margin: 0 -0.75rem;
    background: transparent;
  }

  .data-table {
    display: none;
  }

  /* Paginación */
  .paginacion {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .btn-pag {
    min-height: 44px;
    padding: 0.5rem 0.75rem;
  }

  /* Alerta huérfanos */
  .alerta-huerfanos {
    padding: 0.75rem;
    margin: 0 -0.75rem 0.75rem;
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  .alerta-descripcion {
    font-size: 0.75rem;
  }
}

/* Pantallas muy pequeñas */
@media (max-width: 480px) {
  .pagos-page {
    padding: 0.5rem;
  }

  .metricas-container {
    grid-template-columns: 1fr 1fr;
  }

  .metrica-card {
    padding: 0.625rem;
  }

  .metrica-valor {
    font-size: 0.875rem;
  }

  .header-content h1 {
    font-size: 1.125rem;
  }

  .filtros-rapidos {
    margin: 0 -0.5rem 0.5rem;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }

  .chip-filtro {
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
  }
}

/* Alerta de pagos huérfanos */
.alerta-huerfanos {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.alerta-icono {
  flex-shrink: 0;
}

.alerta-icono svg {
  width: 1.5rem;
  height: 1.5rem;
  color: #d97706;
}

.alerta-contenido {
  flex: 1;
}

.alerta-titulo {
  font-weight: 600;
  color: #92400e;
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
}

.alerta-descripcion {
  font-size: 0.8125rem;
  color: #78350f;
  margin: 0;
  line-height: 1.4;
}

/* Filas con problema */
.fila-problema {
  background-color: #fef3c7 !important;
}

.fila-problema:hover {
  background-color: #fde68a !important;
}

.paciente-problema {
  color: #92400e;
  font-style: italic;
}

.badge-problema {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.125rem 0.375rem;
  background: #dc2626;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.btn-asignar {
  padding: 0.25rem 0.625rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-asignar:hover {
  background: #d97706;
}

/* Modal Asignar Paciente */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}

.modal-asignar {
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: none;
  border: none;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-info {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem;
  line-height: 1.5;
}

.pago-info-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.pago-info-box p {
  margin: 0;
  font-size: 0.8125rem;
  color: #374151;
}

.pago-info-box p + p {
  margin-top: 0.25rem;
}

.pago-info-box .id-huerfano {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #d1d5db;
  font-family: monospace;
  font-size: 0.75rem;
  color: #dc2626;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 0.75rem 0.75rem;
}

.modal-footer .btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Fecha contextual */
.fecha-cell {
  white-space: nowrap;
}

.fecha-contextual {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.fecha-texto {
  font-weight: 500;
  color: #374151;
}

.fecha-subtexto {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Concepto mejorado */
.concepto-cell {
  max-width: 250px;
}

.concepto-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.concepto-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.badge-bono {
  background: #dbeafe;
  color: #1d4ed8;
}

.badge-individual {
  background: #d1fae5;
  color: #065f46;
}

.badge-primera {
  background: #ffedd5;
  color: #c2410c;
}

.badge-familiar {
  background: #fae8ff;
  color: #a21caf;
}

.badge-otro {
  background: #f3f4f6;
  color: #6b7280;
}

.concepto-texto {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #374151;
}

.concepto-progreso {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* Método de pago con icono */
.metodo-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  background: #f3f4f6;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
}

.metodo-icon {
  font-size: 0.875rem;
  line-height: 1;
}

/* Menú de acciones */
.acciones-cell {
  width: 80px;
}

.acciones-wrapper {
  display: flex;
  justify-content: center;
}

.menu-container {
  position: relative;
}

.btn-menu {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-menu:hover,
.btn-menu.menu-activo {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.btn-menu svg {
  width: 1.25rem;
  height: 1.25rem;
}

.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  min-width: 140px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 50;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: none;
  border: none;
  font-size: 0.8125rem;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.15s;
  text-align: left;
}

.menu-item:hover {
  background: #f9fafb;
}

.menu-item svg {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.menu-item-danger {
  color: #dc2626;
}

.menu-item-danger:hover {
  background: #fef2f2;
}

/* Transición del menú */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.15s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.text-center {
  text-align: center;
}

/* Resumen del período mejorado */
.resumen-periodo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.periodo-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.btn-exportar {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-exportar:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-exportar svg {
  width: 1rem;
  height: 1rem;
}

.btn-exportar .dropdown-arrow {
  width: 0.75rem;
  height: 0.75rem;
  margin-left: 0.25rem;
  transition: transform 0.2s;
}

.btn-exportar .dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* Export Dropdown */
.export-dropdown-container {
  position: relative;
}

.export-dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  width: 220px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  z-index: 50;
  overflow: hidden;
}

.dropdown-section {
  padding: 0.5rem;
}

.dropdown-section-title {
  display: block;
  padding: 0.25rem 0.5rem;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.05em;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}

.dropdown-item:hover {
  background: #f5f3ff;
  color: #7c3aed;
}

.dropdown-icon {
  font-size: 1rem;
}

.dropdown-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.25rem 0;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Modal Informe */
.modal-informe {
  max-width: 500px;
}

.informe-descripcion {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.informe-tipo-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.informe-tipo-option {
  cursor: pointer;
}

.informe-tipo-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.informe-tipo-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.informe-tipo-option:hover .informe-tipo-content {
  border-color: #c4b5fd;
  background: #faf5ff;
}

.informe-tipo-option.selected .informe-tipo-content {
  border-color: #7c3aed;
  background: #f5f3ff;
}

.informe-tipo-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.informe-tipo-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.informe-tipo-desc {
  font-size: 0.6875rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.informe-periodo-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.informe-periodo-selector .form-group {
  flex: 1;
}

.informe-periodo-selector label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.375rem;
}

.form-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #7c3aed;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
}

.informe-preview {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
}

.informe-preview-header {
  padding: 0.5rem 0.75rem;
  background: #f3f4f6;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #e5e7eb;
}

.informe-preview-content {
  padding: 0.75rem;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: 0.375rem 0;
  font-size: 0.8125rem;
}

.preview-item:not(:last-child) {
  border-bottom: 1px dashed #e5e7eb;
}

.preview-label {
  color: #6b7280;
}

.preview-value {
  color: #374151;
  font-weight: 500;
  text-align: right;
}

/* Métricas de facturas */
.metricas-facturas {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.metrica-factura {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.metrica-factura-valor {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.metrica-factura-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.metrica-factura-principal .metrica-factura-valor {
  font-size: 1.25rem;
  color: #059669;
}

/* Modal Generar Factura */
.modal-factura {
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-height: 90vh;
  overflow-y: auto;
}

.factura-pago-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.factura-pago-monto {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.monto-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

.monto-valor {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.factura-pago-fecha {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
}

.metodo-badge-small {
  font-size: 0.75rem;
  padding: 0.125rem 0.375rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
}

.tipo-cliente-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.tipo-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s;
}

.tipo-btn:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.tipo-btn.active {
  border-color: #4f46e5;
  background: #eef2ff;
  color: #4f46e5;
}

.tipo-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

.tipo-info {
  font-size: 0.625rem;
  font-weight: 400;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.tipo-btn.active .tipo-info {
  color: #6366f1;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input-text {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.input-text:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.input-textarea {
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
}

.input-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.factura-resumen {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.resumen-linea {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
  padding: 0.375rem 0;
}

.resumen-total {
  border-top: 1px solid #e5e7eb;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  color: #111827;
}

.text-red {
  color: #dc2626;
}

/* Vista de cards para móvil */
.pagos-cards-mobile {
  display: none;
}

@media (max-width: 768px) {
  .pagos-cards-mobile {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 0.75rem;
  }

  .pago-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    padding: 0.875rem;
    cursor: pointer;
    transition: all 0.15s;
  }

  .pago-card:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .pago-card:active {
    background: #f9fafb;
  }

  .pago-card-problema {
    background: #fef3c7;
    border-color: #f59e0b;
  }

  .pago-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .pago-card-paciente {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    flex: 1;
  }

  .pago-card-nombre {
    font-weight: 600;
    font-size: 0.9375rem;
    color: #111827;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge-problema-small {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    background: #dc2626;
    color: white;
    font-size: 0.625rem;
    font-weight: 600;
    border-radius: 9999px;
    text-transform: uppercase;
    width: fit-content;
  }

  .pago-card-monto {
    font-size: 1.125rem;
    font-weight: 700;
    color: #059669;
    flex-shrink: 0;
  }

  .pago-card-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .pago-card-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.8125rem;
    color: #6b7280;
  }

  .pago-card-fecha {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .pago-card-metodo {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    background: #f3f4f6;
    border-radius: 0.25rem;
    font-size: 0.75rem;
  }

  .metodo-icon-small {
    font-size: 0.75rem;
  }

  .pago-card-concepto {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .concepto-badge-small {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .concepto-texto-small {
    font-size: 0.75rem;
    color: #6b7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .pago-card-actions {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
  }

  .btn-card-action {
    padding: 0.5rem 0.875rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    min-height: 36px;
    transition: all 0.15s;
  }

  .btn-card-action:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .btn-asignar-small {
    background: #f59e0b;
    border-color: #f59e0b;
    color: white;
  }

  .btn-asignar-small:hover {
    background: #d97706;
    border-color: #d97706;
  }

  /* Métricas facturas responsive */
  .metricas-facturas {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .metrica-factura {
    flex: 1 1 45%;
    min-width: 0;
  }

  .metrica-factura-valor {
    font-size: 1rem;
  }

  .metrica-factura-label {
    font-size: 0.6875rem;
  }
}
</style>
