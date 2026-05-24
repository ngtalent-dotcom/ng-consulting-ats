import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTodosCandidatos, updateEtapaCandidato } from '../services/candidatosService'
import { getClientes } from '../services/clientesService'

const FILAS_POR_PAGINA = 25
const ETAPAS = ['Aplicó', 'Pre-screen', 'Entrevista Cliente', 'Oferta', 'Cerrado', 'Rechazado']
const DECISIONES = ['Avanza', 'En espera', 'Rechazado', 'Contratado']

const etapaBadge = {
  'Aplicó':             { bg: '#ede9fe', color: '#6d28d9' },
  'Pre-screen':         { bg: '#fef3c7', color: '#92400e' },
  'Entrevista Cliente': { bg: '#dbeafe', color: '#1e40af' },
  'Oferta':             { bg: '#d1fae5', color: '#065f46' },
  'Cerrado':            { bg: '#f0fdf4', color: '#166534' },
  'Rechazado':          { bg: '#fee2e2', color: '#991b1b' },
}

function scoreColor(score) {
  if (score == null) return { bg: '#f1f5f9', color: '#94a3b8' }
  if (score >= 4) return { bg: '#d1fae5', color: '#065f46' }
  if (score >= 3) return { bg: '#fef3c7', color: '#92400e' }
  return { bg: '#fee2e2', color: '#991b1b' }
}

function exportarCSV(lista) {
  const encabezado = ['Nombre', 'Apellido', 'Email', 'Telefono', 'Ciudad', 'Fuente', 'Etapa', 'Decision', 'Score', 'Vacante', 'Cliente', 'Fecha']
  const filas = lista.map(c => [
    c.nombre || '', c.apellido || '', c.email || '',
    c.telefono || '', c.ciudad || '', c.fuente || '',
    c.etapa || '', c.decision || '', c.score ?? '',
    c.vacantes?.titulo || '', c.vacantes?.clientes?.nombre || '',
    c.created_at ? new Date(c.created_at).toLocaleDateString('es-MX') : '',
  ])
  const csv = [encabezado, ...filas]
    .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `candidatos_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function FilaSkeleton() {
  return (
    <tr>
      {[130, 90, 100, 70, 70, 40, 60, 55].map((w, i) => (
        <td key={i}>
          <div style={{ height: 13, width: w, background: '#e2e8f0', borderRadius: 4, animation: 'skeleton-pulse 1.5s ease-in-out infinite' }} />
        </td>
      ))}
      <td />
    </tr>
  )
}

function MoverDropdown({ candidatoId, etapaActual, onMover, cambiandoId }) {
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    if (!abierto) return
    function cerrar(e) {
      if (!e.target.closest('[data-mover-dropdown="' + candidatoId + '"]')) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', cerrar)
    return () => document.removeEventListener('mousedown', cerrar)
  }, [abierto, candidatoId])

  return (
    <div data-mover-dropdown={candidatoId} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={e => { e.stopPropagation(); setAbierto(a => !a) }}
        disabled={cambiandoId === candidatoId}
        style={{ fontSize: 11, padding: '4px 8px' }}
      >
        Mover ▾
      </button>
      {abierto && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 4px)',
          background: 'white', border: '1px solid #e2e8f0', borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200, minWidth: 165,
        }}>
          {ETAPAS.filter(e => e !== etapaActual).map(etapa => {
            const est = etapaBadge[etapa] || { bg: '#f1f5f9', color: '#475569' }
            return (
              <button
                key={etapa}
                onClick={e => { e.stopPropagation(); setAbierto(false); onMover(candidatoId, etapa) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', border: 'none', background: 'none',
                  cursor: 'pointer', fontSize: 12, color: '#334155', transition: 'background 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
              >
                <span className="badge" style={{ background: est.bg, color: est.color, fontSize: 11 }}>
                  {etapa}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TablaCandidatosGlobal() {
  const navigate = useNavigate()
  const [candidatos, setCandidatos] = useState([])
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEtapa, setFiltroEtapa] = useState('')
  const [filtroDecision, setFiltroDecision] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [cambiandoId, setCambiandoId] = useState(null)
  const [pagina, setPagina] = useState(1)
  const [ordenScore, setOrdenScore] = useState(null)

  useEffect(() => {
    getClientes().then(setClientes).catch(console.error)
  }, [])

  const cargar = useCallback(() => {
    setCargando(true)
    setPagina(1)
    getTodosCandidatos({ etapa: filtroEtapa, decision: filtroDecision })
      .then(setCandidatos)
      .catch(err => console.error('Error cargando tabla:', err))
      .finally(() => setCargando(false))
  }, [filtroEtapa, filtroDecision])

  useEffect(() => { cargar() }, [cargar])

  async function handleMover(id, nuevaEtapa) {
    setCambiandoId(id)
    try {
      await updateEtapaCandidato(id, nuevaEtapa)
      setCandidatos(prev => prev.map(c => c.id === id ? { ...c, etapa: nuevaEtapa } : c))
    } catch (err) {
      console.error('Error cambiando etapa:', err)
    } finally {
      setCambiandoId(null)
    }
  }

  // Filtros cliente y búsqueda son client-side
  let resultado = candidatos
  if (busqueda.trim()) {
    const term = busqueda.toLowerCase()
    resultado = resultado.filter(c =>
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.vacantes?.titulo?.toLowerCase().includes(term) ||
      c.vacantes?.clientes?.nombre?.toLowerCase().includes(term)
    )
  }
  if (filtroCliente) {
    resultado = resultado.filter(c => String(c.vacantes?.cliente_id) === String(filtroCliente))
  }
  if (ordenScore === 'desc') resultado = [...resultado].sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
  else if (ordenScore === 'asc') resultado = [...resultado].sort((a, b) => (a.score ?? -1) - (b.score ?? -1))

  const totalPaginas = Math.ceil(resultado.length / FILAS_POR_PAGINA)
  const filasPagina = resultado.slice((pagina - 1) * FILAS_POR_PAGINA, pagina * FILAS_POR_PAGINA)

  const formatFecha = d => d
    ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    : '—'

  const selStyle = activo => ({
    padding: '6px 10px', borderRadius: 7, border: '1px solid',
    borderColor: activo ? '#2563eb' : '#e2e8f0',
    background: activo ? '#dbeafe' : 'white',
    color: activo ? '#1e40af' : '#475569',
    fontSize: 12.5, cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
  })

  function ciclarOrdenScore() {
    setOrdenScore(s => s === 'desc' ? 'asc' : s === 'asc' ? null : 'desc')
  }

  const iconoOrden = ordenScore === 'desc' ? ' ↓' : ordenScore === 'asc' ? ' ↑' : ' ↕'

  return (
    <div className="card" style={{ marginTop: 20 }}>
      {/* Encabezado con filtros */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div className="card-title">Todos los candidatos</div>
          {!cargando && (
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
              {resultado.length} resultado{resultado.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Buscar nombre, vacante..."
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPagina(1) }}
            style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid #e2e8f0', fontSize: 12.5, width: 195, outline: 'none' }}
          />
          <select value={filtroEtapa} onChange={e => setFiltroEtapa(e.target.value)} style={selStyle(!!filtroEtapa)}>
            <option value="">Todas las etapas</option>
            {ETAPAS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={filtroDecision} onChange={e => setFiltroDecision(e.target.value)} style={selStyle(!!filtroDecision)}>
            <option value="">Todas las decisiones</option>
            {DECISIONES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filtroCliente} onChange={e => { setFiltroCliente(e.target.value); setPagina(1) }} style={selStyle(!!filtroCliente)}>
            <option value="">Todos los clientes</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => exportarCSV(resultado)}
            disabled={cargando || resultado.length === 0}
          >
            ↓ CSV
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Cliente</th>
              <th>Puesto</th>
              <th>Etapa</th>
              <th>Decision</th>
              <th
                style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                onClick={ciclarOrdenScore}
                title="Ordenar por score"
              >
                Score{iconoOrden}
              </th>
              <th className="col-oculta-movil">Fuente</th>
              <th className="col-oculta-movil">Fecha</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {cargando
              ? Array.from({ length: 5 }, (_, i) => <FilaSkeleton key={i} />)
              : filasPagina.length === 0
                ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>
                      {candidatos.length === 0
                        ? 'Sin candidatos registrados aún.'
                        : 'Sin resultados para los filtros aplicados.'}
                    </td>
                  </tr>
                )
                : filasPagina.map(c => {
                  const etEst = etapaBadge[c.etapa] || { bg: '#f1f5f9', color: '#475569' }
                  const scCol = scoreColor(c.score)
                  return (
                    <tr key={c.id} className="clickable-row" onClick={() => navigate('/app/candidatos/' + c.id)}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>
                          {c.nombre} {c.apellido || ''}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#94a3b8' }}>{c.email}</div>
                      </td>
                      <td style={{ fontSize: 13 }}>{c.vacantes?.clientes?.nombre || '—'}</td>
                      <td style={{ fontSize: 13 }}>{c.vacantes?.titulo || '—'}</td>
                      <td>
                        <span className="badge" style={{ background: etEst.bg, color: etEst.color, fontSize: 11 }}>
                          {c.etapa || '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: '#475569' }}>{c.decision || '—'}</td>
                      <td>
                        {c.score != null
                          ? <span className="score-pill" style={{ background: scCol.bg, color: scCol.color }}>{c.score}</span>
                          : <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>}
                      </td>
                      <td className="col-oculta-movil" style={{ fontSize: 12.5, color: '#64748b' }}>{c.fuente || '—'}</td>
                      <td className="col-oculta-movil" style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>{formatFecha(c.created_at)}</td>
                      <td onClick={e => e.stopPropagation()} style={{ width: 64 }}>
                        <MoverDropdown
                          candidatoId={c.id}
                          etapaActual={c.etapa}
                          onMover={handleMover}
                          cambiandoId={cambiandoId}
                        />
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
      </div>

      {/* Paginacion */}
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPagina(p => Math.max(1, p - 1))}
            disabled={pagina === 1}
          >
            ← Anterior
          </button>
          <span style={{ fontSize: 12.5, color: '#64748b' }}>
            {pagina} / {totalPaginas} &middot; {resultado.length} candidatos
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
            disabled={pagina === totalPaginas}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
