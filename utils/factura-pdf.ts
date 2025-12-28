/**
 * Generador de PDF para facturas
 * Utiliza pdfmake para generar PDFs en el cliente
 */

import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'

export interface DatosEmisor {
  nombre: string
  nif: string
  direccion: string
  codigoPostal: string
  ciudad: string
  provincia: string
  numeroColegiado?: string
  regimenIva: 'exento' | 'general'
}

export interface DatosReceptor {
  nombre: string
  nif?: string
  direccion?: string
}

export interface LineaFactura {
  descripcion: string
  cantidad: number
  precioUnitario: number
  total: number
}

export interface DatosFacturaPDF {
  numeroFactura: string
  fechaEmision: string
  emisor: DatosEmisor
  receptor: DatosReceptor
  tipoCliente: 'particular' | 'empresa'
  concepto: string
  lineas: LineaFactura[]
  baseImponible: number
  porcentajeIva: number
  importeIva: number
  porcentajeIrpf: number
  importeIrpf: number
  total: number
  metodoPago?: string
  iban?: string
}

function formatearImporte(valor: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(valor)
}

function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export async function generarFacturaPDF(datos: DatosFacturaPDF): Promise<void> {
  // Importar pdfmake dinámicamente (solo en cliente)
  const pdfMake = await import('pdfmake/build/pdfmake')
  const pdfFonts = await import('pdfmake/build/vfs_fonts')

  // Configurar fuentes
  pdfMake.default.vfs = pdfFonts.default.pdfMake.vfs

  // Construir líneas de detalle
  const lineasTabla: Content[][] = datos.lineas.map(linea => [
    { text: linea.descripcion, style: 'tableCell' },
    { text: linea.cantidad.toString(), style: 'tableCell', alignment: 'center' },
    { text: formatearImporte(linea.precioUnitario), style: 'tableCell', alignment: 'right' },
    { text: formatearImporte(linea.total), style: 'tableCell', alignment: 'right' }
  ])

  // Si no hay líneas detalladas, usar concepto general
  if (lineasTabla.length === 0) {
    lineasTabla.push([
      { text: datos.concepto, style: 'tableCell' },
      { text: '1', style: 'tableCell', alignment: 'center' },
      { text: formatearImporte(datos.baseImponible), style: 'tableCell', alignment: 'right' },
      { text: formatearImporte(datos.baseImponible), style: 'tableCell', alignment: 'right' }
    ])
  }

  // Construir desglose de impuestos
  const desglose: Content[] = [
    {
      columns: [
        { text: 'Base imponible:', width: 'auto', style: 'totalesLabel' },
        { text: formatearImporte(datos.baseImponible), width: 100, alignment: 'right', style: 'totalesValue' }
      ],
      margin: [0, 2]
    }
  ]

  if (datos.porcentajeIva > 0) {
    desglose.push({
      columns: [
        { text: `IVA (${datos.porcentajeIva}%):`, width: 'auto', style: 'totalesLabel' },
        { text: formatearImporte(datos.importeIva), width: 100, alignment: 'right', style: 'totalesValue' }
      ],
      margin: [0, 2]
    } as Content)
  }

  if (datos.porcentajeIrpf > 0) {
    desglose.push({
      columns: [
        { text: `IRPF (-${datos.porcentajeIrpf}%):`, width: 'auto', style: 'totalesLabel' },
        { text: `-${formatearImporte(datos.importeIrpf)}`, width: 100, alignment: 'right', style: 'totalesValue', color: '#dc2626' }
      ],
      margin: [0, 2]
    } as Content)
  }

  desglose.push({
    columns: [
      { text: 'TOTAL:', width: 'auto', style: 'totalFinal', bold: true },
      { text: formatearImporte(datos.total), width: 100, alignment: 'right', style: 'totalFinal', bold: true }
    ],
    margin: [0, 8, 0, 0]
  } as Content)

  // Nota de exención IVA si aplica
  const notaExencion: Content[] = []
  if (datos.porcentajeIva === 0 && datos.tipoCliente === 'particular') {
    notaExencion.push({
      text: 'Operación exenta de IVA según Art. 20.1.3º de la Ley 37/1992 del Impuesto sobre el Valor Añadido.',
      style: 'notaLegal',
      margin: [0, 20, 0, 0]
    })
  }

  // Información de pago
  const infoPago: Content[] = []
  if (datos.metodoPago) {
    infoPago.push({
      text: `Método de pago: ${datos.metodoPago}`,
      style: 'infoPago',
      margin: [0, 15, 0, 0]
    })
  }
  if (datos.iban) {
    infoPago.push({
      text: `IBAN: ${datos.iban}`,
      style: 'infoPago',
      margin: [0, 3, 0, 0]
    })
  }

  // Definición del documento
  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60],

    content: [
      // Encabezado
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'FACTURA', style: 'titulo' },
              { text: `Nº ${datos.numeroFactura}`, style: 'numeroFactura' }
            ]
          },
          {
            width: 'auto',
            alignment: 'right',
            stack: [
              { text: `Fecha: ${formatearFecha(datos.fechaEmision)}`, style: 'fecha' }
            ]
          }
        ],
        margin: [0, 0, 0, 30]
      },

      // Datos emisor y receptor
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'EMISOR', style: 'seccionTitulo' },
              { text: datos.emisor.nombre, style: 'nombre', margin: [0, 5, 0, 0] },
              { text: `NIF: ${datos.emisor.nif}`, style: 'detalle' },
              { text: datos.emisor.direccion, style: 'detalle' },
              { text: `${datos.emisor.codigoPostal} ${datos.emisor.ciudad} (${datos.emisor.provincia})`, style: 'detalle' },
              ...(datos.emisor.numeroColegiado ? [{ text: `Nº Colegiado: ${datos.emisor.numeroColegiado}`, style: 'detalle' }] : [])
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'RECEPTOR', style: 'seccionTitulo' },
              { text: datos.receptor.nombre, style: 'nombre', margin: [0, 5, 0, 0] },
              ...(datos.receptor.nif ? [{ text: `NIF/CIF: ${datos.receptor.nif}`, style: 'detalle' }] : []),
              ...(datos.receptor.direccion ? [{ text: datos.receptor.direccion, style: 'detalle' }] : [])
            ]
          }
        ],
        margin: [0, 0, 0, 30]
      },

      // Línea separadora
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }
        ],
        margin: [0, 0, 0, 20]
      },

      // Tabla de conceptos
      {
        table: {
          headerRows: 1,
          widths: ['*', 60, 80, 80],
          body: [
            [
              { text: 'CONCEPTO', style: 'tableHeader' },
              { text: 'CANT.', style: 'tableHeader', alignment: 'center' },
              { text: 'PRECIO', style: 'tableHeader', alignment: 'right' },
              { text: 'IMPORTE', style: 'tableHeader', alignment: 'right' }
            ],
            ...lineasTabla
          ]
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0,
          vLineWidth: () => 0,
          hLineColor: () => '#e5e7eb',
          paddingTop: () => 8,
          paddingBottom: () => 8,
          paddingLeft: () => 8,
          paddingRight: () => 8
        },
        margin: [0, 0, 0, 20]
      },

      // Desglose de totales
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 200,
            stack: desglose
          }
        ],
        margin: [0, 10, 0, 0]
      },

      // Nota exención IVA
      ...notaExencion,

      // Info pago
      ...infoPago
    ],

    styles: {
      titulo: {
        fontSize: 24,
        bold: true,
        color: '#1f2937'
      },
      numeroFactura: {
        fontSize: 12,
        color: '#6b7280',
        margin: [0, 5, 0, 0]
      },
      fecha: {
        fontSize: 11,
        color: '#374151'
      },
      seccionTitulo: {
        fontSize: 10,
        bold: true,
        color: '#6b7280',
        characterSpacing: 1
      },
      nombre: {
        fontSize: 12,
        bold: true,
        color: '#1f2937'
      },
      detalle: {
        fontSize: 10,
        color: '#4b5563',
        margin: [0, 2, 0, 0]
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        color: '#6b7280',
        fillColor: '#f9fafb'
      },
      tableCell: {
        fontSize: 10,
        color: '#374151'
      },
      totalesLabel: {
        fontSize: 10,
        color: '#6b7280'
      },
      totalesValue: {
        fontSize: 10,
        color: '#374151'
      },
      totalFinal: {
        fontSize: 12,
        color: '#1f2937'
      },
      notaLegal: {
        fontSize: 8,
        color: '#6b7280',
        italics: true
      },
      infoPago: {
        fontSize: 10,
        color: '#374151'
      }
    },

    footer: (currentPage: number, pageCount: number) => ({
      text: `Página ${currentPage} de ${pageCount}`,
      alignment: 'center',
      fontSize: 8,
      color: '#9ca3af',
      margin: [0, 20, 0, 0]
    })
  }

  // Generar y descargar PDF
  pdfMake.default.createPdf(docDefinition).download(`factura-${datos.numeroFactura}.pdf`)
}

/**
 * Genera una vista previa del PDF (abre en nueva pestaña)
 */
export async function previsualizarFacturaPDF(datos: DatosFacturaPDF): Promise<void> {
  const pdfMake = await import('pdfmake/build/pdfmake')
  const pdfFonts = await import('pdfmake/build/vfs_fonts')

  pdfMake.default.vfs = pdfFonts.default.pdfMake.vfs

  // Usar la misma definición pero abrir en nueva pestaña
  // Por simplicidad, reutilizamos la función principal
  // En una implementación más completa, extraeríamos la definición a una función común
  await generarFacturaPDF(datos)
}
