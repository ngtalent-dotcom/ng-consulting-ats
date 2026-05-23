import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getClienteById } from '../services/clientesService'
import { getVacantesByCliente, deleteVacante } from '../services/vacantesService'
import { getCandidatosByVacante } from '../services/candidatosService'
import NuevaVacanteModal from '../components/NuevaVacanteModal'
import EditarVacanteModal from '../components/EditarVacanteModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function Vacantes() {
  const { clienteId } = useParams()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [vacanteEditando, setVacanteEditando] = useState(null)
  const [vacanteEliminando, setVacanteEliminando] = useState(null)
  const [candidatosEliminando, setCandidatosEliminando] = useState(0)
  const [cliente, setCliente] = useState(null)
  const [vacantes, setVacantes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const [c, vs] = await Promise.all([
          getClienteById(Number(clienteId)),
          getVacantesByCliente(Number(clienteId)),
        ])
        setCliente(c)
        setVacantes(vs)
      } catch (err) {
        console.error('Error cargando datos:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [clienteId])

  if (cargando) {
    return (
      <div className="page-body">
        <div className="empty-state" style={{ color: '#94a3b8' }}>Cargando...</div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <div className="icon">&#127970;</div>
          <p>Cliente no encontrado.</p>
        </div>
      </div>
    )
  }

  const formatFecha = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const modalidadIcon = {
    'Presencial': '&#127970;',
    'Hibrido': '&#128260;',
    'Remoto': '&#127968;',
  }

  const handleVacanteCreada = (nuevaVacante) => {
    setVacantes(prev => [nuevaVacante, ...prev])
  }

  const handleVacanteActualizada = (actualizada) => {
    setVacantes(prev => prev.map(v => v.id === actualizada.id ? actualizada : v))
  }

  const handleIniciarEliminar = async (vacante) => {
    const cands = await getCandidatosByVacante(vacante.id)
    setCandidatosEliminando(cands.length)
    setVacanteEliminando(vacante)
  }

  const handleConfirmarEliminar = async () => {
    await deleteVacante(vacanteEliminando.id)
    setVacantes(prev => prev.filter(v => v.id !== vacanteEliminando.id))
    setVacanteEliminando(null)
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="breadcrumb" style={{ marginBottom: 2 }}>
            <button className="back-btn" style={{ padding: '2px 6px' }} onClick={() => navigate('/clientes')}>
              &#8592; Clientes
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="current">{cliente.nombre}</span>
          </div>
          <div className="page-title">Vacantes</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Nueva vacante
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Info del cliente */}
        <div className="card" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: 10,
              background: '#dbeafe', color: '#1e40af',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 20, flexShrink: 0,
            }}
          >
            {cliente.nombre.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--gray-800)' }}>{cliente.nombre}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              {cliente.industria} &middot; Contacto: {cliente.contacto} &middot; {cliente.email}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary-light)' }}>{vacantes.length}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
              vacante{vacantes.length !== 1 ? 's' : ''} activa{vacantes.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Grid de vacantes */}
        {vacantes.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="icon">&#128203;</div>
              <p>No hay vacantes para este cliente. Crea la primera con el botón de arriba.</p>
            </div>
          </div>
        ) : (
          <div className="vacantes-grid">
            {vacantes.map(v => (
              <div
                key={v.id}
                className="vacante-card"
                onClick={() => navigate('/vacantes/' + v.id + '/pipeline')}
              >
                <div className="vacante-card-title">{v.titulo}</div>
                <div className="vacante-card-meta">
                  <span className="tag">{v.area}</span>
                  <span className="tag">{v.nivel}</span>
                  <span className="tag">{v.modalidad}</span>
                </div>

                <div style={{ fontSize: 12.5, color: 'var(--gray-500)', marginBottom: 14 }}>
                  &#128205; {v.ciudad}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginBottom: 1 }}>Rango salarial</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-700)' }}>
                      {v.salario_min && v.salario_max
                        ? '$' + Number(v.salario_min).toLocaleString() + ' – $' + Number(v.salario_max).toLocaleString()
                        : 'No especificado'}
                    </div>
                  </div>
                  <div className={'prioridad-' + v.prioridad} style={{ fontSize: 12.5 }}>
                    &#9679; Prioridad {v.prioridad}
                  </div>
                </div>

                <div className="vacante-card-footer">
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                    Abierta: {formatFecha(v.fecha_apertura)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setVacanteEditando(v)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleIniciarEliminar(v)}
                      style={{ color: '#dc2626' }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <NuevaVacanteModal
          clienteId={Number(clienteId)}
          clienteNombre={cliente?.nombre}
          onClose={() => setShowModal(false)}
          onCreated={handleVacanteCreada}
        />
      )}

      {vacanteEditando && (
        <EditarVacanteModal
          vacante={vacanteEditando}
          onClose={() => setVacanteEditando(null)}
          onActualizada={handleVacanteActualizada}
        />
      )}

      <ConfirmDialog
        abierto={!!vacanteEliminando}
        onCerrar={() => setVacanteEliminando(null)}
        onConfirmar={handleConfirmarEliminar}
        titulo="Eliminar vacante"
        mensaje={
          vacanteEliminando
            ? candidatosEliminando > 0
              ? `¿Eliminar "${vacanteEliminando.titulo}"? Esta vacante tiene ${candidatosEliminando} candidato${candidatosEliminando !== 1 ? 's' : ''} asociado${candidatosEliminando !== 1 ? 's' : ''} que también se eliminarán.`
              : `¿Eliminar "${vacanteEliminando.titulo}"? Esta acción no se puede deshacer.`
            : ''
        }
        labelConfirmar="Eliminar vacante"
        peligroso
      />
    </>
  )
}
