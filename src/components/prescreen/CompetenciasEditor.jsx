import { useState } from 'react'
import { PLANTILLAS_SUGERIDAS } from '../../services/prescreenConfig'

const competenciaVacia = () => ({
  id: 'comp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
  nombre: '',
  pregunta: '',
  hint: '',
  orden: 0,
})

export default function CompetenciasEditor({ competencias, onChange }) {
  const [mostrarPlantillas, setMostrarPlantillas] = useState(false)

  const actualizar = (idx, campo, valor) => {
    const nuevas = competencias.map((c, i) => i === idx ? { ...c, [campo]: valor } : c)
    onChange(nuevas)
  }

  const agregar = () => {
    if (competencias.length >= 8) return
    onChange([...competencias, { ...competenciaVacia(), orden: competencias.length + 1 }])
  }

  const eliminar = (idx) => {
    onChange(competencias.filter((_, i) => i !== idx))
  }

  const mover = (idx, dir) => {
    const nuevas = [...competencias]
    const dest = idx + dir
    if (dest < 0 || dest >= nuevas.length) return;
    [nuevas[idx], nuevas[dest]] = [nuevas[dest], nuevas[idx]]
    onChange(nuevas)
  }

  const cargarPlantilla = (key) => {
    const items = PLANTILLAS_SUGERIDAS[key].map((c, i) => ({ ...c, orden: i + 1 }))
    onChange(items)
    setMostrarPlantillas(false)
  }

  const inputStyle = { width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
          Competencias para el pre-screen
          <span style={{ marginLeft: 8, fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>
            {competencias.length}/8 · mínimo 2
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setMostrarPlantillas(v => !v)}
          >
            Cargar plantilla
          </button>
          {mostrarPlantillas && (
            <div style={{
              position: 'absolute', right: 0, top: '100%', marginTop: 4,
              background: 'white', border: '1px solid #e2e8f0', borderRadius: 8,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 10, minWidth: 200,
            }}>
              {[
                ['ventas-b2b', 'Ventas B2B'],
                ['operaciones', 'Operaciones'],
                ['community-manager', 'Community Manager'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => cargarPlantilla(key)}
                  style={{ display: 'block', width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: 13, cursor: 'pointer', color: '#334155' }}
                  onMouseEnter={e => e.target.style.background = '#f8fafc'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {competencias.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8', fontSize: 13, border: '1.5px dashed #e2e8f0', borderRadius: 8 }}>
            Sin competencias. Agrega al menos 2 o carga una plantilla.
          </div>
        )}
        {competencias.map((c, idx) => (
          <div key={c.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
                <button type="button" onClick={() => mover(idx, -1)} disabled={idx === 0}
                  style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 6px', fontSize: 11, cursor: idx === 0 ? 'default' : 'pointer', color: '#94a3b8' }}>↑</button>
                <button type="button" onClick={() => mover(idx, 1)} disabled={idx === competencias.length - 1}
                  style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 5, padding: '1px 6px', fontSize: 11, cursor: idx === competencias.length - 1 ? 'default' : 'pointer', color: '#94a3b8' }}>↓</button>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input
                  type="text"
                  placeholder="Nombre de la competencia (ej. Venta consultiva)"
                  value={c.nombre}
                  onChange={e => actualizar(idx, 'nombre', e.target.value)}
                  style={inputStyle}
                />
                <textarea
                  placeholder="Pregunta para el candidato..."
                  value={c.pregunta}
                  onChange={e => actualizar(idx, 'pregunta', e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
                />
                <textarea
                  placeholder="Hint / guía para el entrevistador (opcional)..."
                  value={c.hint}
                  onChange={e => actualizar(idx, 'hint', e.target.value)}
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5, color: '#64748b' }}
                />
              </div>
              <button
                type="button"
                onClick={() => eliminar(idx)}
                style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 8px', color: '#dc2626', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}
              >
                &#128465;
              </button>
            </div>
          </div>
        ))}
      </div>

      {competencias.length < 8 && (
        <button
          type="button"
          onClick={agregar}
          className="btn btn-secondary btn-sm"
          style={{ marginTop: 10, width: '100%' }}
        >
          + Agregar competencia
        </button>
      )}
    </div>
  )
}
