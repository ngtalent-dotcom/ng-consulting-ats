import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDraggable, useDroppable } from '@dnd-kit/core'
import { getVacanteById, regenerarTokenVacante } from '../services/vacantesService'
import { getCandidatosByVacante, updateEtapaCandidato } from '../services/candidatosService'
import { registrarActividad } from '../services/actividadService'
import DescargarTemplateBtn from '../components/adjuntos/DescargarTemplateBtn'
import AdjuntosList from '../components/adjuntos/AdjuntosList'
import NuevoCandidatoModal from '../components/NuevoCandidatoModal'

const etapasBoardOrder = ['Aplicó', 'Pre-screen', 'Entrevista Cliente', 'Oferta', 'Cerrado']

const etapaColors = {
  'Aplicó':             '#6366f1',
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

function getInitials(nombre) {
  return (nombre || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function CardContent({ candidato }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
          {getInitials(candidato.nombre)}
        </div>
        <div className="kanban-card-name" style={{ marginBottom: 0 }}>
          {candidato.nombre} {candidato.apellido || ''}
        </div>
      </div>
      <div className="kanban-card-meta">
        <span style={{ background: '#f1f5f9', padding: '1px 7px', borderRadius: 10, fontSize: 11 }}>
          {candidato.fuente || 'Desconocido'}
        </span>
        {candidato.score != null && (
          <span
            className="score-pill"
            style={{
              background: candidato.score >= 4 ? '#d1fae5' : candidato.score >= 3 ? '#fef3c7' : '#fee2e2',
              color: candidato.score >= 4 ? '#065f46' : candidato.score >= 3 ? '#92400e' : '#991b1b',
            }}
          >
            &#11088; {candidato.score}
          </span>
        )}
      </div>
    </>
  )
}

function KanbanCard({ candidato, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(candidato.id),
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="kanban-card"
      onClick={onClick}
      style={{
        transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined,
        opacity: isDragging ? 0 : 1,
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      <CardContent candidato={candidato} />
    </div>
  )
}

function KanbanCardGhost({ candidato }) {
  return (
    <div
      className="kanban-card"
      style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.18)', transform: 'rotate(2deg)', cursor: 'grabbing' }}
    >
      <CardContent candidato={candidato} />
    </div>
  )
}

function KanbanCol({ etapa, candidatos, onCardClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: etapa })
  const color = etapaColors[etapa] || '#6366f1'
  return (
    <div
      ref={setNodeRef}
      className="kanban-col"
      style={{ background: isOver ? '#eff6ff' : undefined, transition: 'background 0.15s' }}
    >
      <div className="kanban-col-header">
        <div className="kanban-col-title">
          <span className="kanban-dot" style={{ background: color }} />
          {etapa}
        </div>
        <span className="kanban-count">{candidatos.length}</span>
      </div>
      {candidatos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: isOver ? '#93c5fd' : 'var(--gray-300)', fontSize: 12 }}>
          {isOver ? 'Soltar aquí' : 'Sin candidatos'}
        </div>
      ) : (
        candidatos.map(c => (
          <KanbanCard key={c.id} candidato={c} onClick={() => onCardClick(c.id)} />
        ))
      )}
    </div>
  )
}

export default function Pipeline() {
  const { vacanteId } = useParams()
  const navigate = useNavigate()
  const [vista, setVista] = useState('kanban')
  const [vacante, setVacante] = useState(null)
  const [candidatosList, setCandidatosList] = useState([])
  const [cargando, setCargando] = useState(true)
  const [showNuevoCandidato, setShowNuevoCandidato] = useState(false)
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroFuente, setFiltroFuente] = useState('')
  const [filtroDecision, setFiltroDecision] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [copiandoPortal, setCopiandoPortal] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

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

  const fuentesUnicas = [...new Set(candidatosList.map(c => c.fuente).filter(Boolean))]
  const decisionesUnicas = [...new Set(candidatosList.map(c => c.decision || 'Pendiente'))]

  const candidatosFiltrados = candidatosList.filter(c => {
    const texto = filtroTexto.toLowerCase().trim()
    if (texto && !(
      (c.nombre + ' ' + (c.apellido || '')).toLowerCase().includes(texto) ||
      (c.email || '').toLowerCase().includes(texto)
    )) return false
    if (filtroFuente && c.fuente !== filtroFuente) return false
    if (filtroDecision && (c.decision || 'Pendiente') !== filtroDecision) return false
    return true
  })

  const hayFiltros = filtroTexto || filtroFuente || filtroDecision
  const rechazadosFiltrados = candidatosFiltrados.filter(c => c.etapa === 'Rechazado')
  const activeCandidato = activeId != null ? candidatosList.find(c => c.id === activeId) : null

  const handleDragStart = ({ active }) => setActiveId(Number(active.id))

  const handleDragEnd = async ({ active, over }) => {
    setActiveId(null)
    if (!over) return
    const candidatoId = Number(active.id)
    const nuevaEtapa = over.id
    const candidato = candidatosList.find(c => c.id === candidatoId)
    if (!candidato || candidato.etapa === nuevaEtapa) return

    setCandidatosList(prev => prev.map(c => c.id === candidatoId ? { ...c, etapa: nuevaEtapa } : c))
    try {
      await updateEtapaCandidato(candidatoId, nuevaEtapa)
      await registrarActividad(candidatoId, 'etapa',
        `Etapa cambiada a "${nuevaEtapa}"`,
        { etapa_nueva: nuevaEtapa, etapa_anterior: candidato.etapa }
      )
    } catch {
      setCandidatosList(prev => prev.map(c => c.id === candidatoId ? { ...c, etapa: candidato.etapa } : c))
    }
  }

  const handleDragCancel = () => setActiveId(null)

  const limpiarFiltros = () => { setFiltroTexto(''); setFiltroFuente(''); setFiltroDecision('') }

  const handleCompartirVacante = async () => {
    setCopiandoPortal(true)
    try {
      let token = vacante.portal_token
      if (!token) token = await regenerarTokenVacante(vacante.id)
      const url = window.location.origin + '/portal-vacante/' + token
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        window.prompt('Copia este enlace para el hiring manager:', url)
      }
      setTimeout(() => setCopiandoPortal(false), 2500)
    } catch (err) {
      console.error('Error al generar enlace del portal:', err)
      alert('No se pudo generar el enlace. Verifica que la migración fue aplicada.')
      setCopiandoPortal(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="breadcrumb" style={{ marginBottom: 2 }}>
            <button className="back-btn" style={{ padding: '2px 6px' }} onClick={() => navigate('/app/clientes')}>
              &#8592; Clientes
            </button>
            <span className="breadcrumb-sep">/</span>
            <button className="back-btn" style={{ padding: '2px 6px' }} onClick={() => navigate('/app/clientes/' + vacante.cliente_id + '/vacantes')}>
              {cliente?.nombre}
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="current">{vacante.titulo}</span>
          </div>
          <div className="page-title">Pipeline &middot; {vacante.titulo}</div>
        </div>
        <div className="header-actions">
          <button
            onClick={handleCompartirVacante}
            disabled={copiandoPortal}
            style={{
              padding: '8px 14px', borderRadius: 8, border: '1.5px solid',
              borderColor: copiandoPortal ? '#6ee7b7' : '#e2e8f0',
              background: copiandoPortal ? '#d1fae5' : 'white',
              color: copiandoPortal ? '#065f46' : '#475569',
              fontSize: 13, fontWeight: 600, cursor: copiandoPortal ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copiandoPortal ? '✓ Enlace copiado' : '🔗 Portal HM'}
          </button>
          <DescargarTemplateBtn cliente={cliente?.nombre || ''} puesto={vacante.titulo || ''} />
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
          <button className="btn btn-primary" onClick={() => setShowNuevoCandidato(true)}>
            + Agregar candidato
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Info de la vacante */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            <div>
              <div className="info-label">Cliente</div>
              <div className="info-value">{cliente?.nombre || '—'}</div>
            </div>
            <div>
              <div className="info-label">Área</div>
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
            {vacante.hiring_manager && (
              <div style={{ borderLeft: '1px solid #f1f5f9', paddingLeft: 28, marginLeft: 4 }}>
                <div className="info-label">Hiring Manager</div>
                <div className="info-value" style={{ fontWeight: 600 }}>{vacante.hiring_manager}</div>
                {vacante.hiring_manager_email && (
                  <a href={'mailto:' + vacante.hiring_manager_email} style={{ fontSize: 12, color: '#2563eb', display: 'block', marginTop: 2 }}>
                    {vacante.hiring_manager_email}
                  </a>
                )}
                {vacante.hiring_manager_telefono && (
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{vacante.hiring_manager_telefono}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Barra de filtros */}
        <div className="card" style={{ marginBottom: 16, padding: '12px 20px' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Buscar por nombre o correo..."
              value={filtroTexto}
              onChange={e => setFiltroTexto(e.target.value)}
              style={{
                flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8,
                border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none',
                fontFamily: 'inherit', color: '#334155',
              }}
            />
            {fuentesUnicas.length > 0 && (
              <select value={filtroFuente} onChange={e => setFiltroFuente(e.target.value)} style={selStyle(!filtroFuente)}>
                <option value="">Todas las fuentes</option>
                {fuentesUnicas.map(f => <option key={f}>{f}</option>)}
              </select>
            )}
            {decisionesUnicas.length > 0 && (
              <select value={filtroDecision} onChange={e => setFiltroDecision(e.target.value)} style={selStyle(!filtroDecision)}>
                <option value="">Todas las decisiones</option>
                {decisionesUnicas.map(d => <option key={d}>{d}</option>)}
              </select>
            )}
            {hayFiltros && (
              <>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {candidatosFiltrados.length} de {candidatosList.length}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={limpiarFiltros}>
                  Limpiar
                </button>
              </>
            )}
          </div>
        </div>

        {candidatosList.length === 0 ? (
          <div className="card">
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="icon">&#128100;</div>
              <p>No hay candidatos en este pipeline aún.</p>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Los candidatos aparecerán aquí cuando apliquen desde el portal.
              </p>
            </div>
          </div>
        ) : hayFiltros && candidatosFiltrados.length === 0 ? (
          <div className="card">
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="icon">&#128270;</div>
              <p>Sin resultados para los filtros aplicados.</p>
              <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          </div>
        ) : vista === 'kanban' ? (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
            <div className="kanban-board">
              {etapasBoardOrder.map(etapa => (
                <KanbanCol
                  key={etapa}
                  etapa={etapa}
                  candidatos={candidatosFiltrados.filter(c => c.etapa === etapa)}
                  onCardClick={(id) => navigate('/app/candidatos/' + id)}
                />
              ))}
              <div className="kanban-col" style={{ opacity: 0.7 }}>
                <div className="kanban-col-header">
                  <div className="kanban-col-title">
                    <span className="kanban-dot" style={{ background: etapaColors['Rechazado'] }} />
                    Rechazados
                  </div>
                  <span className="kanban-count">{rechazadosFiltrados.length}</span>
                </div>
                {rechazadosFiltrados.map(c => (
                  <div
                    key={c.id}
                    className="kanban-card"
                    onClick={() => navigate('/app/candidatos/' + c.id)}
                    style={{ opacity: 0.7 }}
                  >
                    <div className="kanban-card-name">{c.nombre} {c.apellido || ''}</div>
                    <div className="kanban-card-meta">{c.fuente || ''}</div>
                  </div>
                ))}
              </div>
            </div>
            <DragOverlay>
              {activeCandidato ? <KanbanCardGhost candidato={activeCandidato} /> : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="card">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Candidato</th>
                    <th>Fuente</th>
                    <th>Etapa</th>
                    <th>Score</th>
                    <th>Decisión</th>
                    <th>Fecha</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {candidatosFiltrados.map(c => {
                    const etapaColor = etapaColors[c.etapa] || '#6366f1'
                    const decColor = decisionColors[c.decision] || '#9ca3af'
                    return (
                      <tr key={c.id} className="clickable-row" onClick={() => navigate('/app/candidatos/' + c.id)}>
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
                          <span className="badge" style={{ background: etapaColor + '22', color: etapaColor, border: '1px solid ' + etapaColor + '44' }}>
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
                            onClick={(e) => { e.stopPropagation(); navigate('/app/candidatos/' + c.id) }}
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
        )}

        <AdjuntosList vacanteId={Number(vacanteId)} />
      </div>

      {showNuevoCandidato && (
        <NuevoCandidatoModal
          vacanteId={Number(vacanteId)}
          onClose={() => setShowNuevoCandidato(false)}
          onCreado={(nuevo) => setCandidatosList(prev => [nuevo, ...prev])}
        />
      )}
    </>
  )
}

function selStyle(isEmpty) {
  return {
    padding: '8px 12px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: 13,
    outline: 'none', fontFamily: 'inherit',
    color: isEmpty ? '#94a3b8' : '#334155',
    background: 'white', cursor: 'pointer',
  }
}
