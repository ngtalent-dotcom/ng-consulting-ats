import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getClientes } from '../services/clientesService'
import { getVacantes } from '../services/vacantesService'
import { getTodosCandidatos } from '../services/candidatosService'
import TablaCandidatosGlobal from '../components/TablaCandidatosGlobal'

const DEFAULT_ORDEN = ['kpis', 'graficas', 'vacantes', 'actividad', 'candidatos']

const SECCION_LABELS = {
  kpis:       'Indicadores clave',
  graficas:   'Gráficas de pipeline',
  vacantes:   'Todas las vacantes',
  actividad:  'Clientes y actividad reciente',
  candidatos: 'Todos los candidatos',
}

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

const estatusBadge = {
  'Activa':  { bg: '#d1fae5', color: '#065f46' },
  'Pausada': { bg: '#fef3c7', color: '#92400e' },
  'Cerrada': { bg: '#f1f5f9', color: '#475569' },
}

function cargarOrden() {
  try {
    const saved = localStorage.getItem('dashboard-orden')
    if (!saved) return DEFAULT_ORDEN
    const parsed = JSON.parse(saved)
    const valid = parsed.filter(id => DEFAULT_ORDEN.includes(id))
    const missing = DEFAULT_ORDEN.filter(id => !parsed.includes(id))
    return [...valid, ...missing]
  } catch {
    return DEFAULT_ORDEN
  }
}

// ─── BarraHorizontal ──────────────────────────────────────────────────

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

// ─── SortableSeccion ──────────────────────────────────────────────────

function SortableSeccion({ id, editando, label, children }) {
  const {
    attributes, listeners, setNodeRef, setActivatorNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        marginBottom: 20,
        outline: editando ? '2px dashed #93c5fd' : 'none',
        outlineOffset: 4,
        borderRadius: 12,
      }}
    >
      {editando && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', marginBottom: 8,
          background: '#eff6ff', borderRadius: 8,
          border: '1px solid #bfdbfe',
        }}>
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              fontSize: 20, color: '#2563eb', lineHeight: 1, userSelect: 'none',
            }}
          >
            ⠿
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#1e40af' }}>{label}</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#93c5fd' }}>Arrastra para mover</span>
        </div>
      )}
      {children}
    </div>
  )
}

// ─── SeccionVacantes ──────────────────────────────────────────────────

function SeccionVacantes({ datos, cargando, navigate }) {
  const [filtro, setFiltro] = useState('Activa')

  const vacantes = datos?.vacantesEnriquecidas || []
  const conteos = {
    Activa:  vacantes.filter(v => v.estatus === 'Activa' || !v.estatus).length,
    Pausada: vacantes.filter(v => v.estatus === 'Pausada').length,
    Cerrada: vacantes.filter(v => v.estatus === 'Cerrada').length,
    Todas:   vacantes.length,
  }
  const filtradas = filtro === 'Todas'
    ? vacantes
    : vacantes.filter(v => filtro === 'Activa'
      ? (v.estatus === 'Activa' || !v.estatus)
      : v.estatus === filtro
    )

  const FILTROS = [
    { key: 'Activa', label: 'Activas' },
    { key: 'Pausada', label: 'Pausadas' },
    { key: 'Cerrada', label: 'Cerradas' },
    { key: 'Todas', label: 'Todas' },
  ]

  return (
    <div className="card">
      <div className="card-header" style={{ flexWrap: 'wrap', gap: 10 }}>
        <div className="card-title">Todas las vacantes</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {FILTROS.map(({ key, label }) => {
            const isActive = filtro === key
            const badge = estatusBadge[key] || { bg: '#dbeafe', color: '#1e40af' }
            return (
              <button
                key={key}
                onClick={() => setFiltro(key)}
                style={{
                  padding: '4px 10px', borderRadius: 6, border: 'none',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: isActive ? badge.bg : '#f1f5f9',
                  color: isActive ? badge.color : '#64748b',
                  transition: 'all 0.15s',
                }}
              >
                {label} ({conteos[key]})
              </button>
            )
          })}
        </div>
      </div>

      {cargando ? (
        <div style={{ color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>Cargando...</div>
      ) : filtradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13 }}>
          No hay vacantes {filtro !== 'Todas' ? filtro.toLowerCase() + 's' : ''}.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Vacante</th>
                <th>Área / Nivel</th>
                <th>Estatus</th>
                <th style={{ textAlign: 'center' }}>Candidatos</th>
                <th style={{ textAlign: 'right' }}>Antigüedad</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(v => {
                const cliente = v.clientes || {}
                const badge = estatusBadge[v.estatus] || estatusBadge['Activa']
                const diasColor = v.diasAbierta < 30 ? '#059669' : v.diasAbierta < 60 ? '#d97706' : '#dc2626'
                return (
                  <tr
                    key={v.id}
                    className="clickable-row"
                    onClick={() => navigate('/app/vacantes/' + v.id + '/pipeline')}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--gray-800)', fontSize: 13 }}>{v.titulo}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{cliente.nombre || '—'}</div>
                    </td>
                    <td>
                      {[v.area, v.nivel].filter(Boolean).map((tag, i) => (
                        <span key={i} style={{
                          background: '#f1f5f9', color: '#475569',
                          padding: '2px 7px', borderRadius: 4,
                          fontSize: 11, marginRight: 4, display: 'inline-block',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </td>
                    <td>
                      <span style={{ ...badge, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                        {v.estatus || 'Activa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 14, color: v.totalCandidatos > 0 ? '#1e293b' : '#cbd5e1' }}>
                      {v.totalCandidatos}
                    </td>
                    <td style={{ textAlign: 'right', fontSize: 12, color: diasColor, fontWeight: 600 }}>
                      {v.diasAbierta}d
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(false)
  const [orden, setOrden] = useState(cargarOrden)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    async function cargar() {
      try {
        const [clientesData, vacantesData, candidatosData] = await Promise.all([
          getClientes(),
          getVacantes(),
          getTodosCandidatos(),
        ])

        const vacantesActivas = vacantesData.filter(v => v.estatus === 'Activa' || !v.estatus).length

        const etapasOrden = ['Aplicó', 'Pre-screen', 'Entrevista Cliente', 'Oferta', 'Cerrado', 'Rechazado']
        const porEtapa = etapasOrden
          .map(etapa => ({ etapa, count: candidatosData.filter(c => c.etapa === etapa).length }))
          .filter(e => e.count > 0)

        const fuenteMap = {}
        candidatosData.forEach(c => {
          const f = c.fuente || 'Sin fuente'
          fuenteMap[f] = (fuenteMap[f] || 0) + 1
        })
        const porFuente = Object.entries(fuenteMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([fuente, count]) => ({ fuente, count }))

        // Enriquecer vacantes con conteo de candidatos y días abierta
        const candidatosPorVacante = {}
        candidatosData.forEach(c => {
          if (c.vacante_id) candidatosPorVacante[c.vacante_id] = (candidatosPorVacante[c.vacante_id] || 0) + 1
        })
        const ordenEstatus = { 'Activa': 0, 'Pausada': 1, 'Cerrada': 2 }
        const vacantesEnriquecidas = vacantesData
          .map(v => ({
            ...v,
            totalCandidatos: candidatosPorVacante[v.id] || 0,
            diasAbierta: Math.floor((Date.now() - new Date(v.fecha_apertura || v.created_at).getTime()) / 86400000),
          }))
          .sort((a, b) => (ordenEstatus[a.estatus] ?? 0) - (ordenEstatus[b.estatus] ?? 0))

        setDatos({
          totalClientes: clientesData.length,
          vacantesActivas,
          totalCandidatos: candidatosData.length,
          enOferta: candidatosData.filter(c => c.etapa === 'Oferta').length,
          porEtapa,
          porFuente,
          recientes: candidatosData.slice(0, 8),
          clientes: clientesData.slice(0, 5),
          vacantesEnriquecidas,
        })
      } catch (err) {
        console.error('Error cargando dashboard:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    setOrden(prev => {
      const next = arrayMove(prev, prev.indexOf(active.id), prev.indexOf(over.id))
      localStorage.setItem('dashboard-orden', JSON.stringify(next))
      return next
    })
  }

  const formatFecha = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }
  const getInitials = (nombre) => (nombre || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  function renderSeccion(id) {
    switch (id) {

      case 'kpis':
        return (
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
        )

      case 'graficas':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Candidatos por etapa</div>
              {cargando ? (
                <div style={{ color: '#94a3b8', fontSize: 13 }}>Cargando...</div>
              ) : !datos?.porEtapa?.length ? (
                <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>Sin candidatos aún.</div>
              ) : datos.porEtapa.map(({ etapa, count }) => (
                <BarraHorizontal key={etapa} label={etapa} valor={count} total={datos.totalCandidatos} color={etapaColors[etapa] || '#6366f1'} />
              ))}
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Candidatos por fuente</div>
              {cargando ? (
                <div style={{ color: '#94a3b8', fontSize: 13 }}>Cargando...</div>
              ) : !datos?.porFuente?.length ? (
                <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }}>Sin candidatos aún.</div>
              ) : datos.porFuente.map(({ fuente, count }) => (
                <BarraHorizontal key={fuente} label={fuente} valor={count} total={datos.totalCandidatos} color="#2563eb" />
              ))}
            </div>
          </div>
        )

      case 'vacantes':
        return <SeccionVacantes datos={datos} cargando={cargando} navigate={navigate} />

      case 'actividad':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Clientes</div>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/app/clientes')}>Ver todos</button>
              </div>
              {cargando ? (
                <div style={{ color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>Cargando...</div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Cliente</th><th>Alta</th></tr></thead>
                    <tbody>
                      {datos?.clientes?.map(c => (
                        <tr key={c.id} className="clickable-row" onClick={() => navigate('/app/clientes/' + c.id + '/vacantes')}>
                          <td>
                            <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{c.nombre}</div>
                            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{c.industria}</div>
                          </td>
                          <td style={{ color: 'var(--gray-400)', fontSize: 12 }}>{formatFecha(c.created_at)}</td>
                        </tr>
                      ))}
                      {!datos?.clientes?.length && (
                        <tr><td colSpan={2} style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>Sin clientes aún</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Candidatos recientes</div>
              </div>
              {cargando ? (
                <div style={{ color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>Cargando...</div>
              ) : !datos?.recientes?.length ? (
                <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic', padding: '12px 0' }}>Sin candidatos aún.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {datos.recientes.map(c => {
                    const estilo = etapaBadge[c.etapa] || { bg: '#f1f5f9', color: '#475569' }
                    const vacante = c.vacantes || {}
                    return (
                      <div
                        key={c.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer' }}
                        onClick={() => navigate('/app/candidatos/' + c.id)}
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
        )

      case 'candidatos':
        return <TablaCandidatosGlobal />

      default:
        return null
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="header-actions">
          <span style={{ fontSize: 12, color: 'var(--gray-400)', marginRight: 8 }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
          {editando ? (
            <button
              onClick={() => setEditando(false)}
              className="btn"
              style={{ background: '#2563eb', color: 'white', fontSize: 13 }}
            >
              ✓ Listo
            </button>
          ) : (
            <button
              onClick={() => setEditando(true)}
              className="btn btn-secondary"
              style={{ fontSize: 13 }}
            >
              ✏️ Editar dashboard
            </button>
          )}
        </div>
      </div>

      <div className="page-body">
        {editando && (
          <div style={{
            marginBottom: 16, padding: '10px 16px',
            background: '#eff6ff', borderRadius: 10,
            border: '1px solid #bfdbfe',
            fontSize: 13, color: '#1e40af',
          }}>
            Arrastra las secciones con el ícono <strong>⠿</strong> para reorganizar. Los cambios se guardan automáticamente.
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orden} strategy={verticalListSortingStrategy}>
            {orden.map(id => (
              <SortableSeccion key={id} id={id} editando={editando} label={SECCION_LABELS[id]}>
                {renderSeccion(id)}
              </SortableSeccion>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </>
  )
}
