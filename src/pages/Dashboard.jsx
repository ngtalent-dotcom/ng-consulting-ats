import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClientes } from '../services/clientesService'
import { getVacantes } from '../services/vacantesService'
import { getTodosCandidatos } from '../services/candidatosService'
import TablaCandidatosGlobal from '../components/TablaCandidatosGlobal'

const etapaColors = {
  'Aplicó':             '#6366f1',
  'Pre-screen':         '#f59e0b',
  'Entrevista Cliente': '#3b82f6',
  'Oferta':             '#8b5cf6',
  'Cerrado':            '#10b981',
  'Rechazado':          '#ef4444',
}

const etapaBadge = {
  'Aplicó':             { bg: '#ede9fe', color: '#6d28d9' },
  'Pre-screen':         { bg: '#fef3c7', color: '#92400e' },
  'Entrevista Cliente': { bg: '#dbeafe', color: '#1e40af' },
  'Oferta':             { bg: '#d1fae5', color: '#065f46' },
  'Cerrado':            { bg: '#f0fdf4', color: '#166534' },
  'Rechazado':          { bg: '#fee2e2', color: '#991b1b' },
}

function BarraHorizontal({ label, valor, total, color }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
      <div style={{ width: 110, fontSize: 12, color: '#475569', textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </div>
      <div style={{ flex: 1, height: 18, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: color || '#6366f1', borderRadius: 4, transition: 'width 0.5s ease', minWidth: valor > 0 ? 4 : 0 }} />
      </div>
      <div style={{ width: 42, fontSize: 12, color: '#1e293b', flexShrink: 0, textAlign: 'right' }}>
        <span style={{ fontWeight: 700 }}>{valor}</span>
        <span style={{ color: '#94a3b8', fontSize: 11 }}> ({pct}%)</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const [clientesData, vacantesData, candidatosData] = await Promise.all([
          getClientes(),
          getVacantes(),
          getTodosCandidatos(),
        ])

        const vacantesActivas = vacantesData.filter(v => v.estatus === 'Activa' || !v.estatus).length
        const totalCandidatos = candidatosData.length

        // Conteos por etapa (excluye rechazados del pipeline activo)
        const etapasOrden = ['Aplicó', 'Pre-screen', 'Entrevista Cliente', 'Oferta', 'Cerrado', 'Rechazado']
        const porEtapa = etapasOrden.map(etapa => ({
          etapa,
          count: candidatosData.filter(c => c.etapa === etapa).length,
        })).filter(e => e.count > 0)

        // Conteos por fuente
        const fuenteMap = {}
        candidatosData.forEach(c => {
          const f = c.fuente || 'Sin fuente'
          fuenteMap[f] = (fuenteMap[f] || 0) + 1
        })
        const porFuente = Object.entries(fuenteMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([fuente, count]) => ({ fuente, count }))

        const enEntrevista = candidatosData.filter(c => c.etapa === 'Entrevista Cliente').length
        const enOferta = candidatosData.filter(c => c.etapa === 'Oferta').length
        const recientes = candidatosData.slice(0, 8)

        setDatos({
          totalClientes: clientesData.length,
          vacantesActivas,
          totalCandidatos,
          enEntrevista,
          enOferta,
          porEtapa,
          porFuente,
          recientes,
          clientes: clientesData.slice(0, 5),
        })
      } catch (err) {
        console.error('Error cargando dashboard:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const formatFecha = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  const getInitials = (nombre) => (nombre || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="header-actions">
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      <div className="page-body">
        {/* KPIs */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#dbeafe' }}>&#127970;</div>
            <div className="metric-info">
              <div className="metric-value">{cargando ? '—' : datos?.totalClientes ?? 0}</div>
              <div className="metric-label">Clientes activos</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#ede9fe' }}>&#128203;</div>
            <div className="metric-info">
              <div className="metric-value">{cargando ? '—' : datos?.vacantesActivas ?? 0}</div>
              <div className="metric-label">Vacantes activas</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#fef3c7' }}>&#128101;</div>
            <div className="metric-info">
              <div className="metric-value">{cargando ? '—' : datos?.totalCandidatos ?? 0}</div>
              <div className="metric-label">Candidatos en proceso</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#d1fae5' }}>&#9989;</div>
            <div className="metric-info">
              <div className="metric-value">{cargando ? '—' : datos?.enOferta ?? 0}</div>
              <div className="metric-label">Ofertas en curso</div>
            </div>
          </div>
        </div>

        {/* Gráficas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Candidatos por etapa</div>
            {cargando ? (
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Cargando...</div>
            ) : datos?.porEtapa?.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>Sin candidatos aún.</div>
            ) : (
              datos.porEtapa.map(({ etapa, count }) => (
                <BarraHorizontal
                  key={etapa}
                  label={etapa}
                  valor={count}
                  total={datos.totalCandidatos}
                  color={etapaColors[etapa] || '#6366f1'}
                />
              ))
            )}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Candidatos por fuente</div>
            {cargando ? (
              <div style={{ color: '#94a3b8', fontSize: 13 }}>Cargando...</div>
            ) : datos?.porFuente?.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>Sin candidatos aún.</div>
            ) : (
              datos.porFuente.map(({ fuente, count }) => (
                <BarraHorizontal
                  key={fuente}
                  label={fuente}
                  valor={count}
                  total={datos.totalCandidatos}
                  color="#2563eb"
                />
              ))
            )}
          </div>
        </div>

        {/* Tablas inferiores */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Clientes */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Clientes</div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/clientes')}>
                Ver todos
              </button>
            </div>
            {cargando ? (
              <div style={{ color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>Cargando...</div>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Alta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datos?.clientes?.map(c => (
                      <tr key={c.id} className="clickable-row" onClick={() => navigate('/clientes/' + c.id + '/vacantes')}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{c.nombre}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{c.industria}</div>
                        </td>
                        <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>{formatFecha(c.created_at)}</td>
                      </tr>
                    ))}
                    {datos?.clientes?.length === 0 && (
                      <tr>
                        <td colSpan={2} style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                          Sin clientes aún
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Candidatos recientes */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Candidatos recientes</div>
            </div>
            {cargando ? (
              <div style={{ color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>Cargando...</div>
            ) : datos?.recientes?.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic', padding: '12px 0' }}>
                Sin candidatos aún.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {datos.recientes.map(c => {
                  const estilo = etapaBadge[c.etapa] || { bg: '#f1f5f9', color: '#475569' }
                  const vacante = c.vacantes || {}
                  return (
                    <div
                      key={c.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer' }}
                      onClick={() => navigate('/candidatos/' + c.id)}
                    >
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                        {getInitials(c.nombre)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.nombre} {c.apellido || ''}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--gray-400)' }}>
                          {vacante.titulo || '—'} &middot; {vacante.clientes?.nombre || '—'}
                        </div>
                      </div>
                      <span className="badge" style={{ background: estilo.bg, color: estilo.color, fontSize: 11, flexShrink: 0 }}>
                        {c.etapa}
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {formatFecha(c.created_at)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Tabla global de candidatos */}
        <TablaCandidatosGlobal />
      </div>
    </>
  )
}
