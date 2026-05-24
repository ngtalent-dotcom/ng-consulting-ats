import { useState, useEffect } from 'react'
import { getPlantillas, createPlantilla, updatePlantilla, deletePlantilla } from '../../services/plantillasService'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const COMPETENCIA_VACIA = { id: '', nombre: '', pregunta: '', hint: '' }

function CompetenciaItem({ comp, index, onChange, onRemove }) {
  return (
    <div style={{
      background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
      padding: '14px 16px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: '#94a3b8', paddingTop: 6, minWidth: 20 }}>#{index + 1}</span>
        <div style={{ flex: 1 }}>
          <input
            placeholder="Nombre de la competencia"
            value={comp.nombre}
            onChange={e => onChange({ ...comp, nombre: e.target.value, id: slugify(e.target.value) || comp.id })}
            style={inputStyle}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18, padding: '4px 6px', lineHeight: 1 }}
          title="Eliminar competencia"
        >×</button>
      </div>
      <textarea
        placeholder="Pregunta para el candidato"
        value={comp.pregunta}
        onChange={e => onChange({ ...comp, pregunta: e.target.value })}
        rows={2}
        style={{ ...inputStyle, resize: 'none', marginBottom: 6 }}
      />
      <input
        placeholder="Hint interno (guía para el entrevistador)"
        value={comp.hint}
        onChange={e => onChange({ ...comp, hint: e.target.value })}
        style={{ ...inputStyle, color: '#64748b', fontSize: 12 }}
      />
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e2e8f0',
  fontSize: 13, fontFamily: 'inherit', color: '#1e293b', outline: 'none', boxSizing: 'border-box',
}

function ModalPlantilla({ plantilla, onClose, onSave }) {
  const esNueva = !plantilla.id
  const [nombre, setNombre] = useState(plantilla.nombre || '')
  const [competencias, setCompetencias] = useState(plantilla.competencias || [])
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const agregarCompetencia = () => {
    setCompetencias(prev => [...prev, { ...COMPETENCIA_VACIA, id: `comp-${Date.now()}` }])
  }

  const actualizarCompetencia = (index, nueva) => {
    setCompetencias(prev => prev.map((c, i) => i === index ? nueva : c))
  }

  const eliminarCompetencia = (index) => {
    setCompetencias(prev => prev.filter((_, i) => i !== index))
  }

  const moverArriba = (index) => {
    if (index === 0) return
    setCompetencias(prev => {
      const arr = [...prev]
      ;[arr[index - 1], arr[index]] = [arr[index], arr[index - 1]]
      return arr
    })
  }

  const moverAbajo = (index) => {
    if (index === competencias.length - 1) return
    setCompetencias(prev => {
      const arr = [...prev]
      ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
      return arr
    })
  }

  async function handleGuardar() {
    setError('')
    if (!nombre.trim()) { setError('El nombre de la plantilla es requerido.'); return }
    if (competencias.length === 0) { setError('Agrega al menos una competencia.'); return }
    const sinNombre = competencias.some(c => !c.nombre.trim())
    if (sinNombre) { setError('Todas las competencias deben tener nombre.'); return }
    const sinPregunta = competencias.some(c => !c.pregunta.trim())
    if (sinPregunta) { setError('Todas las competencias deben tener pregunta.'); return }

    setGuardando(true)
    try {
      const slug = slugify(nombre)
      const payload = { nombre: nombre.trim(), slug, competencias }
      let resultado
      if (esNueva) {
        resultado = await createPlantilla(payload)
      } else {
        resultado = await updatePlantilla(plantilla.id, payload)
      }
      onSave(resultado)
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,23,42,0.5)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '40px 16px', overflowY: 'auto',
    }}>
      <div style={{
        background: 'white', borderRadius: 12, width: '100%', maxWidth: 680,
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)', border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b' }}>
            {esNueva ? 'Nueva plantilla de competencias' : 'Editar plantilla'}
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Nombre */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>
              Nombre de la plantilla
            </label>
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Ventas B2B, RRHH, Logística..."
              style={{ ...inputStyle, fontSize: 15 }}
            />
          </div>

          {/* Competencias */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Competencias ({competencias.length})
              </label>
              <button
                type="button"
                onClick={agregarCompetencia}
                className="btn btn-secondary btn-sm"
              >
                + Agregar competencia
              </button>
            </div>

            {competencias.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: 13, border: '1.5px dashed #e2e8f0', borderRadius: 8 }}>
                Sin competencias. Haz clic en "+ Agregar competencia" para comenzar.
              </div>
            )}

            {competencias.map((comp, i) => (
              <div key={comp.id || i} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 14, right: 44, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <button type="button" onClick={() => moverArriba(i)} disabled={i === 0}
                    style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? '#cbd5e1' : '#64748b', fontSize: 11, padding: '1px 4px' }}>▲</button>
                  <button type="button" onClick={() => moverAbajo(i)} disabled={i === competencias.length - 1}
                    style={{ background: 'none', border: 'none', cursor: i === competencias.length - 1 ? 'default' : 'pointer', color: i === competencias.length - 1 ? '#cbd5e1' : '#64748b', fontSize: 11, padding: '1px 4px' }}>▼</button>
                </div>
                <CompetenciaItem
                  comp={comp}
                  index={i}
                  onChange={nueva => actualizarCompetencia(i, nueva)}
                  onRemove={() => eliminarCompetencia(i)}
                />
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 6, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="button" className="btn btn-primary" onClick={handleGuardar} disabled={guardando}>
              {guardando ? 'Guardando...' : (esNueva ? 'Crear plantilla' : 'Guardar cambios')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PlantillasCompetencias() {
  const [plantillas, setPlantillas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(null)
  const [confirmarEliminar, setConfirmarEliminar] = useState(null)

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    try {
      const data = await getPlantillas()
      setPlantillas(data)
    } catch (err) {
      console.error('Error cargando plantillas:', err)
    } finally {
      setCargando(false)
    }
  }

  function handleSave(guardada) {
    setPlantillas(prev => {
      const existe = prev.find(p => p.id === guardada.id)
      if (existe) return prev.map(p => p.id === guardada.id ? guardada : p)
      return [...prev, guardada]
    })
    setModal(null)
  }

  async function handleEliminar(id) {
    try {
      await deletePlantilla(id)
      setPlantillas(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error eliminando plantilla:', err)
    } finally {
      setConfirmarEliminar(null)
    }
  }

  if (cargando) {
    return (
      <div style={{ padding: 32, color: '#94a3b8', fontSize: 14 }}>Cargando plantillas...</div>
    )
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 860 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, gap: 16 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Plantillas de competencias</h1>
          <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
            Reutiliza estas plantillas al aplicar el pre-screen en cualquier vacante.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setModal({ nombre: '', competencias: [] })}
          style={{ flexShrink: 0 }}
        >
          + Nueva plantilla
        </button>
      </div>

      {plantillas.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 24px',
          border: '1.5px dashed #e2e8f0', borderRadius: 12, color: '#94a3b8',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Sin plantillas todavía</div>
          <div style={{ fontSize: 13 }}>Crea tu primera plantilla de competencias para empezar a usarla en pre-screens.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plantillas.map(p => (
            <div key={p.id} style={{
              background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10,
              padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 16,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{p.nombre}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(p.competencias || []).map((c, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 20,
                      background: '#f1f5f9', color: '#475569', fontWeight: 500,
                    }}>{c.nombre}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setModal(p)}
                >Editar</button>
                <button
                  className="btn btn-sm"
                  style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}
                  onClick={() => setConfirmarEliminar(p)}
                >Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ModalPlantilla
          plantilla={modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {confirmarEliminar && (
        <ConfirmDialog
          abierto
          titulo="¿Eliminar plantilla?"
          mensaje={`Se eliminará "${confirmarEliminar.nombre}" permanentemente. Esta acción no se puede deshacer.`}
          labelConfirmar="Eliminar"
          peligroso
          onConfirmar={() => handleEliminar(confirmarEliminar.id)}
          onCerrar={() => setConfirmarEliminar(null)}
        />
      )}
    </div>
  )
}
