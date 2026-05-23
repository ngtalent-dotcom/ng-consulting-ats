import { useState, useEffect } from 'react'
import { listarAdjuntos, descargarAdjunto, eliminarAdjunto } from '../../services/vacantesAdjuntosService'
import SubirAdjuntoBtn from './SubirAdjuntoBtn'

const iconoTipo = { levantamiento_lleno: '&#128196;', jd: '&#128203;', contrato: '&#128221;', otro: '&#128196;' }
const labelTipo = { levantamiento_lleno: 'Levantamiento', jd: 'JD', contrato: 'Contrato', otro: 'Otro' }

function fechaRelativa(isoStr) {
  if (!isoStr) return '—'
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000
  if (diff < 60) return 'hace un momento'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  if (diff < 86400 * 30) return `hace ${Math.floor(diff / 86400)} días`
  return new Date(isoStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export default function AdjuntosList({ vacanteId }) {
  const [adjuntos, setAdjuntos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [eliminando, setEliminando] = useState(null)
  const [descargando, setDescargando] = useState(null)

  useEffect(() => {
    cargar()
  }, [vacanteId])

  async function cargar() {
    try {
      const data = await listarAdjuntos(vacanteId)
      setAdjuntos(data)
    } catch (err) {
      console.error('Error cargando adjuntos:', err)
    } finally {
      setCargando(false)
    }
  }

  const handleSubido = (adjunto) => {
    setAdjuntos(prev => [adjunto, ...prev])
  }

  const handleDescargar = async (adj) => {
    setDescargando(adj.id)
    try {
      const url = await descargarAdjunto(adj.storage_path)
      const a = document.createElement('a')
      a.href = url
      a.download = adj.nombre_archivo
      a.click()
    } catch (err) {
      alert('Error al descargar: ' + err.message)
    } finally {
      setDescargando(null)
    }
  }

  const handleEliminar = async (adj) => {
    if (!window.confirm(`¿Eliminar "${adj.nombre_archivo}"?`)) return
    setEliminando(adj.id)
    try {
      await eliminarAdjunto(adj.id, adj.storage_path)
      setAdjuntos(prev => prev.filter(a => a.id !== adj.id))
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    } finally {
      setEliminando(null)
    }
  }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="card-header">
        <div className="card-title">&#128193; Documentos de la vacante</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <SubirAdjuntoBtn vacanteId={vacanteId} tipo="levantamiento_lleno" label="Levantamiento" onSubido={handleSubido} />
          <SubirAdjuntoBtn vacanteId={vacanteId} tipo="jd" label="JD" onSubido={handleSubido} />
          <SubirAdjuntoBtn vacanteId={vacanteId} tipo="contrato" label="Contrato" onSubido={handleSubido} />
          <SubirAdjuntoBtn vacanteId={vacanteId} tipo="otro" label="Otro" onSubido={handleSubido} />
        </div>
      </div>

      {cargando ? (
        <div style={{ color: '#94a3b8', fontSize: 13, padding: '12px 0' }}>Cargando...</div>
      ) : adjuntos.length === 0 ? (
        <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic', padding: '12px 0' }}>
          Sin documentos adjuntos. Sube el levantamiento llenado por el cliente.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {adjuntos.map(adj => (
            <div key={adj.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 20 }} dangerouslySetInnerHTML={{ __html: iconoTipo[adj.tipo] || iconoTipo.otro }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {adj.nombre_archivo}
                </div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>
                  <span className="tag" style={{ marginRight: 6 }}>{labelTipo[adj.tipo] || 'Otro'}</span>
                  {formatBytes(adj.tamano_bytes)} &middot; {fechaRelativa(adj.created_at)}
                </div>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleDescargar(adj)}
                disabled={descargando === adj.id}
                style={{ flexShrink: 0 }}
              >
                {descargando === adj.id ? '...' : '&#11015; Descargar'}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleEliminar(adj)}
                disabled={eliminando === adj.id}
                style={{ flexShrink: 0, color: '#dc2626' }}
              >
                {eliminando === adj.id ? '...' : '&#128465;'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
