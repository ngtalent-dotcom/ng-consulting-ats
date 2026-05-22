import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getVacanteById } from '../services/vacantesService'
import { getCandidatosByVacante } from '../services/candidatosService'

const etapasBoardOrder = ['Aplico', 'Pre-screen', 'Entrevista Cliente', 'Oferta', 'Cerrado']

const etapaColors = {
  'Aplico':             '#6366f1',
  'Pre-screen':         '#f59e0b',
  'Entrevista Cliente': '#3b82f6',
  'Oferta':             '#8b5cf6',
  'Cerrado':            '#10b981',
  'Rechazado':          '#ef4444',
}

const decisionColors = {
  'Pendiente':  '#f59e0b',
  'Avanzar':    '#10b981',
  'Rechazar':   '#ef4444',
  'En espera':  '#6366f1',
}

export default function Pipeline() {
  const { vacanteId } = useParams()
  const navigate = useNavigate()
  const [vista, setVista] = useState('kanban')
  const [vacante, setVacante] = useState(null)
  const [candidatosList, setCandidatosList] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const [v, cands] = await Promise.all([
          getVacanteById(Number(vacanteId)),
          getCandidatosByVacante(Number(vacanteId)),
        ])
        setVacante(v)
        setCandidatosList(cands)
      } catch (err) {
        console.error('Error cargando pipeline:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [vacanteId])

  if (cargando) {
    return (
      <div className="page-body">
        <div className="empty-state" style={{ color: '#94a3b8' }}>Cargando pipeline...</div>
      </div>
    )
  }

  if (!vacante) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <div className="icon">&#128203;</div>
          <p>Vacante no encontrada.</p>
        </div>
      </div>
    )
  }

  const cliente = vacante.clientes || {}

  const getInitials = (nombre) =>
    (nombre || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const rechazados = candidatosList.filter(c => c.etapa === 'Rechazado')

  // KANBAN VIEW
  const KanbanView = () => (
    <div className="kanban-board">
      {etapasBoardOrder.map(etapa => {
        const cands = candidatosList.filter(c => c.etapa === etapa)
        const color = etapaColors[etapa] || '#6366f1'
        return (
          <div key={etapa} className="kanban-col">
            <div className="kanban-col-header">
              <div className="kanban-col-title">
                <span className="kanban-dot" style={{ background: color }} />
                {etapa}
              </div>
              <span className="kanban-count">{cands.length}</span>
            </div>

            {cands.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gray-300)', fontSize: 12 }}>
                Sin candidatos
              </div>
            ) : (
              cands.map(c => (
                <div
                  key={c.id}
                  className="kanban-card"
                  onClick={() => navigate('/candidatos/' + c.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                      {getInitials(c.nombre)}
                    </div>
                    <div className="kanban-card-name" style={{ marginBottom: 0 }}>
                      {c.nombre} {c.apellido || ''}
                    </div>
                  </div>
                  <div className="kanban-card-meta">
                    <span style={{ background: '#f1f5f9', padding: '1px 7px', borderRadius: 10, fontSize: 11 }}>
                      {c.fuente || 'Desconocido'}
                    </span>
                    {c.score != null && (
                      <span
                        className="score-pill"
                        style={{
                          background: c.score >= 4 ? '#d1fae5' : c.score >= 3 ? '#fef3c7' : '#fee2e2',
                          color: c.score >= 4 ? '#065f46' : c.score >= 3 ? '#92400e' : '#991b1b',
                        }}
                      >
                        &#11088; {c.score}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )
      })}

      {/* Columna Rechazados */}
      <div className="kanban-col" style={{ opacity: 0.7 }}>
        <div className="kanban-col-header">
          <div className="kanban-col-title">
            <span className="kanban-dot" style={{ background: etapaColors['Rechazado'] }} />
            Rechazados
          </div>
          <span className="kanban-count">{rechazados.length}</span>
        </div>
        {rechazados.map(c => (
          <div
            key={c.id}
            className="kanban-card"
            onClick={() => navigate('/candidatos/' + c.id)}
            style={{ opacity: 0.7 }}
          >
            <div className="kanban-card-name">{c.nombre} {c.apellido || ''}</div>
            <div className="kanban-card-meta">{c.fuente || ''}</div>
          </div>
        ))}
      </div>
    </div>
  )

  // TABLE VIEW
  const TableView = () => (
    <div className="card">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Fuente</th>
              <th>Etapa</th>
              <th>Score</th>
              <th>Decision</th>
              <th>Fecha</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {candidatosList.map(c => {
              const etapaColor = etapaColors[c.etapa] || '#6366f1'
              const decColor = decisionColors[c.decision] || '#9ca3af'
              return (
                <tr
                  key={c.id}
                  className="clickable-row"
                  onClick={() => navigate('/candidatos/' + c.id)}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                        {getInitials(c.nombre)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                          {c.nombre} {c.apellido || ''}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="tag">{c.fuente || '—'}</span></td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: etapaColor + '22',
                        color: etapaColor,
                        border: '1px solid ' + etapaColor + '44',
                      }}
                    >
                      {c.etapa}
                    </span>
                  </td>
                  <td>
                    {c.score != null ? (
                      <span
                        className="score-pill"
                        style={{
                          background: c.score >= 4 ? '#d1fae5' : c.score >= 3 ? '#fef3c7' : '#fee2e2',
                          color: c.score >= 4 ? '#065f46' : c.score >= 3 ? '#92400e' : '#991b1b',
                        }}
                      >
                        &#11088; {c.score}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td>
                    <span style={{ color: decColor, fontWeight: 600, fontSize: 12.5 }}>
                      {c.decision || 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                      : '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={(e) => { e.stopPropagation(); navigate('/candidatos/' + c.id) }}
                    >
                      Ver &#8594;
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <>
      <div className="page-header">
        <div>
          <div className="breadcrumb" style={{ marginBottom: 2 }}>
            <button className="back-btn" style={{ padding: '2px 6px' }} onClick={() => navigate('/clientes')}>
              &#8592; Clientes
            </button>
            <span className="breadcrumb-sep">/</span>
            <button className="back-btn" style={{ padding: '2px 6px' }} onClick={() => navigate('/clientes/' + vacante.cliente_id + '/vacantes')}>
              {cliente?.nombre}
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="current">{vacante.titulo}</span>
          </div>
          <div className="page-title">Pipeline &middot; {vacante.titulo}</div>
        </div>
        <div className="header-actions">
          <div className="toggle-group">
            <button
              className={'toggle-btn ' + (vista === 'kanban' ? 'active' : '')}
              onClick={() => setVista('kanban')}
            >
              &#9635; Kanban
            </button>
            <button
              className={'toggle-btn ' + (vista === 'tabla' ? 'active' : '')}
              onClick={() => setVista('tabla')}
            >
              &#9776; Tabla
            </button>
          </div>
          <button className="btn btn-primary" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
            + Agregar candidato
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Info de la vacante */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <div>
              <div className="info-label">Cliente</div>
              <div className="info-value">{cliente?.nombre || '—'}</div>
            </div>
            <div>
              <div className="info-label">Area</div>
              <div className="info-value">{vacante.area || '—'}</div>
            </div>
            <div>
              <div className="info-label">Nivel</div>
              <div className="info-value">{vacante.nivel || '—'}</div>
            </div>
            <div>
              <div className="info-label">Modalidad</div>
              <div className="info-value">{vacante.modalidad || '—'}</div>
            </div>
            <div>
              <div className="info-label">Ciudad</div>
              <div className="info-value">{vacante.ciudad || '—'}</div>
            </div>
            <div>
              <div className="info-label">Rango salarial</div>
              <div className="info-value">
                {vacante.salario_min && vacante.salario_max
                  ? '$' + Number(vacante.salario_min).toLocaleString() + ' – $' + Number(vacante.salario_max).toLocaleString()
                  : 'No especificado'}
              </div>
            </div>
            <div>
              <div className="info-label">Candidatos</div>
              <div className="info-value">{candidatosList.length} en proceso</div>
            </div>
          </div>
        </div>

        {candidatosList.length === 0 ? (
          <div className="card">
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="icon">&#128100;</div>
              <p>No hay candidatos en este pipeline aun.</p>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Los candidatos apareceran aqui cuando apliquen desde el portal.
              </p>
            </div>
          </div>
        ) : (
          vista === 'kanban' ? <KanbanView /> : <TableView />
        )}
      </div>
    </>
  )
}
