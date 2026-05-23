import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCandidatoById } from '../services/candidatosService'
import PrescreenModal from '../components/prescreen/PrescreenModal'
import { nivelLabel } from '../services/prescreenScoring'

const etapaColors = {
  'Aplicó':             '#6366f1',
  'Pre-screen':         '#f59e0b',
  'Entrevista Cliente': '#3b82f6',
  'Oferta':             '#8b5cf6',
  'Cerrado':            '#10b981',
  'Rechazado':          '#ef4444',
}

const decisionColors = {
  'Pendiente':           '#9ca3af',
  'Fuerte':              '#10b981',
  'Viable con reservas': '#f59e0b',
  'No Apto':             '#ef4444',
}

export default function Candidato() {
  const { candidatoId } = useParams()
  const navigate = useNavigate()
  const [candidato, setCandidato] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarPrescreen, setMostrarPrescreen] = useState(false)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getCandidatoById(Number(candidatoId))
        setCandidato(data)
      } catch (err) {
        console.error('Error cargando candidato:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [candidatoId])

  if (cargando) {
    return (
      <div className="page-body">
        <div className="empty-state" style={{ color: '#94a3b8' }}>Cargando perfil...</div>
      </div>
    )
  }

  if (!candidato) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <div className="icon">&#128100;</div>
          <p>Candidato no encontrado.</p>
        </div>
      </div>
    )
  }

  const vacante = candidato.vacantes || {}
  const cliente = vacante.clientes || {}

  const getInitials = (nombre) =>
    (nombre || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const etapaColor = etapaColors[candidato.etapa] || '#6366f1'
  const decisionColor = decisionColors[candidato.decision] || '#9ca3af'

  const formatFecha = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const todasEtapas = ['Aplicó', 'Pre-screen', 'Entrevista Cliente', 'Oferta', 'Cerrado']
  const etapaActualIndex = todasEtapas.indexOf(candidato.etapa)

  return (
    <>
      <div className="page-header">
        <div>
          <div className="breadcrumb" style={{ marginBottom: 2 }}>
            <button className="back-btn" style={{ padding: '2px 6px' }} onClick={() => navigate('/clientes')}>
              &#8592; Clientes
            </button>
            <span className="breadcrumb-sep">/</span>
            <button className="back-btn" style={{ padding: '2px 6px' }} onClick={() => navigate('/clientes/' + (vacante.cliente_id || '') + '/vacantes')}>
              {cliente.nombre || '—'}
            </button>
            <span className="breadcrumb-sep">/</span>
            <button className="back-btn" style={{ padding: '2px 6px' }} onClick={() => navigate('/vacantes/' + (candidato.vacante_id || '') + '/pipeline')}>
              {vacante.titulo || 'Pipeline'}
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="current">{candidato.nombre}</span>
          </div>
          <div className="page-title">Perfil del candidato</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            &#8592; Volver al pipeline
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="profile-grid">
          {/* Columna izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Info principal */}
            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
                <div className="avatar avatar-lg" style={{ marginBottom: 12 }}>
                  {getInitials(candidato.nombre)}
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--gray-800)', marginBottom: 4 }}>
                  {candidato.nombre} {candidato.apellido || ''}
                </div>
                <span
                  className="badge"
                  style={{
                    background: etapaColor + '22',
                    color: etapaColor,
                    border: '1px solid ' + etapaColor + '44',
                    marginBottom: 8,
                  }}
                >
                  {candidato.etapa}
                </span>
                {candidato.score != null && (
                  <div
                    className="score-pill"
                    style={{
                      background: candidato.score >= 4 ? '#d1fae5' : candidato.score >= 3 ? '#fef3c7' : '#fee2e2',
                      color: candidato.score >= 4 ? '#065f46' : candidato.score >= 3 ? '#92400e' : '#991b1b',
                      fontSize: 14, padding: '4px 12px',
                    }}
                  >
                    &#11088; {candidato.score} / 5.0
                  </div>
                )}
              </div>

              <div className="info-row">
                <div className="info-item">
                  <div className="info-label">Correo</div>
                  <div className="info-value">{candidato.email || '—'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Teléfono</div>
                  <div className="info-value">{candidato.telefono || '—'}</div>
                </div>
                {candidato.ciudad && (
                  <div className="info-item">
                    <div className="info-label">Ciudad</div>
                    <div className="info-value">{candidato.ciudad}</div>
                  </div>
                )}
                <div className="info-item">
                  <div className="info-label">Fuente</div>
                  <div className="info-value">
                    <span className="tag">{candidato.fuente || '—'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Fecha de aplicación</div>
                  <div className="info-value">{formatFecha(candidato.created_at)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Decisión</div>
                  <div className="info-value" style={{ color: decisionColor, fontWeight: 700 }}>
                    {candidato.decision || 'Pendiente'}
                  </div>
                </div>
                {candidato.linkedin && (
                  <div className="info-item">
                    <div className="info-label">LinkedIn</div>
                    <div className="info-value">
                      <a href={candidato.linkedin} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: 13 }}>
                        Ver perfil
                      </a>
                    </div>
                  </div>
                )}
                {candidato.cv_url && (
                  <div className="info-item">
                    <div className="info-label">CV</div>
                    <div className="info-value">
                      <a href={candidato.cv_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, fontSize: 13 }}>
                        &#128196; Descargar CV
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vacante */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Vacante</div>
              <div className="info-row">
                <div className="info-item">
                  <div className="info-label">Puesto</div>
                  <div className="info-value">{vacante.titulo || '—'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Cliente</div>
                  <div className="info-value">{cliente.nombre || '—'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Ciudad</div>
                  <div className="info-value">{vacante.ciudad || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Progreso en el proceso */}
            {candidato.etapa !== 'Rechazado' && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>Progreso en el proceso</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {todasEtapas.map((etapa, i) => {
                    const isPast = i < etapaActualIndex
                    const isCurrent = i === etapaActualIndex
                    const color = etapaColors[etapa]
                    return (
                      <div key={etapa} style={{ display: 'flex', alignItems: 'center', flex: i < todasEtapas.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <div
                            style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: isCurrent ? color : isPast ? '#10b981' : 'var(--gray-200)',
                              color: (isCurrent || isPast) ? 'white' : 'var(--gray-400)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700,
                              boxShadow: isCurrent ? '0 0 0 3px ' + color + '33' : 'none',
                              flexShrink: 0, transition: 'all 0.2s',
                            }}
                          >
                            {isPast ? '&#10003;' : i + 1}
                          </div>
                          <div
                            style={{
                              fontSize: 10, fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? color : isPast ? '#10b981' : 'var(--gray-400)',
                              textAlign: 'center', width: 60, lineHeight: 1.2,
                            }}
                          >
                            {etapa}
                          </div>
                        </div>
                        {i < todasEtapas.length - 1 && (
                          <div
                            style={{
                              flex: 1, height: 2,
                              background: isPast ? '#10b981' : 'var(--gray-200)',
                              marginBottom: 22, marginLeft: 4, marginRight: 4,
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Mensaje del candidato */}
            {candidato.mensaje && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Mensaje del candidato</div>
                <p style={{ fontSize: 13.5, color: 'var(--gray-700)', lineHeight: 1.6, background: 'var(--gray-50)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                  {candidato.mensaje}
                </p>
              </div>
            )}

            {/* Notas del reclutador */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Notas del reclutador</div>
              {candidato.notas ? (
                <p style={{ fontSize: 13.5, color: 'var(--gray-700)', lineHeight: 1.6, background: 'var(--gray-50)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                  {candidato.notas}
                </p>
              ) : (
                <div style={{ color: 'var(--gray-300)', fontSize: 13, fontStyle: 'italic' }}>
                  Sin notas aún.
                </div>
              )}
            </div>

            {/* Banderas rojas */}
            {candidato.banderas_rojas && candidato.banderas_rojas.length > 0 && (
              <div className="card" style={{ borderColor: '#fecaca' }}>
                <div className="card-title" style={{ marginBottom: 12, color: '#dc2626' }}>
                  &#128681; Banderas rojas
                </div>
                <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {candidato.banderas_rojas.map((b, i) => (
                    <li key={i} style={{ fontSize: 13.5, color: '#991b1b', background: '#fef2f2', padding: '8px 12px', borderRadius: 8, border: '1px solid #fecaca' }}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resultados pre-screen */}
            {candidato.prescreen_scores && Object.keys(candidato.prescreen_scores).length > 0 && (() => {
              const nivel = nivelLabel(candidato.score != null ? candidato.score / (Object.keys(candidato.prescreen_scores).length * 5) : 0)
              return (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div className="card-title">&#128203; Resultados pre-screen</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setMostrarPrescreen(true)}>
                      Editar evaluación
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 14px', background: '#f8fafc', borderRadius: 9, border: '1px solid #e2e8f0', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
                        {candidato.score}
                        <span style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8' }}>/{Object.keys(candidato.prescreen_scores).length * 5}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Puntuación total</div>
                    </div>
                    <span style={{ background: nivel.bg, color: nivel.color, padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                      {nivel.label}
                    </span>
                  </div>
                  <div className="info-row">
                    {candidato.prescreen_entrevistador && (
                      <div className="info-item">
                        <div className="info-label">Entrevistador</div>
                        <div className="info-value">{candidato.prescreen_entrevistador}</div>
                      </div>
                    )}
                    {candidato.prescreen_fecha && (
                      <div className="info-item">
                        <div className="info-label">Fecha</div>
                        <div className="info-value">{formatFecha(candidato.prescreen_fecha)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Acciones */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Acciones</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => setMostrarPrescreen(true)}>
                  &#128203; {candidato.prescreen_scores && Object.keys(candidato.prescreen_scores).length > 0 ? 'Ver pre-screen' : 'Aplicar pre-screen'}
                </button>
                <button className="btn btn-secondary" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                  &#128196; Generar reporte PDF
                </button>
                <button className="btn btn-secondary" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                  &#9993; Enviar mensaje
                </button>
              </div>
              <div style={{ marginTop: 10, fontSize: 11.5, color: 'var(--gray-400)' }}>
                Reporte PDF y mensajes estarán disponibles en próximas fases.
              </div>
            </div>
          </div>
        </div>
      </div>

      {mostrarPrescreen && (
        <PrescreenModal
          candidato={candidato}
          vacante={vacante}
          onClose={() => setMostrarPrescreen(false)}
          onGuardado={(campos) => setCandidato(prev => ({ ...prev, ...campos }))}
        />
      )}
    </>
  )
}
