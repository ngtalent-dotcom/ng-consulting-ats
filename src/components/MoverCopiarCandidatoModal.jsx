import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Modal from './ui/Modal'
import { getVacantesConCliente } from '../services/vacantesService'
import { moverCandidato, copiarCandidato } from '../services/candidatosService'

function estatusBadge(estatus) {
  if (estatus === 'Activa')  return { bg: '#d1fae5', color: '#065f46' }
  if (estatus === 'Pausada') return { bg: '#fef3c7', color: '#92400e' }
  return { bg: '#f1f5f9', color: '#475569' }
}

export default function MoverCopiarCandidatoModal({ abierto, onCerrar, candidato, onExito }) {
  const [operacion, setOperacion] = useState('mover')
  const [busquedaVacante, setBusquedaVacante] = useState('')
  const [vacantes, setVacantes] = useState([])
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null)
  const [cargandoVacantes, setCargandoVacantes] = useState(true)
  const [ejecutando, setEjecutando] = useState(false)

  useEffect(() => {
    if (!abierto) return
    setOperacion('mover')
    setBusquedaVacante('')
    setVacanteSeleccionada(null)
    setCargandoVacantes(true)
    getVacantesConCliente(candidato.vacante_id)
      .then(setVacantes)
      .catch(() => toast.error('No se pudo cargar la lista de vacantes.'))
      .finally(() => setCargandoVacantes(false))
  }, [abierto, candidato.vacante_id])

  const vacantesOrdenadas = [...vacantes].sort((a, b) => {
    const cerradaA = a.estatus === 'Cerrada' || a.estatus === 'Cubierta'
    const cerradaB = b.estatus === 'Cerrada' || b.estatus === 'Cubierta'
    if (cerradaA && !cerradaB) return 1
    if (!cerradaA && cerradaB) return -1
    return 0
  })

  const vacantesFiltradas = vacantesOrdenadas.filter(v => {
    const term = busquedaVacante.toLowerCase()
    return (
      v.titulo.toLowerCase().includes(term) ||
      v.clientes?.nombre.toLowerCase().includes(term) ||
      (v.area || '').toLowerCase().includes(term)
    )
  })

  const handleConfirmar = async () => {
    if (!vacanteSeleccionada) return
    setEjecutando(true)
    try {
      let resultado
      if (operacion === 'mover') {
        resultado = await moverCandidato(candidato.id, vacanteSeleccionada.id)
      } else {
        resultado = await copiarCandidato(candidato, vacanteSeleccionada.id)
      }
      toast.success(operacion === 'mover' ? 'Candidato movido' : 'Candidato copiado')
      onExito(operacion, resultado, vacanteSeleccionada)
      onCerrar()
    } catch {
      toast.error('Ocurrió un error al procesar la operación. Intenta de nuevo.')
    } finally {
      setEjecutando(false)
    }
  }

  const nombreCompleto = `${candidato.nombre || ''} ${candidato.apellido || ''}`.trim()
  const vacanteOrigen = candidato.vacantes?.titulo || '—'
  const clienteOrigen = candidato.vacantes?.clientes?.nombre || '—'

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Mover / Copiar candidato" ancho={600}>
      {/* Candidato origen */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563eb', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
          {(nombreCompleto || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{nombreCompleto}</div>
          <div style={{ fontSize: 12.5, color: '#64748b' }}>{vacanteOrigen} · {clienteOrigen}</div>
        </div>
      </div>

      {/* Selector de operacion */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 10 }}>
        Acción a realizar
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {['mover', 'copiar'].map(op => {
          const activo = operacion === op
          return (
            <div
              key={op}
              onClick={() => setOperacion(op)}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 8,
                border: `2px solid ${activo ? '#1e3a5f' : '#e2e8f0'}`,
                background: activo ? '#1e3a5f' : 'white',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 14, color: activo ? 'white' : '#1e293b' }}>
                {op === 'mover' ? '↗ Mover' : '⧉ Copiar'}
              </div>
              <div style={{ fontSize: 12, color: activo ? 'rgba(255,255,255,0.75)' : '#64748b' }}>
                {op === 'mover'
                  ? 'Desvincula de la vacante actual'
                  : 'El original no se modifica'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Selector de vacante destino */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
        Vacante destino
      </div>
      <input
        type="search"
        placeholder="Buscar vacante o cliente..."
        value={busquedaVacante}
        onChange={e => setBusquedaVacante(e.target.value)}
        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
      />

      <div style={{ maxHeight: 260, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 16 }}>
        {cargandoVacantes ? (
          <div style={{ padding: '20px 16px', color: '#94a3b8', fontSize: 13 }}>Cargando vacantes...</div>
        ) : vacantesFiltradas.length === 0 ? (
          <div style={{ padding: '20px 16px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}>
            {vacantes.length === 0
              ? 'No hay otras vacantes disponibles.'
              : 'Sin vacantes que coincidan con la búsqueda.'}
          </div>
        ) : (
          vacantesFiltradas.map(v => {
            const cerrada = v.estatus === 'Cerrada' || v.estatus === 'Cubierta'
            const seleccionada = vacanteSeleccionada?.id === v.id
            const est = estatusBadge(v.estatus)
            return (
              <label
                key={v.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                  opacity: cerrada ? 0.5 : 1,
                  background: seleccionada ? '#eff6ff' : 'white',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!seleccionada) e.currentTarget.style.background = '#f8fafc' }}
                onMouseLeave={e => { if (!seleccionada) e.currentTarget.style.background = 'white' }}
              >
                <input
                  type="radio"
                  name="vacante-destino"
                  checked={seleccionada}
                  onChange={() => setVacanteSeleccionada(v)}
                  style={{ marginTop: 3, flexShrink: 0, accentColor: '#2563eb' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: '#1e293b', marginBottom: 2 }}>{v.titulo}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>
                    {v.clientes?.nombre || '—'}
                    {v.area ? ` · ${v.area}` : ''}
                    {v.nivel ? ` · ${v.nivel}` : ''}
                  </div>
                  <span className="badge" style={{ background: est.bg, color: est.color, fontSize: 11 }}>
                    {v.estatus || '—'}
                  </span>
                </div>
              </label>
            )
          })
        )}
      </div>

      {/* Aviso contextual */}
      {vacanteSeleccionada && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, lineHeight: 1.5,
          background: operacion === 'mover' ? '#fffbeb' : '#eff6ff',
          border: `1px solid ${operacion === 'mover' ? '#fde68a' : '#bfdbfe'}`,
          color: operacion === 'mover' ? '#92400e' : '#1e40af',
        }}>
          {operacion === 'mover' ? (
            <>
              <strong>⚠️</strong> {nombreCompleto} dejará de aparecer en
              "{vacanteOrigen} / {clienteOrigen}" y pasará a
              "{vacanteSeleccionada.titulo} / {vacanteSeleccionada.clientes?.nombre || '—'}".
              Esta acción no se puede deshacer.
            </>
          ) : (
            <>
              <strong>ℹ️</strong> Se creará una copia completa de {nombreCompleto} (incluyendo
              pre-screen y evaluación) en "{vacanteSeleccionada.titulo} /
              {vacanteSeleccionada.clientes?.nombre || '—'}".
              El candidato original no se modifica.
            </>
          )}
        </div>
      )}

      {/* Botones */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className="btn btn-secondary" onClick={onCerrar} disabled={ejecutando}>
          Cancelar
        </button>
        <button
          className={operacion === 'mover' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={handleConfirmar}
          disabled={!vacanteSeleccionada || ejecutando || vacantes.length === 0}
        >
          {ejecutando
            ? 'Procesando...'
            : operacion === 'mover'
              ? 'Mover candidato →'
              : 'Copiar candidato →'}
        </button>
      </div>
    </Modal>
  )
}
