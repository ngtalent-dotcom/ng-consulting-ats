import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PortalLayout from './PortalLayout'

const ETAPA_CONFIG = {
  'Aplicó':             { bg: '#f1f5f9', color: '#475569' },
  'Prescreen':          { bg: '#ede9fe', color: '#7c3aed' },
  'Entrevista RRHH':    { bg: '#dbeafe', color: '#1d4ed8' },
  'Entrevista cliente': { bg: '#cffafe', color: '#0369a1' },
  'Oferta':             { bg: '#fef9c3', color: '#854d0e' },
  'Contratado':         { bg: '#d1fae5', color: '#065f46' },
  'Rechazado':          { bg: '#fee2e2', color: '#991b1b' },
}

const ETAPA_ORDEN = [
  'Aplicó', 'Prescreen', 'Entrevista RRHH',
  'Entrevista cliente', 'Oferta', 'Contratado', 'Rechazado',
]

const ESTATUS_CONFIG = {
  'Activa':    { bg: '#d1fae5', color: '#065f46' },
  'En pausa':  { bg: '#fef9c3', color: '#854d0e' },
  'Cubierta':  { bg: '#dbeafe', color: '#1e40af' },
  'Cerrada':   { bg: '#f1f5f9', color: '#64748b' },
}

function EtapaBadge({ etapa }) {
  const cfg = ETAPA_CONFIG[etapa] || { bg: '#f1f5f9', color: '#475569' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap',
      background: cfg.bg, color: cfg.color,
    }}>
      {etapa}
    </span>
  )
}

function ScoreStars({ score }) {
  if (!score) return <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>
  return (
    <span style={{ color: '#f59e0b', fontSize: 14, letterSpacing: 1 }} title={`${score}/5`}>
      {'★'.repeat(score)}{'☆'.repeat(5 - score)}
    </span>
  )
}

export default function Portal() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`/api/portal?token=${encodeURIComponent(token)}`)
        if (!res.ok) throw new Error('not_found')
        setData(await res.json())
      } catch {
        setError('Portal no encontrado o enlace inválido.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [token])

  if (cargando) {
    return (
      <PortalLayout>
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
          Cargando portal...
        </div>
      </PortalLayout>
    )
  }

  if (error) {
    return (
      <PortalLayout>
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>&#128274;</div>
          <p style={{ color: '#475569', fontSize: 16, marginBottom: 8 }}>{error}</p>
          <p style={{ color: '#94a3b8', fontSize: 13 }}>
            Si crees que es un error, contacta a N&amp;G Talent Consulting.
          </p>
        </div>
      </PortalLayout>
    )
  }

  const { cliente, vacantes } = data

  return (
    <PortalLayout>
      {/* Encabezado del cliente */}
      <div style={{
        background: 'white', borderRadius: 12, border: '1px solid #e2e8f0',
        padding: '24px 28px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: '#dbeafe', color: '#1e40af',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 22, flexShrink: 0,
        }}>
          {cliente.nombre.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1e293b' }}>{cliente.nombre}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
            {cliente.industria && <span>{cliente.industria} &middot; </span>}
            {vacantes.length} vacante{vacantes.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>
            Portal confidencial
          </div>
          <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 2 }}>
            Solo para uso interno del cliente
          </div>
        </div>
      </div>

      {vacantes.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 12, border: '1px solid #e2e8f0',
          padding: '60px 0', textAlign: 'center', color: '#94a3b8',
        }}>
          No hay vacantes registradas aún.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {vacantes.map(v => {
            const candidatos = [...(v.candidatos || [])].sort((a, b) => {
              const ia = ETAPA_ORDEN.indexOf(a.etapa)
              const ib = ETAPA_ORDEN.indexOf(b.etapa)
              if (ia !== ib) return ia - ib
              return new Date(b.created_at) - new Date(a.created_at)
            })
            const estatusCfg = ESTATUS_CONFIG[v.estatus] || { bg: '#f1f5f9', color: '#64748b' }

            return (
              <div key={v.id} style={{
                background: 'white', borderRadius: 12,
                border: '1px solid #e2e8f0', overflow: 'hidden',
              }}>
                {/* Encabezado de vacante */}
                <div style={{
                  padding: '18px 24px',
                  borderBottom: candidatos.length > 0 ? '1px solid #f1f5f9' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{v.titulo}</span>
                      <span style={{
                        padding: '2px 9px', borderRadius: 20,
                        fontSize: 11.5, fontWeight: 600,
                        background: estatusCfg.bg, color: estatusCfg.color,
                      }}>{v.estatus}</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: '#64748b', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {v.area && <span>{v.area}</span>}
                      {v.nivel && <><span style={{ color: '#cbd5e1' }}>·</span><span>{v.nivel}</span></>}
                      {v.modalidad && <><span style={{ color: '#cbd5e1' }}>·</span><span>{v.modalidad}</span></>}
                      {v.ciudad && <><span style={{ color: '#cbd5e1' }}>·</span><span>{v.ciudad}</span></>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b' }}>{candidatos.length}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>candidato{candidatos.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>

                {candidatos.length === 0 ? (
                  <div style={{ padding: '20px 24px', color: '#94a3b8', fontSize: 13 }}>
                    Sin candidatos registrados aún.
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={thStyle}>Candidato</th>
                          <th style={thStyle}>Ciudad</th>
                          <th style={thStyle}>Etapa</th>
                          <th style={thStyle}>Score</th>
                          <th style={{ ...thStyle, width: '38%' }}>Notas del reclutador</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidatos.map(c => (
                          <tr key={c.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                            <td style={tdStyle}>
                              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                {c.nombre} {c.apellido}
                              </span>
                            </td>
                            <td style={{ ...tdStyle, color: '#64748b' }}>{c.ciudad || '—'}</td>
                            <td style={tdStyle}><EtapaBadge etapa={c.etapa} /></td>
                            <td style={tdStyle}><ScoreStars score={c.score} /></td>
                            <td style={{ ...tdStyle, color: '#475569', fontStyle: c.notas ? 'italic' : 'normal' }}>
                              {c.notas || <span style={{ color: '#cbd5e1' }}>—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: 40, textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
        Esta información es confidencial. No compartir con terceros.
      </div>
    </PortalLayout>
  )
}

const thStyle = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: 11.5, fontWeight: 600, color: '#64748b',
  textTransform: 'uppercase', letterSpacing: '.04em',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '12px 16px',
  verticalAlign: 'top',
}
