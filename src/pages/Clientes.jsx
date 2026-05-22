import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getClientes } from '../services/clientesService'

export default function Clientes() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)

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

  const formatFecha = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title">Clientes</div>
        <div className="header-actions">
          <button className="btn btn-primary" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
            + Nuevo cliente
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              Todos los clientes {!cargando && '(' + clientes.length + ')'}
            </div>
          </div>
          {cargando ? (
            <div className="empty-state" style={{ color: '#94a3b8', padding: '40px 0' }}>Cargando clientes...</div>
          ) : clientes.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="icon">&#127970;</div>
              <p>No hay clientes aun. Agrega tu primer cliente desde Supabase.</p>
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
                  {clientes.map(c => (
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
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => { e.stopPropagation(); navigate('/clientes/' + c.id + '/vacantes') }}
                        >
                          Ver vacantes &#8594;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
