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
