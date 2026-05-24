import jsPDF from 'jspdf' // cspell:disable-line
import autoTable from 'jspdf-autotable' // cspell:disable-line

const AZUL = [30, 64, 175]
const GRIS_OSCURO = [30, 41, 59]
const GRIS_MEDIO = [71, 85, 105]
const GRIS_CLARO = [241, 245, 249]
const MARGEN = 14
const ANCHO_PAGINA = 210

function seccion(doc, titulo, y) {
  doc.setFillColor(...GRIS_CLARO)
  doc.rect(MARGEN, y, ANCHO_PAGINA - MARGEN * 2, 7, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold') // cspell:disable-line
  doc.setTextColor(...AZUL)
  doc.text(titulo.toUpperCase(), MARGEN + 3, y + 5)
  return y + 12
}

function campo(doc, label, valor, x, y, anchoLabel = 38) {
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold') // cspell:disable-line
  doc.setTextColor(...GRIS_MEDIO)
  doc.text(label, x, y)
  doc.setFont('helvetica', 'normal') // cspell:disable-line
  doc.setTextColor(...GRIS_OSCURO)
  const texto = valor || '—'
  const lineas = doc.splitTextToSize(texto, 80)
  doc.text(lineas, x + anchoLabel, y)
  return y + lineas.length * 5
}

function saltoPaginaSi(doc, y, espacio = 20) {
  if (y + espacio > 280) {
    doc.addPage()
    return 20
  }
  return y
}

export function generarPDFCandidato(candidato, vacante, notas) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' }) // cspell:disable-line

  const nombre = `${candidato.nombre || ''} ${candidato.apellido || ''}`.trim()
  const clienteNombre = vacante?.clientes?.nombre || '—'
  const fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  // ── Header ──────────────────────────────────────────────
  doc.setFillColor(...AZUL)
  doc.rect(0, 0, ANCHO_PAGINA, 28, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold') // cspell:disable-line
  doc.text('N&G Talent Consulting', MARGEN, 11)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal') // cspell:disable-line
  doc.text('Reporte de Candidato', MARGEN, 18)
  doc.text(fecha, ANCHO_PAGINA - MARGEN, 18, { align: 'right' })

  // ── Nombre y estado ──────────────────────────────────────
  let y = 38
  doc.setTextColor(...GRIS_OSCURO)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold') // cspell:disable-line
  doc.text(nombre, MARGEN, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal') // cspell:disable-line
  doc.setTextColor(...GRIS_MEDIO)
  const etapaDecision = `Etapa: ${candidato.etapa || '—'}   ·   Decisión: ${candidato.decision || 'Pendiente'}`
  doc.text(etapaDecision, MARGEN, y)
  y += 5

  if (candidato.score != null) {
    doc.setFontSize(10)
    doc.setTextColor(...AZUL)
    doc.text(`Score pre-screen: ${candidato.score}`, MARGEN, y)
    y += 5
  }

  y += 4
  doc.setDrawColor(226, 232, 240)
  doc.line(MARGEN, y, ANCHO_PAGINA - MARGEN, y)
  y += 8

  // ── Datos personales ─────────────────────────────────────
  y = seccion(doc, 'Datos personales', y)
  const mitad = ANCHO_PAGINA / 2
  const yIzq = campo(doc, 'Correo:', candidato.email, MARGEN, y)
  const yDer = campo(doc, 'Teléfono:', candidato.telefono, mitad, y)
  y = Math.max(yIzq, yDer) + 2
  const yIzq2 = campo(doc, 'Ciudad:', candidato.ciudad, MARGEN, y)
  const yDer2 = campo(doc, 'Fuente:', candidato.fuente, mitad, y)
  y = Math.max(yIzq2, yDer2) + 2
  if (candidato.linkedin) {
    y = campo(doc, 'LinkedIn:', candidato.linkedin, MARGEN, y)
  }
  y += 4

  // ── Vacante ──────────────────────────────────────────────
  y = saltoPaginaSi(doc, y)
  y = seccion(doc, 'Vacante', y)
  const yIzq3 = campo(doc, 'Puesto:', vacante?.titulo, MARGEN, y)
  const yDer3 = campo(doc, 'Cliente:', clienteNombre, mitad, y)
  y = Math.max(yIzq3, yDer3) + 2
  const yIzq4 = campo(doc, 'Área:', vacante?.area, MARGEN, y)
  const yDer4 = campo(doc, 'Modalidad:', vacante?.modalidad, mitad, y)
  y = Math.max(yIzq4, yDer4) + 2
  const yIzq5 = campo(doc, 'Nivel:', vacante?.nivel, MARGEN, y)
  const yDer5 = campo(doc, 'Ciudad:', vacante?.ciudad, mitad, y)
  y = Math.max(yIzq5, yDer5) + 6

  // ── Resultados pre-screen ────────────────────────────────
  if (candidato.prescreen_scores && Object.keys(candidato.prescreen_scores).length > 0) {
    y = saltoPaginaSi(doc, y, 40)
    y = seccion(doc, 'Resultados pre-screen', y)

    const filas = Object.entries(candidato.prescreen_scores).map(([id, score]) => [
      id.replace(/_/g, ' '),
      score != null ? `${score}/5` : '—',
      score >= 4 ? 'Alto' : score >= 3 ? 'Medio' : 'Bajo',
    ])

    autoTable(doc, { // cspell:disable-line
      startY: y,
      head: [['Criterio', 'Score', 'Nivel']],
      body: filas,
      margin: { left: MARGEN, right: MARGEN },
      styles: { fontSize: 8.5, cellPadding: 3 },
      headStyles: { fillColor: AZUL, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 110 },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 30, halign: 'center' },
      },
    })

    y = doc.lastAutoTable.finalY + 8 // cspell:disable-line
  }

  // ── Notas del reclutador ─────────────────────────────────
  if (candidato.notas) {
    y = saltoPaginaSi(doc, y)
    y = seccion(doc, 'Notas del reclutador', y)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal') // cspell:disable-line
    doc.setTextColor(...GRIS_OSCURO)
    const lineasNotas = doc.splitTextToSize(candidato.notas, ANCHO_PAGINA - MARGEN * 2)
    doc.text(lineasNotas, MARGEN, y)
    y += lineasNotas.length * 5 + 6
  }

  // ── Banderas rojas ───────────────────────────────────────
  if (candidato.banderas_rojas && candidato.banderas_rojas.length > 0) {
    y = saltoPaginaSi(doc, y)
    doc.setFillColor(254, 226, 226)
    doc.rect(MARGEN, y - 2, ANCHO_PAGINA - MARGEN * 2, 7, 'F')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold') // cspell:disable-line
    doc.setTextColor(153, 27, 27)
    doc.text('BANDERAS ROJAS', MARGEN + 3, y + 3)
    y += 10
    doc.setFont('helvetica', 'normal') // cspell:disable-line
    doc.setTextColor(153, 27, 27)
    candidato.banderas_rojas.forEach(b => {
      doc.text(`• ${b}`, MARGEN + 3, y)
      y += 5
    })
    y += 4
  }

  // ── Notas del historial ──────────────────────────────────
  if (notas && notas.length > 0) {
    y = saltoPaginaSi(doc, y)
    y = seccion(doc, 'Notas del historial', y)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal') // cspell:disable-line
    doc.setTextColor(...GRIS_OSCURO)
    notas.forEach(n => {
      y = saltoPaginaSi(doc, y)
      const fechaNota = n.created_at
        ? new Date(n.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
        : ''
      doc.setTextColor(...GRIS_MEDIO)
      doc.setFontSize(8)
      doc.text(fechaNota, MARGEN, y)
      y += 4
      doc.setTextColor(...GRIS_OSCURO)
      doc.setFontSize(9)
      const lineas = doc.splitTextToSize(n.descripcion, ANCHO_PAGINA - MARGEN * 2 - 4)
      doc.text(lineas, MARGEN + 2, y)
      y += lineas.length * 5 + 4
    })
  }

  // ── Footer ───────────────────────────────────────────────
  const totalPaginas = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `N&G Talent Consulting · Reporte generado el ${fecha} · Pág. ${i}/${totalPaginas}`,
      ANCHO_PAGINA / 2,
      290,
      { align: 'center' }
    )
  }

  const nombreArchivo = `Candidato_${nombre.replace(/\s+/g, '_')}.pdf`
  doc.save(nombreArchivo)
}

const AZUL_OSCURO = [22, 42, 74]
const VERDE = [5, 150, 105]

function textoEnvuelto(doc, texto, x, y, maxAncho) {
  const lineas = doc.splitTextToSize(texto || '—', maxAncho)
  doc.text(lineas, x, y)
  return y + lineas.length * 5.5
}

export function generarPDFCobro({ form, salarioAnual, comisionMonto, fechaFinGarantia, serviciosSeleccionados, textoDocumento }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' }) // cspell:disable-line

  const hoy = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  function formatFechaPDF(fechaStr) {
    if (!fechaStr) return '—'
    const [y, m, d] = fechaStr.split('-')
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`
  }

  function formatMontoPDF(n) {
    if (n == null) return '—'
    return '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' MXN'
  }

  const ANCHO = ANCHO_PAGINA - MARGEN * 2

  // ── Header ──────────────────────────────────────────────────────────────
  doc.setFillColor(...AZUL_OSCURO)
  doc.rect(0, 0, ANCHO_PAGINA, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold') // cspell:disable-line
  doc.text('N&G Talent Consulting', MARGEN, 12)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal') // cspell:disable-line
  doc.text('Documento de Cobro por Servicios de Reclutamiento', MARGEN, 19)
  doc.text(`Monterrey, N.L., ${hoy}`, ANCHO_PAGINA - MARGEN, 19, { align: 'right' })

  let y = 40

  // ── Destinatario ─────────────────────────────────────────────────────────
  doc.setTextColor(...GRIS_OSCURO)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal') // cspell:disable-line
  const dest = form.destinatario.trim()
    ? `Estimado(a) ${form.destinatario.trim()}:`
    : 'A quien corresponda:'
  doc.text(dest, MARGEN, y)
  y += 10

  // ── Párrafo intro ────────────────────────────────────────────────────────
  const garantia = parseInt(form.garantiaMeses) || 3
  const pct = form.comisionPct || '5'
  const introTexto = `Los candidatos tienen una garantía de ${garantia} meses; si por alguna razón terminan su contrato durante ese periodo, abriremos otro proceso sin costo adicional. Los servicios incluidos en esta ocasión fueron los siguientes:`

  doc.setFontSize(9.5)
  doc.setTextColor(...GRIS_MEDIO)
  y = textoEnvuelto(doc, introTexto, MARGEN, y, ANCHO)
  y += 8

  // ── Encabezado de servicio ───────────────────────────────────────────────
  doc.setFillColor(235, 240, 255)
  doc.rect(MARGEN, y - 4, ANCHO, 14, 'F')
  doc.setDrawColor(180, 198, 230)
  doc.rect(MARGEN, y - 4, ANCHO, 14, 'S')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold') // cspell:disable-line
  doc.setTextColor(...AZUL_OSCURO)
  doc.text(`Servicio de Reclutamiento — Vacante: ${form.puesto || '—'}`, MARGEN + 4, y + 3)
  if (form.cliente) {
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'normal') // cspell:disable-line
    doc.setTextColor(...GRIS_MEDIO)
    doc.text(`Cliente: ${form.cliente}`, MARGEN + 4, y + 8)
  }
  y += 20

  // ── Lista de servicios ───────────────────────────────────────────────────
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal') // cspell:disable-line

  serviciosSeleccionados.forEach(s => {
    if (y > 260) { doc.addPage(); y = 20 }

    let descripcion = s.descripcion
    if (s.id === 'organizacion' && form.entrevistadores.trim()) {
      descripcion = `Organización de entrevistas que se llevaron a cabo con ${form.entrevistadores.trim()}.`
    }

    // Bullet cuadrado azul
    doc.setFillColor(...AZUL)
    doc.rect(MARGEN, y - 2.5, 2.5, 2.5, 'F')

    doc.setFont('helvetica', 'bold') // cspell:disable-line
    doc.setTextColor(...GRIS_OSCURO)
    doc.text(s.label, MARGEN + 5, y)

    doc.setFont('helvetica', 'normal') // cspell:disable-line
    doc.setTextColor(...GRIS_MEDIO)
    const lineasDesc = doc.splitTextToSize(descripcion, ANCHO - 5)
    doc.text(lineasDesc, MARGEN + 5, y + 4.5)

    y += 4.5 + lineasDesc.length * 4.8 + 5
  })

  y += 4

  // ── Párrafo comisión ─────────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20 }
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'normal') // cspell:disable-line
  doc.setTextColor(...GRIS_MEDIO)
  const parrafoComision = `Una vez transcurrido el periodo de garantía de ${garantia} meses a partir de la fecha de firma de oferta del candidato, se procederá con el pago de la comisión correspondiente, equivalente al ${pct}% del salario anual acordado.`
  y = textoEnvuelto(doc, parrafoComision, MARGEN, y, ANCHO)
  y += 6

  doc.setFontSize(9)
  doc.setTextColor(...GRIS_OSCURO)
  doc.text('A continuación se detallan las fechas clave y el monto correspondiente:', MARGEN, y)
  y += 8

  // ── Tabla de montos ──────────────────────────────────────────────────────
  const salMensualStr = form.salarioMensual
    ? '$' + form.salarioMensual.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' MXN'
    : '—'

  const filas = [
    ['Candidato', `${form.candidatoNombre || '—'}${form.puesto ? `  (${form.puesto})` : ''}`],
    ['Fecha de firma de oferta', formatFechaPDF(form.fechaFirma)],
    [`Fin del periodo de garantía (${garantia} meses)`, formatFechaPDF(fechaFinGarantia)],
    ['Salario mensual', salMensualStr],
    ['Salario anual', formatMontoPDF(salarioAnual)],
    [`Comisión (${pct}%)`, formatMontoPDF(comisionMonto)],
  ]

  autoTable(doc, { // cspell:disable-line
    startY: y,
    body: filas,
    margin: { left: MARGEN, right: MARGEN },
    styles: { fontSize: 9.5, cellPadding: { top: 4, bottom: 4, left: 5, right: 5 } },
    columnStyles: {
      0: { cellWidth: 65, fontStyle: 'bold', textColor: GRIS_MEDIO },
      1: { cellWidth: ANCHO - 65, textColor: GRIS_OSCURO },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell(data) {
      // Resaltar fila de comisión
      if (data.row.index === filas.length - 1) {
        data.cell.styles.fillColor = [209, 250, 229]
        data.cell.styles.textColor = VERDE
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize = 10.5
      }
    },
  })

  y = doc.lastAutoTable.finalY + 12 // cspell:disable-line

  // ── Cierre ───────────────────────────────────────────────────────────────
  if (y > 255) { doc.addPage(); y = 20 }
  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'normal') // cspell:disable-line
  doc.setTextColor(...GRIS_MEDIO)
  doc.text('Quedo a tu disposición para cualquier duda o comentario adicional.', MARGEN, y)
  y += 9
  doc.text('Saludos cordiales,', MARGEN, y)
  y += 12

  doc.setFont('helvetica', 'bold') // cspell:disable-line
  doc.setTextColor(...GRIS_OSCURO)
  doc.setFontSize(10)
  doc.text(form.firmante || 'Gustavo Martínez Navejar', MARGEN, y)
  y += 5.5
  doc.setFont('helvetica', 'normal') // cspell:disable-line
  doc.setFontSize(9)
  doc.setTextColor(...GRIS_MEDIO)
  doc.text('N&G Talent Consulting', MARGEN, y)
  y += 5
  doc.text('reclutamiento@ngtalentconsulting.com.mx', MARGEN, y)

  // ── Footer en todas las páginas ──────────────────────────────────────────
  const totalPaginas = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i)
    doc.setFillColor(...AZUL_OSCURO)
    doc.rect(0, 285, ANCHO_PAGINA, 12, 'F')
    doc.setFontSize(7.5)
    doc.setTextColor(180, 200, 230)
    doc.text(
      `N&G Talent Consulting  ·  reclutamiento@ngtalentconsulting.com.mx  ·  Página ${i}/${totalPaginas}`,
      ANCHO_PAGINA / 2,
      292,
      { align: 'center' }
    )
  }

  const nombreArchivo = `Cobro_${(form.candidatoNombre || 'Candidato').replace(/\s+/g, '_')}_${(form.puesto || 'Puesto').replace(/\s+/g, '_')}.pdf`
  doc.save(nombreArchivo)
}
