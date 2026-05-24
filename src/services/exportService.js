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
PROMPT PARA CLAUDE — DESCRIPCIÓN DE PUESTO
${'═'.repeat(60)}

Con los datos del levantamiento de arriba, genera una Descripción de
Puesto profesional en Markdown lista para revisar con el cliente.
Incluye estas secciones en este orden:

1. SOBRE LA EMPRESA
   2 líneas de contexto. Si no hay info, marca con 📝.

2. RESUMEN DEL ROL
   3 párrafos: quién buscan, qué hará, qué hace único este rol.

3. RESPONSABILIDADES CLAVE
   6–9 bullets en infinitivo.

4. REQUISITOS OBLIGATORIOS
   Escolaridad, experiencia mínima, herramientas. Lo que es indispensable.

5. CALIFICACIONES DESEADAS
   3–5 nice-to-haves.

6. COMPETENCIAS BLANDAS CLAVE
   3–4 con una línea de descripción cada una.

7. CÓMO SE VE EL ÉXITO
   A 3 y 6 meses. Si faltan métricas, agrega nota 📝.

8. LO QUE OFRECEMOS
   Sueldo + prestaciones + 4–5 razones aspiracionales para unirse.

9. OPCIONES DE TÍTULO PARA PUBLICAR
   5 variantes del título del puesto pensadas para LinkedIn.

TONO: Profesional, aspiracional y cercano. Español neutro mexicano.
Marca con 📝 cualquier dato que falte o necesite confirmación.

*N&G Talent Consulting — Consultor: Gustavo Martínez Navejar*
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
PROMPT PARA CLAUDE — ANÁLISIS DE PRE-SCREEN
${'═'.repeat(60)}

Con los datos del pre-screen de arriba, genera un reporte de análisis
estructurado con las siguientes secciones:

1. RESUMEN EJECUTIVO (4–5 líneas)
   Quién es el candidato, qué experiencia tiene y por qué es (o no) relevante
   para este puesto específico.

2. FORTALEZAS DETECTADAS (3 puntos con ▸)
   Basadas en los scores altos y en las notas cualitativas positivas.

3. ÁREAS DE RIESGO O MEJORA (máx. 3 puntos)
   Inconsistencias, señales de alerta, scores bajos o preguntas sin respuesta.

4. RECOMENDACIÓN FINAL
   Directa y justificada. Usa el score como base pero matiza con el análisis
   cualitativo. Indica si debe avanzar y bajo qué condiciones.
   Referencia de decisión: 80–100% → Fuerte ✅ | 60–79% → Viable con reservas ⚠️ | <60% → No apto ❌

5. PREGUNTAS DE SEGUIMIENTO PARA ENTREVISTA CON CLIENTE (5 preguntas)
   Específicas a este candidato, orientadas a cerrar los gaps detectados.
   Para cada una indica brevemente qué área explora.

*N&G Talent Consulting — Consultor: Gustavo Martínez Navejar*
`

  const contenido = cuerpo + '\n' + prompt
  const nombreArchivo = `Prescreen_${nombre.replace(/\s+/g, '_')}_paraClaude.txt`
  descargar(contenido, nombreArchivo)
}
