import { useState, useEffect } from 'react'
import { getLevantamientos, createLevantamiento, deleteLevantamiento } from '../../services/levantamientoService'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const BASE_URL = window.location.origin

function badgeEstado(completado) {
  if (completado) {
    return (
      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#d1fae5', color: '#059669', fontWeight: 600 }}>
        Completado
      </span>
    )
  }
  return (
    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#fef9c3', color: '#854d0e', fontWeight: 600 }}>
      Pendiente
    </span>
  )
}

function ModalNuevo({ onClose, onCrear }) {
  const [titulo, setTitulo] = useState('')
  const [cliente, setCliente] = useState('')
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState('')

  async function handleCrear() {
    setError('')
    if (!titulo.trim()) { setError('El título del puesto es requerido.'); return }
    setCreando(true)
    try {
      const data = await createLevantamiento({ tituloPuesto: titulo.trim(), clienteNombre: cliente.trim() })
      onCrear(data)
    } catch (err) {
      setError(err.message || 'Error al crear')
    } finally {
      setCreando(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0',
    fontSize: 14, fontFamily: 'inherit', color: '#1e293b', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b' }}>Nuevo levantamiento de perfil</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
            Se generará un enlace único para que el cliente llene el perfil del puesto a cubrir.
          </p>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Título del puesto *
            </label>
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Ejecutivo de Ventas B2B"
              style={inputStyle}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Nombre del cliente (opcional)
            </label>
            <input
              value={cliente}
              onChange={e => setCliente(e.target.value)}
              placeholder="Ej: Empresa XYZ"
              style={inputStyle}
            />
          </div>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={handleCrear} disabled={creando}>
              {creando ? 'Generando...' : 'Generar enlace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Levantamiento() {
  const [levantamientos, setLevantamientos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalNuevo, setModalNuevo] = useState(false)
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)
  const [copiado, setCopiado] = useState(null)
  const [verDatos, setVerDatos] = useState(null)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    try {
      const data = await getLevantamientos()
      setLevantamientos(data)
    } catch (err) {
      console.error('Error cargando levantamientos:', err)
    } finally {
      setCargando(false)
    }
  }

  function handleCreado(nuevo) {
    setLevantamientos(prev => [nuevo, ...prev])
    setModalNuevo(false)
  }

  async function handleEliminar(id) {
    try {
      await deleteLevantamiento(id)
      setLevantamientos(prev => prev.filter(l => l.id !== id))
    } catch (err) {
      console.error('Error eliminando levantamiento:', err)
    } finally {
      setConfirmarEliminar(null)
    }
  }

  function copiarEnlace(token) {
    const url = `${BASE_URL}/levantamiento/${token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(token)
      setTimeout(() => setCopiado(null), 2000)
    })
  }

  function formatFecha(fecha) {
    if (!fecha) return '—'
    return new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (cargando) {
    return <div style={{ padding: 32, color: '#94a3b8', fontSize: 14 }}>Cargando...</div>
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 920 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Levantamiento de perfil</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Genera enlaces para que tus clientes llenen el perfil del puesto a cubrir.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalNuevo(true)} style={{ flexShrink: 0 }}>
          + Nuevo levantamiento
        </button>
      </div>

      {levantamientos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', border: '1.5px dashed #e2e8f0', borderRadius: 12, color: '#94a3b8' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📝</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Sin levantamientos todavía</div>
          <div style={{ fontSize: 13 }}>Crea un nuevo levantamiento y comparte el enlace con tu cliente.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {levantamientos.map(lev => (
            <div key={lev.id} style={{
              background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10,
              padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{lev.titulo_vacante || 'Sin título'}</span>
                  {badgeEstado(lev.completado)}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {lev.cliente_nombre && <span style={{ marginRight: 10 }}>🏢 {lev.cliente_nombre}</span>}
                  <span>Creado {formatFecha(lev.created_at)}</span>
                  {lev.completado_at && <span style={{ marginLeft: 10 }}>· Completado {formatFecha(lev.completado_at)}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {lev.completado && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setVerDatos(lev)}
                  >Ver respuestas</button>
                )}
                <button
                  className="btn btn-sm"
                  style={{
                    background: copiado === lev.token ? '#d1fae5' : '#f1f5f9',
                    color: copiado === lev.token ? '#059669' : '#475569',
                    border: '1px solid ' + (copiado === lev.token ? '#6ee7b7' : '#e2e8f0'),
                  }}
                  onClick={() => copiarEnlace(lev.token)}
                >
                  {copiado === lev.token ? '✓ Copiado' : '📋 Copiar enlace'}
                </button>
                <button
                  className="btn btn-sm"
                  style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}
                  onClick={() => setConfirmarEliminar(lev)}
                >Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalNuevo && (
        <ModalNuevo onClose={() => setModalNuevo(false)} onCrear={handleCreado} />
      )}

      {confirmarEliminar && (
        <ConfirmDialog
          abierto
          titulo="¿Eliminar levantamiento?"
          mensaje={`Se eliminará el levantamiento de "${confirmarEliminar.titulo_vacante}" permanentemente.`}
          labelConfirmar="Eliminar"
          peligroso
          onConfirmar={() => handleEliminar(confirmarEliminar.id)}
          onCerrar={() => setConfirmarEliminar(null)}
        />
      )}

      {verDatos && (
        <ModalVerDatos lev={verDatos} onClose={() => setVerDatos(null)} />
      )}
    </div>
  )
}

function ModalVerDatos({ lev, onClose }) {
  const d = lev.datos || {}
  const campos = [
    ['Título del puesto', d.tituloPuesto],
    ['Área / Departamento', d.area],
    ['Número de vacantes', d.numVacantes],
    ['Modalidad', d.modalidad],
    ['Horario de trabajo', d.horario],
    ['Sueldo ofrecido', d.sueldo],
    ['Descripción del puesto', d.descripcion],
    ['Funciones principales', d.funciones],
    ['Experiencia requerida', d.experiencia],
    ['Escolaridad', d.escolaridad],
    ['Habilidades y herramientas', d.habilidades],
    ['Prestaciones adicionales', d.prestaciones],
    ['Razón de la vacante', d.razon],
    ['Proceso de selección', d.proceso],
    ['Nombre del contacto', d.contactoNombre],
    ['Cargo del contacto', d.contactoCargo],
  ]

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.5)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 16px', overflowY: 'auto',
    }}>
      <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 640, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b' }}>{lev.titulo_vacante}</h2>
            {lev.cliente_nombre && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{lev.cliente_nombre}</div>}
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>
          {campos.map(([label, valor]) => valor ? (
            <div key={label} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 14, color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{valor}</div>
            </div>
          ) : null)}
        </div>
      </div>
    </div>
  )
}
