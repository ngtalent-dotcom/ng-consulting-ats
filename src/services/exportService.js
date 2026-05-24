import { TODAS_FIJAS } from './prescreenConfig'
import { calcularResultado, nivelLabel } from './prescreenScoring'

function descargar(contenido, nombreArchivo) {
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  a.click()
  URL.revokeObjectURL(url)
}

export function descargarLevantamientoParaClaude(lev) {
  const d = lev.datos || {}
  const fecha = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  const lineas = [
    '═'.repeat(60),
    'LEVANTAMIENTO DE PERFIL DE PUESTO',
    '═'.repeat(60),
    `Puesto: ${d.tituloPuesto || lev.titulo_vacante || '—'}`,
    lev.cliente_nombre ? `Cliente: ${lev.cliente_nombre}` : '',
    d.contactoNombre ? `Completado por: ${d.contactoNombre}${d.contactoCargo ? ` (${d.contactoCargo})` : ''}` : '',
    `Exportado: ${fecha}`,
    '',
    '─'.repeat(60),
    '1. INFORMACIÓN GENERAL',
    '─'.repeat(60),
    d.area          ? `Área / Departamento: ${d.area}` : '',
    d.numVacantes   ? `Número de vacantes: ${d.numVacantes}` : '',
    d.modalidad     ? `Modalidad: ${d.modalidad}` : '',
    d.horario       ? `Horario: ${d.horario}` : '',
    d.sueldo        ? `Sueldo: ${d.sueldo}` : '',
    '',
    '─'.repeat(60),
    '2. DESCRIPCIÓN DEL PUESTO',
    '─'.repeat(60),
    d.descripcion   ? `Descripción:\n${d.descripcion}` : '',
    '',
    d.funciones     ? `Funciones y responsabilidades:\n${d.funciones}` : '',
    '',
    '─'.repeat(60),
    '3. PERFIL DEL CANDIDATO IDEAL',
    '─'.repeat(60),
    d.experiencia   ? `Experiencia requerida:\n${d.experiencia}` : '',
    '',
    d.escolaridad   ? `Escolaridad: ${d.escolaridad}` : '',
    d.habilidades   ? `Habilidades y herramientas:\n${d.habilidades}` : '',
    '',
    '─'.repeat(60),
    '4. CONDICIONES Y PROCESO',
    '─'.repeat(60),
    d.prestaciones  ? `Prestaciones adicionales:\n${d.prestaciones}` : '',
    '',
    d.razon         ? `Razón de la vacante: ${d.razon}` : '',
    d.proceso       ? `Proceso de selección:\n${d.proceso}` : '',
  ].filter(l => l !== undefined && l !== null)

  const cuerpo = lineas.join('\n')

  const prompt = `
${'═'.repeat(60)}
PROMPT SUGERIDO PARA CLAUDE
${'═'.repeat(60)}

Con base en el levantamiento de perfil de puesto anterior, por favor ayúdame con lo siguiente:

1. DESCRIPCIÓN DE VACANTE
   Redacta la descripción completa del puesto lista para publicar en LinkedIn.
   Incluye: resumen del puesto, responsabilidades principales, requisitos,
   lo que ofrecemos y cómo aplicar.

2. PERFIL DEL CANDIDATO
   Define en 4-5 líneas el perfil ideal del candidato (quién es, qué sabe
   hacer, qué experiencia tiene, cómo piensa).

3. COMPETENCIAS CLAVE
   Lista las 5 competencias más importantes que debe tener esta persona,
   explicando brevemente por qué cada una es crítica para este rol.

4. PREGUNTAS DE ENTREVISTA
   Sugiere 8 preguntas específicas para este perfil, incluyendo preguntas
   conductuales (STAR) y situacionales. Agrupa por competencia.

5. RED FLAGS
   ¿Qué señales de alerta debería buscar durante el proceso de selección
   para este tipo de perfil?
`

  const contenido = cuerpo + '\n' + prompt
  const nombreArchivo = `Levantamiento_${(d.tituloPuesto || lev.titulo_vacante || 'Puesto').replace(/\s+/g, '_')}_paraClaude.txt`
  descargar(contenido, nombreArchivo)
}

export function descargarPrescreenParaClaude(candidato, vacante) {
  const competenciasDinamicas = vacante?.prescreen_template?.competencias || []
  const todasPreguntas = [...TODAS_FIJAS, ...competenciasDinamicas]
  const scores = candidato.prescreen_scores || {}
  const notas = candidato.prescreen_notas || {}
  const { total, totalPosible, pct, decision } = calcularResultado(scores, todasPreguntas.length)
  const nivel = nivelLabel(pct)

  const nombre = `${candidato.nombre || ''} ${candidato.apellido || ''}`.trim()
  const fecha = candidato.prescreen_fecha
    ? new Date(candidato.prescreen_fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

  const bloques = [
    { titulo: 'BLOQUE 1 — APERTURA', ids: ['apertura'] },
    { titulo: 'BLOQUE 2 — EXPERIENCIA LABORAL', ids: ['exp-reciente', 'exp-anterior'] },
    { titulo: 'BLOQUE 3 — COMPETENCIAS CLAVE', ids: competenciasDinamicas.map(c => c.id) },
    { titulo: 'BLOQUE 4 — MOTIVACIÓN, FIT Y CIERRE', ids: ['motivacion-fit', 'expectativa-cierre'] },
  ]

  const lineas = [
    '═'.repeat(60),
    'REPORTE DE PRE-SCREEN',
    '═'.repeat(60),
    `Candidato:     ${nombre}`,
    `Vacante:       ${vacante?.titulo || '—'}`,
    `Cliente:       ${vacante?.clientes?.nombre || '—'}`,
    `Entrevistador: ${candidato.prescreen_entrevistador || '—'}`,
    `Fecha:         ${fecha}`,
    '',
  ]

  bloques.forEach(bloque => {
    const preguntasBloque = todasPreguntas.filter(p => bloque.ids.includes(p.id))
    if (preguntasBloque.length === 0) return

    lineas.push('─'.repeat(60))
    lineas.push(bloque.titulo)
    lineas.push('─'.repeat(60))

    preguntasBloque.forEach(p => {
      const score = scores[p.id]
      const nota = notas[p.id]
      lineas.push(``)
      lineas.push(`[${p.nombre}]`)
      lineas.push(`Pregunta: ${p.pregunta}`)
      lineas.push(`Score:    ${score != null ? `${score}/5` : 'Sin evaluar'}`)
      if (nota) lineas.push(`Notas:    ${nota}`)
    })
    lineas.push('')
  })

  lineas.push('═'.repeat(60))
  lineas.push('PUNTUACIÓN FINAL')
  lineas.push('═'.repeat(60))
  lineas.push(`Total:    ${total}/${totalPosible} (${Math.round(pct * 100)}%)`)
  lineas.push(`Nivel:    ${nivel.label}`)
  lineas.push(`Decisión: ${decision}`)

  const cuerpo = lineas.join('\n')

  const prompt = `
${'═'.repeat(60)}
PROMPT SUGERIDO PARA CLAUDE
${'═'.repeat(60)}

Con base en el reporte de pre-screen anterior de ${nombre}, por favor dame:

1. RESUMEN EJECUTIVO
   Resume el perfil del candidato en 4-5 líneas: quién es, qué experiencia
   tiene, cuáles son sus fortalezas y qué lo hace relevante para esta vacante.

2. FORTALEZAS DETECTADAS
   Lista las 3 fortalezas más relevantes basándote en los scores y notas.

3. ÁREAS DE RIESGO O MEJORA
   ¿Qué aspectos podrían ser un riesgo? ¿Qué preguntas quedan sin resolver?

4. RECOMENDACIÓN FINAL
   ¿Deberías avanzar con este candidato? ¿Bajo qué condiciones o con qué
   reservas? Sé directo y justifica tu postura.

5. PREGUNTAS DE SEGUIMIENTO
   Sugiere 3-5 preguntas específicas para hacerle al candidato en la
   entrevista con el cliente, basadas en los gaps o áreas de interés.
`

  const contenido = cuerpo + '\n' + prompt
  const nombreArchivo = `Prescreen_${nombre.replace(/\s+/g, '_')}_paraClaude.txt`
  descargar(contenido, nombreArchivo)
}
