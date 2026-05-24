import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClientes, deleteCliente, regenerarTokenPortal } from '../services/clientesService'
import { getVacantesByCliente } from '../services/vacantesService'
import NuevoClienteModal from '../components/NuevoClienteModal'
import EditarClienteModal from '../components/EditarClienteModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function Clientes() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [showNuevo, setShowNuevo] = useState(false)
  const [clienteEditando, setClienteEditando] = useState(null)
  const [clienteEliminando, setClienteEliminando] = useState(null)
  const [vacantesEliminando, setVacantesEliminando] = useState(0)
  const [filtroTexto, setFiltroTexto] = useState('')
  const [filtroIndustria, setFiltroIndustria] = useState('')
  const [copiandoId, setCopiandoId] = useState(null)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getClientes()
        setClientes(data)
      } catch (err) {
        console.error('Error cargando clientes:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const handleIniciarEliminar = async (cliente) => {
    const vacantes = await getVacantesByCliente(cliente.id)
    setVacantesEliminando(vacantes.length)
    setClienteEliminando(cliente)
  }

  const handleCompartirPortal = async (e, c) => {
    e.stopPropagation()
    try {
      let token = c.portal_token
      if (!token) {
        token = await regenerarTokenPortal(c.id)
        setClientes(prev => prev.map(cl => cl.id === c.id ? { ...cl, portal_token: token } : cl))
      }
      const url = `${window.location.origin}/portal/${token}`
      try {
        await navigator.clipboard.writeText(url)
        setCopiandoId(c.id)
        setTimeout(() => setCopiandoId(null), 2000)
      } catch {
        window.prompt('Copia este enlace para compartir con el cliente:', url)
      }
    } catch (err) {
      console.error('Error al obtener token del portal:', err)
      alert('Error al generar el enlace. Asegúrate de haber corrido la migración migration_portal.sql en Supabase.')
    }
  }

  const handleConfirmarEliminar = async () => {
    await deleteCliente(clienteEliminando.id)
    setClientes(prev => prev.filter(c => c.id !== clienteEliminando.id))
    setClienteEliminando(null)
  }

  const formatFecha = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const industriasUnicas = [...new Set(clientes.map(c => c.industria).filter(Boolean))]
  const clientesFiltrados = clientes.filter(c => {
    const texto = filtroTexto.toLowerCase().trim()
    if (texto && !(
      c.nombre.toLowerCase().includes(texto) ||
      (c.contacto || '').toLowerCase().includes(texto) ||
      (c.email || '').toLowerCase().includes(texto)
    )) return false
    if (filtroIndustria && c.industria !== filtroIndustria) return false
    return true
  })
  const hayFiltros = filtroTexto || filtroIndustria

  return (
    <>
      <div className="page-header">
        <div className="page-title">Clientes</div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setShowNuevo(true)}>
            + Nuevo cliente
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Todos los clientes ({!cargando && (hayFiltros ? clientesFiltrados.length + ' de ' : '') + clientes.length})
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={filtroTexto}
                onChange={e => setFiltroTexto(e.target.value)}
                style={{
                  padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                  fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#334155', width: 180,
                }}
              />
              {industriasUnicas.length > 0 && (
                <select
                  value={filtroIndustria}
                  onChange={e => setFiltroIndustria(e.target.value)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                    fontSize: 13, outline: 'none', fontFamily: 'inherit',
                    color: filtroIndustria ? '#334155' : '#94a3b8', background: 'white', cursor: 'pointer',
                  }}
                >
                  <option value="">Todas las industrias</option>
                  {industriasUnicas.map(i => <option key={i}>{i}</option>)}
                </select>
              )}
              {hayFiltros && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setFiltroTexto(''); setFiltroIndustria('') }}>
                  Limpiar
                </button>
              )}
            </div>
          </div>
          {cargando ? (
            <div className="empty-state" style={{ color: '#94a3b8', padding: '40px 0' }}>Cargando clientes...</div>
          ) : clientes.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="icon">&#127970;</div>
              <p>No hay clientes aún. Agrega el primero con el botón de arriba.</p>
            </div>
          ) : hayFiltros && clientesFiltrados.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="icon">&#128270;</div>
              <p>Sin resultados para los filtros aplicados.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>Industria</th>
                    <th>Contacto</th>
                    <th>Alta</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFiltrados.map(c => (
                    <tr
                      key={c.id}
                      className="clickable-row"
                      onClick={() => navigate('/clientes/' + c.id + '/vacantes')}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            style={{
                              width: 36, height: 36, borderRadius: 8,
                              background: '#dbeafe', color: '#1e40af',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: 14, flexShrink: 0,
                            }}
                          >
                            {c.nombre.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{c.nombre}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="tag">{c.industria || '—'}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{c.contacto || '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{c.email || ''}</div>
                      </td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>
                        {formatFecha(c.created_at)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => navigate('/clientes/' + c.id + '/vacantes')}
                          >
                            Ver vacantes &#8594;
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={(e) => handleCompartirPortal(e, c)}
                            title="Copiar enlace del portal para el cliente"
                            style={copiandoId === c.id ? { background: '#d1fae5', color: '#065f46', borderColor: '#6ee7b7' } : {}}
                          >
                            {copiandoId === c.id ? '✓ Copiado' : '🔗 Portal'}
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setClienteEditando(c)}
                          >
                            ✏️ Editar
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleIniciarEliminar(c)}
                            style={{ color: '#dc2626' }}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {showNuevo && (
        <NuevoClienteModal
          onClose={() => setShowNuevo(false)}
          onCreado={(nuevo) => setClientes(prev => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)))}
        />
      )}

      {clienteEditando && (
        <EditarClienteModal
          cliente={clienteEditando}
          onClose={() => setClienteEditando(null)}
          onActualizado={(actualizado) => {
            setClientes(prev => prev.map(c => c.id === actualizado.id ? actualizado : c))
            setClienteEditando(null)
          }}
        />
      )}

      <ConfirmDialog
        abierto={!!clienteEliminando}
        onCerrar={() => setClienteEliminando(null)}
        onConfirmar={handleConfirmarEliminar}
        titulo="Eliminar cliente"
        mensaje={
          clienteEliminando
            ? vacantesEliminando > 0
              ? `¿Eliminar "${clienteEliminando.nombre}"? Este cliente tiene ${vacantesEliminando} vacante${vacantesEliminando !== 1 ? 's' : ''} asociada${vacantesEliminando !== 1 ? 's' : ''} que también se eliminarán.`
              : `¿Eliminar "${clienteEliminando.nombre}"? Esta acción no se puede deshacer.`
            : ''
        }
        labelConfirmar="Eliminar cliente"
        peligroso
      />
    </>
  )
}
