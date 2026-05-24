import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getCandidatosEspontaneos, deleteCandidato } from '../services/candidatosService'
import MoverCopiarCandidatoModal from '../components/MoverCopiarCandidatoModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const areasInteres = ['Ventas', 'Operaciones', 'Marketing', 'Finanzas', 'RRHH', 'Administración', 'Logística', 'Tecnología', 'Otro']

function diasDesde(fecha) {
  const diff = Date.now() - new Date(fecha).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export default function BancoTalento() {
  const navigate = useNavigate()
  const [candidatos, setCandidatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroArea, setFiltroArea] = useState('')

  const [modalMover, setModalMover] = useState(false)
  const [candidatoSeleccionado, setCandidatoSeleccionado] = useState(null)
  const [confirmEliminar, setConfirmEliminar] = useState(null)

  async function cargar() {
    try {
      const data = await getCandidatosEspontaneos()
      setCandidatos(data)
    } catch (err) {
      console.error('Error cargando banco de talento:', err)
      toast.error('Error al cargar el banco de talento')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const filtrados = candidatos.filter(c => {
    const nombre = `${c.nombre} ${c.apellido}`.toLowerCase()
    const matchBusqueda = !busqueda.trim() ||
      nombre.includes(busqueda.toLowerCase()) ||
      c.email?.toLowerCase().includes(busqueda.toLowerCase())
    const matchArea = !filtroArea || c.area_interes === filtroArea
    return matchBusqueda && matchArea
  })

  async function handleEliminar() {
    if (!confirmEliminar) return
    try {
      await deleteCandidato(confirmEliminar.id, confirmEliminar.cv_url)
      setCandidatos(prev => prev.filter(c => c.id !== confirmEliminar.id))
      toast.success('Candidato eliminado')
    } catch {
      toast.error('Error al eliminar el candidato')
    }
    setConfirmEliminar(null)
  }

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>
          Banco de Talento
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
          Candidatos que aplicaron espontáneamente sin una vacante específica.
        </p>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 8,
            border: '1.5px solid #e2e8f0', fontSize: 13,
            color: '#1e293b', background: 'white', outline: 'none',
            fontFamily: 'inherit', width: 260,
          }}
        />
        <select
          value={filtroArea}
          onChange={e => setFiltroArea(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 8,
            border: '1.5px solid #e2e8f0', fontSize: 13,
            color: filtroArea ? '#1e293b' : '#94a3b8',
            background: 'white', outline: 'none', fontFamily: 'inherit',
          }}
        >
          <option value="">Todas las áreas</option>
          {areasInteres.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8', alignSelf: 'center' }}>
          {filtrados.length} candidato{filtrados.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabla */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>Cargando...</div>
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>&#11088;</div>
          <p style={{ fontSize: 16, color: '#64748b', marginBottom: 8 }}>
            {candidatos.length === 0 ? 'Aún no hay candidatos en el banco de talento.' : 'Sin resultados para tu búsqueda.'}
          </p>
          {candidatos.length === 0 && (
            <button
              onClick={() => window.open('/careers', '_blank')}
              style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
            >
              Ver portal de candidatos ↗
            </button>
          )}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Candidato', 'Área de interés', 'Ciudad', 'Fuente', 'Fecha', ''].map((h, i) => (
                  <th key={i} style={{
                    padding: '11px 16px', textAlign: 'left',
                    fontSize: 12, fontWeight: 600, color: '#64748b',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c, idx) => {
                const dias = diasDesde(c.created_at)
                const esNuevo = dias < 3
                return (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: idx < filtrados.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>
                        {c.nombre} {c.apellido}
                      </div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.email}</div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      {c.area_interes ? (
                        <span style={{
                          background: '#ede9fe', color: '#6d28d9',
                          padding: '3px 10px', borderRadius: 20,
                          fontSize: 12, fontWeight: 600,
                        }}>
                          {c.area_interes}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: '#64748b' }}>
                      {c.ciudad || '—'}
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 13, color: '#64748b' }}>
                      {c.fuente || '—'}
                    </td>
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>
                        hace {dias === 0 ? 'hoy' : `${dias} día${dias !== 1 ? 's' : ''}`}
                      </div>
                      {esNuevo && (
                        <span style={{
                          background: '#d1fae5', color: '#065f46',
                          padding: '1px 7px', borderRadius: 10,
                          fontSize: 10, fontWeight: 700,
                        }}>
                          NUEVO
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => navigate('/candidatos/' + c.id)}
                          style={{
                            background: '#f1f5f9', color: '#334155',
                            border: '1px solid #e2e8f0', borderRadius: 7,
                            padding: '6px 12px', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Ver perfil
                        </button>
                        <button
                          onClick={() => { setCandidatoSeleccionado(c); setModalMover(true) }}
                          style={{
                            background: '#dbeafe', color: '#1e40af',
                            border: '1px solid #bfdbfe', borderRadius: 7,
                            padding: '6px 12px', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Asignar vacante
                        </button>
                        <button
                          onClick={() => setConfirmEliminar(c)}
                          style={{
                            background: 'none', color: '#94a3b8',
                            border: '1px solid #e2e8f0', borderRadius: 7,
                            padding: '6px 10px', fontSize: 13,
                            cursor: 'pointer',
                          }}
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal mover a vacante */}
      {candidatoSeleccionado && (
        <MoverCopiarCandidatoModal
          abierto={modalMover}
          onCerrar={() => { setModalMover(false); setCandidatoSeleccionado(null) }}
          candidato={candidatoSeleccionado}
          onExito={() => {
            setModalMover(false)
            setCandidatoSeleccionado(null)
            cargar()
          }}
        />
      )}

      {/* Confirmar eliminar */}
      <ConfirmDialog
        abierto={!!confirmEliminar}
        titulo="Eliminar candidato"
        mensaje={`¿Eliminar a ${confirmEliminar?.nombre} ${confirmEliminar?.apellido} del banco de talento? Esta acción no se puede deshacer.`}
        onConfirmar={handleEliminar}
        onCerrar={() => setConfirmEliminar(null)}
      />
    </div>
  )
}
