export function calcularResultado(scores, totalPreguntas) {
  const totalPosible = totalPreguntas * 5
  const total = Object.values(scores).reduce((a, b) => a + (b || 0), 0)
  const pct = totalPosible === 0 ? 0 : total / totalPosible

  let decision = 'Pendiente'
  if (total > 0) {
    if (pct >= 0.80) decision = 'Fuerte'
    else if (pct >= 0.60) decision = 'Viable con reservas'
    else decision = 'No Apto'
  }

  return { total, totalPosible, pct, decision }
}

export function nivelLabel(pct) {
  if (pct >= 0.80) return { label: 'Fuerte', color: '#065f46', bg: '#d1fae5' }
  if (pct >= 0.60) return { label: 'Viable con reservas', color: '#92400e', bg: '#fef3c7' }
  if (pct > 0)     return { label: 'No Apto', color: '#991b1b', bg: '#fee2e2' }
  return { label: 'Sin evaluar', color: '#94a3b8', bg: '#f1f5f9' }
}
