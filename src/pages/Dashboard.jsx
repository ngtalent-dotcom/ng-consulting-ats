import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClientes } from '../services/clientesService'
import { getVacantes } from '../services/vacantesService'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const [metricas, setMetricas] = useState({ vacantesActivas: 0, totalCandidatos: 0, enEntrevista: 0, enOferta: 0 })
  const [clientes, setClientes] = useState([])
  const [recientes, setRecientes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        // Cargar clientes y vacantes en paralelo
        const [clientesData, vacantesData] = await Promise.all([
          getClientes(),
          getVacantes(),
        ])
        setClientes(clientesData.slice(0, 5))

        const activas = vacantesData.filter(v => v.estatus === 'Activa').length

        // Cargar candidatos recientes
        const { data: cands } = await supabase
          .from('candidatos')
          .select('*, vacantes(titulo, clientes(nombre))')
          .order('created_at', { ascending: false })
          .limit(6)

        const totalCands = cands ? cands.length : 0
        const enEntrevista = cands ? cands.filter(c => c.etapa === 'Entrevista Cliente').length : 0
        const enOferta = cands ? cands.filter(c => c.etapa === 'Oferta').length : 0

        // Contar total candidatos
        const { count } = await supabase
          .from('candidatos')
          .select('id', { count: 'exact', head: true })

        setMetricas({
          vacantesActivas: activas,
          totalCandidatos: count || 0,
          enEntrevista,
          enOferta,
        })
        setRecientes(cands || [])
      } catch (err) {
        console.error('Error cargando dashboard:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const etapaColor = {
    'Aplicó':             { bg: '#ede9fe', color: '#6d28d9' },
    'Pre-screen':         { bg: '#fef3c7', color: '#92400e' },
    'Entrevista Cliente': { bg: '#dbeafe', color: '#1e40af' },
    'Oferta':             { bg: '#d1fae5', color: '#065f46' },
    'Rechazado':          { bg: '#fee2e2', color: '#991b1b' },
  }

  const formatFecha = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  const getInitials = (nombre) => (nombre || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
        </div>
        <div className="header-actions">
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
      </div>

      <div className="page-body">
        {/* Metricas */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#dbeafe' }}>&#128193;</div>
            <div className="metric-info">
              <div className="metric-value">{cargando ? '—' : metricas.vacantesActivas}</div>
              <div className="metric-label">Vacantes activas</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#ede9fe' }}>&#128101;</div>
            <div className="metric-info">
              <div className="metric-value">{cargando ? '—' : metricas.totalCandidatos}</div>
              <div className="metric-label">Candidatos en proceso</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#fef3c7' }}>&#128197;</div>
            <div className="metric-info">
              <div className="metric-value">{cargando ? '—' : metricas.enEntrevista}</div>
              <div className="metric-label">Entrevistas con cliente</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon" style={{ background: '#d1fae5' }}>&#9989;</div>
            <div className="metric-info">
              <div className="metric-value">{cargando ? '—' : metricas.enOferta}</div>
              <div className="metric-label">Ofertas en curso</div>
            </div>
          </div>
        </div>

        {/* Dos columnas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Clientes activos */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Clientes activos</div>
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
                    {clientes.map(c => (
                      <tr
                        key={c.id}
                        className="clickable-row"
                        onClick={() => navigate('/clientes/' + c.id + '/vacantes')}
                      >
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{c.nombre}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{c.industria}</div>
                        </td>
                        <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>
                          {formatFecha(c.created_at)}
                        </td>
                      </tr>
                    ))}
                    {clientes.length === 0 && (
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

          {/* Actividad reciente */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Actividad reciente</div>
            </div>
            {cargando ? (
              <div style={{ color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>Cargando...</div>
            ) : recientes.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic', padding: '12px 0' }}>
                Sin actividad reciente.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recientes.map(c => {
                  const estilo = etapaColor[c.etapa] || { bg: '#f1f5f9', color: '#475569' }
                  const vacante = c.vacantes || {}
                  const clienteNombre = vacante.clientes?.nombre || '—'
                  return (
                    <div
                      key={c.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer' }}
                      onClick={() => navigate('/candidatos/' + c.id)}
                    >
                      <div className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>
                        {getInitials(c.nombre)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.nombre} {c.apellido || ''}
                        </div>
                        <div style={{ fontSize: 11.5, color: 'var(--gray-400)' }}>
                          {vacante.titulo || '—'} &middot; {clienteNombre}
                        </div>
                      </div>
                      <span className="badge" style={{ background: estilo.bg, color: estilo.color, fontSize: 11 }}>
                        {c.etapa}
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                        {formatFecha(c.created_at)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
