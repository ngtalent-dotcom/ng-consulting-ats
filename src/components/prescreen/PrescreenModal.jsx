import { useState } from 'react'
import StarRating from './StarRating'
import { BLOQUES_FIJOS, TODAS_FIJAS } from '../../services/prescreenConfig'
import { calcularResultado, nivelLabel } from '../../services/prescreenScoring'
import { updateCandidato } from '../../services/candidatosService'
import { registrarActividad } from '../../services/actividadService'

export default function PrescreenModal({ candidato, vacante, onClose, onGuardado }) {
  const competenciasDinamicas = vacante?.prescreen_template?.competencias || []
  const todasPreguntas = [...TODAS_FIJAS, ...competenciasDinamicas]

  const [scores, setScores] = useState(candidato.prescreen_scores || {})
  const [notas, setNotas] = useState(candidato.prescreen_notas || {})
  const [entrevistador, setEntrevistador] = useState(candidato.prescreen_entrevistador || '')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const setScore = (id, val) => setScores(prev => ({ ...prev, [id]: val }))
  const setNota = (id, val) => setNotas(prev => ({ ...prev, [id]: val }))

  const { total, totalPosible, pct, decision } = calcularResultado(scores, todasPreguntas.length)
  const nivel = nivelLabel(pct)

  const handleGuardar = async () => {
    setGuardando(true)
    setError(null)
    try {
      const campos = {
        prescreen_scores: scores,
        prescreen_notas: notas,
        prescreen_fecha: new Date().toISOString(),
        prescreen_entrevistador: entrevistador.trim() || null,
        score: total,
        decision,
      }
      if (candidato.etapa === 'Aplicó') campos.etapa = 'Pre-screen'
      await updateCandidato(candidato.id, campos)
      await registrarActividad(candidato.id, 'prescreen',
        `Pre-screen completado · Score ${total}/${totalPosible}`,
        { score: total, total_posible: totalPosible, decision, nivel: nivel.label }
      )
      if (campos.etapa) await registrarActividad(candidato.id, 'etapa', `Etapa cambiada a "Pre-screen"`, { etapa_nueva: 'Pre-screen', etapa_anterior: candidato.etapa })
      onGuardado(campos)
      onClose()
    } catch (err) {
      setError('Error al guardar: ' + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const bloques = [
    { titulo: 'Bloque 1 — Apertura', preguntas: BLOQUES_FIJOS.apertura },
    { titulo: 'Bloque 2 — Experiencia laboral', preguntas: BLOQUES_FIJOS.experiencia },
    { titulo: 'Bloque 3 — Competencias clave', preguntas: competenciasDinamicas },
    { titulo: 'Bloque 4 — Motivación, fit y cierre', preguntas: BLOQUES_FIJOS.cierre },
  ]

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(2px)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 14, width: '100%', maxWidth: 720, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', marginBottom: 20 }}
      >
        {/* Header */}
        <div style={{ padding: '22px 28px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>&#128203; Pre-screen</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              {candidato.nombre} {candidato.apellido || ''} &middot; {vacante?.titulo || '—'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#64748b' }}>&#x2715;</button>
        </div>

        {/* Entrevistador */}
        <div style={{ padding: '16px 28px 0' }}>
          <input
            type="text"
            placeholder="Nombre del entrevistador (opcional)"
            value={entrevistador}
            onChange={e => setEntrevistador(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 7, border: '1px solid #e2e8f0', fontSize: 13, width: 280, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>

        {/* Bloques */}
        <div style={{ padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {bloques.map((bloque, bi) => (
            bloque.preguntas.length === 0 ? null : (
              <div key={bi}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14, paddingBottom: 6, borderBottom: '2px solid #dbeafe' }}>
                  {bloque.titulo}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {bloque.preguntas.map(p => (
                    <div key={p.id} style={{ background: '#f8fafc', borderRadius: 10, padding: '14px 16px', border: '1px solid #f1f5f9' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                        {p.nombre}
                      </div>
                      <div style={{ fontSize: 13, color: '#334155', marginBottom: 6, lineHeight: 1.6 }}>
                        {p.pregunta}
                      </div>
                      {p.hint && (
                        <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', marginBottom: 10, lineHeight: 1.5 }}>
                          {p.hint}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                        <StarRating
                          value={scores[p.id] || 0}
                          onChange={val => setScore(p.id, val)}
                        />
                      </div>
                      <textarea
                        placeholder="Notas del entrevistador..."
                        value={notas[p.id] || ''}
                        onChange={e => setNota(p.id, e.target.value)}
                        rows={2}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid #e2e8f0', fontSize: 12.5, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, outline: 'none', boxSizing: 'border-box', color: '#334155' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        {/* Footer con resumen */}
        <div style={{ padding: '20px 28px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', borderRadius: '0 0 14px 14px' }}>
          {/* Tabla resumen */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Resumen</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {todasPreguntas.map(p => {
                const s = scores[p.id] || 0
                return (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: '#475569' }}>
                    <span>{p.nombre}</span>
                    <span style={{ fontWeight: 600, color: s === 0 ? '#cbd5e1' : s >= 4 ? '#059669' : s >= 3 ? '#d97706' : '#dc2626' }}>
                      {s === 0 ? '—' : `${s}/5`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Total y decisión */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'white', borderRadius: 9, border: '1px solid #e2e8f0', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{total}<span style={{ fontSize: 14, fontWeight: 400, color: '#94a3b8' }}>/{totalPosible}</span></div>
              <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{totalPosible > 0 ? Math.round(pct * 100) : 0}% del total</div>
            </div>
            <span style={{ background: nivel.bg, color: nivel.color, padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
              {nivel.label}
            </span>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 7, padding: '10px 14px', marginBottom: 12, color: '#dc2626', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="btn btn-primary"
              style={{ flex: 2, background: guardando ? '#93c5fd' : undefined }}
            >
              {guardando ? 'Guardando...' : 'Guardar evaluación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
